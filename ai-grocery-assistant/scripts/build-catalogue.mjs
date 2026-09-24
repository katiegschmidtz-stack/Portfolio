// Generates src/data/products.json: ~300 sample products for three fictional
// Calgary stores. Run with `npm run catalogue` after editing the lists below.
import { writeFileSync } from "node:fs";

const STORES = [
  { id: "bow-valley", factor: 1.0 },
  { id: "chinook-fresh", factor: 1.07 },
  { id: "foothills-food", factor: 0.95 },
];

const STORE_BRAND = "Market Basics";

// [key, name, category, emoji, size, national price (CAD), allergens, tags, national brands]
// Tags: "meat" and "fish" mark items that aren't vegetarian; "vegan" marks plant-only items.
const P = "Produce", M = "Meat & Seafood", D = "Dairy & Eggs", B = "Bakery",
  C = "Pantry", S = "Spices", BR = "Breakfast", SN = "Snacks", F = "Frozen",
  BV = "Beverages", H = "Household", PC = "Personal Care", PB = "Plant-Based";

const FARM = ["Big Sky Farms"];
const MEAT = ["Stampede Meats"];
const DAIRY = ["Wild Rose Dairy"];
const BAKE = ["Bowness Bakery"];
const PANTRY = ["Harvest Moon"];
const SPICE = ["Kananaskis Kitchen"];

