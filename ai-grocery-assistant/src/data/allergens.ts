import type { Allergen, Diet } from "@/lib/types";

export const ALLERGENS: { id: Allergen; label: string; words: string[] }[] = [
  { id: "peanut", label: "Peanuts", words: ["peanut", "peanuts"] },
  { id: "tree-nut", label: "Tree nuts", words: ["tree nut", "tree nuts", "almond", "almonds", "cashew", "walnut", "nuts"] },
  { id: "dairy", label: "Dairy", words: ["dairy", "milk", "lactose", "cheese"] },
  { id: "egg", label: "Eggs", words: ["egg", "eggs"] },
  { id: "gluten", label: "Gluten / wheat", words: ["gluten", "wheat", "celiac", "coeliac"] },
  { id: "soy", label: "Soy", words: ["soy", "soya"] },
  { id: "fish", label: "Fish", words: ["fish"] },
  { id: "shellfish", label: "Shellfish", words: ["shellfish", "shrimp", "crustacean"] },
  { id: "sesame", label: "Sesame", words: ["sesame"] },
  { id: "mustard", label: "Mustard", words: ["mustard"] },
];

export const DIETS: { id: Diet; label: string }[] = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
];

export function allergenLabel(id: Allergen): string {
  return ALLERGENS.find((a) => a.id === id)?.label ?? id;
}

/** "peanuts", "peanuts and dairy", "peanuts, dairy and eggs" */
export function allergenList(ids: Allergen[]): string {
  const names = ids.map((id) => allergenLabel(id).toLowerCase());
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
