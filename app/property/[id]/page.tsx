import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PropertyCard from "@/components/PropertyCard";
import Icon from "@/components/Icon";
import Gallery from "@/components/property/Gallery";
import PropertyTabs from "@/components/property/PropertyTabs";
import PropertyActions from "@/components/property/PropertyActions";
import { BookingProvider } from "@/components/property/BookingContext";
import BookingPanel from "@/components/property/BookingPanel";
import RoomCard from "@/components/property/RoomCard";
import Amenities from "@/components/property/Amenities";
import Reviews from "@/components/property/Reviews";
import LocationSection from "@/components/property/LocationSection";
import Policies from "@/components/property/Policies";
import { allProperties, getPropertyDetail, getSimilarProperties } from "@/lib/propertyDetails";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return allProperties.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const detail = getPropertyDetail(id);
  if (!detail) return { title: "Property not found — Journey" };
  return {
    title: `${detail.name}, ${detail.location} — Journey`,
    description: detail.tagline,
  };
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "rooms", label: "Rooms" },
  { id: "amenities", label: "Amenities" },
  { id: "location", label: "Location" },
  { id: "reviews", label: "Reviews" },
  { id: "policies", label: "Policies" },
];

export default async function PropertyPage({ params }: { params: Params }) {
  const { id } = await params;
  const detail = getPropertyDetail(id);
  if (!detail) notFound();

  const similar = getSimilarProperties(detail);

  return (
    <>
      <Sidebar />
      <div className="main">
        <div className="prop">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/" className="crumb-back">
              <Icon name="arrowLeft" size={13} />
              Back to search
            </Link>
            <span className="crumb-sep">/</span>
            <span>{detail.kindLabel}</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{detail.name}</span>
          </nav>

          <header className="prop-head">
            <div>
              <div className="prop-eyebrow">
                <Icon name="pin" size={13} />
                {detail.location}
                <span className="prop-eyebrow-dot" />
                {detail.kindLabel}
              </div>
              <h1 className="prop-title">{detail.name}</h1>
              <p className="prop-tagline">{detail.tagline}</p>
              <div className="prop-meta">
                <div className="stars">
                  {Array.from({ length: detail.stars }, (_, i) => (
                    <Icon key={i} name="star" size={12} filled className="star on" />
                  ))}
                </div>
                <span className="rating-pill">
                  <Icon name="star" size={10} filled />
                  {detail.rating.toFixed(1)}
                </span>
                <span className="prop-meta-muted">{detail.reviewCount} reviews</span>
                <span className="prop-meta-sep" />
                <span className="prop-meta-fact"><Icon name="users" size={12} /> Sleeps {detail.guests}</span>
                <span className="prop-meta-fact"><Icon name="bed" size={12} /> {detail.bedrooms} bedrooms</span>
                <span className="prop-meta-fact"><Icon name="bath" size={12} /> {detail.bathrooms} baths</span>
                <span className="prop-meta-fact"><Icon name="ruler" size={12} /> {detail.sizeSqm} m²</span>
              </div>
            </div>
            <PropertyActions />
          </header>

          <Gallery images={detail.gallery} name={detail.name} />

          <PropertyTabs tabs={TABS} />

          <BookingProvider detail={detail}>
            <div className="prop-layout">
              <div className="prop-main">
                <section id="overview" className="psec">
                  <h2 className="psec-title">About this property</h2>
                  <div className="prose">
                    {detail.description.map((p) => <p key={p}>{p}</p>)}
                  </div>

                  <div className="hl-grid">
                    {detail.highlights.map((h) => (
                      <div key={h.title} className="hl">
                        <span className="hl-icon"><Icon name={h.icon} size={16} /></span>
                        <div>
                          <div className="hl-title">{h.title}</div>
                          <div className="hl-text">{h.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="card-pills prop-tags">
                    {detail.pills.map((pill) => (
                      <span key={pill.label} className={`pill p-${pill.color}`}>{pill.label}</span>
                    ))}
                  </div>
                </section>

                <section id="rooms" className="psec">
                  <div className="psec-head">
                    <h2 className="psec-title">Choose your room</h2>
                    <span className="psec-hint">Prices per night · {detail.rooms.length} room types</span>
                  </div>
                  <div className="rooms">
                    {detail.rooms.map((room) => <RoomCard key={room.id} room={room} />)}
                  </div>
                </section>

                <section id="amenities" className="psec">
                  <h2 className="psec-title">Amenities &amp; services</h2>
                  <Amenities groups={detail.amenities} />
                </section>

                <section id="location" className="psec">
                  <h2 className="psec-title">Where you&apos;ll be</h2>
                  <LocationSection detail={detail} />
                </section>

                <section id="reviews" className="psec">
                  <h2 className="psec-title">What guests say</h2>
                  <Reviews detail={detail} />
                </section>

                <section id="policies" className="psec">
                  <h2 className="psec-title">Policies &amp; good to know</h2>
                  <Policies detail={detail} />
                </section>
              </div>

              <aside className="prop-side">
                <BookingPanel detail={detail} />
              </aside>
            </div>
          </BookingProvider>
        </div>

        <div className="content prop-similar">
          <div className="section-heading">
            <div className="section-label">You may also like</div>
            <div className="section-subtitle">More {detail.kindLabel.toLowerCase()}s and hand-picked stays nearby in spirit</div>
          </div>
          <div className="cards-grid">
            {similar.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>
      </div>
    </>
  );
}
