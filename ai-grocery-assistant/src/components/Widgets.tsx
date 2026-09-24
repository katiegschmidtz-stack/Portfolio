"use client";

import Link from "next/link";
import { useState } from "react";
import { ALLERGENS, DIETS } from "@/data/allergens";
import { STORES } from "@/data/stores";
import { getProduct, ingredientName } from "@/lib/catalogue";
import type { Message, Widget } from "@/lib/scripted";
import type { Allergen, Diet } from "@/lib/types";
import { useApp } from "./AppProvider";

function Toggle({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="chip" aria-pressed={pressed} onClick={onClick}>
      {pressed && <span aria-hidden="true">✓ </span>}
      {children}
    </button>
  );
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function AllergiesWidget({ message }: { message: Message }) {
  const { answerWidget } = useApp();
  const [allergies, setAllergies] = useState<Allergen[]>([]);
  const [diets, setDiets] = useState<Diet[]>([]);
  const none = allergies.length === 0 && diets.length === 0;
  return (
    <fieldset className="widget">
      <legend className="widget-label">Allergies (tap all that apply)</legend>
      <div className="chips">
        {ALLERGENS.map((a) => (
          <Toggle key={a.id} pressed={allergies.includes(a.id)} onClick={() => setAllergies((l) => toggle(l, a.id))}>
            {a.label}
          </Toggle>
        ))}
      </div>
      <p className="widget-label">Dietary needs</p>
      <div className="chips">
        {DIETS.map((d) => (
          <Toggle key={d.id} pressed={diets.includes(d.id)} onClick={() => setDiets((l) => toggle(l, d.id))}>
            {d.label}
          </Toggle>
        ))}
      </div>
      <button type="button" className="btn btn-primary" onClick={() => answerWidget(message.id, { widget: "allergies", allergies, diets })}>
        {none ? "No allergies or diets" : "Save and continue"}
      </button>
    </fieldset>
  );
}

function PickList({
  message,
  items,
  label,
  noneLabel,
  doneLabel,
  onDone,
}: {
  message: Message;
  items: { id: string; label: string; sub?: string }[];
  label: string;
  noneLabel: string;
  doneLabel: (n: number) => string;
  onDone: (ids: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  return (
    <fieldset className="widget" aria-describedby={`${message.id}-text`}>
      <legend className="widget-label">{label}</legend>
      <div className="chips">
        {items.map((i) => (
          <Toggle key={i.id} pressed={picked.includes(i.id)} onClick={() => setPicked((l) => toggle(l, i.id))}>
            {i.label}
            {i.sub && <span className="chip-sub"> {i.sub}</span>}
          </Toggle>
        ))}
      </div>
      <button type="button" className="btn btn-primary" onClick={() => onDone(picked)}>
        {picked.length ? doneLabel(picked.length) : noneLabel}
      </button>
    </fieldset>
  );
}

function WidgetBody({ message, widget }: { message: Message; widget: Widget }) {
  const { answerWidget, send, setCartOpen, state } = useApp();
  switch (widget.type) {
    case "suggestions":
      return (
        <div className="chips">
          {widget.options.map((o) => (
            <button key={o} type="button" className="chip chip-suggest" onClick={() => send(o)}>
              {o}
            </button>
          ))}
        </div>
      );
    case "allergies":
      return <AllergiesWidget message={message} />;
    case "reconfirm":
      return (
        <div className="chips">
          <button type="button" className="btn btn-primary" onClick={() => answerWidget(message.id, { widget: "reconfirm", confirmed: true })}>
            Yes, that&apos;s right
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => answerWidget(message.id, { widget: "reconfirm", confirmed: false })}>
            Something&apos;s changed
          </button>
        </div>
      );
    case "store":
      return (
        <div className="store-list" role="group" aria-label="Choose a store">
          {STORES.map((s) => (
            <button key={s.id} type="button" className="store-option" onClick={() => answerWidget(message.id, { widget: "store", storeId: s.id })}>
              <strong>{s.name}</strong>
              <span>
                {s.neighbourhood} · {s.note}
              </span>
            </button>
          ))}
        </div>
      );
    case "servings":
      return (
        <div className="chips" role="group" aria-label="Number of people">
          {[2, 3, 4, 6, 8].map((n) => (
            <button
              key={n}
              type="button"
              className={`chip chip-number${n === widget.suggested ? " chip-default" : ""}`}
              onClick={() => answerWidget(message.id, { widget: "servings", servings: n })}
            >
              {n}
              {n === widget.suggested && <span className="visually-hidden"> (your usual)</span>}
            </button>
          ))}
        </div>
      );
    case "pantry":
      return (
        <PickList
          message={message}
          items={widget.items.map((id) => ({ id, label: ingredientName(id) }))}
          label="Already at home"
          noneLabel="I need all of them"
          doneLabel={(n) => `Leave off ${n}`}
          onDone={(have) => answerWidget(message.id, { widget: "pantry", have })}
        />
      );
    case "skip": {
      const items = widget.items.map((id) => {
        const item = state.cart?.items.find((i) => i.id === id);
        const p = item && getProduct(item.productId);
        return { id, label: p?.name ?? ingredientName(id) };
      });
      return (
        <PickList
          message={message}
          items={items}
          label="Skip this week"
          noneLabel="Keep everything"
          doneLabel={(n) => `Skip ${n}`}
          onDone={(skip) => answerWidget(message.id, { widget: "skip", skip })}
        />
      );
    }
    case "open-cart":
      return (
        <button type="button" className="btn btn-primary" onClick={() => setCartOpen(true)}>
          Open my cart
        </button>
      );
    case "review":
      return (
        <Link href="/review" className="btn btn-primary">
          Go to final review
        </Link>
      );
  }
}

const PERSISTENT: Widget["type"][] = ["open-cart", "review", "suggestions"];

/** Checkpoint widgets only work while they're the latest question; buttons that just navigate always work. */
export function MessageWidget({ message, latest }: { message: Message; latest: boolean }) {
  if (!message.widget) return null;
  const persistent = PERSISTENT.includes(message.widget.type);
  if (message.answered && !persistent) {
    return <p className="answered">You chose: {message.answered}</p>;
  }
  if (!latest && !persistent) return null;
  return <WidgetBody message={message} widget={message.widget} />;
}
