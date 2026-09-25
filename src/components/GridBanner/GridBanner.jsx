import './GridBanner.scss';

const banners = [
  {
    id: 1,
    title: 'Men Collection',
    subtitle: 'Modern essentials for everyday style',
    image:
      'https://images.unsplash.com/photo-1516826957135-700dedea698c',
    link: '/shop?category=men',
    className: 'grid-banner-featured',
  },
  {
    id: 2,
    title: 'Women Collection',
    subtitle: 'Effortless style, made for you',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b',
    link: '/shop?category=women',
    className: 'grid-banner-small',
  },
  {
    id: 3,
    title: 'New Season',
    subtitle: 'Discover the latest arrivals',
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050',
    link: '/shop?category=new',
    className: 'grid-banner-small',
  },
  {
    id: 4,
    title: 'Shoes',
    subtitle: 'Step into something new',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    link: '/shop?category=shoes',
    className: 'grid-banner-small',
  },
  {
    id: 5,
    title: 'Accessories',
    subtitle: 'Complete your everyday look',
    image:
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49',
    link: '/shop?category=accessories',
    className: 'grid-banner-small',
  },
  {
    id: 6,
    title: 'Essentials',
    subtitle: 'Timeless pieces for every wardrobe',
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
    link: '/shop?category=essentials',
    className: 'grid-banner-featured',
  },
];

function GridBanner() {
  return (
    <section className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16">
      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Explore Velora
        </p>

        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          Shop By Collection
        </h2>
      </div>

      <div className="grid-banner-grid mb-12 md:mb-14 xl:mb-16 mx-auto">
        {banners.map((banner) => (
          <a
            key={banner.id}
            href={banner.link}
            className={`group relative block overflow-hidden ${banner.className}`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/20 transition duration-300 group-hover:bg-black/40" />

            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <h3 className="text-2xl font-semibold">
                {banner.title}
              </h3>

              <p className="mt-1 text-sm text-white/90">
                {banner.subtitle}
              </p>

              <span className="mt-4 inline-block text-sm font-medium underline underline-offset-4">
                Shop now
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default GridBanner;
