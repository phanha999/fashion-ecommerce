import StoreImage from '../StoreImage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Keyboard, A11y } from 'swiper/modules';
import 'swiper/css';
import BannerLink from '../BannerLink';
import { getHeroBanners } from '../../services/shopify/contentService';



import './HeroBanner.scss';



function HeroBanner() {
  const [banners, setBanners] = useState([]);
  const slider = useRef(null);
  const container = useRef(null);
  const [active, setActive] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const goTo = useCallback(index => {
    const instance = slider.current;
    if (!instance || instance.destroyed) return;
    if (instance.params.loop) instance.slideToLoop(index, reducedMotion ? 0 : 450);
    else instance.slideTo(index, reducedMotion ? 0 : 450);
  }, [reducedMotion]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = event => setReducedMotion(event.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let inView = true;
    const update = () => setVisible(inView && document.visibilityState === 'visible');
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); }, { threshold: 0.2 });
    observer.observe(element);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, [isLoading, banners.length]);

  useEffect(() => {
    const instance = slider.current;
    if (!instance || instance.destroyed || !instance.autoplay) return;
    if (reducedMotion || hovered || focused || !visible || banners.length < 2) instance.autoplay.stop();
    else instance.autoplay.start();
  }, [reducedMotion, hovered, focused, visible, banners.length, isLoading]);
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
    <section ref={container} className="relative" aria-label="Featured collections" aria-roledescription="carousel" onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }} onPointerLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <Swiper modules={[Autoplay, Keyboard, A11y]} onSwiper={instance => { slider.current = instance; }} onSlideChange={instance => setActive(instance.realIndex)} slidesPerView={1} loop={banners.length > 1} speed={reducedMotion ? 0 : 450} threshold={8} grabCursor={banners.length > 1} allowTouchMove={banners.length > 1} touchStartPreventDefault={false} preventClicks preventClicksPropagation keyboard={{enabled:true,onlyInViewport:true}} autoplay={reducedMotion ? false : {delay:5000,disableOnInteraction:false}} a11y={{containerMessage:'Banner slides'}} className="hero-slider h-[520px] sm:h-[640px] lg:h-[800px]">
        {banners.map((banner, index) => (
          <SwiperSlide key={banner.id} className="h-full" role="group" aria-roledescription="slide" aria-label={(index + 1) + ' of ' + banners.length}>
            <div className="relative h-full overflow-hidden">
              <StoreImage
                priority={index === 0}
                draggable={false}
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
                      draggable={false}
                      to={banner.button_url}
                      className="inline-block bg-white px-8 py-4 text-sm font-medium uppercase tracking-wider text-black transition duration-500 hover:bg-black hover:text-white"
                    >
                      {banner.button}
                    </BannerLink>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {banners.length > 1 && <div className="absolute bottom-5 left-1/2 z-10 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center rounded-full bg-black/50 px-2">{banners.map((banner, index) => <button key={banner.id} type="button" aria-label={'View slide ' + (index + 1)} aria-pressed={active === index} onClick={() => goTo(index)} className="flex h-11 w-9 shrink-0 items-center justify-center"><span className={'h-2.5 w-2.5 rounded-full border border-white transition-colors ' + (active === index ? 'bg-white' : 'bg-transparent')} /></button>)}</div>}
    </section>
  );
}

export default HeroBanner;


