import ProductCard from '../ProductCard/ProductCard';
import { newArrivalProducts as products } from '../products.data';

function NewArrivals() {
  return (
    <section className="pb-20">
      <div className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16">
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

        <div className="grid grid-cols-2 gap-4 sm:gap-[30px] md:grid-cols-4">
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
