"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { FlagBadge, ProductThumb, TopBar } from "@/components/bits";
import { BudgetBar } from "@/components/CartSheet";
import { cartTotal, changesFromDefaults, itemCount, itemPrice } from "@/lib/cart";
import { getProduct, storeName } from "@/lib/catalogue";
import { money } from "@/lib/format";

export default function ReviewPage() {
  const { state, ready, setCartOpen } = useApp();
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const cart = state.cart;

  if (!ready) return <div className="screen" aria-busy="true" />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="screen">
        <TopBar />
        <main id="main" className="page">
          <h1>Final review</h1>
          <p>There&apos;s nothing in your cart yet.</p>
          <Link href="/" className="btn btn-primary">
            Back to chat
          </Link>
        </main>
      </div>
    );
  }

  const changes = changesFromDefaults(cart);
  const lines = cart.items.map((i) => {
    const p = getProduct(i.productId)!;
    return `${i.qty} × ${p.brand} ${p.name} (${p.size})`;
  });
  const plainList = `${cart.title}\n${lines.join("\n")}`;

  return (
    <div className="screen">
      <TopBar />
      <main id="main" className="page">
        <p className="eyebrow">Step 3 of 3</p>
        <h1>Final review</h1>
        <p className="lede">
          {cart.title} · {itemCount(cart)} items from {storeName(cart.storeId)}. Nothing is sent until you tap the button at the bottom.
        </p>

        <BudgetBar cart={cart} editable={false} />

        <section aria-labelledby="items-h" className="card">
          <h2 id="items-h">Items</h2>
          <ul className="review-list">
            {cart.items.map((i) => {
              const p = getProduct(i.productId)!;
              return (
                <li key={i.id}>
                  <ProductThumb product={p} size={40} />
                  <span className="review-item">
                    <span>
                      {i.qty} × {p.name}
                    </span>
                    <span className="muted">
                      {p.brand} · {p.size}
                    </span>
                    {i.flags.length > 0 && (
                      <span className="badges">
                        {i.flags.map((f) => (
                          <FlagBadge key={f} flag={f} />
                        ))}
                      </span>
                    )}
                  </span>
                  <span className="review-price">{money(itemPrice(i, cart))}</span>
                </li>
              );
            })}
          </ul>
          <p className="review-total">
            <span>Estimated total</span>
            <strong>{money(cartTotal(cart))}</strong>
          </p>
          <p className="muted small">Final prices, taxes and fees are set by the store at checkout.</p>
        </section>

        <section aria-labelledby="changes-h" className="card">
          <h2 id="changes-h">Changes from my first suggestions</h2>
          {changes.length === 0 ? (
            <p className="muted">None. This is the cart exactly as I built it.</p>
          ) : (
            <ul className="changes">
              {changes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
        </section>

        <div className="review-actions">
          <Link href="/" className="btn btn-ghost" onClick={() => setCartOpen(true)}>
            Keep editing
          </Link>
          <button type="button" className="btn btn-primary" onClick={() => setSent(true)} aria-describedby="send-note">
            Send to Instacart
          </button>
        </div>
        <p id="send-note" className="muted small center">
          You&apos;ll pick your store and pay on Instacart.
        </p>

        {sent && (
          <section className="card handoff" role="status" aria-labelledby="handoff-h">
            <h2 id="handoff-h">Checkout handoff is coming soon</h2>
            <p>
              The connection to Instacart is added in Phase 5. Until then, here&apos;s your list to copy into any grocery app.
            </p>
            <pre className="plain-list">{plainList}</pre>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(plainList);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? "Copied" : "Copy list"}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
