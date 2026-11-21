"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chat({ suggestions, email }: { suggestions: string[]; email: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    const history: Msg[] = [...messages, { role: "user", content: q }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: text }]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages([...history, { role: "assistant", content: msg }]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    ask(input);
  }

  return (
    <div className="chat">
      <div className="chat-log" ref={logRef} aria-live="polite">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>
              Hi! I&apos;m an AI assistant that knows Katie&apos;s experience. Ask me anything a
              hiring manager would want to know.
            </p>
            <div className="chips">
              {suggestions.map((s) => (
                <button key={s} className="chip" onClick={() => ask(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>
              {m.content || <span className="typing" aria-label="Thinking"><i /><i /><i /></span>}
            </div>
          ))
        )}
      </div>
      <form className="chat-form" onSubmit={onSubmit}>
        <label htmlFor="chat-input" className="sr-only">
          Ask about Katie
        </label>
        <input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Katie's experience…"
          maxLength={1000}
          disabled={busy}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-gold" disabled={busy || !input.trim()}>
          Ask
        </button>
      </form>
      <p className="chat-note">
        Answers are AI-generated from Katie&apos;s resume and may not be perfect. For anything
        important, email <a href={`mailto:${email}`}>{email}</a>.
      </p>
    </div>
  );
}
