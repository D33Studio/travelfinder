import Icon from "@/components/Icon";
import type { PropertyDetail } from "@/lib/propertyDetails";

export default function Policies({ detail }: { detail: PropertyDetail }) {
  return (
    <div className="pol">
      <div className="pol-times">
        <div className="pol-time">
          <span className="amen-icon"><Icon name="door" size={15} /></span>
          <div>
            <span className="pol-time-label">Check in</span>
            <strong>{detail.checkIn}</strong>
          </div>
        </div>
        <div className="pol-time">
          <span className="amen-icon"><Icon name="clock" size={15} /></span>
          <div>
            <span className="pol-time-label">Check out</span>
            <strong>{detail.checkOut}</strong>
          </div>
        </div>
        <div className="pol-time">
          <span className="amen-icon"><Icon name="key" size={15} /></span>
          <div>
            <span className="pol-time-label">Arrival</span>
            <strong>Private check-in by host</strong>
          </div>
        </div>
      </div>

      <div className="pol-grid">
        {detail.policies.map((p) => (
          <div key={p.title} className="pol-item">
            <div className="pol-title">{p.title}</div>
            <p>{p.text}</p>
          </div>
        ))}
      </div>

      <div className="pol-cols">
        <div>
          <div className="section-label pol-sub">Good to know</div>
          <ul className="bullets">
            {detail.goodToKnow.map((g) => <li key={g}>{g}</li>)}
          </ul>
        </div>
        <div>
          <div className="section-label pol-sub">Fees &amp; extras</div>
          <ul className="bullets">
            {detail.fees.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      </div>

      <div className="notice">
        <span className="notice-tag">
          <span className="dot" />
          Important
        </span>
        <p>
          A valid credit card is required at check-in for incidental charges. The property may pre-authorise this card, and the hold is released at check-out.
          By reserving, you acknowledge Journey&apos;s <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
