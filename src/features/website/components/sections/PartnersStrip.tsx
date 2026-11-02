import { useMemo } from "react";
import { A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useGetBusinessProfileSummaryQuery } from "../../../../core/store/businessProfilesApi";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/** Two-letter monogram standing in for each client's logo until real logos are supplied. */
const monogram = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");

/** The carousel loops, so it needs at least twice the most cards on screen (6); a short list is repeated to fill it. */
const MIN_SLIDES = 12;

/**
 * "Trusted by" carousel. A fixed number of compact client cards per screen size (2 on small phones up to
 * 6 on desktops), auto-playing one step at a time with a smooth slide. Hovering pauses it; swipe on touch.
 */
const PartnersStrip = () => {
  const reducedMotion = useReducedMotion();
  // The businesses on the platform (GetBusinessProfileSummary). Only their names are shown - nothing else from the summary.
  // No sample names: the strip is hidden until it answers, and stays hidden if it fails or has no active business.
  const { data: profiles } = useGetBusinessProfileSummaryQuery();
  const names = useMemo(() => {
    const fromApi = [
      ...new Set(
        (profiles ?? [])
          .filter((profile) => profile.status?.toLowerCase() === "active")
          .map((profile) => (profile.tradingName || profile.legalName || "").trim())
          .filter(Boolean),
      ),
    ];
    return fromApi;
  }, [profiles]);
  const slides = useMemo(() => {
    const filled = [...names];
    while (filled.length > 0 && filled.length < MIN_SLIDES) filled.push(...names);
    return filled;
  }, [names]);

  if (names.length === 0) return null;

  return (
    <section className="partners" aria-label="Trusted by leading feed businesses">
      <div className="site-container">
        <p className="partners__title">Trusted by leading feed businesses</p>
        <Swiper
          className="partners__swiper"
          modules={[A11y, Autoplay]}
          loop
          grabCursor
          speed={reducedMotion ? 0 : 900}
          autoplay={reducedMotion ? false : { delay: 2200, disableOnInteraction: false, pauseOnMouseEnter: true }}
          slidesPerView={2}
          spaceBetween={12}
          breakpoints={{
            480: { slidesPerView: 3, spaceBetween: 12 },
            768: { slidesPerView: 4, spaceBetween: 16 },
            992: { slidesPerView: 5, spaceBetween: 16 },
            1200: { slidesPerView: 6, spaceBetween: 20 },
          }}
        >
          {slides.map((name, index) => (
            // A repeated name gets its own key: the list may hold it more than once.
            <SwiperSlide key={`${name}-${index}`} className="partners__slide">
              <span className="partners__logo" aria-hidden>
                {monogram(name)}
              </span>
              <span className="partners__name">{name}</span>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default PartnersStrip;
