"use client";

import { useRouter } from "next/navigation";
import { CURVE, T } from "@/lib/motion";

export default function ProjectClose() {
  const router = useRouter();

  function handleClose() {
    const card = document.getElementById("project-card");
    if (!card) { router.push("/"); return; }
    card.style.animation = `pageOut ${T["1x"]}ms ${CURVE} both`;
    card.addEventListener("animationend", () => router.push("/"), { once: true });
  }

  return (
    <button
      onClick={handleClose}
      aria-label="Back to all work"
      className="proj-close"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21.4727 5.4668C21.767 5.1757 22.2419 5.1785 22.5332 5.47266C22.8243 5.76698 22.8215 6.24185 22.5274 6.5332L9.7549 19.1846C9.26773 19.6671 8.4823 19.6671 7.99513 19.1846L1.47267 12.7236C1.1785 12.4323 1.17569 11.9574 1.46681 11.6631C1.75816 11.3689 2.23303 11.3662 2.52736 11.6572L8.87404 17.9434L21.4727 5.4668Z"
          fill="currentColor"/>
      </svg>
    </button>
  );
}
