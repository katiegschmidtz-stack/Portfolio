# Katie Schmidtz · Portfolio

Personal portfolio site: impact metrics, case studies, things I've built, a printable web resume, and a "Chat with my resume" AI assistant.

Built with Next.js (App Router) and deployed on Vercel. The chat uses the Claude API.

## Editing content

All copy lives in `lib/content.ts`. The page, the `/resume` page, and the chat assistant all read from it, so a fact changed there updates everywhere.

## Running locally

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

## Deploying on Vercel

1. In Vercel, choose **Add New → Project** and import this repository. The defaults for Next.js work as is.
2. Under **Settings → Environment Variables**, add `ANTHROPIC_API_KEY` (create a key at console.anthropic.com). Without it, the site works and the chat politely says it isn't switched on.
3. In the Anthropic Console, set a monthly spend limit for the key as a safety net.
4. Add a custom domain under **Settings → Domains**.

## Chat assistant

- `app/api/chat/route.ts` streams answers from Claude, grounded on the system prompt built in `lib/chatPrompt.ts`.
- Each answer is capped in length, user messages are limited to 1,000 characters, and each visitor gets about 20 questions an hour (best effort per server instance).
- The system prompt is cached, so repeat questions cost much less.
