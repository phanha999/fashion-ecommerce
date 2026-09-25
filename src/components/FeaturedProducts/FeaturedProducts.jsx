import { Link } from 'react-router-dom';
import { featuredProducts as products } from '../products.data';

function ProductItem({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex gap-4 sm:gap-[30px]"
    >

      <div className="w-32 sm:w-44 md:w-36 lg:w-44 h-32 sm:h-44 md:h-36 lg:h-44 shrink-0 overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col">
        <h3 className="text-sm font-medium text-gray-900">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
            {product.description}
          </p>
        )}

        <p className="mt-2 text-sm text-gray-500">
          ${product.price}
        </p>
      </div>
    </Link>
  );
}

function FeaturedProducts() {
  return (
    <section className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16 pb-20">

      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Featured Collection
        </p>

        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          Discover Our Products
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-[30px] lg:grid-cols-4">

        <div className="relative min-h-[420px] overflow-hidden md:min-h-[520px] lg:col-span-1 lg:min-h-[600px]">
          <img
            src="https://images.unsplash.com/photo-1445205170230-053b83016050"
            alt="Featured collection"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/25" />

          <div className="absolute bottom-0 left-0 p-8 text-white">
            <p className="text-sm uppercase tracking-[0.2em]">
              New Season
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              Timeless Essentials
            </h3>

            <Link
              to="/shop"
              className="mt-5 inline-block border border-white px-6 py-3 text-sm transition hover:bg-white hover:text-black"
            >
              Shop Collection
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-[30px] md:grid-cols-3 lg:col-span-3">
          {products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
