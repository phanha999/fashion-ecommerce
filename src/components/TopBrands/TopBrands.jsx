const brands = [
  {
    id: 1,
    background: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    logo: '/images/brands/nike.png',
  },
  {
    id: 2,
    background: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
    logo: '/images/brands/zara.png',
  },
  {
    id: 3,
    background: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
    logo: '/images/brands/hm.png',
  },
  {
    id: 4,
    background: 'https://images.unsplash.com/photo-1556906781-9a412961c28c',
    logo: '/images/brands/adidas.png',
  },
  {
    id: 5,
    background: 'https://images.unsplash.com/photo-1542272604-787c3835535d',
    logo: '/images/brands/levis.png',
  },
  {
    id: 6,
    background: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
    logo: '/images/brands/cos.png',
  },
  {
    id: 7,
    background: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b',
    logo: '/images/brands/puma.png',
  },
  {
    id: 8,
    background: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3',
    logo: '/images/brands/uniqlo.png',
  },
  {
    id: 9,
    background: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e',
    logo: '/images/brands/gucci.png',
  },
  {
    id: 10,
    background: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3',
    logo: '/images/brands/prada.png',
  },
  {
    id: 11,
    background: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
    logo: '/images/brands/chanel.png',
  },
  {
    id: 12,
    background: 'https://images.unsplash.com/photo-1490481651871-50d0d1f0e1e0',
    logo: '/images/brands/dior.png',
  },
  {
    id: 13,
    background: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc',
    logo: '/images/brands/burberry.png',
  },
  {
    id: 14,
    background: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
    logo: '/images/brands/armani.png',
  },
  {
    id: 15,
    background: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce',
    logo: '/images/brands/calvin-klein.png',
  },
  {
    id: 16,
    background: 'https://images.unsplash.com/photo-1506629905607-d9c297d7f3a1',
    logo: '/images/brands/tommy.png',
  },
];

function TopBrands() {
  return (
    <section className="pb-20">
      <div className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16">

        <div className="mb-10 text-left">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
            Our Selection
          </p>

          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            Top Brands
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-[30px] md:grid-cols-3 lg:grid-cols-4">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="group relative aspect-square overflow-hidden"
            >
              <img
                src={brand.background}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/40" />

              <div className="relative flex h-full items-center justify-center p-8">
                <img
                  src={brand.logo}
                  alt="Brand logo"
                  className="max-h-14 max-w-[150px] object-contain"
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default TopBrands;
