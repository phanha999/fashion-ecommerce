import storefrontMedia from '../../data/storefrontMedia';
import './GridBanner.scss';

const banners = [
  {
    id: 1,
    title: 'Men Collection',
    subtitle: 'Modern essentials for everyday style',
    image:
      storefrontMedia.collections.men,
    link: '/shop?collection=men',
    className: 'grid-banner-featured',
  },
  {
    id: 2,
    title: 'Women Collection',
    subtitle: 'Effortless style, made for you',
    image:
      storefrontMedia.collections.women,
    link: '/shop?collection=women',
    className: 'grid-banner-small',
  },
  {
    id: 3,
    title: 'New Season',
    subtitle: 'Discover the latest arrivals',
    image:
      storefrontMedia.collections.newSeason,
    link: '/shop?collection=new',
    className: 'grid-banner-small',
  },
  {
    id: 4,
    title: 'Shoes',
    subtitle: 'Step into something new',
    image:
      storefrontMedia.collections.shoes,
    link: '/shop?collection=shoes',
    className: 'grid-banner-small',
  },
  {
    id: 5,
    title: 'Accessories',
    subtitle: 'Complete your everyday look',
    image:
      storefrontMedia.collections.accessories,
    link: '/shop?collection=accessories',
    className: 'grid-banner-small',
  },
  {
    id: 6,
    title: 'Essentials',
    subtitle: 'Timeless pieces for every wardrobe',
    image:
      storefrontMedia.collections.essentials,
    link: '/shop?collection=essentials',
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
