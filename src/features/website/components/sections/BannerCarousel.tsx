import { useMemo } from "react";
import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { API_URL } from "../../../../core/api/api";
import { useGetActiveBannersQuery } from "../../../../core/store/bannersApi";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * The Hero's sliding background: the active banners from the admin's Banners master, by priority.
 * Renders nothing until there are banners, so the Hero keeps its own photo while loading or when the API fails.
 */
const BannerCarousel = () => {
  const { data } = useGetActiveBannersQuery();
  const reducedMotion = useReducedMotion();

  const banners = useMemo(
    () => (data ?? []).filter((banner) => banner.fileName).sort((a, b) => a.priority - b.priority),
    [data],
  );

  if (banners.length === 0) return null;
  const several = banners.length > 1;

  return (
    <div className="hero__banners">
      <Swiper
        modules={[A11y, Autoplay, Navigation, Pagination]}
        slidesPerView={1}
        loop={several}
        speed={reducedMotion ? 0 : 900}
        autoplay={reducedMotion || !several ? false : { delay: 5000, disableOnInteraction: false }}
        navigation={several}
        pagination={several ? { clickable: true } : false}
        a11y={{ prevSlideMessage: "Previous banner", nextSlideMessage: "Next banner" }}
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner.id}>
            <img
              src={`${API_URL}${banner.fileName}`}
              alt=""
              // The first banner is in view on load; the rest can wait.
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerCarousel;
