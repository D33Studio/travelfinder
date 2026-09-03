"use client";

import { useEffect, useState } from "react";

export interface TabDef {
  id: string;
  label: string;
}

/* How far below the top of the scroller a section must reach before it counts
   as the active one — roughly the height of the sticky tab bar plus a margin. */
const ACTIVATION_OFFSET = 160;

export default function PropertyTabs({ tabs }: { tabs: TabDef[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>(".main");
    if (!scroller) return;
    const sections = tabs.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollerTop = scroller.getBoundingClientRect().top;
      // The last section whose top has crossed the activation line wins;
      // before any section has, the first tab stays active.
      let current = sections[0].id;
      for (const s of sections) {
        if (s.getBoundingClientRect().top - scrollerTop <= ACTIVATION_OFFSET) current = s.id;
      }
      // At the very bottom, the last section is what the user is looking at.
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2) current = sections[sections.length - 1].id;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [tabs]);

  const go = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="tabs" aria-label="Page sections">
      {tabs.map((t) => (
        <button key={t.id} type="button" className={`tab${active === t.id ? " active" : ""}`} onClick={() => go(t.id)}>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
