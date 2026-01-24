import Link from 'next/link';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
        {/* Product Image */}
        <div className="relative h-48 bg-gray-100 flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="max-h-full max-w-full object-contain p-4"
            />
          ) : (
            <div className="text-gray-400">No image</div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex-grow flex flex-col">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 flex-grow">
            {product.title}
          </h3>

          {/* Price */}
          <div className="mt-auto">
            {product.current_price !== undefined && product.current_price !== null ? (
              <p className="text-2xl font-bold text-gray-900">
                ${product.current_price.toFixed(2)}
                <span className="text-sm text-gray-500 ml-1">{product.currency}</span>
              </p>
            ) : (
              <p className="text-sm text-gray-500">Price not available</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
