"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { Flag, Product } from "@/lib/types";

const CATEGORY_TINT: Record<string, string> = {
  Produce: "#E3F0D8",
  "Meat & Seafood": "#F8DCD3",
  "Dairy & Eggs": "#E6EEF7",
  "Plant-Based": "#DDF0E4",
  Bakery: "#F6E6CC",
  Pantry: "#F7E1CF",
  Spices: "#F5D9C8",
  Breakfast: "#F3E7D3",
  Snacks: "#FBEBC4",
  Frozen: "#DDEDF4",
  Beverages: "#FCE5CF",
  Household: "#E9E6F2",
  "Personal Care": "#EFE3F1",
};

export function ProductThumb({ product, size = 48 }: { product: Product; size?: number }) {
  return (
    <span
      className="thumb"
      aria-hidden="true"
      style={{ width: size, height: size, background: CATEGORY_TINT[product.category] ?? "#F3E7D3", fontSize: size * 0.55 }}
    >
      {product.emoji}
    </span>
  );
}

export function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="var(--basil)" />
      <path d="M16 25c0-7 2-11 7-14-6 0-9 3-10 8-1-3-3-5-6-5 2 2 4 5 4 11h5z" fill="#FFF8EE" />
    </svg>
  );
}

export function TopBar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="topbar">
      <Link href="/" className="brand" aria-label="Sprig, back to chat">
        <Logo />
        <span>Sprig</span>
      </Link>
      <nav className="topbar-nav" aria-label="Main">
        {children}
        <Link href="/memory" className="pill-link">
          What I remember
        </Link>
      </nav>
    </header>
  );
}

const FLAG_LABEL: Record<Flag, string> = {
  substituted: "Substituted",
  "allergen-swap": "Allergy swap",
  "diet-swap": "Diet swap",
  "brand-changed": "Brand changed",
  "over-budget": "Over budget",
};

export function FlagBadge({ flag }: { flag: Flag }) {
  return <span className={`badge badge-${flag}`}>{FLAG_LABEL[flag]}</span>;
}

/** Small "Why?" link that reveals the reasoning behind a choice. */
export function Why({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="why">
      <button
        type="button"
        className="why-toggle"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Why ${label}?`}
        onClick={() => setOpen((o) => !o)}
      >
        Why?
      </button>
      <span id={id} className="why-text" hidden={!open}>
        {text}
      </span>
    </span>
  );
}
