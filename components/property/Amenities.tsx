"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import type { AmenityGroup } from "@/lib/propertyDetails";

const PREVIEW_GROUPS = 3;

export default function Amenities({ groups }: { groups: AmenityGroup[] }) {
  const [all, setAll] = useState(false);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const shown = all ? groups : groups.slice(0, PREVIEW_GROUPS);

  return (
    <div>
      <div className="amen-grid">
        {shown.map((g) => (
          <div key={g.title} className="amen-group">
            <div className="amen-title">{g.title}</div>
            <ul>
              {g.items.map((it) => (
                <li key={it.label}>
                  <span className="amen-icon">
                    <Icon name={it.icon} size={14} />
                  </span>
                  {it.label}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {groups.length > PREVIEW_GROUPS && (
        <button type="button" className="ghost-btn amen-toggle" onClick={() => setAll((v) => !v)} aria-expanded={all}>
          {all ? "Show fewer" : `Show all ${total} amenities`}
          <Icon name="chevronDown" size={13} style={{ transform: all ? "rotate(180deg)" : undefined, transition: "transform 0.2s" }} />
        </button>
      )}
    </div>
  );
}
