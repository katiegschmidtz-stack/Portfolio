import { describe, expect, it } from "vitest";
import { RECIPES } from "@/data/recipes";
import { addIngredient, buildRecipeCart, buildRestockCart, cartTotal, swapProduct } from "@/lib/cart";
import { getProduct, PRODUCTS } from "@/lib/catalogue";
import { SAMPLE_MEMORY, shopContext } from "@/lib/memory";
import { answer, initialChat, sendText } from "@/lib/scripted";
import type { Allergen, ShopContext } from "@/lib/types";

const chili = RECIPES.find((r) => r.id === "chili")!;
const ctx = (over: Partial<ShopContext> = {}): ShopContext => ({
  storeId: "bow-valley",
  allergies: [],
  diets: [],
  preferredBrands: {},
  ...over,
});

function allergensIn(cart: ReturnType<typeof buildRecipeCart>): Allergen[] {
  return cart.items.flatMap((i) => getProduct(i.productId)!.allergens);
}

describe("catalogue", () => {
  it("has about 300 products with prices at all three stores", () => {
    expect(PRODUCTS.length).toBeGreaterThanOrEqual(280);
    for (const p of PRODUCTS) expect(Object.keys(p.prices)).toHaveLength(3);
  });
});

describe("allergen rule", () => {
  it("never puts a dairy item in a chili cart for a dairy allergy, and explains the swap", () => {
    const cart = buildRecipeCart(chili, 4, ctx({ allergies: ["dairy"] }), [], 60);
    expect(allergensIn(cart)).not.toContain("dairy");
    const cheese = cart.items.find((i) => i.ingredient === "cheddar-cheese")!;
    expect(cheese.flags).toContain("allergen-swap");
    expect(cheese.reason).toMatch(/dairy/);
  });

  it("swaps peanut butter in a restock for a peanut allergy", () => {
    const cart = buildRestockCart(SAMPLE_MEMORY.essentials, shopContext(SAMPLE_MEMORY), 90);
    expect(cart.items.flatMap((i) => getProduct(i.productId)!.allergens)).not.toContain("peanut");
    expect(getProduct(cart.items.find((i) => i.ingredient === "peanut-butter")!.productId)!.ingredient).toBe("sunflower-seed-butter");
  });

  it("refuses to swap or add an unsafe product", () => {
    const c = ctx({ allergies: ["peanut"] });
    const cart = buildRestockCart([{ ingredient: "bananas", qty: 1 }], c, 90);
    const r = swapProduct(cart, "bananas", "peanut-butter--harvest-moon", c);
    expect(r.error).toMatch(/peanut/);
    const added = addIngredient(cart, "trail-mix", 1, c);
    expect(added.cart.items.map((i) => i.ingredient)).not.toContain("trail-mix");
  });
});

describe("recipe cart", () => {
  it("contains every required ingredient and removes pantry items", () => {
    const cart = buildRecipeCart(chili, 4, ctx(), ["cumin"], 60);
    const have = cart.items.map((i) => i.ingredient);
    for (const ing of chili.ingredients.filter((i) => i.required && i.ingredient !== "cumin")) {
      expect(have).toContain(ing.ingredient);
    }
    expect(cart.removed.map((r) => r.ingredient)).toContain("cumin");
  });

  it("substitutes an out-of-stock brand with a reason", () => {
    const cart = buildRecipeCart(chili, 4, ctx(), [], 60);
    const beans = cart.items.find((i) => i.ingredient === "kidney-beans")!;
    expect(beans.flags).toContain("substituted");
    expect(beans.reason).toMatch(/out of stock/);
  });

  it("flags swaps when over budget", () => {
    const cart = buildRecipeCart(chili, 8, ctx(), [], 30);
    expect(cartTotal(cart)).toBeGreaterThan(30);
    expect(cart.items.some((i) => i.flags.includes("over-budget"))).toBe(true);
  });
});

describe("scripted chili journey", () => {
  it("asks blocking checkpoints before building, then builds a cart", () => {
    let s = sendText(initialChat({ ...SAMPLE_MEMORY, allergies: null, store: null }), "I want to make chili");
    expect(s.cart).toBeNull();
    expect(s.messages.at(-1)!.widget?.type).toBe("allergies");
    s = answer(s, s.messages.at(-1)!.id, { widget: "allergies", allergies: ["peanut"], diets: [] });
    expect(s.messages.at(-1)!.widget?.type).toBe("store");
    s = answer(s, s.messages.at(-1)!.id, { widget: "store", storeId: "chinook-fresh" });
    expect(s.messages.at(-1)!.widget?.type).toBe("servings");
    s = answer(s, s.messages.at(-1)!.id, { widget: "servings", servings: 4 });
    expect(s.messages.at(-1)!.widget?.type).toBe("pantry");
    s = answer(s, s.messages.at(-1)!.id, { widget: "pantry", have: ["salt"] });
    expect(s.cart?.items.length).toBeGreaterThan(10);
    s = sendText(s, "make it vegetarian");
    expect(s.cart!.items.every((i) => !getProduct(i.productId)!.tags.includes("meat"))).toBe(true);
  });
});
