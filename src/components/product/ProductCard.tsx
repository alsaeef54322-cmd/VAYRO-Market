import React from 'react';
import { Heart, Plus, Star, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';

import { handleImageError } from '../../utils/imageFallback';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, featured = false }) => {
  const { t } = useLanguage();
  const {
    navigateToProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuickViewProduct
  } = useStore();

  const isFav = isInWishlist(product.id);

  return (
    <div
      onClick={() => navigateToProduct(product.id)}
      className="group relative cursor-pointer flex flex-col bg-white dark:bg-[#1A1E19] rounded-2xl overflow-hidden border border-[#111310]/5 dark:border-white/10 hover:border-[#111310]/15 dark:hover:border-white/20 hover:shadow-xl transition-all duration-300"
    >
      {/* Image Container with Editorial Aspect Ratio */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F5F2E9]/60 dark:bg-[#141713]">
        <img
          src={product.images[0]}
          alt={product.name_ar}
          loading="lazy"
          onError={handleImageError}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Second image preview on hover if available */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={product.name_ar}
            loading="lazy"
            onError={handleImageError}
            className="absolute inset-0 h-full w-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-none">
          <div>
            {product.isNew && (
              <span className="px-2.5 py-1 rounded-md bg-[#111310] dark:bg-[#D5FF3F] text-[#D5FF3F] dark:text-[#111310] text-[10px] font-mono font-bold tracking-wider uppercase shadow-sm">
                {t('جديد', 'NEW')}
              </span>
            )}
            {product.compareAtPrice && !product.isNew && (
              <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[10px] font-bold shadow-sm">
                {t('خصم', 'SALE')}
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`pointer-events-auto p-2 rounded-full transition-all shadow-md ${
              isFav
                ? 'bg-[#111310] dark:bg-[#232921] text-rose-500 ring-2 ring-[#D5FF3F]'
                : 'bg-white/90 dark:bg-[#1A1E19]/90 backdrop-blur-sm text-[#111310] dark:text-[#F7F7F3] hover:bg-white dark:hover:bg-[#232921] hover:scale-110'
            }`}
            title={t('إضافة للمفضلة', 'Wishlist')}
          >
            <Heart size={15} className={isFav ? 'fill-rose-500 stroke-rose-500' : ''} />
          </button>
        </div>

        {/* Quick View & Quick Add Overlays */}
        <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between pointer-events-none">
          {/* Quick View Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#1A1E19]/95 backdrop-blur-md text-[#111310] dark:text-[#F7F7F3] text-xs font-semibold shadow-md hover:bg-white dark:hover:bg-[#232921] flex items-center gap-1.5 border border-transparent dark:border-white/10"
          >
            <Eye size={13} />
            <span className="hidden sm:inline">{t('معاينة سريعة', 'Quick view')}</span>
          </button>

          {/* Quick Add (+) Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="pointer-events-auto w-9 h-9 rounded-full bg-[#111310] dark:bg-[#D5FF3F] text-white dark:text-[#111310] flex items-center justify-center shadow-lg hover:bg-[#D5FF3F] dark:hover:bg-white hover:text-[#111310] transition-colors"
            title={t('إضافة سريعة للسلة', 'Quick Add to Bag')}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 text-right">
        {/* Brand Kicker & Rating */}
        <div className="flex items-center justify-between text-[11px] text-[#111310]/60 dark:text-[#F7F7F3]/60 mb-1">
          <span className="font-mono uppercase font-bold tracking-wider text-[#AAB5A0] dark:text-[#A6B29C]">
            {product.brand}
          </span>
          <div className="flex items-center gap-1 font-medium">
            <Star size={11} className="fill-[#111310] text-[#111310] dark:fill-[#D5FF3F] dark:text-[#D5FF3F]" />
            <span>{product.rating}</span>
            <span className="text-[#111310]/40 dark:text-[#F7F7F3]/40">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm text-[#111310] group-hover:text-black line-clamp-1 leading-snug">
          {t(product.name_ar, product.name_en)}
        </h3>

        {/* Subtitle / materials */}
        <p className="text-xs text-[#111310]/50 line-clamp-1 mt-0.5">
          {t(product.subtitle_ar, product.subtitle_en)}
        </p>

        {/* Color swatches preview */}
        {product.colors && product.colors.length > 1 && (
          <div className="flex items-center gap-1.5 mt-2.5">
            {product.colors.map((c, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-black/20"
                style={{ backgroundColor: c.hex }}
                title={t(c.name_ar, c.name_en)}
              />
            ))}
            <span className="text-[10px] text-[#111310]/40">
              +{product.colors.length} {t('ألوان', 'colors')}
            </span>
          </div>
        )}

        {/* Price Row */}
        <div className="mt-3 pt-2.5 border-t border-[#111310]/5 dark:border-white/10 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black text-[#111310] dark:text-[#F7F7F3]">
              {product.price.toLocaleString()} {t('ج.م', 'EGP')}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-[#111310]/40 dark:text-[#F7F7F3]/40 line-through">
                {product.compareAtPrice.toLocaleString()} {t('ج.م', 'EGP')}
              </span>
            )}
          </div>

          <span className="text-[11px] font-medium text-[#586249] dark:text-[#D5FF3F]">
            {t(product.madeIn_ar, product.madeIn_en)}
          </span>
        </div>
      </div>
    </div>
  );
};
