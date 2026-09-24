"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "./AppProvider";
import { Logo, TopBar } from "./bits";
import { CartSheet } from "./CartSheet";
import { MessageWidget } from "./Widgets";

function Composer() {
  const { send } = useApp();
  const [text, setText] = useState("");
  const [note, setNote] = useState<string>();

  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault();
        send(text);
        setText("");
        setNote(undefined);
      }}
    >
      {note && (
        <p className="composer-note" role="status">
          {note}
        </p>
      )}
      <div className="composer-row">
        <label htmlFor="chat-input" className="visually-hidden">
          Message Sprig
        </label>
        <input
          id="chat-input"
          className="composer-input"
          placeholder="What are you shopping for?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoComplete="off"
          enterKeyHint="send"
        />
        <button
          type="button"
          className="round-btn round-btn-mic"
          aria-label="Speak your request"
          onClick={() => setNote("Voice input arrives in Phase 3. For now, type your request.")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11h-2Z"
            />
          </svg>
        </button>
        <button type="submit" className="round-btn round-btn-send" aria-label="Send" disabled={!text.trim()}>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z" />
          </svg>
        </button>
      </div>
    </form>
  );
}

export function ChatScreen() {
  const { state, ready, newShop } = useApp();
  const endRef = useRef<HTMLDivElement>(null);
  const lastWidgetId = [...state.messages].reverse().find((m) => m.widget)?.id;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "end" });
  }, [state.messages.length]);

  return (
    <div className="screen chat-screen">
      <TopBar>
        {state.messages.length > 1 && (
          <button type="button" className="pill-link" onClick={newShop}>
            New shop
          </button>
        )}
      </TopBar>
      <main id="main" className="chat-log" role="log" aria-live="polite" aria-label="Conversation with Sprig" aria-busy={!ready}>
        {state.messages.map((m) => (
          <div key={m.id} className={`msg msg-${m.role}`}>
            {m.role === "assistant" && (
              <span className="msg-avatar">
                <Logo />
              </span>
            )}
            <div className="msg-body">
              <p className="bubble">
                <span className="visually-hidden">{m.role === "assistant" ? "Sprig: " : "You: "}</span>
                {m.text}
              </p>
              {m.widget && <MessageWidget message={m} latest={m.id === lastWidgetId} />}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </main>
      <div className="dock">
        <CartSheet />
        <Composer />
      </div>
    </div>
  );
}
