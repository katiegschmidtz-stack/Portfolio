"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { alternatives, cartTotal, cheaperSwap, itemCount, itemPrice, possibleSavings } from "@/lib/cart";
import { getProduct, priceAt, storeName } from "@/lib/catalogue";
import { money } from "@/lib/format";
import type { Cart, CartItem } from "@/lib/types";
import { useApp } from "./AppProvider";
import { FlagBadge, ProductThumb, Why } from "./bits";

export function BudgetBar({ cart, editable = true }: { cart: Cart; editable?: boolean }) {
  const { setBudget, ctx } = useApp();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(cart.budget));
  const total = cartTotal(cart);
  const over = total > cart.budget;
  const pct = Math.min(100, (total / cart.budget) * 100);
  const inputId = useId();

  return (
    <div className={`budget${over ? " budget-over" : ""}`}>
      <div className="budget-row">
        <span>
          <strong>{money(total)}</strong> of {money(cart.budget)} budget
        </span>
        {editable && !editing && (
          <button type="button" className="link-btn" onClick={() => { setValue(String(cart.budget)); setEditing(true); }}>
            Change budget
          </button>
        )}
      </div>
      {editing && (
        <form
          className="budget-edit"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Math.round(Number(value));
            if (n > 0) setBudget(n);
            setEditing(false);
          }}
        >
          <label htmlFor={inputId}>New budget in dollars</label>
          <input id={inputId} inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))} autoFocus />
          <button type="submit" className="btn btn-primary btn-small">
            Save
          </button>
        </form>
      )}
      <div
        className="budget-track"
        role="progressbar"
        aria-label="Cart total compared with budget"
        aria-valuemin={0}
        aria-valuemax={cart.budget}
        aria-valuenow={total}
        aria-valuetext={`${money(total)} of ${money(cart.budget)}`}
      >
        <div className="budget-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="budget-note">
        {!over
          ? `${money(cart.budget - total)} left to spend.`
          : possibleSavings(cart, ctx) >= total - cart.budget
            ? `${money(total - cart.budget)} over. Items marked "Over budget" have cheaper options that close the gap.`
            : `${money(total - cart.budget)} over. Cheaper brands save up to ${money(possibleSavings(cart, ctx))}, so you may also want to remove something, like a topping.`}
      </p>
    </div>
  );
}

