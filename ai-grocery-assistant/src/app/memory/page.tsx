"use client";

import { useId, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { TopBar } from "@/components/bits";
import { ALLERGENS, DIETS } from "@/data/allergens";
import { STORES } from "@/data/stores";
import { ingredientName } from "@/lib/catalogue";
import { money } from "@/lib/format";
import type { Memory } from "@/lib/types";

function Section({
  title,
  children,
  onForget,
  empty,
}: {
  title: string;
  children: React.ReactNode;
  onForget?: () => void;
  empty?: boolean;
}) {
  const id = useId();
  return (
    <section className="card mem-section" aria-labelledby={id}>
      <div className="mem-head">
        <h2 id={id}>{title}</h2>
        {onForget && !empty && (
          <button type="button" className="link-btn danger" onClick={onForget} aria-label={`Delete ${title.toLowerCase()}`}>
            Delete
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function NumberField({ label, value, onSave, prefix }: { label: string; value: number | null; onSave: (n: number) => void; prefix?: string }) {
  const [draft, setDraft] = useState(value === null ? "" : String(value));
  const id = useId();
  return (
    <form
      className="inline-form"
      onSubmit={(e) => {
        e.preventDefault();
        const n = Math.round(Number(draft));
        if (n > 0) onSave(n);
      }}
    >
      <label htmlFor={id}>{label}</label>
      <span className="input-wrap">
        {prefix && <span aria-hidden="true">{prefix}</span>}
        <input id={id} inputMode="numeric" value={draft} onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ""))} placeholder="Not set" />
      </span>
      <button type="submit" className="btn btn-ghost btn-small">
        Save
      </button>
    </form>
  );
}

export default function MemoryPage() {
  const { state, ready, updateMemory, forget, loadSample } = useApp();
  const [confirming, setConfirming] = useState(false);
  const m = state.memory;
  const set = (patch: Partial<Memory>) => updateMemory((cur) => ({ ...cur, ...patch }));

  if (!ready) return <div className="screen" aria-busy="true" />;

  const brands = Object.entries(m.preferredBrands);

  return (
    <div className="screen">
      <TopBar />
      <main id="main" className="page">
        <h1>What I remember</h1>
        <p className="lede">
          Everything here is saved on this device only. Change or delete anything; I&apos;ll ask again next time if I need it.
        </p>

        <Section title="Allergies and dietary needs" onForget={() => set({ allergies: null, diets: [] })} empty={m.allergies === null && !m.diets.length}>
          {m.allergies === null && <p className="muted">Not set yet. I&apos;ll ask before your next shop.</p>}
          <div className="chips" role="group" aria-label="Allergies">
            {ALLERGENS.map((a) => {
              const on = m.allergies?.includes(a.id) ?? false;
              return (
                <button
                  key={a.id}
                  type="button"
                  className="chip"
                  aria-pressed={on}
                  onClick={() => set({ allergies: on ? (m.allergies ?? []).filter((x) => x !== a.id) : [...(m.allergies ?? []), a.id] })}
                >
                  {on && <span aria-hidden="true">✓ </span>}
                  {a.label}
                </button>
              );
            })}
          </div>
          <div className="chips" role="group" aria-label="Dietary needs">
            {DIETS.map((d) => {
              const on = m.diets.includes(d.id);
              return (
                <button key={d.id} type="button" className="chip" aria-pressed={on} onClick={() => set({ diets: on ? m.diets.filter((x) => x !== d.id) : [...m.diets, d.id] })}>
                  {on && <span aria-hidden="true">✓ </span>}
                  {d.label}
                </button>
              );
            })}
          </div>
          {m.allergies !== null && m.allergies.length === 0 && <p className="muted small">No allergies saved.</p>}
        </Section>

        <Section title="Store" onForget={() => set({ store: null })} empty={m.store === null}>
          <label htmlFor="store-select" className="visually-hidden">
            Store
          </label>
          <select id="store-select" value={m.store ?? ""} onChange={(e) => set({ store: (e.target.value || null) as Memory["store"] })}>
            <option value="">Not set</option>
            {STORES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.neighbourhood})
              </option>
            ))}
          </select>
        </Section>

        <Section title="Household size" onForget={() => set({ householdSize: null })} empty={m.householdSize === null}>
          <NumberField key={`hh-${m.householdSize}`} label="People" value={m.householdSize} onSave={(n) => set({ householdSize: n })} />
        </Section>

        <Section title="Budget" onForget={() => set({ budget: null })} empty={m.budget === null}>
          <NumberField key={`b-${m.budget}`} label="Usual budget per shop" value={m.budget} prefix="$" onSave={(n) => set({ budget: n })} />
          {m.budget === null && <p className="muted small">Not set. I&apos;ll start from {money(60)} for a recipe and {money(90)} for a restock.</p>}
        </Section>

        <Section title="Preferred brands" onForget={() => set({ preferredBrands: {} })} empty={!brands.length}>
          {brands.length === 0 ? (
            <p className="muted">None yet. When you swap a brand in your cart, I&apos;ll remember it.</p>
          ) : (
            <ul className="mem-list">
              {brands.map(([ingredient, brand]) => (
                <li key={ingredient}>
                  <span>
                    {ingredientName(ingredient)}: <strong>{brand}</strong>
                  </span>
                  <button
                    type="button"
                    className="link-btn danger"
                    aria-label={`Delete preferred brand for ${ingredientName(ingredient)}`}
                    onClick={() => {
                      const next = { ...m.preferredBrands };
                      delete next[ingredient];
                      set({ preferredBrands: next });
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Usual essentials" onForget={() => set({ essentials: [] })} empty={!m.essentials.length}>
          {m.essentials.length === 0 ? (
            <p className="muted">None yet. Ask me to restock your essentials and I&apos;ll start a list.</p>
          ) : (
            <ul className="mem-list">
              {m.essentials.map((e) => (
                <li key={e.ingredient}>
                  <span>{ingredientName(e.ingredient)}</span>
                  <span className="stepper small" role="group" aria-label={`Usual quantity of ${ingredientName(e.ingredient)}`}>
                    <button
                      type="button"
                      aria-label={`Decrease usual quantity of ${ingredientName(e.ingredient)}`}
                      onClick={() => set({ essentials: m.essentials.map((x) => (x.ingredient === e.ingredient ? { ...x, qty: Math.max(1, x.qty - 1) } : x)) })}
                    >
                      −
                    </button>
                    <span>{e.qty}</span>
                    <button
                      type="button"
                      aria-label={`Increase usual quantity of ${ingredientName(e.ingredient)}`}
                      onClick={() => set({ essentials: m.essentials.map((x) => (x.ingredient === e.ingredient ? { ...x, qty: x.qty + 1 } : x)) })}
                    >
                      +
                    </button>
                  </span>
                  <button
                    type="button"
                    className="link-btn danger"
                    aria-label={`Delete ${ingredientName(e.ingredient)} from usual essentials`}
                    onClick={() => set({ essentials: m.essentials.filter((x) => x.ingredient !== e.ingredient) })}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <section className="card mem-section" aria-label="Reset">
          <button type="button" className="btn btn-ghost btn-block" onClick={loadSample}>
            Load a sample household (for demos)
          </button>
          {!confirming ? (
            <button type="button" className="btn btn-danger btn-block" onClick={() => setConfirming(true)}>
              Forget everything
            </button>
          ) : (
            <div className="confirm" role="alert">
              <p>This clears everything I remember and your current cart. Are you sure?</p>
              <div className="chips">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    forget();
                    setConfirming(false);
                  }}
                >
                  Yes, forget everything
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
