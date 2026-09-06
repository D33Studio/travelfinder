"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

export default function PropertyActions() {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* user dismissed the share sheet */
    }
  };

  return (
    <div className="prop-actions">
      <button type="button" className="ghost-btn" onClick={share}>
        <Icon name="share" size={14} />
        {copied ? "Link copied" : "Share"}
      </button>
      <button type="button" className={`ghost-btn${saved ? " on" : ""}`} onClick={() => setSaved((s) => !s)} aria-pressed={saved}>
        <Icon name="bookmark" size={14} filled={saved} />
        {saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
