// Pure cart logic shared by the scripted demo (Phase 1) and the AI tools
// (Phase 2). Nothing here touches the browser.
import { allergenList } from "@/data/allergens";
import type { Recipe } from "@/data/recipes";
import { SUBSTITUTES } from "@/data/substitutes";
import {
  containsAllergen,
  fitsDiet,
  getProduct,
  ingredientName,
  inStock,
  isSafe,
  priceAt,
  productsFor,
  storeName,
  usable,
} from "./catalogue";
import { money } from "./format";
import type { Cart, CartItem, Flag, Product, RemovedItem, ShopContext } from "./types";

export const DEFAULT_BUDGET = { recipe: 60, restock: 90 } as const;

type Pick =
  | { ok: true; product: Product; reason?: string; why: string; flags: Flag[] }
  | { ok: false; reason: string };

/** Order candidates: remembered brand first, then national brands, then store brand. */
function rank(products: Product[], ctx: ShopContext, ingredient: string): Product[] {
  const preferred = ctx.preferredBrands[ingredient];
  return [...products].sort((a, b) => {
    if (preferred) {
      if (a.brand === preferred && b.brand !== preferred) return -1;
      if (b.brand === preferred && a.brand !== preferred) return 1;
    }
    if (a.tier !== b.tier) return a.tier === "national" ? -1 : 1;
    return priceAt(a, ctx.storeId) - priceAt(b, ctx.storeId);
  });
}

/** Choose among products for one ingredient that are already known to be safe. */
function chooseBrand(products: Product[], ctx: ShopContext, ingredient: string): Pick | null {
  const ranked = rank(products, ctx, ingredient);
  const pick = ranked.find((p) => inStock(p, ctx.storeId));
  if (!pick) return null;
  const first = ranked[0];
  const store = storeName(ctx.storeId);
  const cheapest = [...ranked].filter((p) => inStock(p, ctx.storeId)).sort((a, b) => priceAt(a, ctx.storeId) - priceAt(b, ctx.storeId))[0];
  const savings = priceAt(pick, ctx.storeId) - priceAt(cheapest, ctx.storeId);
  const saveNote = savings > 0.009 ? ` ${cheapest.brand} would save ${money(savings)} if you'd like to swap.` : "";

  if (pick !== first) {
    return {
      ok: true,
      product: pick,
      flags: ["substituted"],
      reason: `${first.brand} is out of stock at ${store}, so I picked ${pick.brand}.`,
      why: `Your first choice would have been ${first.brand} ${first.name}, but ${store} is out of it today. ${pick.brand} is the same product in a similar size.${saveNote}`,
    };
  }
  if (ctx.preferredBrands[ingredient] === pick.brand) {
    return {
      ok: true,
      product: pick,
      flags: [],
      reason: "Your usual brand.",
      why: `You've chosen ${pick.brand} for this before, so I used it first.${saveNote}`,
    };
  }
  return {
    ok: true,
    product: pick,
    flags: [],
    why:
      pick.tier === "national"
        ? `A well-known brand in the size this needs.${saveNote}`
        : `The store brand is the only one in stock at ${store}.`,
  };
}

