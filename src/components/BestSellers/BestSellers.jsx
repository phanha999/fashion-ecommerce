import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard';
import { bestSellerProducts as products } from '../products.data';

function BestSellers() {
  return (
    <section className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Popular picks
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Best Sellers
          </h2>
        </div>

        <Link
          to="/shop"
          className="text-sm font-medium text-gray-900 underline underline-offset-4"
        >
          View all
        </Link> 
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-[30px] lg:grid-cols-4">
        <div className="col-span-2 row-span-2">
          <ProductCard product={products[0]} />
        </div>

        {products.slice(1).map((product) => (
          <div key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default BestSellers;
