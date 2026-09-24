import ProductCard from '../ProductCard/ProductCard';

function NewArrivals() {
  const products = [
    {
      id: 1,
      name: 'Oversized Cotton Shirt',
      price: 59,
      image:
        'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab',
      isNew: true,
    },
    {
      id: 2,
      name: 'Minimal Blazer',
      price: 129,
      image:
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35',
      isNew: true,
    },
    {
      id: 3,
      name: 'Relaxed Trousers',
      price: 79,
      image:
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80',
      isNew: true,
    },
    {
      id: 4,
      name: 'Classic Leather Bag',
      price: 149,
      image:
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
      isNew: true,
    },
  ];

  return (
    <section className="pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gray-500">
              Latest
            </p>

            <h2 className="text-3xl font-semibold md:text-4xl">
              New Arrivals
            </h2>
          </div>

          <a
            href="/shop"
            className="hidden text-sm font-medium underline underline-offset-4 md:block"
          >
            View All
          </a>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewArrivals;