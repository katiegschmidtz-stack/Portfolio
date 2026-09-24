// Phase 1: scripted assistant replies so both journeys can be clicked through
// without AI. Pure functions: (state, input) -> new state.
import { ALLERGENS, allergenList } from "@/data/allergens";
import { findRecipe, RECIPES } from "@/data/recipes";
import { STORES } from "@/data/stores";
import { STARTER_ESSENTIALS } from "@/data/substitutes";
import {
  addIngredient,
  applyDiet,
  buildRecipeCart,
  buildRestockCart,
  cartTotal,
  cheaperSwap,
  DEFAULT_BUDGET,
  applyBudget,
  itemCount,
  possibleSavings,
  removeItem,
  swapProduct,
} from "./cart";
import { getProduct, ingredientName, searchCatalogue, storeName, usable } from "./catalogue";
import { money, numberWord, plural } from "./format";
import { shopContext } from "./memory";
import type { Allergen, Cart, Diet, Memory, ShopContext, StoreId } from "./types";

export type Widget =
  | { type: "suggestions"; options: string[] }
  | { type: "allergies" }
  | { type: "reconfirm"; allergies: Allergen[] }
  | { type: "store" }
  | { type: "servings"; suggested: number }
  | { type: "pantry"; items: string[] }
  | { type: "skip"; items: string[] }
  | { type: "open-cart" }
  | { type: "review" };

export interface Message {
  id: string;
  role: "assistant" | "user";
  text: string;
  widget?: Widget;
  /** Set once a widget has been answered, with a short summary of the answer. */
  answered?: string;
}

export interface Flow {
  journey: { kind: "recipe"; recipeId: string } | { kind: "restock" } | null;
  step: "idle" | "allergies" | "reconfirm" | "store" | "servings" | "pantry" | "skip" | "cart";
  allergiesConfirmed: boolean;
  servings?: number;
  /** Diet changes for this shop only ("make it vegetarian"). */
  extraDiets: Diet[];
}

export interface ChatState {
  messages: Message[];
  flow: Flow;
  cart: Cart | null;
  memory: Memory;
}

export type Answer =
  | { widget: "allergies"; allergies: Allergen[]; diets: Diet[] }
  | { widget: "reconfirm"; confirmed: boolean }
  | { widget: "store"; storeId: StoreId }
  | { widget: "servings"; servings: number }
  | { widget: "pantry"; have: string[] }
  | { widget: "skip"; skip: string[] };

export const IDLE_FLOW: Flow = { journey: null, step: "idle", allergiesConfirmed: false, extraDiets: [] };

export const GREETING: Message = {
  id: "m0",
  role: "assistant",
  text: "Hi, I'm Sprig, your grocery neighbour. Tell me what you're making or what you need, and I'll put together a cart you can check before anything is sent.",
  widget: { type: "suggestions", options: ["I want to make chili", "Restock my usual essentials"] },
};

export function initialChat(memory: Memory): ChatState {
  return { messages: [GREETING], flow: IDLE_FLOW, cart: null, memory };
}

export function contextFor(state: Pick<ChatState, "memory" | "flow">): ShopContext {
  const ctx = shopContext(state.memory);
  return { ...ctx, diets: [...new Set([...ctx.diets, ...state.flow.extraDiets])] };
}

let counter = 0;
function say(text: string, widget?: Widget): Message {
  counter += 1;
  return { id: `a${Date.now().toString(36)}${counter}`, role: "assistant", text, widget };
}

function userMessage(text: string): Message {
  counter += 1;
  return { id: `u${Date.now().toString(36)}${counter}`, role: "user", text };
}

function push(state: ChatState, ...messages: Message[]): ChatState {
  return { ...state, messages: [...state.messages, ...messages] };
}

function markAnswered(state: ChatState, messageId: string, summary: string): ChatState {
  return { ...state, messages: state.messages.map((m) => (m.id === messageId ? { ...m, answered: summary } : m)) };
}