/** Pick a product for an ingredient, applying the allergen rule, diet and stock. */
export function pickForIngredient(ingredient: string, ctx: ShopContext): Pick {
  const direct = productsFor(ingredient);
  const name = ingredientName(ingredient);
  if (!direct.length) return { ok: false, reason: `I couldn't find ${name} in the catalogue.` };

  const safeDirect = direct.filter((p) => isSafe(p, ctx.allergies) && fitsDiet(p, ctx.diets));
  const direct_ = chooseBrand(safeDirect, ctx, ingredient);
  if (direct_) return direct_;

  // Nothing usable for this ingredient: explain why and look for a swap.
  const blockedBy = containsAllergen(direct[0], ctx.allergies);
  const dietBlocked = !fitsDiet(direct[0], ctx.diets);
  const why = blockedBy.length
    ? `contains ${allergenList(blockedBy)}`
    : dietBlocked
      ? `isn't ${ctx.diets.includes("vegan") ? "vegan" : "vegetarian"}`
      : `is out of stock at ${storeName(ctx.storeId)}`;

  for (const alt of SUBSTITUTES[ingredient] ?? []) {
    const altProducts = productsFor(alt).filter((p) => isSafe(p, ctx.allergies) && fitsDiet(p, ctx.diets));
    const choice = chooseBrand(altProducts, ctx, alt);
    if (choice?.ok) {
      const flag: Flag = blockedBy.length ? "allergen-swap" : dietBlocked ? "diet-swap" : "substituted";
      return {
        ok: true,
        product: choice.product,
        flags: [flag],
        reason: `Instead of ${name.toLowerCase()}, which ${why}.`,
        why: `The recipe calls for ${name.toLowerCase()}, but it ${why}. ${choice.product.name} does the same job in this dish. ${choice.why}`,
      };
    }
  }
  return { ok: false, reason: `Left out ${name.toLowerCase()}: it ${why} and I couldn't find a safe swap.` };
}

function makeItem(ingredient: string, qty: number, pick: Extract<Pick, { ok: true }>): CartItem {
  return {
    id: ingredient,
    productId: pick.product.id,
    ingredient,
    qty,
    reason: pick.reason,
    why: pick.why,
    flags: pick.flags,
    original: { productId: pick.product.id, qty },
  };
}

export function scaleQty(qtyFor4: number, servings: number, staple?: boolean): number {
  if (staple) return qtyFor4;
  return Math.max(1, Math.ceil((qtyFor4 * servings) / 4));
}

export function buildRecipeCart(
  recipe: Recipe,
  servings: number,
  ctx: ShopContext,
  haveAtHome: string[],
  budget: number,
): Cart {
  const items: CartItem[] = [];
  const removed: RemovedItem[] = [];
  for (const ing of recipe.ingredients) {
    if (haveAtHome.includes(ing.ingredient)) {
      removed.push({ ingredient: ing.ingredient, label: ingredientName(ing.ingredient), reason: "You have it at home" });
      continue;
    }
    const pick = pickForIngredient(ing.ingredient, ctx);
    if (!pick.ok) {
      removed.push({ ingredient: ing.ingredient, label: ingredientName(ing.ingredient), reason: pick.reason });
      continue;
    }
    items.push(makeItem(ing.ingredient, scaleQty(ing.qtyFor4, servings, ing.staple), pick));
  }
  return applyBudget({
    title: `${recipe.name} for ${servings}`,
    journey: "recipe",
    storeId: ctx.storeId,
    budget,
    items,
    removed,
  }, ctx);
}

export function buildRestockCart(essentials: { ingredient: string; qty: number }[], ctx: ShopContext, budget: number): Cart {
  const items: CartItem[] = [];
  const removed: RemovedItem[] = [];
  for (const e of essentials) {
    const pick = pickForIngredient(e.ingredient, ctx);
    if (!pick.ok) {
      removed.push({ ingredient: e.ingredient, label: ingredientName(e.ingredient), reason: pick.reason });
      continue;
    }
    items.push(makeItem(e.ingredient, e.qty, pick));
  }
  return applyBudget({ title: "Weekly restock", journey: "restock", storeId: ctx.storeId, budget, items, removed }, ctx);
}

export function itemPrice(item: CartItem, cart: Cart): number {
  const p = getProduct(item.productId);
  return p ? priceAt(p, cart.storeId) * item.qty : 0;
}

export function cartTotal(cart: Cart): number {
  return Math.round(cart.items.reduce((s, i) => s + itemPrice(i, cart), 0) * 100) / 100;
}

export function itemCount(cart: Cart): number {
  return cart.items.reduce((s, i) => s + i.qty, 0);
}

