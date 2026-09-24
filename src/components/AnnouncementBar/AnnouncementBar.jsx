 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

const announcements = [
  'Complimentary shipping on orders over $150',
  'Discover the latest collection — new styles just landed',
  'Sign up for our newsletter and enjoy 10% off your first order',
];

function AnnouncementBar() {
  return (
    <div
      className="bg-gray-950 px-4 text-center text-white"
      role="region"
      aria-label="Store announcements"
    >
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop
        speed={500}
        slidesPerView={1}
        className="mx-auto h-10 max-w-[1920px]"
      >
        {announcements.map((announcement) => (
          <SwiperSlide
            key={announcement}
          >
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-center text-[10px] font-medium uppercase tracking-[0.12em] sm:text-xs sm:tracking-[0.16em]">
                {announcement}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default AnnouncementBar;
