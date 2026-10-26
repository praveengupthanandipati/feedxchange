import { A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { partners } from "../../data/content";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/** Two-letter monogram standing in for each client's logo until real logos are supplied. */
const monogram = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");

/**
 * "Trusted by" carousel. A fixed number of compact client cards per screen size (2 on small phones up to
 * 6 on desktops), auto-playing one step at a time with a smooth slide. Hovering pauses it; swipe on touch.
 */
const PartnersStrip = () => {
  const reducedMotion = useReducedMotion();

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
          {partners.map((name) => (
            <SwiperSlide key={name} className="partners__slide">
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
