"use client";

import { useState } from "react";
import type { CaseStudy } from "@/lib/content";

export default function CaseStudies({ items }: { items: CaseStudy[] }) {
  const [active, setActive] = useState(items[0].id);
  const study = items.find((c) => c.id === active) ?? items[0];

  return (
    <div className="cases">
      <div className="case-tabs" role="tablist" aria-label="Case studies">
        {items.map((c) => (
          <button
            key={c.id}
            role="tab"
            id={`tab-${c.id}`}
            aria-selected={c.id === active}
            aria-controls="case-panel"
            className={`case-tab ${c.id === active ? "is-active" : ""}`}
            onClick={() => setActive(c.id)}
          >
            <span className="case-tab-tag">{c.tag}</span>
            <span className="case-tab-title">{c.title}</span>
          </button>
        ))}
      </div>
      <article
        className="case-panel"
        id="case-panel"
        role="tabpanel"
        aria-labelledby={`tab-${study.id}`}
        key={study.id}
      >
        <p className="case-org">{study.org}</p>
        <h3>{study.title}</h3>
        <p className="case-summary">{study.summary}</p>
        <div className="case-grid">
          <div>
            <h4>The challenge</h4>
            <p>{study.problem}</p>
            <h4>What I did</h4>
            <ul>
              {study.moves.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
          <div className="case-results">
            <h4>Results</h4>
            <ul>
              {study.results.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </article>
    </div>
  );
}
