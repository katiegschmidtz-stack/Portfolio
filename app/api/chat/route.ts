import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/chatPrompt";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-opus-5-5";
const MAX_TURNS = 12; // messages of history kept per request
const MAX_CHARS = 1000; // per user message
const RATE_LIMIT = 20; // requests per IP per hour (best effort, per server instance)

const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + 60 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

function cleanMessages(input: unknown): Anthropic.MessageParam[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;
  const out: Anthropic.MessageParam[] = [];
  for (const m of input.slice(-MAX_TURNS)) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
      return null;
    }
    const content = m.content.trim().slice(0, m.role === "user" ? MAX_CHARS : 4000);
    if (!content) return null;
    out.push({ role: m.role, content });
  }
  // The API expects the conversation to start with a user turn and end with one.
  while (out.length && out[0].role !== "user") out.shift();
  if (!out.length || out[out.length - 1].role !== "user") return null;
  return out;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "The chat isn't switched on yet. Please email Katie instead." },
      { status: 503 },
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return Response.json(
      { error: "You've asked a lot of questions! Please try again later, or email Katie directly." },
      { status: 429 },
    );
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const messages = cleanMessages(body.messages);
  if (!messages) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 2048, // answers are a few sentences; this caps cost per question
    output_config: { effort: "low" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral", ttl: "1h" } },
    ],
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode("I can't help with that one. Try asking about Katie's experience or skills."),
          );
        }
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
          console.error("Anthropic rate limit", error.status);
        } else if (error instanceof Anthropic.APIError) {
          console.error("Anthropic API error", error.status, error.message);
        } else {
          console.error("Chat stream error", error);
        }
        controller.enqueue(
          encoder.encode("\n\nSorry, something went wrong on my end. Please try again or email Katie."),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
