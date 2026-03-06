import { useState, useEffect } from 'react';
import { categoryColors, getCategory } from '../utils/category';

interface ArticleCoverProps {
  title: string;
  cover?: string | null;
  className?: string;
  category?: string; // Optional, if already calculated
}

export default function ArticleCover({ title, cover, className = "", category }: ArticleCoverProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If cover changes, reset error state
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [cover]);

  const articleCategory = category || getCategory(title);
  const gradientClass = categoryColors[articleCategory] || categoryColors['其他'];

  if (cover && !hasError) {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`}>
        {/* Skeleton / Placeholder while loading */}
        {!isLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
        )}
        
        <img
          src={cover}
          alt={title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback to gradient placeholder
  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center p-6 ${className}`}>
      <span className="text-white text-3xl font-bold opacity-40 select-none">
        {articleCategory}
      </span>
    </div>
  );
}