function allergySummary(allergies: Allergen[], diets: Diet[]): string {
  const parts: string[] = [];
  if (allergies.length) parts.push(`avoiding ${allergenList(allergies)}`);
  if (diets.length) parts.push(diets.join(" and "));
  return parts.length ? parts.join(", ") : "no allergies";
}

// ---------------------------------------------------------------------------
// Journey steps

function startJourney(state: ChatState, journey: NonNullable<Flow["journey"]>): ChatState {
  const flow: Flow = { ...IDLE_FLOW, journey };
  return advance({ ...state, flow, cart: null }, journey.kind === "recipe" ? `${recipeName(journey.recipeId)}, great choice.` : "Happy to restock.");
}

function recipeName(id: string): string {
  return RECIPES.find((r) => r.id === id)?.name ?? "That";
}

/** Ask the next blocking checkpoint, or build the cart when nothing is missing. */
function advance(state: ChatState, lead = ""): ChatState {
  const { flow, memory } = state;
  const prefix = lead ? `${lead} ` : "";

  if (memory.allergies === null) {
    return push(
      { ...state, flow: { ...flow, step: "allergies" } },
      say(`${prefix}Before I build anything: does anyone you're shopping for have allergies or dietary needs?`, { type: "allergies" }),
    );
  }
  if (!flow.allergiesConfirmed) {
    const a = memory.allergies;
    const text = a.length ? `Still avoiding ${allergenList(a)}?` : "Still no allergies to plan around?";
    return push({ ...state, flow: { ...flow, step: "reconfirm" } }, say(`${prefix}${text}`, { type: "reconfirm", allergies: a }));
  }
  if (memory.store === null) {
    return push(
      { ...state, flow: { ...flow, step: "store" } },
      say(`${prefix}Which store should I shop at? Prices and stock depend on it.`, { type: "store" }),
    );
  }

  const journey = flow.journey;
  if (journey?.kind === "recipe") {
    const recipe = RECIPES.find((r) => r.id === journey.recipeId)!;
    if (flow.servings === undefined) {
      return push(
        { ...state, flow: { ...flow, step: "servings" } },
        say(`${prefix}How many people are you cooking for?`, { type: "servings", suggested: memory.householdSize ?? 4 }),
      );
    }
    if (flow.step !== "pantry") {
      const ctx = contextFor(state);
      const staples = recipe.ingredients.filter((i) => i.staple).map((i) => i.ingredient);
      return push(
        { ...state, flow: { ...flow, step: "pantry" } },
        say(
          `${prefix}Got it, ${recipe.name.toLowerCase()} for ${numberWord(flow.servings)}, from ${storeName(ctx.storeId)}. Do you already have any of these? Tap what you have and I'll leave it off.`,
          { type: "pantry", items: staples },
        ),
      );
    }
  }
  if (journey?.kind === "restock") return buildRestock(state, prefix);
  return state;
}

function flaggedSummary(cart: Cart): string {
  const flagged = cart.items.filter((i) => i.flags.length);
  const total = cartTotal(cart);
  const budgetLine =
    total <= cart.budget
      ? `${money(total)}, under your ${money(cart.budget)} budget`
      : `${money(total)}, which is ${money(total - cart.budget)} over your ${money(cart.budget)} budget. I've marked swaps that would help`;
  const lines = [`${plural(itemCount(cart), "item")} for ${budgetLine}.`];
  if (flagged.length) lines.push(`I flagged ${plural(flagged.length, "thing")} for you to check.`);
  const safety = cart.removed.filter((r) => r.reason.startsWith("Left out"));
  for (const r of safety) lines.push(r.reason);
  return lines.join(" ");
}

function buildRecipe(state: ChatState, have: string[]): ChatState {
  const journey = state.flow.journey as { kind: "recipe"; recipeId: string };
  const recipe = RECIPES.find((r) => r.id === journey.recipeId)!;
  const ctx = contextFor(state);
  const budget = state.memory.budget ?? DEFAULT_BUDGET.recipe;
  const cart = buildRecipeCart(recipe, state.flow.servings ?? 4, ctx, have, budget);
  const next = { ...state, cart, flow: { ...state.flow, step: "cart" as const } };
  return push(next, say(`Here's your draft cart: ${flaggedSummary(cart)}`, { type: "open-cart" }));
}

