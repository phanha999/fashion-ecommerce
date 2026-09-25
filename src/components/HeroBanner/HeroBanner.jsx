import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

import './HeroBanner.scss';
import 'swiper/css';
import 'swiper/css/pagination';

function HeroBanner() {
  const banners = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
        subtitle: 'New Collection 2026',
        title: 'Define Your Style',
        description: 'Discover modern fashion designed for your everyday style.',
        button: 'Shop Now',
        button_url: '/shop/men',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
        subtitle: 'Autumn Collection',
        title: 'Modern Essentials',
        description: 'Timeless pieces made for your everyday wardrobe.',
        button: 'Shop Now',
        button_url: '/shop/women',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
        subtitle: 'New Arrivals',  
        title: 'Made For You',
        description: 'Explore the latest styles from Velora.',
        button: 'Shop Now',
        button_url: '/shop/kids',
    },
  ];

  return (
    <section>
      <Swiper
        modules={[Pagination]}
        pagination={{
          clickable: true,
        }}
        loop
        speed={700}
        className="carouselWrapper h-[520px] sm:h-[640px] lg:h-[800px]"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative h-full overflow-hidden">
              <img
                src={banner.image}
                alt={banner.title}
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

                    <button
                      type="button"
                      className=""
                    >
                        <a href={banner.button_url} className="bg-white px-8 py-4 text-sm font-medium uppercase tracking-wider text-black transition hover:bg-black hover:text-white duration-500">
                            {banner.button}
                        </a> 
                    </button>
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
