import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Minus,
  Plus,
  Share2,
  Building2,
  Info
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ProductReviewsSection } from './ProductReviewsSection';
import { PRODUCTS, EGYPTIAN_GOVERNORATES } from '../../data/products';

export const ProductDetailPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const {
    selectedProductId,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setCurrentPage,
    showToast,
    getProductReviews
  } = useStore();

  const product = PRODUCTS.find((p) => p.id === selectedProductId) || PRODUCTS[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name_ar || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedGovId, setSelectedGovId] = useState('cairo');
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping'>('details');

  const isFav = isInWishlist(product.id);
  const selectedGov = EGYPTIAN_GOVERNORATES.find((g) => g.id === selectedGovId) || EGYPTIAN_GOVERNORATES[0];
  const reviews = getProductReviews(product.id);
  const liveCount = reviews.length;
  const liveRating = liveCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / liveCount).toFixed(1)
    : product.rating.toFixed(1);

  // Related products from the same category or brand
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast(t('تم نسخ رابط المنتج للمشاركة!', 'Product link copied to clipboard!'));
    }
  };

  return (
    <div className="bg-[#F5F2E9] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#111310]/60 mb-6 text-right">
          <button onClick={() => setCurrentPage('home')} className="hover:text-black">
            {t('الرئيسية', 'Home')}
          </button>
          <span>/</span>
          <button onClick={() => setCurrentPage('catalog')} className="hover:text-black">
            {t('المتجر', 'Catalog')}
          </button>
          <span>/</span>
          <span className="text-[#111310] font-bold truncate max-w-xs">
            {t(product.name_ar, product.name_en)}
          </span>
        </div>

        {/* Main Product Section: Gallery + Purchase Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Gallery Column (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[580px] shrink-0 no-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white ${
                      activeImageIndex === idx
                        ? 'border-[#111310] ring-2 ring-[#D5FF3F]'
                        : 'border-[#111310]/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Active Image with Zoom Feel */}
            <div className="relative flex-1 aspect-[4/5] rounded-3xl overflow-hidden bg-white border border-[#111310]/10 shadow-sm group">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name_ar}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />

              {product.isNew && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-md bg-[#111310] text-[#D5FF3F] text-xs font-mono font-bold tracking-wider uppercase shadow-md">
                    {t('جديد', 'NEW')}
                  </span>
                </div>
              )}

              {/* Share & Wishlist quick corner */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2.5 rounded-full backdrop-blur-md shadow-md transition-all ${
                    isFav ? 'bg-[#111310] text-rose-500' : 'bg-white/90 text-[#111310] hover:bg-white'
                  }`}
                  title={t('المفضلة', 'Wishlist')}
                >
                  <Heart size={18} className={isFav ? 'fill-rose-500' : ''} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-white/90 backdrop-blur-md text-[#111310] hover:bg-white shadow-md transition-all"
                  title={t('مشاركة', 'Share')}
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Details & Purchase Action Column (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#111310]/10 shadow-sm text-right flex flex-col justify-between">
            <div>
              {/* Brand & Origin */}
              <div className="flex items-center justify-between text-xs text-[#111310]/60 mb-2">
                <span className="font-mono uppercase font-black tracking-widest text-[#586249]">
                  {product.brand}
                </span>
                <span className="text-[11px] font-semibold text-[#111310]/70">
                  {t(product.madeIn_ar, product.madeIn_en)}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-[#111310] tracking-tight leading-snug">
                {t(product.name_ar, product.name_en)}
              </h1>

              {/* Subtitle / materials */}
              <p className="text-xs sm:text-sm text-[#111310]/60 mt-1">
                {t(product.subtitle_ar, product.subtitle_en)}
              </p>

              {/* Rating & SKU */}
              <div className="mt-3 flex items-center justify-between text-xs pb-4 border-b border-[#111310]/10">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('reviews-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 font-bold text-[#111310] hover:opacity-80 transition-opacity text-right"
                >
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span>{liveRating}</span>
                  <span className="text-[#111310]/60 font-semibold underline underline-offset-4 decoration-[#111310]/30 hover:decoration-[#111310]">
                    ({liveCount} {t('تقييم موثق', 'verified reviews')})
                  </span>
                </button>
                <span className="font-mono text-[11px] text-[#111310]/40">
                  SKU: {product.sku}
                </span>
              </div>

              {/* Price & Stock Status */}
              <div className="my-5 flex items-baseline justify-between">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-[#111310]">
                    {product.price.toLocaleString()} {t('ج.م', 'EGP')}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-[#111310]/40 line-through">
                      {product.compareAtPrice.toLocaleString()} {t('ج.م', 'EGP')}
                    </span>
                  )}
                </div>

                <div className="text-left">
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{t(`متوفر (${product.stock} قطع في القاهرة)`, `In stock (${product.stock} units)`)}</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                      {t('نفدت الكمية مؤقتًا', 'Out of stock')}
                    </span>
                  )}
                </div>
              </div>

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2.5 text-xs font-bold text-[#111310]">
                    <span>{t('اللون المختار:', 'Selected Color:')} <strong className="text-[#586249]">{selectedColor}</strong></span>
                    <span className="text-[11px] text-[#111310]/50">{product.colors.length} {t('خيارات', 'options')}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {product.colors.map((c, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(c.name_ar)}
                        className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColor === c.name_ar
                            ? 'border-[#111310] ring-2 ring-[#D5FF3F] scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={t(c.name_ar, c.name_en)}
                      >
                        {selectedColor === c.name_ar && (
                          <Check size={14} className={c.hex === '#111310' ? 'text-white' : 'text-black'} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2.5 text-xs font-bold text-[#111310]">
                    <span>{t('المقاس:', 'Select Size:')} <strong className="text-[#586249]">{selectedSize}</strong></span>
                    <button className="text-[11px] text-[#111310]/60 underline hover:text-black">
                      {t('دليل المقاسات', 'Size Guide')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                          selectedSize === s
                            ? 'bg-[#111310] text-[#D5FF3F] shadow-sm'
                            : 'bg-[#F5F2E9] text-[#111310] hover:bg-[#EAE6DC]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Counter & Add-to-Cart Action */}
              <div className="flex gap-3 items-center pt-2">
                <div className="flex items-center border border-[#111310]/20 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 hover:bg-[#F5F2E9] text-[#111310] transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3.5 text-sm font-bold font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-3 hover:bg-[#F5F2E9] text-[#111310] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => addToCart(product, quantity, selectedColor, selectedSize)}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-[#111310] text-white hover:bg-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg group"
                >
                  <ShoppingBag size={16} className="text-[#D5FF3F]" />
                  <span>{t('إضافة إلى حقيبة التسوق', 'Add to Bag')}</span>
                  <span>•</span>
                  <span>{(product.price * quantity).toLocaleString()} {t('ج.م', 'EGP')}</span>
                </button>
              </div>

              {/* B2B Teaser if wholesale available */}
              {product.wholesaleAvailable && (
                <div className="mt-4 p-3 rounded-xl bg-[#D5FF3F]/20 border border-[#D5FF3F]/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#111310]">
                    <Building2 size={16} className="text-[#111310]" />
                    <span className="font-bold">
                      {t('متاح للشراء بالجملة والشركات', 'Available for B2B Bulk Orders')}
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentPage('wholesale')}
                    className="font-bold text-[#111310] underline hover:no-underline text-[11px]"
                  >
                    {t('طلب عرض سعر B2B', 'Get B2B Quote')}
                  </button>
                </div>
              )}

              {/* Egypt Shipping Transit Times Inset */}
              <div className="mt-6 p-4 rounded-2xl bg-[#F5F2E9]/70 border border-[#111310]/10">
                <div className="flex items-center justify-between mb-2 text-xs font-bold text-[#111310]">
                  <span className="flex items-center gap-1.5">
                    <Truck size={15} />
                    <span>{t('مواعيد التوصيل لمحافظتك:', 'Estimated Transit to Your Governorate:')}</span>
                  </span>
                </div>

                <div className="flex gap-2 items-center">
                  <select
                    value={selectedGovId}
                    onChange={(e) => setSelectedGovId(e.target.value)}
                    className="flex-1 bg-white border border-[#111310]/20 rounded-xl py-2 px-3 text-xs font-semibold text-[#111310] focus:outline-none"
                  >
                    {EGYPTIAN_GOVERNORATES.map((gov) => (
                      <option key={gov.id} value={gov.id}>
                        {t(gov.name_ar, gov.name_en)}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-[11px] text-[#111310]/70 mt-2 flex items-center justify-between">
                  <span>{t('مدة التوصيل المقدرة:', 'Estimated delivery:')} <strong>{selectedGov.deliveryDays}</strong></span>
                  <span className="text-[#18794E] font-medium">{t('توصيل لباب المنزل', 'Doorstep Delivery')}</span>
                </p>
              </div>

            </div>

            {/* Accordion Tabs for description, specs, care */}
            <div className="mt-8 pt-6 border-t border-[#111310]/10">
              <div className="flex border-b border-[#111310]/10 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 px-3 border-b-2 transition-colors ${
                    activeTab === 'details' ? 'border-[#111310] text-[#111310]' : 'border-transparent text-[#111310]/40'
                  }`}
                >
                  {t('الوصف', 'Description')}
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2 px-3 border-b-2 transition-colors ${
                    activeTab === 'specs' ? 'border-[#111310] text-[#111310]' : 'border-transparent text-[#111310]/40'
                  }`}
                >
                  {t('المواصفات الفنية', 'Specifications')}
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-2 px-3 border-b-2 transition-colors ${
                    activeTab === 'shipping' ? 'border-[#111310] text-[#111310]' : 'border-transparent text-[#111310]/40'
                  }`}
                >
                  {t('الاستبدال والضمان', 'Returns & Warranty')}
                </button>
              </div>

              <div className="py-4 text-xs text-[#111310]/80 leading-relaxed">
                {activeTab === 'details' && (
                  <p>{t(product.description_ar, product.description_en)}</p>
                )}
                {activeTab === 'specs' && (
                  <div className="space-y-2">
                    {product.specs.map((s, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-[#111310]/5">
                        <span className="font-bold text-[#111310]">{t(s.label_ar, s.label_en)}</span>
                        <span>{t(s.value_ar, s.value_en)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'shipping' && (
                  <div className="space-y-2">
                    <p>{t('• استرجاع واستبدال مجاني خلال 14 يومًا من تاريخ الاستلام في حال كانت القطعة بحالتها الأصلية.', '• 14-day complimentary exchange & return policy in original packaging.')}</p>
                    <p>{t('• فحص ومعاينة المنتج عند الاستلام متاح قبل دفع المبلغ لمندوب الشحن.', '• Inspection on delivery is welcomed before completing payment.')}</p>
                    <p>{t('• ضمان جودة محلي صادر ومعتمد من متجر VAYRO مصر.', '• Certified Egyptian authenticity & quality guarantee.')}</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Customer Reviews & Star Ratings Section */}
        <ProductReviewsSection product={product} />

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#111310]/10">
            <div className="flex items-center justify-between mb-8 text-right">
              <div>
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#AAB5A0] font-bold block mb-1">
                  {t('قد ينال إعجابك أيضًا', 'COMPLETE THE LOOK')}
                </span>
                <h3 className="text-2xl font-black text-[#111310]">
                  {t('منتجات مكملة ومقترحة', 'Related Curation')}
                </h3>
              </div>
              <button
                onClick={() => setCurrentPage('catalog')}
                className="text-xs font-bold text-[#111310] underline"
              >
                {t('تصفح المزيد', 'View more')}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