/** Safe, in-stock alternatives for the same ingredient, cheapest first. */
export function alternatives(item: CartItem, ctx: ShopContext): Product[] {
  return productsFor(item.ingredient)
    .filter((p) => p.id !== item.productId && usable(p, ctx))
    .sort((a, b) => priceAt(a, ctx.storeId) - priceAt(b, ctx.storeId));
}

export function cheaperSwap(item: CartItem, ctx: ShopContext): { product: Product; saves: number } | null {
  const current = getProduct(item.productId);
  if (!current) return null;
  const cheapest = alternatives(item, ctx)[0];
  if (!cheapest) return null;
  const saves = (priceAt(current, ctx.storeId) - priceAt(cheapest, ctx.storeId)) * item.qty;
  return saves > 0.009 ? { product: cheapest, saves: Math.round(saves * 100) / 100 } : null;
}

/** Flag the swaps that would bring an over-budget cart back under. */
export function applyBudget(cart: Cart, ctx: ShopContext): Cart {
  const items: CartItem[] = cart.items.map((i) => ({ ...i, flags: i.flags.filter((f) => f !== "over-budget") }));
  const next = { ...cart, items };
  let over = cartTotal(next) - next.budget;
  if (over <= 0) return next;
  const swaps = items
    .map((i) => ({ i, swap: cheaperSwap(i, ctx) }))
    .filter((x) => x.swap)
    .sort((a, b) => b.swap!.saves - a.swap!.saves);
  const possible = swaps.reduce((sum, x) => sum + x.swap!.saves, 0);
  // If cheaper brands can't close the gap, point at the few biggest savings
  // rather than flagging everything; the budget note suggests removing items.
  const limit = possible >= over ? swaps.length : MAX_BUDGET_FLAGS;
  for (const { i, swap } of swaps.slice(0, limit)) {
    if (over <= 0) break;
    i.flags = [...i.flags, "over-budget"];
    over -= swap!.saves;
  }
  return next;
}

const MAX_BUDGET_FLAGS = 4;

/** How much cheaper brands could save across the whole cart. */
export function possibleSavings(cart: Cart, ctx: ShopContext): number {
  return Math.round(cart.items.reduce((s, i) => s + (cheaperSwap(i, ctx)?.saves ?? 0), 0) * 100) / 100;
}

export type CartResult = { cart: Cart; error?: string; message?: string };

export function setQty(cart: Cart, itemId: string, qty: number, ctx: ShopContext): Cart {
  if (qty <= 0) return removeItem(cart, itemId, "You removed it", ctx);
  return applyBudget({ ...cart, items: cart.items.map((i) => (i.id === itemId ? { ...i, qty } : i)) }, ctx);
}

export function removeItem(cart: Cart, itemId: string, reason: string, ctx: ShopContext): Cart {
  const item = cart.items.find((i) => i.id === itemId);
  if (!item) return cart;
  const product = getProduct(item.productId);
  return applyBudget(
    {
      ...cart,
      items: cart.items.filter((i) => i.id !== itemId),
      removed: [...cart.removed, { ingredient: item.ingredient, label: product?.name ?? item.ingredient, reason }],
    },
    ctx,
  );
}

