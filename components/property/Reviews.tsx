import Icon from "@/components/Icon";
import type { PropertyDetail } from "@/lib/propertyDetails";

export default function Reviews({ detail }: { detail: PropertyDetail }) {
  return (
    <div className="rev">
      <div className="rev-summary">
        <div className="rev-big">
          <div className="rev-score">{detail.rating.toFixed(1)}</div>
          <div className="stars">
            {Array.from({ length: 5 }, (_, i) => (
              <Icon key={i} name="star" size={13} filled className={i < Math.round(detail.rating) ? "star on" : "star"} />
            ))}
          </div>
          <div className="rev-count">{detail.reviewCount} verified stays</div>
          <div className="rev-badge">
            <Icon name="sparkles" size={12} />
            Guest favourite
          </div>
        </div>
        <ul className="rev-bars">
          {detail.scores.map((s) => (
            <li key={s.label}>
              <span>{s.label}</span>
              <div className="bar">
                <div style={{ width: `${(s.value / 5) * 100}%` }} />
              </div>
              <b>{s.value.toFixed(1)}</b>
            </li>
          ))}
        </ul>
      </div>

      <div className="rev-list">
        {detail.reviews.map((r) => (
          <article key={r.name} className="rev-card">
            <div className="rev-card-head">
              <div className="avatar">{r.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
              <div className="rev-who">
                <strong>{r.name}</strong>
                <span>{r.from}</span>
              </div>
              <div className="rev-when">
                <div className="stars small">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Icon key={i} name="star" size={10} filled className={i < r.score ? "star on" : "star"} />
                  ))}
                </div>
                <span>{r.date}</span>
              </div>
            </div>
            <h4 className="rev-title">{r.title}</h4>
            <p className="rev-text">{r.text}</p>
            <div className="rev-stay">{r.stay}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