function buildRestock(state: ChatState, prefix: string): ChatState {
  const ctx = contextFor(state);
  const known = state.memory.essentials.length > 0;
  const essentials = known ? state.memory.essentials : STARTER_ESSENTIALS;
  const budget = state.memory.budget ?? DEFAULT_BUDGET.restock;
  const cart = buildRestockCart(essentials, ctx, budget);
  const memory = known ? state.memory : { ...state.memory, essentials };
  const intro = known
    ? `${prefix}Here are your usual essentials from ${storeName(ctx.storeId)}.`
    : `${prefix}I don't know your usuals yet, so here's a starter list from ${storeName(ctx.storeId)}. I'll remember it for next time.`;
  return push(
    { ...state, memory, cart, flow: { ...state.flow, step: "skip" } },
    say(`${intro} ${flaggedSummary(cart)} Anything to skip this week?`, {
      type: "skip",
      items: cart.items.map((i) => i.id),
    }),
  );
}

// ---------------------------------------------------------------------------
// Widget answers

export function answer(state: ChatState, messageId: string, a: Answer, echo = true): ChatState {
  const userSays = (text: string) => (echo ? [userMessage(text)] : []);
  switch (a.widget) {
    case "allergies": {
      const summary = allergySummary(a.allergies, a.diets);
      const memory = { ...state.memory, allergies: a.allergies, diets: a.diets };
      const next = push(markAnswered({ ...state, memory }, messageId, summary), ...userSays(capitalise(summary)));
      return advance({ ...next, flow: { ...next.flow, allergiesConfirmed: true } }, `Got it, ${summary}. I'll remember that.`);
    }
    case "reconfirm": {
      if (!a.confirmed) {
        const next = push(markAnswered(state, messageId, "Update"), ...userSays("Something's changed"));
        return advance({ ...next, memory: { ...next.memory, allergies: null } }, "No problem.");
      }
      const next = push(markAnswered(state, messageId, "Yes"), ...userSays("Yes, that's right"));
      return advance({ ...next, flow: { ...next.flow, allergiesConfirmed: true } }, "Thanks for confirming.");
    }
    case "store": {
      const name = storeName(a.storeId);
      const next = push(markAnswered(state, messageId, name), ...userSays(name));
      return advance({ ...next, memory: { ...next.memory, store: a.storeId } }, `${name} it is.`);
    }
    case "servings": {
      const next = push(markAnswered(state, messageId, String(a.servings)), ...userSays(`${a.servings} people`));
      const memory = next.memory.householdSize === null ? { ...next.memory, householdSize: a.servings } : next.memory;
      return advance({ ...next, memory, flow: { ...next.flow, servings: a.servings } });
    }
    case "pantry": {
      const names = a.have.map((i) => ingredientName(i).toLowerCase());
      const summary = names.length ? `Have ${names.join(", ")}` : "None of these";
      const next = push(markAnswered(state, messageId, summary), ...userSays(names.length ? `I have ${names.join(", ")}` : "I need all of them"));
      return buildRecipe(next, a.have);
    }
    case "skip": {
      const ctx = contextFor(state);
      let cart = state.cart!;
      for (const id of a.skip) cart = removeItem(cart, id, "Skipping this week", ctx);
      const names = a.skip.map((id) => ingredientName(id).toLowerCase());
      const next = push(
        { ...markAnswered(state, messageId, names.length ? `Skip ${names.join(", ")}` : "Keep everything"), cart, flow: { ...state.flow, step: "cart" } },
        ...userSays(names.length ? `Skip ${names.join(", ")}` : "Keep everything"),
      );
      const lead = names.length ? `Done, skipping ${names.join(", ")} this week.` : "Great, keeping everything.";
      return push(next, say(`${lead} ${plural(itemCount(cart), "item")}, ${money(cartTotal(cart))}. Your cart is ready to review.`, { type: "open-cart" }));
    }
  }
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Free text

const STOP = new Set(["the", "a", "an", "for", "some", "please", "can", "you", "and", "ones", "one", "with", "cheaper", "swap", "remove", "take", "out", "add", "more", "of", "to", "my", "me", "i", "don't", "dont", "need", "brand", "store", "it"]);

function itemsMatching(cart: Cart, text: string) {
  const words = text.toLowerCase().split(/[^a-z']+/).filter((w) => w.length > 2 && !STOP.has(w));
  return cart.items.filter((item) => {
    const p = getProduct(item.productId);
    const hay = `${p?.name ?? ""} ${item.ingredient}`.toLowerCase();
    return words.some((w) => hay.includes(w.replace(/s$/, "")));
  });
}

function parseAllergies(text: string): Allergen[] {
  const t = text.toLowerCase();
  return ALLERGENS.filter((a) => a.words.some((w) => new RegExp(`\\b${w}\\b`).test(t))).map((a) => a.id);
}

export function sendText(state: ChatState, raw: string): ChatState {
  const text = raw.trim();
  if (!text) return state;
  const t = text.toLowerCase();
  let next = push(state, userMessage(text));
  const pending = [...next.messages].reverse().find((m) => m.widget && !m.answered && m.role === "assistant");

  // Typed answers to a waiting checkpoint.
  if (pending?.widget?.type === "allergies") {
    const allergies = parseAllergies(t);
    const diets: Diet[] = /vegan/.test(t) ? ["vegan"] : /vegetarian/.test(t) ? ["vegetarian"] : [];
    if (allergies.length || diets.length || /\b(no|none|nope|nothing)\b/.test(t)) {
      return answer(next, pending.id, { widget: "allergies", allergies, diets }, false);
    }
  }
  if (pending?.widget?.type === "reconfirm" && /\b(yes|yep|yeah|still|correct|right)\b/.test(t)) {
    next = { ...next, messages: next.messages.slice(0, -1) };
    return answer(next, pending.id, { widget: "reconfirm", confirmed: true }, false);
  }
  if (pending?.widget?.type === "store") {
    const store = STORES.find((s) => t.includes(s.name.split(" ")[0].toLowerCase()));
    if (store) {
      return answer(next, pending.id, { widget: "store", storeId: store.id }, false);
    }
  }
  if (pending?.widget?.type === "servings") {
    const n = Number(t.match(/\d+/)?.[0] ?? ["one", "two", "three", "four", "five", "six", "seven", "eight"].indexOf(t.split(" ")[0]) + 1);
    if (n > 0 && n <= 20) {
      return answer(next, pending.id, { widget: "servings", servings: n }, false);
    }
  }

  // New journeys.
  const recipe = findRecipe(t);
  if (recipe) return startJourney(next, { kind: "recipe", recipeId: recipe.id });
  if (/restock|essentials|usual|the usual/.test(t)) return startJourney(next, { kind: "restock" });

  const cart = next.cart;
  if (cart) {
    const ctx = contextFor(next);

    if (/vegetarian|meatless|no meat|veggie/.test(t)) {
      const flow = { ...next.flow, extraDiets: [...new Set([...next.flow.extraDiets, "vegetarian" as Diet])] };
      const { cart: veg, changes } = applyDiet(cart, contextFor({ ...next, flow }));
      const title = veg.title.startsWith("Vegetarian") ? veg.title : `Vegetarian ${veg.title.charAt(0).toLowerCase()}${veg.title.slice(1)}`;
      const text = changes.length
        ? `Done, it's vegetarian now: ${changes.join("; ")}. New total ${money(cartTotal(veg))}.`
        : "Good news, everything in the cart is already vegetarian.";
      return push({ ...next, flow, cart: { ...veg, title } }, say(text, { type: "open-cart" }));
    }

    if (/cheap|save|less expensive|budget brand|store brand/.test(t) && !/\$?\d+/.test(t)) {
      const targets = itemsMatching(cart, t);
      const pool = targets.length ? targets : cart.items.filter((i) => i.flags.includes("over-budget"));
      let updated = cart;
      let saved = 0;
      const swapped: string[] = [];
      for (const item of pool.length ? pool : cart.items) {
        const swap = cheaperSwap(item, ctx);
        if (!swap) continue;
        const r = swapProduct(updated, item.id, swap.product.id, ctx);
        if (r.error) continue;
        updated = r.cart;
        saved += swap.saves;
        swapped.push(swap.product.name.toLowerCase());
      }
      if (!swapped.length) return push(next, say("Those are already the cheapest options I have at this store."));
      return push(
        { ...next, cart: updated },
        say(`Done, switched ${swapped.join(", ")} to the cheaper option. That saves ${money(saved)}; new total ${money(cartTotal(updated))}.`, { type: "open-cart" }),
      );
    }

    const budgetMatch = t.match(/budget[^\d]*\$?(\d+)|\$(\d+)/);
    if (budgetMatch) {
      const budget = Number(budgetMatch[1] ?? budgetMatch[2]);
      const updated = applyBudget({ ...cart, budget }, ctx);
      const total = cartTotal(updated);
      const text =
        total <= budget
          ? `Budget set to ${money(budget)}. You're at ${money(total)}, so you're all good.`
          : possibleSavings(updated, ctx) >= total - budget
            ? `Budget set to ${money(budget)}. You're ${money(total - budget)} over, so I've marked cheaper swaps that close the gap.`
            : `Budget set to ${money(budget)}. You're ${money(total - budget)} over. Cheaper brands only save ${money(possibleSavings(updated, ctx))}, so I've marked the biggest ones. Removing a topping or two would help too.`;
      return push({ ...next, cart: updated, memory: { ...next.memory, budget } }, say(text, { type: "open-cart" }));
    }

    if (/\b(remove|take out|drop|don't need|dont need|no more|skip)\b/.test(t)) {
      const targets = itemsMatching(cart, t);
      if (!targets.length) return push(next, say("I couldn't tell which item you meant. You can also tap Remove on it in the cart."));
      let updated = cart;
      for (const item of targets) updated = removeItem(updated, item.id, "You removed it", ctx);
      const names = targets.map((i) => ingredientName(i.ingredient).toLowerCase());
      return push({ ...next, cart: updated }, say(`Removed ${names.join(", ")}. New total ${money(cartTotal(updated))}.`));
    }

    const addMatch = t.match(/\badd\s+(.+)/);
    if (addMatch) {
      const found = searchCatalogue(addMatch[1], undefined, 20);
      if (!found.length) return push(next, say(`I couldn't find "${addMatch[1]}" in this store's catalogue.`));
      const product = found.find((p) => usable(p, ctx)) ?? found[0];
      const r = addIngredient(cart, product.ingredient, 1, ctx);
      if (r.error) return push(next, say(r.error));
      const added = r.cart.items.find((i) => i.ingredient === product.ingredient)!;
      const p = getProduct(added.productId)!;
      const note = added.reason ? ` ${added.reason}` : "";
      return push({ ...next, cart: r.cart }, say(`Added ${p.brand} ${p.name} (${p.size}).${note} New total ${money(cartTotal(r.cart))}.`));
    }

    if (/review|check ?out|send|ready|looks good|done|that's it|thats it/.test(t)) {
      return push(next, say("Great. Have one last look on the review screen; nothing is sent until you say so.", { type: "review" }));
    }
  }

  if (/dinner|lunch|something|idea|hungry|cook/.test(t)) {
    return push(
      next,
      say("I'm still learning recipes. In this preview I can build a chili cart or restock your usual essentials. Want to try one?", {
        type: "suggestions",
        options: ["I want to make chili", "Restock my usual essentials"],
      }),
    );
  }

  const tips = cart
    ? 'Try "make it vegetarian", "swap the beans for the cheaper ones", "remove the jalapeños", "add avocado" or "set my budget to $50".'
    : 'Try "I want to make chili" or "restock my usual essentials".';
  return push(next, say(`Sorry, this click-through preview only understands a few phrases so far. ${tips}`));
}
