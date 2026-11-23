"use client";

import { track } from "@vercel/analytics";

export default function PrintButton() {
  return (
    <button className="btn btn-navy" onClick={() => {
        track("Resume PDF download");
        window.print();
      }}>
      Download PDF
    </button>
  );
}
