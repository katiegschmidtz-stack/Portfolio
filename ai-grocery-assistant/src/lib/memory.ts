import type { Memory, ShopContext, StoreId } from "./types";

export const EMPTY_MEMORY: Memory = {
  store: null,
  allergies: null,
  diets: [],
  householdSize: null,
  budget: null,
  preferredBrands: {},
  essentials: [],
  spokenReplies: false,
};

/** A filled-in household for demos of the restock journey. */
export const SAMPLE_MEMORY: Memory = {
  store: "bow-valley",
  allergies: ["peanut"],
  diets: [],
  householdSize: 4,
  budget: 90,
  preferredBrands: {
    milk: "Maple Crest",
    "kidney-beans": "Harvest Moon",
    coffee: "Aurora Coffee Co.",
    "greek-yogurt": "Maple Crest",
  },
  essentials: [
    { ingredient: "milk", qty: 2 },
    { ingredient: "eggs", qty: 1 },
    { ingredient: "bread-whole-wheat", qty: 1 },
    { ingredient: "bananas", qty: 1 },
    { ingredient: "apples", qty: 1 },
    { ingredient: "greek-yogurt", qty: 1 },
    { ingredient: "coffee", qty: 1 },
    { ingredient: "peanut-butter", qty: 1 },
    { ingredient: "spinach", qty: 1 },
    { ingredient: "cheddar-cheese", qty: 1 },
    { ingredient: "chicken-breast", qty: 1 },
    { ingredient: "toilet-paper", qty: 1 },
  ],
  spokenReplies: false,
};

const KEY = "sprig.memory.v1";

export function loadMemory(): Memory {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_MEMORY;
    return { ...EMPTY_MEMORY, ...JSON.parse(raw) };
  } catch {
    return EMPTY_MEMORY;
  }
}

export function saveMemory(memory: Memory): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    // Private browsing or storage full: memory just won't persist.
  }
}

export function forgetEverything(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function shopContext(memory: Memory, storeOverride?: StoreId): ShopContext {
  return {
    storeId: storeOverride ?? memory.store ?? "bow-valley",
    allergies: memory.allergies ?? [],
    diets: memory.diets,
    preferredBrands: memory.preferredBrands,
  };
}
