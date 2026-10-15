"use client";

import { useState } from "react";
import ResumeCard from "./ResumeCard";

export default function ResumeSection() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div style={{ marginBottom: "3rem" }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "0 16px",
            height: 40,
            borderRadius: 100,
            background: "#FFD132",
            border: "1px solid #000",
            boxShadow: "4px 4px 16px 0px rgba(0,0,0,0.16)",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: 15,
            fontWeight: 700,
            color: "#000",
          }}
        >
          Resume
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "3rem" }}>
      <ResumeCard onClose={() => setOpen(false)} />
    </div>
  );
}
