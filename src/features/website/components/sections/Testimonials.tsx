import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "../../../../shared/components/icon";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Autoplay, Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { testimonials } from "../../data/content";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import SectionHead from "../common/SectionHead";

const initials = (name: string) =>
  name
    .replace(/^Dr\.\s*/, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");

/** 10 testimonials in a Swiper carousel: 1 per view on phones, 2 on tablets, 3 on laptops; auto-advances. */
const Testimonials = () => {
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const reducedMotion = useReducedMotion();

  return (
    <section className="section site-testimonials" aria-labelledby="testimonials-title">
      <div className="site-container">
        <SectionHead id="testimonials-title" eyebrow="Testimonials" title="Businesses that trade better with us" />

        <div className="site-testimonials__carousel" data-reveal>
          <Swiper
            modules={[A11y, Autoplay, Keyboard, Pagination]}
            onSwiper={setSwiper}
            slidesPerView={1}
            spaceBetween={20}
            loop
            speed={reducedMotion ? 0 : 700}
            grabCursor
            keyboard={{ enabled: true }}
            autoplay={reducedMotion ? false : { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              768: { slidesPerView: 2, spaceBetween: 24 },
              1200: { slidesPerView: 3, spaceBetween: 24 },
            }}
            a11y={{ prevSlideMessage: "Previous testimonial", nextSlideMessage: "Next testimonial" }}
          >
            {testimonials.map((item) => (
              <SwiperSlide key={item.name}>
                <figure className="quote-card">
                  <div className="quote-card__stars" role="img" aria-label="Rated 5 out of 5">
                    {Array.from({ length: 5 }, (_, index) => (
                      <StarIcon key={index} aria-hidden />
                    ))}
                  </div>
                  <blockquote>“{item.quote}”</blockquote>
                  <figcaption className="quote-card__author">
                    <span aria-hidden>{initials(item.name)}</span>
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.role}</small>
                    </div>
                  </figcaption>
                </figure>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="site-testimonials__nav">
            <button type="button" onClick={() => swiper?.slidePrev()} aria-label="Previous testimonials">
              <ChevronLeftIcon aria-hidden />
            </button>
            <button type="button" onClick={() => swiper?.slideNext()} aria-label="Next testimonials">
              <ChevronRightIcon aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