export function swapProduct(cart: Cart, itemId: string, productId: string, ctx: ShopContext, reason?: string): CartResult {
  const item = cart.items.find((i) => i.id === itemId);
  const product = getProduct(productId);
  const current = item && getProduct(item.productId);
  if (!item || !product || !current) return { cart, error: "I couldn't find that item." };
  const blocked = containsAllergen(product, ctx.allergies);
  if (blocked.length) {
    return { cart, error: `I can't add ${product.brand} ${product.name}: it contains ${allergenList(blocked)}.` };
  }
  if (!inStock(product, ctx.storeId)) {
    return { cart, error: `${product.brand} ${product.name} is out of stock at ${storeName(ctx.storeId)}.` };
  }
  const diff = (priceAt(product, ctx.storeId) - priceAt(current, ctx.storeId)) * item.qty;
  const autoReason =
    diff < -0.009
      ? `Switched to ${product.brand}, saves ${money(-diff)}.`
      : diff > 0.009
        ? `Switched to ${product.brand}, ${money(diff)} more.`
        : `Switched to ${product.brand}.`;
  const updated: CartItem = {
    ...item,
    productId,
    reason: reason ?? autoReason,
    why: `You changed this from ${current.brand} to ${product.brand}. ${autoReason}`,
    flags: [...item.flags.filter((f) => f !== "over-budget" && f !== "brand-changed"), "brand-changed"],
  };
  return { cart: applyBudget({ ...cart, items: cart.items.map((i) => (i.id === itemId ? updated : i)) }, ctx) };
}

export function addIngredient(cart: Cart, ingredient: string, qty: number, ctx: ShopContext): CartResult {
  const existing = cart.items.find((i) => i.ingredient === ingredient);
  if (existing) return { cart: setQty(cart, existing.id, existing.qty + qty, ctx) };
  const pick = pickForIngredient(ingredient, ctx);
  if (!pick.ok) return { cart, error: pick.reason };
  const item = { ...makeItem(ingredient, qty, pick), original: null };
  return {
    cart: applyBudget(
      { ...cart, items: [...cart.items, item], removed: cart.removed.filter((r) => r.ingredient !== ingredient) },
      ctx,
    ),
  };
}

/** Swap every item that doesn't fit the diet for its closest match. */
export function applyDiet(cart: Cart, ctx: ShopContext): { cart: Cart; changes: string[] } {
  const changes: string[] = [];
  let next = cart;
  for (const item of cart.items) {
    const product = getProduct(item.productId);
    if (!product || fitsDiet(product, ctx.diets)) continue;
    next = { ...next, items: next.items.filter((i) => i.id !== item.id) };
    const pick = pickForIngredient(item.ingredient, ctx);
    if (pick.ok) {
      next = {
        ...next,
        items: [...next.items, { ...makeItem(item.ingredient, item.qty, pick), id: item.id, original: item.original }],
      };
      changes.push(`${product.name} → ${pick.product.name}`);
    } else {
      next = { ...next, removed: [...next.removed, { ingredient: item.ingredient, label: product.name, reason: pick.reason }] };
      changes.push(`removed ${product.name}`);
    }
  }
  // Keep the original order so the cart doesn't jump around.
  const order = cart.items.map((i) => i.id);
  next = { ...next, items: [...next.items].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)) };
  return { cart: applyBudget(next, ctx), changes };
}

/** Everything that differs from what the assistant first proposed, for the review screen. */
export function changesFromDefaults(cart: Cart): string[] {
  const out: string[] = [];
  for (const item of cart.items) {
    const p = getProduct(item.productId);
    if (!p) continue;
    if (!item.original) {
      out.push(`Added ${p.brand} ${p.name}`);
      continue;
    }
    const was = getProduct(item.original.productId);
    const userSwapped = was && was.id !== p.id && was.ingredient === p.ingredient;
    if (userSwapped) {
      out.push(`${p.name}: ${was.brand} → ${p.brand}`);
    } else if (item.flags.some((f) => f === "allergen-swap" || f === "diet-swap" || f === "substituted")) {
      out.push(`${p.name}: ${item.reason ?? "substituted"}`);
    }
    if (item.original.qty !== item.qty) out.push(`${p.name}: quantity ${item.original.qty} → ${item.qty}`);
  }
  for (const r of cart.removed) {
    const why = r.reason.replace(/\.$/, "");
    out.push(`Not buying ${r.label.toLowerCase()} (${why.charAt(0).toLowerCase()}${why.slice(1)})`);
  }
  return out;
}
