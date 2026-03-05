'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { favoritesApi } from '@/lib/api';

interface FavoriteButtonProps {
  productId: number;
  initialFavorited?: boolean;
  size?: 'sm' | 'md';
}

export default function FavoriteButton({ productId, initialFavorited = false, size = 'md' }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    const prev = isFavorited;
    setIsFavorited(!prev);

    try {
      if (prev) {
        await favoritesApi.remove(productId);
      } else {
        await favoritesApi.add(productId);
      }
    } catch {
      setIsFavorited(prev);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClass = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={`${sizeClass} ${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
