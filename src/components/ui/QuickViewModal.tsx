import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';

export const QuickViewModal: React.FC = () => {
  const { t, dir } = useLanguage();
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    navigateToProduct
  } = useStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const isFav = isInWishlist(quickViewProduct.id);
  const activeColor = selectedColor || quickViewProduct.colors[0]?.name_ar;
  const activeSize = selectedSize || quickViewProduct.sizes[0];

  const handleAddToCart = () => {
    addToCart(quickViewProduct, quantity, activeColor, activeSize);
    setQuickViewProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111310]/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="flex-1 absolute inset-0"
        onClick={() => setQuickViewProduct(null)}
      />

      <div className="relative w-full max-w-3xl bg-white dark:bg-[#181C17] border border-[#111310]/10 dark:border-white/10 text-[#111310] dark:text-[#F7F7F3] rounded-3xl shadow-2xl overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2 text-right">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-[#232921] backdrop-blur text-[#111310] dark:text-[#F7F7F3] flex items-center justify-center shadow hover:bg-white dark:hover:bg-[#2C332A]"
        >
          <X size={18} />
        </button>

        {/* Gallery Image Column */}
        <div className="p-6 bg-[#F5F2E9]/60 dark:bg-[#141713] flex flex-col justify-between">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white shadow-inner">
            <img
              src={quickViewProduct.images[selectedImageIndex] || quickViewProduct.images[0]}
              alt={quickViewProduct.name_ar}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {quickViewProduct.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {quickViewProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx ? 'border-[#111310]' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#111310]/60 mb-2">
              <span className="font-mono uppercase font-bold text-[#AAB5A0]">
                {quickViewProduct.brand}
              </span>
              <div className="flex items-center gap-1 font-medium">
                <Star size={12} className="fill-[#111310] text-[#111310]" />
                <span>{quickViewProduct.rating}</span>
                <span>({quickViewProduct.reviewsCount})</span>
              </div>
            </div>

            <h3 className="text-xl font-black text-[#111310]">
              {t(quickViewProduct.name_ar, quickViewProduct.name_en)}
            </h3>

            <p className="text-xs text-[#111310]/60 mt-1">
              {t(quickViewProduct.subtitle_ar, quickViewProduct.subtitle_en)}
            </p>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-black text-[#111310]">
                {quickViewProduct.price.toLocaleString()} {t('ج.م', 'EGP')}
              </span>
              {quickViewProduct.compareAtPrice && (
                <span className="text-sm text-[#111310]/40 line-through">
                  {quickViewProduct.compareAtPrice.toLocaleString()} {t('ج.م', 'EGP')}
                </span>
              )}
            </div>

            {/* Colors */}
            {quickViewProduct.colors.length > 0 && (
              <div className="mt-5">
                <label className="text-xs font-bold text-[#111310] block mb-2">
                  {t('اللون:', 'Color:')} {activeColor}
                </label>
                <div className="flex items-center gap-2">
                  {quickViewProduct.colors.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(c.name_ar)}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                        activeColor === c.name_ar ? 'border-[#111310] scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={t(c.name_ar, c.name_en)}
                    >
                      {activeColor === c.name_ar && (
                        <Check size={12} className={c.hex === '#111310' ? 'text-white' : 'text-black'} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {quickViewProduct.sizes.length > 0 && (
              <div className="mt-5">
                <label className="text-xs font-bold text-[#111310] block mb-2">
                  {t('المقاس:', 'Size:')} {activeSize}
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeSize === s
                          ? 'bg-[#111310] text-[#D5FF3F]'
                          : 'bg-[#F5F2E9] text-[#111310] hover:bg-[#EAE6DC]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-8 pt-5 border-t border-[#111310]/10 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 px-6 rounded-xl bg-[#111310] text-[#D5FF3F] hover:bg-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <ShoppingBag size={15} />
                <span>{t('إضافة إلى السلة', 'Add to Bag')}</span>
              </button>

              <button
                onClick={() => toggleWishlist(quickViewProduct.id)}
                className={`p-3 rounded-xl border border-[#111310]/15 hover:bg-[#F5F2E9] transition-colors ${
                  isFav ? 'bg-[#111310] text-rose-500' : 'text-[#111310]'
                }`}
                title={t('المفضلة', 'Wishlist')}
              >
                <Heart size={18} className={isFav ? 'fill-rose-500' : ''} />
              </button>
            </div>

            <button
              onClick={() => {
                const id = quickViewProduct.id;
                setQuickViewProduct(null);
                navigateToProduct(id);
              }}
              className="text-center text-xs font-bold text-[#111310] hover:underline"
            >
              {t('عرض صفحة تفاصيل المنتج الكاملة ←', 'View Full Product Page Details →')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
