"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as cartOps from "@/lib/cart";
import { getProduct } from "@/lib/catalogue";
import { EMPTY_MEMORY, forgetEverything, loadMemory, SAMPLE_MEMORY, saveMemory } from "@/lib/memory";
import { answer, contextFor, initialChat, sendText, type Answer, type ChatState } from "@/lib/scripted";
import type { Memory, ShopContext } from "@/lib/types";

interface AppApi {
  state: ChatState;
  ready: boolean;
  ctx: ShopContext;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  send: (text: string) => void;
  answerWidget: (messageId: string, a: Answer) => void;
  setQty: (itemId: string, qty: number) => void;
  removeItem: (itemId: string) => void;
  swap: (itemId: string, productId: string) => string | undefined;
  setBudget: (budget: number) => void;
  updateMemory: (update: (m: Memory) => Memory) => void;
  forget: () => void;
  loadSample: () => void;
  newShop: () => void;
}

const AppContext = createContext<AppApi | null>(null);

const SESSION_KEY = "sprig.session.v1";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ChatState>(() => initialChat(EMPTY_MEMORY));
  const [ready, setReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const loaded = useRef(false);

  // Load memory (this device) and the in-progress shop (this tab) once.
  useEffect(() => {
    const memory = loadMemory();
    let restored: ChatState | null = null;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) restored = { ...JSON.parse(raw), memory };
    } catch {
      // ignore
    }
    setState(restored ?? initialChat(memory));
    loaded.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    saveMemory(state.memory);
    try {
      const { memory: _memory, ...session } = state;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
  }, [state]);

  const ctx = useMemo(() => contextFor(state), [state]);

  const send = useCallback((text: string) => setState((s) => sendText(s, text)), []);
  const answerWidget = useCallback((id: string, a: Answer) => setState((s) => answer(s, id, a)), []);

  const withCart = useCallback((fn: (s: ChatState) => ChatState) => setState((s) => (s.cart ? fn(s) : s)), []);

  const setQty = useCallback(
    (itemId: string, qty: number) => withCart((s) => ({ ...s, cart: cartOps.setQty(s.cart!, itemId, qty, contextFor(s)) })),
    [withCart],
  );

  const removeItem = useCallback(
    (itemId: string) => withCart((s) => ({ ...s, cart: cartOps.removeItem(s.cart!, itemId, "You removed it", contextFor(s)) })),
    [withCart],
  );

  const swap = useCallback(
    (itemId: string, productId: string) => {
      // Validate against the current state first so we can report errors synchronously.
      const r = state.cart ? cartOps.swapProduct(state.cart, itemId, productId, ctx) : { error: "No cart yet." };
      if (r.error) return r.error;
      setState((s) => {
        if (!s.cart) return s;
        const res = cartOps.swapProduct(s.cart, itemId, productId, contextFor(s));
        if (res.error) return s;
        const product = getProduct(productId)!;
        // Remember the brand the shopper chose for next time.
        const memory = {
          ...s.memory,
          preferredBrands: { ...s.memory.preferredBrands, [product.ingredient]: product.brand },
        };
        return { ...s, cart: res.cart, memory };
      });
      return undefined;
    },
    [state.cart, ctx],
  );

  const setBudget = useCallback(
    (budget: number) =>
      withCart((s) => ({
        ...s,
        cart: cartOps.applyBudget({ ...s.cart!, budget }, contextFor(s)),
        memory: { ...s.memory, budget },
      })),
    [withCart],
  );

  const updateMemory = useCallback((update: (m: Memory) => Memory) => setState((s) => ({ ...s, memory: update(s.memory) })), []);

  const forget = useCallback(() => {
    forgetEverything();
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    setState(initialChat(EMPTY_MEMORY));
  }, []);

  const loadSample = useCallback(() => setState((s) => ({ ...s, memory: SAMPLE_MEMORY })), []);

  const newShop = useCallback(() => {
    setCartOpen(false);
    setState((s) => initialChat(s.memory));
  }, []);

  const api: AppApi = {
    state,
    ready,
    ctx,
    cartOpen,
    setCartOpen,
    send,
    answerWidget,
    setQty,
    removeItem,
    swap,
    setBudget,
    updateMemory,
    forget,
    loadSample,
    newShop,
  };

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}

export function useApp(): AppApi {
  const api = useContext(AppContext);
  if (!api) throw new Error("useApp must be used inside AppProvider");
  return api;
}
