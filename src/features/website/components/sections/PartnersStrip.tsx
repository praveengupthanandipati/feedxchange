import { useMemo } from "react";
import { A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { trustedBusinessTypes } from "../../data/content";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/** Two-letter monogram for each card ("and" is skipped, so "Layer and Broiler Farms" gives "LB"). */
const monogram = (name: string) =>
  name
    .split(/\s+/)
    .filter((word) => !/^and$/i.test(word))
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

/** The carousel loops, so it needs at least twice the most cards on screen (6); a short list is repeated to fill it. */
const MIN_SLIDES = 12;

const TITLE = "TRUSTED BY HUNDREDS OF LEADING BUSINESSES ACROSS INDIA";

/**
 * "Trusted by" carousel. A fixed number of compact cards per screen size (2 on small phones up to
 * 6 on desktops), auto-playing one step at a time with a smooth slide. Hovering pauses it; swipe on touch.
 * It lists the kinds of businesses served (trustedBusinessTypes), not customer names (Website UAT).
 */
const PartnersStrip = () => {
  const reducedMotion = useReducedMotion();
  const names = trustedBusinessTypes;
  const slides = useMemo(() => {
    const filled = [...names];
    while (filled.length > 0 && filled.length < MIN_SLIDES) filled.push(...names);
    return filled;
  }, [names]);

  return (
    <section className="partners" aria-label={TITLE}>
      <div className="site-container">
        <p className="partners__title">{TITLE}</p>
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
