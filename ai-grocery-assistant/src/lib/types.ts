export type Allergen =
  | "peanut"
  | "tree-nut"
  | "dairy"
  | "egg"
  | "gluten"
  | "soy"
  | "fish"
  | "shellfish"
  | "sesame"
  | "mustard";

export type Diet = "vegetarian" | "vegan";

export type StoreId = "bow-valley" | "chinook-fresh" | "foothills-food";

export interface Store {
  id: StoreId;
  name: string;
  neighbourhood: string;
  note: string;
}

export interface Product {
  id: string;
  /** Generic ingredient this product satisfies, e.g. "kidney-beans". */
  ingredient: string;
  name: string;
  brand: string;
  tier: "national" | "store";
  category: string;
  emoji: string;
  size: string;
  prices: Record<StoreId, number>;
  allergens: Allergen[];
  tags: string[];
  outOfStockAt: StoreId[];
}

export type Flag = "substituted" | "allergen-swap" | "brand-changed" | "over-budget" | "diet-swap";

export interface CartItem {
  id: string;
  productId: string;
  ingredient: string;
  qty: number;
  /** One short line shown under the item when the choice isn't obvious. */
  reason?: string;
  /** Plain-language reasoning behind the "Why?" link. */
  why: string;
  flags: Flag[];
  /** What the assistant first picked, so the review screen can list changes. */
  original: { productId: string; qty: number } | null;
}

export interface RemovedItem {
  ingredient: string;
  label: string;
  reason: string;
}

export interface Cart {
  title: string;
  journey: "recipe" | "restock";
  storeId: StoreId;
  budget: number;
  items: CartItem[];
  removed: RemovedItem[];
}

export interface Memory {
  store: StoreId | null;
  /** null means "never asked"; [] means "no allergies". */
  allergies: Allergen[] | null;
  diets: Diet[];
  householdSize: number | null;
  budget: number | null;
  preferredBrands: Record<string, string>;
  essentials: { ingredient: string; qty: number }[];
  spokenReplies: boolean;
}

export interface ShopContext {
  storeId: StoreId;
  allergies: Allergen[];
  diets: Diet[];
  preferredBrands: Record<string, string>;
}