const BASES = [
  // Produce
  ["yellow-onion", "Yellow Onion", P, "🧅", "1 each", 1.29, [], ["vegan"], FARM],
  ["red-onion", "Red Onion", P, "🧅", "1 each", 1.49, [], ["vegan"], FARM],
  ["garlic", "Garlic", P, "🧄", "1 head", 0.99, [], ["vegan"], FARM],
  ["red-bell-pepper", "Red Bell Pepper", P, "🫑", "1 each", 1.99, [], ["vegan"], FARM],
  ["green-bell-pepper", "Green Bell Pepper", P, "🫑", "1 each", 1.49, [], ["vegan"], FARM],
  ["jalapeno", "Jalapeño Peppers", P, "🌶️", "100 g", 0.79, [], ["vegan"], FARM],
  ["green-onions", "Green Onions", P, "🧅", "1 bunch", 1.29, [], ["vegan"], FARM],
  ["cilantro", "Cilantro", P, "🌿", "1 bunch", 1.49, [], ["vegan"], FARM],
  ["tomatoes", "Tomatoes on the Vine", P, "🍅", "680 g", 3.99, [], ["vegan"], FARM],
  ["avocado", "Avocado", P, "🥑", "1 each", 1.79, [], ["vegan"], FARM],
  ["lime", "Lime", P, "🍋", "1 each", 0.69, [], ["vegan"], FARM],
  ["lemon", "Lemon", P, "🍋", "1 each", 0.89, [], ["vegan"], FARM],
  ["bananas", "Bananas", P, "🍌", "1 kg (about 6)", 1.69, [], ["vegan"], FARM],
  ["apples", "Gala Apples", P, "🍎", "1.36 kg bag", 5.49, [], ["vegan"], FARM],
  ["oranges", "Navel Oranges", P, "🍊", "1.36 kg bag", 5.99, [], ["vegan"], FARM],
  ["strawberries", "Strawberries", P, "🍓", "454 g", 4.99, [], ["vegan"], FARM],
  ["blueberries", "Blueberries", P, "🫐", "340 g", 5.49, [], ["vegan"], FARM],
  ["grapes", "Red Seedless Grapes", P, "🍇", "1 kg", 5.99, [], ["vegan"], FARM],
  ["spinach", "Baby Spinach", P, "🥬", "312 g", 4.99, [], ["vegan"], FARM],
  ["romaine", "Romaine Hearts", P, "🥬", "3 pack", 4.49, [], ["vegan"], FARM],
  ["carrots", "Carrots", P, "🥕", "907 g bag", 2.49, [], ["vegan"], FARM],
  ["celery", "Celery", P, "🥬", "1 bunch", 2.99, [], ["vegan"], FARM],
  ["broccoli", "Broccoli", P, "🥦", "1 crown", 2.99, [], ["vegan"], FARM],
  ["potatoes", "Russet Potatoes", P, "🥔", "2.27 kg bag", 5.99, [], ["vegan"], FARM],
  ["sweet-potato", "Sweet Potato", P, "🍠", "1 each", 1.79, [], ["vegan"], FARM],
  ["cucumber", "English Cucumber", P, "🥒", "1 each", 1.49, [], ["vegan"], FARM],
  ["mushrooms", "White Mushrooms", P, "🍄", "227 g", 2.99, [], ["vegan"], FARM],
  ["zucchini", "Zucchini", P, "🥒", "1 each", 1.49, [], ["vegan"], FARM],
  ["corn-cobs", "Sweet Corn", P, "🌽", "4 cobs", 3.99, [], ["vegan"], FARM],

  // Meat & seafood
  ["ground-beef", "Lean Ground Beef", M, "🥩", "454 g", 7.99, [], ["meat"], ["Stampede Meats", "Rocky Ridge Ranch"]],
  ["ground-turkey", "Lean Ground Turkey", M, "🦃", "454 g", 7.49, [], ["meat"], MEAT],
  ["chicken-breast", "Boneless Chicken Breasts", M, "🍗", "about 900 g", 15.99, [], ["meat"], ["Stampede Meats", "Rocky Ridge Ranch"]],
  ["chicken-thighs", "Boneless Chicken Thighs", M, "🍗", "about 800 g", 11.99, [], ["meat"], MEAT],
  ["bacon", "Smoked Bacon", M, "🥓", "375 g", 6.99, [], ["meat"], MEAT],
  ["pork-chops", "Pork Loin Chops", M, "🥩", "about 600 g", 9.49, [], ["meat"], MEAT],
  ["stewing-beef", "Stewing Beef", M, "🥩", "about 680 g", 13.49, [], ["meat"], MEAT],
  ["italian-sausage", "Mild Italian Sausage", M, "🌭", "500 g", 7.99, [], ["meat"], MEAT],
  ["salmon", "Atlantic Salmon Fillets", M, "🐟", "2 x 170 g", 12.99, ["fish"], ["fish"], ["Northern Catch"]],
  ["shrimp", "Raw Shrimp, Frozen", M, "🦐", "340 g", 11.99, ["shellfish"], ["fish"], ["Northern Catch"]],
  ["sliced-ham", "Sliced Black Forest Ham", M, "🍖", "175 g", 4.49, [], ["meat"], MEAT],
  ["sliced-turkey", "Sliced Oven-Roasted Turkey", M, "🦃", "175 g", 4.99, [], ["meat"], MEAT],

  // Dairy & eggs
  ["milk", "2% Milk", D, "🥛", "2 L", 5.49, ["dairy"], [], ["Wild Rose Dairy", "Maple Crest"]],
  ["eggs", "Large Eggs", D, "🥚", "12 pack", 4.79, ["egg"], [], ["Wild Rose Dairy"]],
  ["butter", "Salted Butter", D, "🧈", "454 g", 6.99, ["dairy"], [], DAIRY],
  ["cheddar-cheese", "Shredded Old Cheddar", D, "🧀", "320 g", 7.49, ["dairy"], [], ["Wild Rose Dairy", "Maple Crest"]],
  ["mozzarella", "Mozzarella Block", D, "🧀", "340 g", 6.99, ["dairy"], [], DAIRY],
  ["parmesan", "Grated Parmesan", D, "🧀", "250 g", 6.49, ["dairy"], [], DAIRY],
  ["sour-cream", "Sour Cream 14%", D, "🥣", "500 mL", 3.49, ["dairy"], [], DAIRY],
  ["greek-yogurt", "Plain Greek Yogurt", D, "🥣", "750 g", 5.99, ["dairy"], [], ["Wild Rose Dairy", "Maple Crest"]],
  ["yogurt-cups", "Fruit Yogurt Cups", D, "🥣", "8 x 100 g", 4.99, ["dairy"], [], DAIRY],
  ["cream-cheese", "Cream Cheese", D, "🧀", "250 g", 4.29, ["dairy"], [], DAIRY],
  ["whipping-cream", "Whipping Cream 35%", D, "🥛", "473 mL", 4.49, ["dairy"], [], DAIRY],
  ["oat-milk", "Oat Beverage", PB, "🥛", "1.75 L", 4.79, [], ["vegan"], ["Prairie Oat Co."]],
  ["almond-milk", "Almond Beverage", PB, "🥛", "1.89 L", 4.49, ["tree-nut"], ["vegan"], ["Prairie Oat Co."]],
  ["dairy-free-shreds", "Dairy-Free Cheddar-Style Shreds", PB, "🧀", "200 g", 6.49, [], ["vegan"], ["Green Pasture"]],
  ["dairy-free-sour-cream", "Dairy-Free Sour Cream", PB, "🥣", "340 g", 4.99, [], ["vegan"], ["Green Pasture"]],
  ["dairy-free-butter", "Plant Butter", PB, "🧈", "454 g", 6.49, [], ["vegan"], ["Green Pasture"]],
  ["coconut-yogurt", "Coconut Yogurt", PB, "🥥", "500 g", 5.99, [], ["vegan"], ["Green Pasture"]],
  ["plant-based-ground", "Plant-Based Ground", PB, "🌱", "340 g", 6.99, [], ["vegan"], ["Green Pasture"]],
  ["tofu", "Firm Tofu", PB, "⬜", "454 g", 3.49, ["soy"], ["vegan"], ["Green Pasture"]],
  ["veggie-burgers", "Veggie Burgers", PB, "🍔", "4 pack", 6.49, ["soy", "gluten"], ["vegan"], ["Green Pasture"]],

  // Bakery
  ["bread-white", "Sliced White Bread", B, "🍞", "675 g", 3.49, ["gluten"], ["vegan"], BAKE],
  ["bread-whole-wheat", "Whole Wheat Bread", B, "🍞", "675 g", 3.79, ["gluten"], ["vegan"], BAKE],
  ["gluten-free-bread", "Gluten-Free White Bread", B, "🍞", "454 g", 6.99, ["egg"], [], BAKE],
  ["bagels", "Sesame Bagels", B, "🥯", "6 pack", 3.99, ["gluten", "sesame"], ["vegan"], BAKE],
  ["flour-tortillas", "Flour Tortillas", B, "🫓", "10 pack", 4.29, ["gluten"], ["vegan"], BAKE],
  ["corn-tortillas", "Corn Tortillas", B, "🫓", "30 pack", 3.99, [], ["vegan"], BAKE],
  ["hamburger-buns", "Hamburger Buns", B, "🍔", "8 pack", 3.49, ["gluten"], ["vegan"], BAKE],
  ["croissants", "Butter Croissants", B, "🥐", "6 pack", 5.99, ["gluten", "dairy", "egg"], [], BAKE],

  // Pantry and canned
  ["diced-tomatoes", "Diced Tomatoes", C, "🥫", "796 mL", 2.49, [], ["vegan"], ["Harvest Moon", "Prairie Gold"]],
  ["crushed-tomatoes", "Crushed Tomatoes", C, "🥫", "796 mL", 2.49, [], ["vegan"], PANTRY],
  ["tomato-paste", "Tomato Paste", C, "🥫", "156 mL", 1.29, [], ["vegan"], PANTRY],
  ["pasta-sauce", "Marinara Pasta Sauce", C, "🥫", "650 mL", 3.99, [], ["vegan"], ["Harvest Moon", "Prairie Gold"]],
  ["kidney-beans", "Red Kidney Beans", C, "🥫", "540 mL", 1.79, [], ["vegan"], ["Harvest Moon", "Prairie Gold"]],
  ["black-beans", "Black Beans", C, "🥫", "540 mL", 1.79, [], ["vegan"], ["Harvest Moon", "Prairie Gold"]],
  ["chickpeas", "Chickpeas", C, "🥫", "540 mL", 1.79, [], ["vegan"], PANTRY],
  ["pinto-beans", "Pinto Beans", C, "🥫", "540 mL", 1.79, [], ["vegan"], PANTRY],
  ["beef-broth", "Beef Broth", C, "🥣", "900 mL", 3.29, [], ["meat"], PANTRY],
  ["chicken-broth", "Chicken Broth", C, "🥣", "900 mL", 3.29, [], ["meat"], PANTRY],
  ["vegetable-broth", "Vegetable Broth", C, "🥣", "900 mL", 2.99, [], ["vegan"], PANTRY],
  ["canned-corn", "Kernel Corn", C, "🌽", "341 mL", 1.49, [], ["vegan"], PANTRY],
  ["tuna", "Flaked Light Tuna", C, "🐟", "170 g", 1.99, ["fish"], ["fish"], ["Northern Catch"]],
  ["chicken-noodle-soup", "Chicken Noodle Soup", C, "🥣", "540 mL", 2.29, ["gluten"], ["meat"], PANTRY],
  ["spaghetti", "Spaghetti", C, "🍝", "900 g", 2.99, ["gluten"], ["vegan"], ["Harvest Moon", "Prairie Gold"]],
  ["penne", "Penne Rigate", C, "🍝", "900 g", 2.99, ["gluten"], ["vegan"], PANTRY],
  ["gluten-free-pasta", "Gluten-Free Rice Penne", C, "🍝", "340 g", 3.99, [], ["vegan"], PANTRY],
  ["rice", "Long Grain White Rice", C, "🍚", "2 kg", 5.99, [], ["vegan"], PANTRY],
  ["basmati-rice", "Basmati Rice", C, "🍚", "2 kg", 8.99, [], ["vegan"], PANTRY],
  ["quinoa", "White Quinoa", C, "🍚", "900 g", 7.99, [], ["vegan"], PANTRY],
  ["flour", "All-Purpose Flour", C, "🌾", "2.5 kg", 5.49, ["gluten"], ["vegan"], PANTRY],
  ["sugar", "White Sugar", C, "🧂", "2 kg", 3.99, [], ["vegan"], PANTRY],
  ["brown-sugar", "Golden Brown Sugar", C, "🧂", "1 kg", 3.49, [], ["vegan"], PANTRY],
  ["olive-oil", "Extra Virgin Olive Oil", C, "🫒", "1 L", 12.99, [], ["vegan"], PANTRY],
  ["canola-oil", "Canola Oil", C, "🫗", "1.89 L", 6.99, [], ["vegan"], PANTRY],
  ["vinegar", "White Vinegar", C, "🫗", "1 L", 2.49, [], ["vegan"], PANTRY],
  ["peanut-butter", "Smooth Peanut Butter", C, "🥜", "1 kg", 6.99, ["peanut"], ["vegan"], ["Harvest Moon", "Prairie Gold"]],
  ["almond-butter", "Almond Butter", C, "🥜", "500 g", 8.99, ["tree-nut"], ["vegan"], PANTRY],
  ["sunflower-seed-butter", "Sunflower Seed Butter", C, "🌻", "500 g", 7.49, [], ["vegan"], PANTRY],
  ["honey", "Liquid Honey", C, "🍯", "500 g", 7.99, [], [], ["Big Sky Farms"]],
  ["maple-syrup", "Pure Maple Syrup", C, "🍁", "540 mL", 9.99, [], ["vegan"], PANTRY],
  ["jam", "Strawberry Jam", C, "🍓", "500 mL", 4.49, [], ["vegan"], PANTRY],
  ["salsa", "Medium Salsa", C, "🌶️", "650 mL", 4.29, [], ["vegan"], PANTRY],
  ["ketchup", "Ketchup", C, "🍅", "1 L", 4.49, [], ["vegan"], PANTRY],
  ["mustard", "Yellow Mustard", C, "🌭", "375 mL", 2.49, ["mustard"], ["vegan"], PANTRY],
  ["mayonnaise", "Real Mayonnaise", C, "🥚", "890 mL", 5.99, ["egg"], [], PANTRY],
  ["soy-sauce", "Soy Sauce", C, "🫗", "500 mL", 3.49, ["soy", "gluten"], ["vegan"], PANTRY],

  // Spices
  ["chili-powder", "Chili Powder", S, "🌶️", "70 g", 3.49, [], ["vegan"], SPICE],
  ["cumin", "Ground Cumin", S, "🟤", "60 g", 3.99, [], ["vegan"], SPICE],
  ["oregano", "Dried Oregano", S, "🌿", "12 g", 2.99, [], ["vegan"], SPICE],
  ["paprika", "Smoked Paprika", S, "🌶️", "70 g", 3.99, [], ["vegan"], SPICE],
  ["garlic-powder", "Garlic Powder", S, "🧄", "90 g", 3.99, [], ["vegan"], SPICE],
  ["black-pepper", "Ground Black Pepper", S, "⚫", "100 g", 4.49, [], ["vegan"], SPICE],
  ["salt", "Iodized Table Salt", S, "🧂", "1 kg", 1.99, [], ["vegan"], SPICE],
  ["cinnamon", "Ground Cinnamon", S, "🟤", "50 g", 3.49, [], ["vegan"], SPICE],
  ["cayenne", "Cayenne Pepper", S, "🌶️", "40 g", 3.29, [], ["vegan"], SPICE],

  // Breakfast
  ["coffee", "Medium Roast Ground Coffee", BR, "☕", "925 g", 14.99, [], ["vegan"], ["Aurora Coffee Co."]],
  ["tea", "Orange Pekoe Tea", BR, "🫖", "72 bags", 4.99, [], ["vegan"], ["Aurora Coffee Co."]],
  ["cereal", "Toasted Oat O's", BR, "🥣", "425 g", 4.99, ["gluten"], ["vegan"], ["Chinook Mills"]],
  ["granola", "Maple Almond Granola", BR, "🥣", "750 g", 5.99, ["gluten", "tree-nut"], [], ["Chinook Mills"]],
  ["oats", "Large Flake Oats", BR, "🌾", "1 kg", 4.49, ["gluten"], ["vegan"], ["Chinook Mills"]],
  ["pancake-mix", "Buttermilk Pancake Mix", BR, "🥞", "905 g", 3.99, ["gluten", "dairy"], [], ["Chinook Mills"]],

  // Snacks
  ["tortilla-chips", "Tortilla Chips", SN, "🌽", "300 g", 3.99, [], ["vegan"], ["Crunch Creek"]],
  ["potato-chips", "Sea Salt Potato Chips", SN, "🥔", "235 g", 3.99, [], ["vegan"], ["Crunch Creek"]],
  ["crackers", "Wheat Crackers", SN, "🍘", "200 g", 3.49, ["gluten"], ["vegan"], ["Crunch Creek"]],
  ["granola-bars", "Peanut Butter Granola Bars", SN, "🍫", "6 bars", 3.99, ["peanut", "gluten"], [], ["Chinook Mills"]],
  ["trail-mix", "Classic Trail Mix", SN, "🥜", "600 g", 8.99, ["peanut", "tree-nut"], ["vegan"], ["Crunch Creek"]],

  // Frozen
  ["frozen-peas", "Frozen Green Peas", F, "🟢", "750 g", 2.99, [], ["vegan"], ["Glacier Fresh"]],
  ["frozen-mixed-veg", "Frozen Mixed Vegetables", F, "🥕", "1 kg", 3.49, [], ["vegan"], ["Glacier Fresh"]],
  ["frozen-berries", "Frozen Mixed Berries", F, "🫐", "600 g", 5.99, [], ["vegan"], ["Glacier Fresh"]],
  ["frozen-pizza", "Pepperoni Pizza", F, "🍕", "about 900 g", 7.99, ["gluten", "dairy"], ["meat"], ["Glacier Fresh"]],
  ["ice-cream", "Vanilla Ice Cream", F, "🍨", "1.5 L", 5.99, ["dairy", "egg"], [], ["Wild Rose Dairy"]],

  // Beverages
  ["orange-juice", "Orange Juice, No Pulp", BV, "🧃", "1.54 L", 4.49, [], ["vegan"], ["Sunny Slope"]],
  ["apple-juice", "Apple Juice", BV, "🧃", "1.89 L", 3.49, [], ["vegan"], ["Sunny Slope"]],
  ["sparkling-water", "Lime Sparkling Water", BV, "🫧", "12 x 355 mL", 5.99, [], ["vegan"], ["Glacier Springs"]],

  // Household
  ["toilet-paper", "Toilet Paper", H, "🧻", "12 double rolls", 9.99, [], [], ["Northern Home"]],
  ["paper-towels", "Paper Towels", H, "🧻", "6 rolls", 8.99, [], [], ["Northern Home"]],
  ["dish-soap", "Dish Soap", H, "🧴", "740 mL", 3.99, [], [], ["Northern Home"]],
  ["dishwasher-pods", "Dishwasher Pods", H, "🫧", "40 pack", 12.99, [], [], ["Northern Home"]],
  ["laundry-detergent", "Laundry Detergent", H, "🧺", "2.03 L", 12.99, [], [], ["Northern Home"]],
  ["garbage-bags", "Kitchen Garbage Bags", H, "🗑️", "40 pack", 8.49, [], [], ["Northern Home"]],

  // Personal care
  ["toothpaste", "Fluoride Toothpaste", PC, "🪥", "130 mL", 2.99, [], [], ["Clearwater"]],
  ["shampoo", "Everyday Shampoo", PC, "🧴", "750 mL", 5.99, [], [], ["Clearwater"]],
  ["hand-soap", "Hand Soap", PC, "🧼", "354 mL", 2.99, [], [], ["Clearwater"]],
];

