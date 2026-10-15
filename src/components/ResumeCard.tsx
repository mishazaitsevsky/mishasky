"use client";

import Image from "next/image";
import { useState } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────
interface Job {
  company:     string;
  role:        string;
  bullets?:    string[];
  description?: string;
  viewProject?: string; // href
}

const JOBS: Job[] = [
  {
    company: "Amazon",
    role: "Product Designer, 2024–Present",
    bullets: [
      "Nova Builder Studio (Lead)",
      "Tool Onboarding (Lead)",
      "Amazon Content Partners (Lead)",
      "Audio Chat, Reasoning",
      "Icon Agent (Sole)",
      "Shipped Code",
    ],
    description:
      "Most recently, I've been focused on proving that the traditional five-person product team is increasingly unnecessary if you have the right instincts and tooling.",
    viewProject: "/",
  },
  {
    company: "Neon Machine",
    role: "Lead Product Designer, 2022–2024",
  },
  {
    company: "Expedia",
    role: "Senior Product Designer, 2020–2022",
  },
  {
    company: "Walmart",
    role: "Senior Product Designer, 2019–2020",
  },
  {
    company: "Indigo Slate",
    role: "Senior Product Designer, 2019–2020",
  },
  {
    company: "Microsoft",
    role: "Senior Product Designer, 2019–2020",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function TimelineNode({ active }: { active: boolean }) {
  return (
    <div style={{
      width: 40,
      height: 40,
      borderRadius: "50%",
      border: `1.5px solid #000`,
      background: active ? "#FFD132" : "#fff",
      boxShadow: "4px 4px 16px 0px rgba(0,0,0,0.16)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      <Image src="/icons/resume-dot.svg" width={16} height={19} alt="" />
    </div>
  );
}

function TimelineConnector({ last, visible = true }: { last?: boolean; visible?: boolean }) {
  if (last) return <div style={{ flex: 1 }} />;
  return (
    <div style={{
      flex: 1,
      width: 0,
      borderLeft: visible ? "1.5px dashed #000" : "1.5px solid transparent",
      margin: "4px auto 0",
    }} />
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface ResumeCardProps {
  onClose: () => void;
}

export default function ResumeCard({ onClose }: ResumeCardProps) {
  const [openIndex, setOpenIndex] = useState(0);

  function toggle(i: number) {
    setOpenIndex(prev => (prev === i ? -1 : i));
  }

  return (
    <div style={{
      background: "#fff",
      borderRadius: 36,
      padding: 36,
      boxShadow: "4px 4px 16px 0px rgba(0,0,0,0.16)",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      fontFamily: "var(--font-mono)",
      color: "#000",
    }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 24 }}>
        {/* Eyebrow */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.4em",
            textAlign: "center",
            lineHeight: "15px",
          }}>
            RESUME
          </div>
          <div style={{ borderBottom: "1px solid #000" }} />
        </div>

        {/* Title */}
        <div style={{ fontSize: 30, fontWeight: 700, lineHeight: "39px" }}>
          10+ Years
        </div>
      </div>

      {/* ── Timeline ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {JOBS.map((job, i) => {
          const isOpen = openIndex === i;
          const isLast = i === JOBS.length - 1;

          return (
            <div key={job.company} style={{ display: "flex", gap: 12, alignItems: "stretch" }}>

              {/* Left: node + connector */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 40,
                flexShrink: 0,
              }}>
                <TimelineNode active={isOpen} />
                <TimelineConnector last={isLast} visible />
              </div>

              {/* Right: content */}
              <div style={{
                flex: 1,
                paddingBottom: isLast ? 8 : 24,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                minWidth: 0,
              }}>

                {/* Clickable header row */}
                <button
                  onClick={() => toggle(i)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left",
                    color: "inherit",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{
                    fontSize: 30,
                    fontWeight: isOpen ? 700 : 400,
                    lineHeight: "39px",
                  }}>
                    {job.company}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 400, lineHeight: "24px" }}>
                    {job.role}
                  </span>
                </button>

                {/* Expanded content */}
                {isOpen && job.bullets && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {/* Bullets column */}
                    <div style={{ fontSize: 16, lineHeight: "24px", flex: 1, minWidth: 180 }}>
                      {job.bullets.map(b => (
                        <div key={b}>• {b}</div>
                      ))}
                    </div>
                    {/* Description column */}
                    {job.description && (
                      <div style={{ fontSize: 16, lineHeight: "24px", flex: 1, minWidth: 180 }}>
                        {job.description}
                      </div>
                    )}
                  </div>
                )}

                {/* View Project link */}
                {isOpen && job.viewProject && (
                  <a
                    href={job.viewProject}
                    style={{ fontSize: 16, fontWeight: 700, color: "#007AD5", lineHeight: "24px" }}
                  >
                    View Project
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer pills ── */}
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 16px",
            height: 40,
            borderRadius: 100,
            background: "#FFD132",
            border: "1px solid #fff",
            boxShadow: "4px 4px 16px 0px rgba(0,0,0,0.16)",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 700,
            color: "#000",
          }}
        >
          Close
          <Image src="/icons/resume-close-arrow.svg" width={15} height={13} alt="" />
        </button>

        {/* Download */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 16px",
            height: 40,
            borderRadius: 100,
            background: "#fff",
            border: "1px solid #FFD132",
            boxShadow: "4px 4px 16px 0px rgba(0,0,0,0.16)",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 700,
            color: "#000",
          }}
        >
          Download
          <Image src="/icons/resume-download.svg" width={17} height={16} alt="" />
        </button>
      </div>
    </div>
  );
}
