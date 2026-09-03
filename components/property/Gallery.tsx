"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Icon from "@/components/Icon";

export default function Gallery({ images, name }: { images: string[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + images.length) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  const tiles = images.slice(0, 5);

  return (
    <>
      <div className="gal">
        {tiles.map((src, i) => (
          <button
            key={src}
            type="button"
            className={`gal-tile${i === 0 ? " gal-hero" : ""}`}
            onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1} of ${images.length}`}
          >
            <Image
              src={src}
              alt={`${name} — photo ${i + 1}`}
              fill
              sizes={i === 0 ? "(max-width: 1100px) 100vw, 60vw" : "(max-width: 1100px) 50vw, 20vw"}
              priority={i === 0}
              style={{ objectFit: "cover" }}
            />
            <span className="gal-shade" />
          </button>
        ))}
        <button type="button" className="glass-btn gal-all" onClick={() => setOpen(0)}>
          <Icon name="image" size={13} />
          View all {images.length} photos
        </button>
      </div>

      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${name} photos`} onClick={close}>
          <div className="lightbox-top" onClick={(e) => e.stopPropagation()}>
            <span className="lightbox-count">
              {open + 1} <span>/ {images.length}</span>
            </span>
            <button type="button" className="glass-btn glass-icon" onClick={close} aria-label="Close">
              <Icon name="x" size={15} />
            </button>
          </div>

          <button type="button" className="glass-btn glass-icon lightbox-nav prev" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous photo">
            <Icon name="chevronLeft" size={18} />
          </button>
          <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
            <Image key={images[open]} src={images[open]} alt={`${name} — photo ${open + 1}`} fill sizes="90vw" style={{ objectFit: "contain" }} />
          </div>
          <button type="button" className="glass-btn glass-icon lightbox-nav next" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next photo">
            <Icon name="chevronRight" size={18} />
          </button>

          <div className="lightbox-strip" onClick={(e) => e.stopPropagation()}>
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                className={`lightbox-thumb${i === open ? " active" : ""}`}
                onClick={() => setOpen(i)}
                aria-label={`Photo ${i + 1}`}
              >
                <Image src={src} alt="" fill sizes="80px" style={{ objectFit: "cover" }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