function CartRow({ item, cart }: { item: CartItem; cart: Cart }) {
  const { setQty, removeItem, swap, ctx } = useApp();
  const [swapOpen, setSwapOpen] = useState(false);
  const [error, setError] = useState<string>();
  const product = getProduct(item.productId);
  if (!product) return null;
  const label = `${product.brand} ${product.name}`;
  const alts = swapOpen ? alternatives(item, ctx) : [];
  const cheaper = item.flags.includes("over-budget") ? cheaperSwap(item, ctx) : null;
  const flagged = item.flags.length > 0;

  return (
    <li className={`cart-row${flagged ? " cart-row-flagged" : ""}`}>
      <div className="cart-row-main">
        <ProductThumb product={product} />
        <div className="cart-row-text">
          <p className="cart-row-name">{product.name}</p>
          <p className="cart-row-meta">
            {product.brand} · {product.size}
          </p>
          {item.flags.length > 0 && (
            <p className="badges">
              {item.flags.map((f) => (
                <FlagBadge key={f} flag={f} />
              ))}
            </p>
          )}
          {item.reason && <p className="cart-row-reason">{item.reason}</p>}
          <Why text={item.why} label={`I picked ${label}`} />
        </div>
        <p className="cart-row-price">{money(itemPrice(item, cart))}</p>
      </div>

      <div className="cart-row-actions">
        <div className="stepper" role="group" aria-label={`Quantity of ${product.name}`}>
          <button type="button" aria-label={`Decrease quantity of ${product.name}`} onClick={() => setQty(item.id, item.qty - 1)}>
            −
          </button>
          <span aria-live="polite">{item.qty}</span>
          <button type="button" aria-label={`Increase quantity of ${product.name}`} onClick={() => setQty(item.id, item.qty + 1)}>
            +
          </button>
        </div>
        <button type="button" className="btn btn-ghost btn-small" aria-expanded={swapOpen} onClick={() => setSwapOpen((o) => !o)} aria-label={`Swap ${product.name}`}>
          Swap
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={() => removeItem(item.id)} aria-label={`Remove ${product.name}`}>
          Remove
        </button>
      </div>

      {cheaper && !swapOpen && (
        <button type="button" className="save-hint" onClick={() => setError(swap(item.id, cheaper.product.id))}>
          Save {money(cheaper.saves)} with {cheaper.product.brand}
        </button>
      )}

      {swapOpen && (
        <div className="swap-list">
          {alts.length === 0 && <p className="muted">No other safe, in-stock options at {storeName(cart.storeId)}.</p>}
          {alts.map((alt) => {
            const diff = (priceAt(alt, cart.storeId) - priceAt(product, cart.storeId)) * item.qty;
            return (
              <button
                key={alt.id}
                type="button"
                className="swap-option"
                onClick={() => {
                  const err = swap(item.id, alt.id);
                  setError(err);
                  if (!err) setSwapOpen(false);
                }}
              >
                <ProductThumb product={alt} size={36} />
                <span>
                  <strong>{alt.brand}</strong> {alt.name}, {alt.size}
                  {alt.tier === "store" && <span className="muted"> (store brand)</span>}
                </span>
                <span className={diff < 0 ? "saves" : "costs"}>{diff < 0 ? `−${money(-diff)}` : `+${money(diff)}`}</span>
              </button>
            );
          })}
        </div>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}

export function CartItems({ cart }: { cart: Cart }) {
  return (
    <ul className="cart-list">
      {cart.items.map((item) => (
        <CartRow key={item.id} item={item} cart={cart} />
      ))}
    </ul>
  );
}

export function CartSheet() {
  const { state, cartOpen, setCartOpen } = useApp();
  const cart = state.cart;
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!cartOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen]);

  if (!cart) return null;
  const flagged = cart.items.filter((i) => i.flags.length).length;

  return (
    <>
      <button
        type="button"
        className="cart-peek"
        aria-expanded={cartOpen}
        aria-haspopup="dialog"
        onClick={() => setCartOpen(true)}
      >
        <span className="cart-peek-handle" aria-hidden="true" />
        <span className="cart-peek-row">
          <span aria-hidden="true">🛒</span>
          <span>
            <strong>{cart.title}</strong> · {itemCount(cart)} items · {money(cartTotal(cart))}
            {flagged > 0 && <span className="peek-flag"> · {flagged} to check</span>}
          </span>
          <span className="peek-open">Open</span>
        </span>
      </button>

      <div className={`sheet-backdrop${cartOpen ? " open" : ""}`} onClick={() => setCartOpen(false)} aria-hidden="true" />
      <section
        className={`sheet${cartOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!cartOpen}
      >
        <div className="sheet-head">
          <div>
            <h2 id={titleId}>Draft cart: {cart.title}</h2>
            <p className="muted">
              {storeName(cart.storeId)} · prices in CAD
            </p>
          </div>
          <button ref={closeRef} type="button" className="icon-btn" aria-label="Close cart" onClick={() => setCartOpen(false)}>
            ✕
          </button>
        </div>
        <div className="sheet-body">
          <BudgetBar cart={cart} />
          <CartItems cart={cart} />
          {cart.removed.length > 0 && (
            <details className="removed">
              <summary>Not in the cart ({cart.removed.length})</summary>
              <ul>
                {cart.removed.map((r) => (
                  <li key={r.ingredient + r.reason}>
                    <strong>{r.label}</strong>: {r.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
        <div className="sheet-foot">
          <Link href="/review" className="btn btn-primary btn-block" onClick={() => setCartOpen(false)}>
            Review cart ({money(cartTotal(cart))})
          </Link>
        </div>
      </section>
    </>
  );
}
