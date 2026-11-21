"use client";

export default function PrintButton() {
  return (
    <button className="btn btn-navy" onClick={() => window.print()}>
      Download PDF
    </button>
  );
}
