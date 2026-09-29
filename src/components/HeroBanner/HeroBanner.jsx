import { useEffect, useState } from 'react';
import { getHeroBanners } from '../../services/shopify/contentService';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

import './HeroBanner.scss';
import 'swiper/css';
import 'swiper/css/pagination';

function HeroBanner() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getHeroBanners()
      .then((shopifyBanners) => {
        if (!cancelled) setBanners(shopifyBanners);
      })
      .catch((error) => {
        console.error('Could not load Shopify hero banners:', error);
        if (!cancelled) setLoadError(error.message || 'Unknown Shopify error.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <section
        aria-label="Loading hero banners"
        className="carouselWrapper min-h-[520px] bg-gray-100 sm:min-h-[640px] lg:min-h-[800px]"
      />
    );
  }

  if (banners.length === 0) {
    return (
      <section className="mx-auto my-6 max-w-7xl px-6" role="alert">
        <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Hero Shopify chưa hiển thị. {loadError || 'Shopify không trả về banner nào.'}
        </p>
      </section>
    );
  }

  return (
    <section>
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        loop={banners.length > 1}
        speed={700}
        className="carouselWrapper h-[520px] sm:h-[640px] lg:h-[800px]"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative h-full overflow-hidden">
              <img
                src={banner.image}
                alt={banner.imageAlt || banner.title}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-black/30" />

              <div className="absolute inset-0 flex items-center">
                <div className="mx-auto w-full max-w-7xl px-6">
                  <div className="max-w-xl text-white">
                    <p className="mb-4 text-sm uppercase tracking-[0.3em]">
                      {banner.subtitle}
                    </p>

                    <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-7xl">
                      {banner.title}
                    </h1>

                    <p className="mb-8 max-w-md text-base text-white/80">
                      {banner.description}
                    </p>

                    <a
                      href={banner.button_url}
                      className="inline-block bg-white px-8 py-4 text-sm font-medium uppercase tracking-wider text-black transition duration-500 hover:bg-black hover:text-white"
                    >
                      {banner.button}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default HeroBanner;

