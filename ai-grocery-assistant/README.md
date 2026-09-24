# Sprig: AI grocery assistant (demo)

A phone-first grocery assistant for Calgary shoppers. Say or type "I want to make chili" or "restock my usual essentials" and Sprig builds a draft cart you can check and change before anything is sent to checkout.

"Sprig" is a placeholder name and identity. It is not affiliated with Instacart.

## Build status

| Phase | What it adds | Status |
| --- | --- | --- |
| 1 | Sample catalogue, phone screens, scripted replies | **Done** |
| 2 | Claude as the assistant (server-side API key) | Not started |
| 3 | Voice input and spoken replies, memory polish | Not started |
| 4 | "How I test this" evaluation page | Not started |
| 5 | Instacart handoff, access code, daily cap | Not started |

## Preview it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
cd ai-grocery-assistant
npm install        # first time only: downloads the building blocks
npm run dev        # starts the app
```

Then open http://localhost:3000. To see it at phone size in Chrome, open DevTools (Cmd+Option+I) and click the phone icon.

### Things to try (Phase 1)

In Phase 1 the replies are scripted, so Sprig only understands a few phrases.

1. Tap **I want to make chili**. Pick an allergy (try Dairy), a store, the number of people, and anything you already have.
2. Tap **Open my cart**. Check the flagged items, tap **Why?**, try **Swap**, the quantity buttons and **Change budget**.
3. Type follow-ups: "make it vegetarian", "swap the beans for the cheaper ones", "remove the jalapeños", "add avocado", "set my budget to $40".
4. Tap **Review cart** for the final review screen. **Send to Instacart** shows a "coming soon" list until Phase 5.
5. Open **What I remember** to edit or delete anything, or **Load a sample household**, then start a **New shop** and tap **Restock my usual essentials**.

## How it's put together

- `scripts/build-catalogue.mjs` generates `src/data/products.json`: 297 fictional products with national-brand and store-brand ("Market Basics") tiers, CAD prices and stock for three fictional Calgary stores. Run `npm run catalogue` after editing it.
- `src/lib/cart.ts` holds the cart rules: allergen safety, diet swaps, out-of-stock substitutions, budget flags. The AI in Phase 2 will call these same functions, so the allergen rule is enforced in code, not only in instructions.
- `src/lib/scripted.ts` is the Phase 1 stand-in for the AI.
- Memory is stored in this browser only (`localStorage`), with a "Forget everything" button.

## Checks

```bash
npm test           # cart and safety rules
npm run typecheck
npm run build
```
