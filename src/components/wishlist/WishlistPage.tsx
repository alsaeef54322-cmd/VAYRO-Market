import React from 'react';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Eye,
  CheckCircle2,
  PackageOpen
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { handleImageError } from '../../utils/imageFallback';

export const WishlistPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const {
    products,
    wishlist,
    removeFromWishlist,
    clearWishlist,
    moveItemToCart,
    moveAllWishlistToCart,
    setQuickViewProduct,
    navigateToProduct,
    setCurrentPage
  } = useStore();

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="bg-[#F7F7F3] min-h-[80vh] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-8 border-b border-[#20241F]/10 gap-4 text-right">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-md bg-[#20241F] text-[#D5FF3F] text-xs font-mono font-bold tracking-wider uppercase">
              <Heart size={13} className="fill-[#D5FF3F]" />
              <span>{t('المختارات المحفوظة', 'MY SAVED EDIT')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#20241F] tracking-tight">
              {t('قائمة المفضلة', 'Wishlist')}
            </h1>
            <p className="text-xs sm:text-sm text-[#20241F]/60 mt-1">
              {savedProducts.length === 0
                ? t('لا توجد قطع محفوظة في قائمتك حتى الآن.', 'No saved items in your wishlist yet.')
                : t(
                    `لديك ${savedProducts.length} قطع مختارة يمكنك نقلها مباشرة إلى حقيبة التسوق وإتمام الطلب.`,
                    `You have ${savedProducts.length} saved pieces ready to move into your bag.`
                  )}
            </p>
          </div>

          {/* Top Actions */}
          {savedProducts.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={moveAllWishlistToCart}
                className="py-3 px-5 rounded-xl bg-[#20241F] text-[#D5FF3F] hover:bg-black font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <ShoppingBag size={15} />
                <span>{t('نقل الكل لحقيبة التسوق', 'Move All to Bag')}</span>
              </button>

              <button
                onClick={clearWishlist}
                className="py-3 px-4 rounded-xl border border-[#20241F]/15 hover:border-rose-300 hover:text-rose-600 bg-white text-[#20241F]/70 text-xs font-bold transition-colors"
                title={t('إفراغ المفضلة بالكامل', 'Clear entire wishlist')}
              >
                {t('إفراغ القائمة', 'Clear All')}
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        {savedProducts.length === 0 ? (
          /* Empty State */
          <div className="py-20 max-w-md mx-auto text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-white border border-[#20241F]/10 flex items-center justify-center text-[#20241F]/30 shadow-sm mb-6">
              <Heart size={36} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-[#20241F]">
              {t('قائمتك المفضلة فارغة حاليًا', 'Your wishlist is currently empty')}
            </h3>
            <p className="text-xs text-[#20241F]/60 mt-2 leading-relaxed">
              {t(
                'استعرض تشكيلاتنا الحصرية من الأزياء والمنتجات المصنوعة بأيدي أمهر الحرفيين في مصر، واحفظ القطع التي تنال إعجابك للرجوع إليها في أي وقت.',
                'Explore our exclusive collections and save distinct fashion pieces, artisan leather, and ceramic vessels for later.'
              )}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => setCurrentPage('catalog')}
                className="py-3.5 px-8 rounded-xl bg-[#20241F] text-[#D5FF3F] hover:bg-black font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>{t('استكشف الكتالوج الكامل', 'Browse Catalog')}</span>
                <ArrowLeft size={14} className={dir === 'ltr' ? 'rotate-180' : ''} />
              </button>
              <button
                onClick={() => setCurrentPage('home')}
                className="py-3.5 px-6 rounded-xl bg-white border border-[#20241F]/15 text-[#20241F] hover:bg-[#ECEAE1] font-bold text-xs transition-colors"
              >
                {t('العودة للرئيسية', 'Return to Home')}
              </button>
            </div>
          </div>
        ) : (
          /* Grid of Saved Products */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {savedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl overflow-hidden border border-[#20241F]/10 hover:border-[#20241F]/30 transition-all shadow-sm flex flex-col justify-between group"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[4/5] bg-[#ECEAE1]/50 overflow-hidden cursor-pointer">
                  <img
                    src={product.images[0]}
                    alt={product.name_ar}
                    onError={handleImageError}
                    onClick={() => navigateToProduct(product.id)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                    {product.isNew && (
                      <span className="px-2.5 py-0.5 rounded-md bg-[#20241F] text-[#D5FF3F] text-[10px] font-mono font-bold tracking-wider uppercase">
                        {t('جديد', 'NEW')}
                      </span>
                    )}
                    {product.brand && (
                      <span className="px-2 py-0.5 rounded-md bg-white/95 backdrop-blur text-[#20241F] text-[10px] font-mono font-bold shadow-xs">
                        {product.brand}
                      </span>
                    )}
                  </div>

                  {/* Remove from wishlist floating button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(product.id);
                    }}
                    className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/95 text-rose-600 hover:bg-rose-50 flex items-center justify-center shadow-md transition-colors"
                    title={t('إزالة من المفضلة', 'Remove from Wishlist')}
                  >
                    <Trash2 size={14} />
                  </button>

                  {/* Quick View Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickViewProduct(product);
                    }}
                    className="absolute bottom-3 inset-x-3 py-2 px-3 rounded-xl bg-white/95 backdrop-blur text-[#20241F] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Eye size={14} />
                    <span>{t('معاينة سريعة', 'Quick View')}</span>
                  </button>
                </div>

                {/* Product Information & Move to Cart Button */}
                <div className="p-5 text-right flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase text-[#18794E]">
                      {t(product.subCategory_ar, product.subCategory_en)}
                    </p>
                    <h3
                      onClick={() => navigateToProduct(product.id)}
                      className="text-sm font-bold text-[#20241F] mt-1 line-clamp-1 hover:underline cursor-pointer"
                    >
                      {t(product.name_ar, product.name_en)}
                    </h3>
                    <p className="text-xs text-[#20241F]/60 mt-0.5 line-clamp-1">
                      {t(product.subtitle_ar, product.subtitle_en)}
                    </p>
                  </div>

                  {/* Price & Move to Cart action */}
                  <div className="mt-4 pt-4 border-t border-[#20241F]/5">
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-sm font-black text-[#20241F]">
                        {product.price.toLocaleString()} {t('ج.م', 'EGP')}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-xs text-[#20241F]/40 line-through">
                          {product.compareAtPrice.toLocaleString()} {t('ج.م', 'EGP')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => moveItemToCart(product)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#20241F] text-[#D5FF3F] hover:bg-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                      <ShoppingBag size={14} />
                      <span>{t('نقل إلى حقيبة التسوق', 'Move to Bag')}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
