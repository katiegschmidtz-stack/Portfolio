import productsJson from "@/data/products.json";
import { getStore } from "@/data/stores";
import type { Allergen, Diet, Product, ShopContext, StoreId } from "./types";

export const PRODUCTS = productsJson as Product[];

const byId = new Map(PRODUCTS.map((p) => [p.id, p]));

export function getProduct(id: string): Product | undefined {
  return byId.get(id);
}

export function productsFor(ingredient: string): Product[] {
  return PRODUCTS.filter((p) => p.ingredient === ingredient);
}

/** Generic name for an ingredient, e.g. "Red Kidney Beans". */
export function ingredientName(ingredient: string): string {
  return productsFor(ingredient)[0]?.name ?? ingredient.replace(/-/g, " ");
}

export function priceAt(product: Product, storeId: StoreId): number {
  return product.prices[storeId];
}

export function inStock(product: Product, storeId: StoreId): boolean {
  return !product.outOfStockAt.includes(storeId);
}

/** The allergen rule. Every path that puts a product in a cart goes through this. */
export function containsAllergen(product: Product, allergies: Allergen[]): Allergen[] {
  return product.allergens.filter((a) => allergies.includes(a));
}

export function isSafe(product: Product, allergies: Allergen[]): boolean {
  return containsAllergen(product, allergies).length === 0;
}

export function fitsDiet(product: Product, diets: Diet[]): boolean {
  if (diets.includes("vegan") && !product.tags.includes("vegan")) return false;
  if (diets.includes("vegetarian") && (product.tags.includes("meat") || product.tags.includes("fish"))) return false;
  return true;
}

export function usable(product: Product, ctx: ShopContext): boolean {
  return isSafe(product, ctx.allergies) && fitsDiet(product, ctx.diets) && inStock(product, ctx.storeId);
}

export function storeName(storeId: StoreId): string {
  return getStore(storeId).name;
}

/** Loose text search used for "add ..." requests. */
export function searchCatalogue(query: string, ctx?: ShopContext, limit = 8): Product[] {
  const words = query
    .toLowerCase()
    .split(/[^a-z0-9%]+/)
    .filter((w) => w.length > 2);
  if (!words.length) return [];
  const scored = PRODUCTS.map((p) => {
    const hay = `${p.name} ${p.brand} ${p.ingredient} ${p.category}`.toLowerCase();
    const score = words.reduce((s, w) => s + (hay.includes(w.replace(/s$/, "")) ? 1 : 0), 0);
    return { p, score };
  })
    .filter((x) => x.score > 0 && (!ctx || usable(x.p, ctx)))
    .sort((a, b) => b.score - a.score || (ctx ? priceAt(a.p, ctx.storeId) - priceAt(b.p, ctx.storeId) : 0));
  return scored.slice(0, limit).map((x) => x.p);
}
