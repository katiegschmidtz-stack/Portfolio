export interface RecipeIngredient {
  ingredient: string;
  /** Packages needed for 4 servings. */
  qtyFor4: number;
  /** Counts toward "recipe completeness"; toppings are optional. */
  required: boolean;
  /** Offered in the pantry check. */
  staple?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  keywords: string[];
  ingredients: RecipeIngredient[];
}

export const RECIPES: Recipe[] = [
  {
    id: "chili",
    name: "Chili",
    keywords: ["chili", "chilli", "chile con carne"],
    ingredients: [
      { ingredient: "ground-beef", qtyFor4: 1, required: true },
      { ingredient: "yellow-onion", qtyFor4: 1, required: true },
      { ingredient: "garlic", qtyFor4: 1, required: true, staple: true },
      { ingredient: "red-bell-pepper", qtyFor4: 1, required: true },
      { ingredient: "jalapeno", qtyFor4: 1, required: false },
      { ingredient: "diced-tomatoes", qtyFor4: 1, required: true },
      { ingredient: "tomato-paste", qtyFor4: 1, required: true },
      { ingredient: "kidney-beans", qtyFor4: 1, required: true },
      { ingredient: "black-beans", qtyFor4: 1, required: true },
      { ingredient: "beef-broth", qtyFor4: 1, required: true },
      { ingredient: "chili-powder", qtyFor4: 1, required: true, staple: true },
      { ingredient: "cumin", qtyFor4: 1, required: true, staple: true },
      { ingredient: "oregano", qtyFor4: 1, required: false, staple: true },
      { ingredient: "olive-oil", qtyFor4: 1, required: false, staple: true },
      { ingredient: "salt", qtyFor4: 1, required: false, staple: true },
      { ingredient: "cheddar-cheese", qtyFor4: 1, required: false },
      { ingredient: "sour-cream", qtyFor4: 1, required: false },
      { ingredient: "green-onions", qtyFor4: 1, required: false },
      { ingredient: "tortilla-chips", qtyFor4: 1, required: false },
    ],
  },
];

export function findRecipe(text: string): Recipe | undefined {
  const t = text.toLowerCase();
  return RECIPES.find((r) => r.keywords.some((k) => t.includes(k)));
}
