import StoreImage from '../StoreImage';
import { useEffect, useRef, useState } from 'react';
import BannerLink from '../BannerLink';
import { getHeroBanners } from '../../services/shopify/contentService';



import './HeroBanner.scss';



function HeroBanner() {
  const [banners, setBanners] = useState([]);
  const slider = useRef(null);
  const [active, setActive] = useState(0);
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
          Shopify hero banners are not available. {loadError || 'Shopify returned no hero banners.'}
        </p>
      </section>
    );
  }

  return (
    <section className="relative" aria-label="Featured collections" aria-roledescription="carousel"><div ref={slider} onScroll={event => setActive(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))} className="hero-slider flex h-[520px] snap-x snap-mandatory overflow-x-auto sm:h-[640px] lg:h-[800px]">
        {banners.map((banner, index) => (
          <div key={banner.id} className="h-full w-full shrink-0 snap-start" role="group" aria-roledescription="slide" aria-label={(index + 1) + ' of ' + banners.length}>
            <div className="relative h-full overflow-hidden">
              <StoreImage
                priority={index === 0}
                maxWidth={1920}
                sizes="100vw"
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

                    <BannerLink
                      to={banner.button_url}
                      className="inline-block bg-white px-8 py-4 text-sm font-medium uppercase tracking-wider text-black transition duration-500 hover:bg-black hover:text-white"
                    >
                      {banner.button}
                    </BannerLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {banners.length > 1 && <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 rounded-full bg-black/40 px-2">{banners.map((banner, index) => <button key={banner.id} type="button" aria-label={'View slide ' + (index + 1)} aria-pressed={active === index} onClick={() => slider.current.scrollTo({left: slider.current.clientWidth * index, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})} className="flex h-11 w-11 items-center justify-center"><span className={'h-2.5 w-2.5 rounded-full border border-white ' + (active === index ? 'bg-white' : 'bg-transparent')} /></button>)}</div>}
    </section>
  );
}

export default HeroBanner;


