"use client";

import { useEffect, useRef, useState } from "react";
import type { Metric } from "@/lib/content";

export default function Counter({ metric }: { metric: Metric }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(metric.value);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    setShown(0);
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 1400;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(metric.value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, metric.value]);

  const d = metric.decimals ?? 0;
  return (
    <div className="metric" ref={ref}>
      <div className="metric-value">
        {metric.prefix}
        {shown.toFixed(d)}
        {metric.suffix}
      </div>
      <div className="metric-label">{metric.label}</div>
      <div className="metric-detail">{metric.detail}</div>
    </div>
  );
}
