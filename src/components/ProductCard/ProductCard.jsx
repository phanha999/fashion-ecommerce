import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  return (
    <div>
      <Link
        to={`/products/${product.id}`}
        className="group block overflow-hidden"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          {product.isNew && (
            <span className="absolute left-3 top-3 bg-black px-3 py-1 text-xs uppercase tracking-wider text-white">
              New
            </span>
          )}
        </div>

        <div className="pt-4">
          <h3 className="text-sm font-medium text-gray-900">
            {product.name}
          </h3>

          {product.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
              {product.description}
            </p>
          )}

          <p className="mt-2 text-sm text-gray-600">
            ${product.price}  
          </p>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;
