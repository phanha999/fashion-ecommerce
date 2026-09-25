import { Link } from 'react-router-dom';

function ProductCard({ product, imageRatio = 'portrait' }) {
  const formattedPrice = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: product.currencyCode || 'USD',
  }).format(product.price);
  const hasNaturalDimensions = imageRatio === 'natural' && product.imageWidth && product.imageHeight;
  const imageRatioClass = hasNaturalDimensions
    ? ''
    : imageRatio === 'square' ? 'aspect-square' : 'aspect-[3/4]';
  const imageStyle = hasNaturalDimensions
    ? { aspectRatio: `${product.imageWidth} / ${product.imageHeight}` }
    : undefined;

  return (
    <div>
      <Link to={`/products/${product.id}`} className="group block overflow-hidden">
        <div className={`relative ${imageRatioClass} overflow-hidden rounded-md bg-gray-100`} style={imageStyle}>
          <img
            src={product.image}
            alt={product.imageAlt || product.name}
            className={`h-full w-full ${imageRatio === 'natural' ? 'object-contain' : 'object-cover transition duration-500 group-hover:scale-105'}`}
          />
          {product.isNew && (
            <span className="absolute left-3 top-3 bg-black px-3 py-1 text-xs uppercase tracking-wider text-white">
              New
            </span>
          )}
        </div>
        <div className="px-3 pt-4">
          <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
          {product.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
              {product.description}
            </p>
          )}
          <p className="mt-3 text-sm font-medium text-gray-900">{formattedPrice}</p>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;