// Deterministic "random" so the catalogue is stable between runs.
function hash(str) {
  let h = 2166136261;
  for (const ch of str) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Price endings people expect on shelf tags: x.29, x.49, x.79, x.99 ...
function shelfPrice(n) {
  const whole = Math.floor(n);
  const cents = n - whole;
  const endings = [0.29, 0.49, 0.79, 0.99];
  const end = endings.find((e) => cents <= e + 0.001) ?? 0.99;
  return Math.round((whole + end) * 100) / 100;
}

// Items the demo relies on being out of stock somewhere.
const FORCED_OUT = new Set([
  "kidney-beans--harvest-moon@bow-valley",
  "cumin--kananaskis-kitchen@chinook-fresh",
  "cheddar-cheese--wild-rose-dairy@foothills-food",
  "coffee--aurora-coffee-co@bow-valley",
]);

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const products = [];
for (const [key, name, category, emoji, size, price, allergens, tags, brands] of BASES) {
  const variants = [
    ...brands.map((brand, i) => ({ brand, tier: "national", base: price * (1 + i * 0.12) })),
    { brand: STORE_BRAND, tier: "store", base: price * 0.8 },
  ];
  for (const v of variants) {
    const id = `${key}--${slug(v.brand)}`;
    const prices = {};
    const outOfStockAt = [];
    for (const store of STORES) {
      const jitter = 1 + ((hash(id + store.id) % 7) - 3) / 100; // ±3% per store
      prices[store.id] = shelfPrice(v.base * store.factor * jitter);
      const forced = FORCED_OUT.has(`${id}@${store.id}`);
      const random = hash(`stock:${id}:${store.id}`) % 29 === 0 && !["salt", "garlic"].includes(key);
      if (forced || random) outOfStockAt.push(store.id);
    }
    products.push({
      id,
      ingredient: key,
      name,
      brand: v.brand,
      tier: v.tier,
      category,
      emoji,
      size,
      prices,
      allergens,
      tags,
      outOfStockAt,
    });
  }
}

writeFileSync(new URL("../src/data/products.json", import.meta.url), JSON.stringify(products, null, 1) + "\n");
console.log(`Wrote ${products.length} products across ${new Set(products.map((p) => p.category)).size} categories.`);
