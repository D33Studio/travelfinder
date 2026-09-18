import Link from "next/link";
import Icon from "@/components/Icon";

export default function PropertyNotFound() {
  return (
    <div className="prop empty-state">
      <div className="empty-icon">
        <Icon name="pin" size={22} />
      </div>
      <h1 className="prop-title">We couldn&apos;t find that property</h1>
      <p className="prop-tagline">It may have been removed from the collection, or the link is out of date.</p>
      <Link href="/" className="primary-btn empty-cta">
        <Icon name="arrowLeft" size={14} />
        Back to search
      </Link>
    </div>
  );
}
