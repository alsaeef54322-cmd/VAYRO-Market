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
  Info,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Zap,
  HelpCircle,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ProductReviewsSection } from './ProductReviewsSection';
import { EGYPTIAN_GOVERNORATES } from '../../data/products';
import { ImageLightboxModal } from '../ui/ImageLightboxModal';
import { handleImageError } from '../../utils/imageFallback';

export const ProductDetailPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const {
    products,
    selectedProductId,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setCurrentPage,
    showToast,
    getProductReviews
  } = useStore();

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]?.name_ar || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedGovId, setSelectedGovId] = useState('cairo');
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping'>('details');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-3">{t('المنتج غير موجود', 'Product Not Found')}</h2>
        <button
          onClick={() => setCurrentPage('catalog')}
          className="px-6 py-2.5 rounded-xl bg-[#20241F] text-[#D5FF3F] text-xs font-bold"
        >
          {t('العودة للمتجر', 'Return to Catalog')}
        </button>
      </div>
    );
  }

  const isFav = isInWishlist(product.id);
  const selectedGov = EGYPTIAN_GOVERNORATES.find((g) => g.id === selectedGovId) || EGYPTIAN_GOVERNORATES[0];
  const reviews = getProductReviews(product.id);
  const liveCount = reviews.length;
  const liveRating = liveCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / liveCount).toFixed(1)
    : product.rating.toFixed(1);

  // Related products from the same category or brand
  const relatedProducts = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast(t('تم نسخ رابط المنتج للمشاركة!', 'Product link copied to clipboard!'), 'success');
    }
  };

  const handleQuickBuy = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    setCurrentPage('checkout');
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % product.images.length);
  };

  return (
    <div className="bg-[#F7F7F3] dark:bg-[#111411] min-h-screen py-8 text-[#20241F] dark:text-[#F3F5EF] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#646A63] dark:text-[#B5BDB3] mb-6 text-right">
          <button onClick={() => setCurrentPage('home')} className="hover:text-black dark:hover:text-white transition-colors">
            {t('الرئيسية', 'Home')}
          </button>
          <span>/</span>
          <button onClick={() => setCurrentPage('catalog')} className="hover:text-black dark:hover:text-white transition-colors">
            {t('المتجر', 'Catalog')}
          </button>
          <span>/</span>
          <span className="text-[#20241F] dark:text-[#F3F5EF] font-bold truncate max-w-xs">
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
                    className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white dark:bg-[#1A1F1A] ${
                      activeImageIndex === idx
                        ? 'border-[#20241F] dark:border-[#D5FF3F] ring-2 ring-[#D5FF3F]'
                        : 'border-[#E2E5DE] dark:border-[#353D35] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Active Image with Zoom Trigger and Carousel Arrows */}
            <div
              className="relative flex-1 aspect-[4/5] rounded-3xl overflow-hidden bg-white dark:bg-[#1A1F1A] border border-[#E2E5DE] dark:border-[#353D35] shadow-sm group cursor-pointer"
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name_ar}
                onError={handleImageError}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />

              {product.isNew && (
                <div className="absolute top-4 right-4 z-10 pointer-events-none">
                  <span className="px-3 py-1 rounded-md bg-[#20241F] dark:bg-[#D5FF3F] text-[#D5FF3F] dark:text-[#20241F] text-xs font-mono font-bold tracking-wider uppercase shadow-md">
                    {t('جديد', 'NEW')}
                  </span>
                </div>
              )}

              {/* Prev / Next Arrows on image */}
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 dark:bg-black/60 text-[#20241F] dark:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow"
                    title={t('الصورة السابقة', 'Previous')}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 dark:bg-black/60 text-[#20241F] dark:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow"
                    title={t('الصورة التالية', 'Next')}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Zoom In Hint button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="absolute bottom-4 right-4 z-10 p-2.5 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-sm text-[#20241F] dark:text-white shadow hover:scale-110 transition-transform flex items-center gap-1.5 text-xs font-bold"
                title={t('تكبير وفحص تفاصيل الصورة', 'Zoom image')}
              >
                <Maximize2 size={16} />
                <span className="hidden sm:inline text-[11px]">{t('تكبير الصورة', 'Zoom')}</span>
              </button>

              {/* Share & Wishlist quick corner */}
              <div
                className="absolute top-4 left-4 z-10 flex flex-col gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2.5 rounded-full backdrop-blur-md shadow-md transition-all ${
                    isFav
                      ? 'bg-[#20241F] text-rose-500 ring-2 ring-[#D5FF3F]'
                      : 'bg-white/90 dark:bg-[#1A1F1A]/90 text-[#20241F] dark:text-white hover:bg-white'
                  }`}
                  title={t('المفضلة', 'Wishlist')}
                >
                  <Heart size={18} className={isFav ? 'fill-rose-500 text-rose-500' : ''} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-white/90 dark:bg-[#1A1F1A]/90 backdrop-blur-md text-[#20241F] dark:text-white hover:bg-white shadow-md transition-all"
                  title={t('مشاركة', 'Share')}
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Details & Purchase Action Column (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#1A1F1A] p-6 sm:p-8 rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm text-right flex flex-col justify-between">
            <div>
              {/* Brand & Origin */}
              <div className="flex items-center justify-between text-xs text-[#646A63] dark:text-[#B5BDB3] mb-2">
                <span className="font-mono uppercase font-black tracking-widest text-[#18794E] dark:text-[#65C98A]">
                  {product.brand}
                </span>
                <span className="text-[11px] font-semibold text-[#646A63] dark:text-[#B5BDB3]">
                  {t(product.madeIn_ar, product.madeIn_en)}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-[#20241F] dark:text-[#F3F5EF] tracking-tight leading-snug">
                {t(product.name_ar, product.name_en)}
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-[#646A63] dark:text-[#B5BDB3] mt-1 font-medium">
                {t(product.subtitle_ar, product.subtitle_en)}
              </p>

              {/* Ratings and Reviews Summary */}
              <div className="flex items-center gap-3 my-4 pb-4 border-b border-[#E2E5DE] dark:border-[#353D35]">
                <div className="flex items-center gap-1 bg-[#F7F7F3] dark:bg-[#232923] py-1 px-2.5 rounded-lg border border-[#E2E5DE] dark:border-[#353D35]">
                  <Star size={14} className="fill-[#18794E] text-[#18794E] dark:fill-[#D5FF3F] dark:text-[#D5FF3F]" />
                  <span className="text-xs font-bold font-mono text-[#20241F] dark:text-[#F3F5EF]">{liveRating}</span>
                </div>
                <span className="text-xs text-[#646A63] dark:text-[#B5BDB3]">
                  {liveCount > 0 ? (
                    <span>{liveCount} {t('تقييم موثق من عملاء اشتروا المنتج', 'verified reviews')}</span>
                  ) : (
                    <span>{t('كن أول من يقيّم هذا المنتج', 'Be the first to review')}</span>
                  )}
                </span>
              </div>

              {/* Pricing & Stock Banner */}
              <div className="flex items-baseline justify-between mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-[#20241F] dark:text-[#F3F5EF] font-mono">
                    {product.price.toLocaleString()} {t('ج.م', 'EGP')}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-base text-[#646A63] dark:text-[#B5BDB3] line-through font-mono">
                      {product.compareAtPrice.toLocaleString()} {t('ج.م', 'EGP')}
                    </span>
                  )}
                </div>

                <div className="text-left">
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{t(`متوفر (${product.stock} قطع في القاهرة)`, `In stock (${product.stock} units)`)}</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/60 px-2.5 py-1 rounded-md">
                      {t('نفدت الكمية مؤقتًا', 'Out of stock')}
                    </span>
                  )}
                </div>
              </div>

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2.5 text-xs font-bold text-[#20241F] dark:text-[#F3F5EF]">
                    <span>{t('اللون المختار:', 'Selected Color:')} <strong className="text-[#18794E] dark:text-[#65C98A]">{selectedColor}</strong></span>
                    <span className="text-[11px] text-[#646A63] dark:text-[#B5BDB3]">{product.colors.length} {t('خيارات', 'options')}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {product.colors.map((c, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColor(c.name_ar)}
                        className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColor === c.name_ar
                            ? 'border-[#20241F] dark:border-[#D5FF3F] ring-2 ring-[#D5FF3F] scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={t(c.name_ar, c.name_en)}
                      >
                        {selectedColor === c.name_ar && (
                          <Check size={14} className={c.hex.toLowerCase() === '#111310' || c.hex.toLowerCase() === '#1c1c1c' ? 'text-white' : 'text-black'} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2.5 text-xs font-bold text-[#20241F] dark:text-[#F3F5EF]">
                    <span>{t('المقاس:', 'Select Size:')} <strong className="text-[#18794E] dark:text-[#65C98A]">{selectedSize}</strong></span>
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="text-[11px] text-[#18794E] dark:text-[#65C98A] underline hover:no-underline font-semibold flex items-center gap-1"
                    >
                      <HelpCircle size={12} />
                      <span>{t('دليل المقاسات', 'Size Guide')}</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                          selectedSize === s
                            ? 'bg-[#20241F] text-[#D5FF3F] dark:bg-[#D5FF3F] dark:text-[#20241F] shadow-sm'
                            : 'bg-[#F7F7F3] dark:bg-[#232923] text-[#20241F] dark:text-[#F3F5EF] hover:bg-[#ECEAE1] dark:hover:bg-[#2E362E]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Counter & Add-to-Cart Action */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch pt-2">
                <div className="flex items-center justify-between border border-[#E2E5DE] dark:border-[#353D35] rounded-xl overflow-hidden bg-white dark:bg-[#1A1F1A]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 hover:bg-[#F7F7F3] dark:hover:bg-[#232923] text-[#20241F] dark:text-white transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 text-sm font-bold font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-3 hover:bg-[#F7F7F3] dark:hover:bg-[#232923] text-[#20241F] dark:text-white transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  type="button"
                  onClick={() => addToCart(product, quantity, selectedColor, selectedSize)}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-[#20241F] text-white hover:bg-black dark:bg-[#232923] dark:hover:bg-[#2F372F] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md group"
                >
                  <ShoppingBag size={16} className="text-[#D5FF3F]" />
                  <span>{t('إضافة إلى السلة', 'Add to Bag')}</span>
                  <span>•</span>
                  <span className="font-mono">{(product.price * quantity).toLocaleString()} {t('ج.م', 'EGP')}</span>
                </button>

                {/* Quick Buy Instant Checkout Button */}
                <button
                  type="button"
                  onClick={handleQuickBuy}
                  className="py-3.5 px-5 rounded-xl bg-[#D5FF3F] text-[#20241F] hover:brightness-105 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                  title={t('شراء فوري ومباشر لباب المنزل', 'Instant Checkout')}
                >
                  <Zap size={15} />
                  <span>{t('شراء فوري', 'Buy Now')}</span>
                </button>
              </div>

              {/* B2B Teaser if wholesale available */}
              {product.wholesaleAvailable && (
                <div className="mt-4 p-3 rounded-xl bg-[#D5FF3F]/15 dark:bg-[#D5FF3F]/10 border border-[#D5FF3F]/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#20241F] dark:text-[#F3F5EF]">
                    <Building2 size={16} className="text-[#18794E] dark:text-[#D5FF3F]" />
                    <span className="font-bold">
                      {t('متاح للشراء بالجملة والشركات (B2B)', 'Available for B2B Bulk Orders')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('wholesale')}
                    className="font-bold text-[#18794E] dark:text-[#D5FF3F] underline hover:no-underline text-[11px]"
                  >
                    {t('طلب عرض سعر B2B', 'Get B2B Quote')}
                  </button>
                </div>
              )}

              {/* Egypt Shipping Transit Times Inset */}
              <div className="mt-6 p-4 rounded-2xl bg-[#F7F7F3] dark:bg-[#232923] border border-[#E2E5DE] dark:border-[#353D35]">
                <div className="flex items-center justify-between mb-2 text-xs font-bold text-[#20241F] dark:text-[#F3F5EF]">
                  <span className="flex items-center gap-1.5">
                    <Truck size={15} className="text-[#18794E] dark:text-[#65C98A]" />
                    <span>{t('مواعيد التوصيل لمحافظتك:', 'Estimated Transit to Your Governorate:')}</span>
                  </span>
                </div>

                <div className="flex gap-2 items-center">
                  <select
                    value={selectedGovId}
                    onChange={(e) => setSelectedGovId(e.target.value)}
                    className="bg-white dark:bg-[#1A1F1A] text-xs py-2 px-3 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] flex-1 focus:outline-none"
                  >
                    {EGYPTIAN_GOVERNORATES.map((g) => (
                      <option key={g.id} value={g.id}>
                        {t(g.name_ar, g.name_en)} ({g.deliveryDays})
                      </option>
                    ))}
                  </select>

                  <div className="px-3 py-2 bg-white dark:bg-[#1A1F1A] border border-[#E2E5DE] dark:border-[#353D35] rounded-xl text-xs font-mono font-bold text-[#18794E] dark:text-[#65C98A]">
                    {selectedGov.shippingFee} {t('ج.م', 'EGP')}
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion Tabs for description, specs, care */}
            <div className="mt-8 pt-6 border-t border-[#E2E5DE] dark:border-[#353D35]">
              <div className="flex border-b border-[#E2E5DE] dark:border-[#353D35] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors ${
                    activeTab === 'details'
                      ? 'border-[#20241F] dark:border-[#D5FF3F] text-[#20241F] dark:text-[#F3F5EF]'
                      : 'border-transparent text-[#646A63] dark:text-[#B5BDB3]'
                  }`}
                >
                  {t('الوصف', 'Description')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors ${
                    activeTab === 'specs'
                      ? 'border-[#20241F] dark:border-[#D5FF3F] text-[#20241F] dark:text-[#F3F5EF]'
                      : 'border-transparent text-[#646A63] dark:text-[#B5BDB3]'
                  }`}
                >
                  {t('المواصفات الفنية', 'Specifications')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors ${
                    activeTab === 'shipping'
                      ? 'border-[#20241F] dark:border-[#D5FF3F] text-[#20241F] dark:text-[#F3F5EF]'
                      : 'border-transparent text-[#646A63] dark:text-[#B5BDB3]'
                  }`}
                >
                  {t('الاستبدال والضمان', 'Returns & Warranty')}
                </button>
              </div>

              <div className="py-4 text-xs text-[#20241F]/80 dark:text-[#F3F5EF]/80 leading-relaxed">
                {activeTab === 'details' && (
                  <p>{t(product.description_ar, product.description_en)}</p>
                )}
                {activeTab === 'specs' && (
                  <div className="space-y-2">
                    {product.specs.map((s, i) => (
                      <div key={i} className="flex justify-between py-1.5 border-b border-[#E2E5DE] dark:border-[#353D35]">
                        <span className="font-bold text-[#20241F] dark:text-[#F3F5EF]">{t(s.label_ar, s.label_en)}</span>
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
          <div className="mt-20 pt-12 border-t border-[#E2E5DE] dark:border-[#353D35]">
            <div className="flex items-center justify-between mb-8 text-right">
              <div>
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#18794E] dark:text-[#65C98A] font-bold block mb-1">
                  {t('قد ينال إعجابك أيضًا', 'COMPLETE THE LOOK')}
                </span>
                <h3 className="text-2xl font-black text-[#20241F] dark:text-[#F3F5EF]">
                  {t('منتجات مكملة ومقترحة', 'Related Curation')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage('catalog')}
                className="text-xs font-bold text-[#18794E] dark:text-[#65C98A] underline hover:no-underline"
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

      {/* Interactive Image Lightbox Zoom Modal */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={product.images}
        initialIndex={activeImageIndex}
        productTitle={t(product.name_ar, product.name_en)}
      />

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#111310]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsSizeGuideOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#1A1F1A] rounded-3xl p-6 border border-[#E2E5DE] dark:border-[#353D35] shadow-2xl text-right relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5DE] dark:border-[#353D35] mb-4">
              <h3 className="text-base font-bold text-[#20241F] dark:text-[#F3F5EF]">
                {t('دليل المقاسات المعتمد (VAYRO Size Guide)', 'Official Size Guide')}
              </h3>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#646A63] dark:text-[#B5BDB3] mb-4">
              {t(
                'القياسات مطابقة للمعايير القياسية المصرية والأوروبية. نوصي باختيار مقاسك المعتاد للحصول على مظهر مريح.',
                'Measurements follow standard European & Egyptian tailoring. We suggest taking your true size.'
              )}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="bg-[#F7F7F3] dark:bg-[#232923] border-b border-[#E2E5DE] dark:border-[#353D35]">
                    <th className="py-2.5 px-3 font-bold">{t('المقاس', 'Size')}</th>
                    <th className="py-2.5 px-3 font-bold">{t('محيط الصدر (سم)', 'Chest (cm)')}</th>
                    <th className="py-2.5 px-3 font-bold">{t('الطول (سم)', 'Length (cm)')}</th>
                    <th className="py-2.5 px-3 font-bold">{t('الكتف (سم)', 'Shoulder (cm)')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5DE] dark:divide-[#353D35] font-mono">
                  <tr>
                    <td className="py-2 px-3 font-bold">S</td>
                    <td className="py-2 px-3">96 - 100</td>
                    <td className="py-2 px-3">71</td>
                    <td className="py-2 px-3">45</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold">M</td>
                    <td className="py-2 px-3">102 - 106</td>
                    <td className="py-2 px-3">73</td>
                    <td className="py-2 px-3">47</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold">L</td>
                    <td className="py-2 px-3">108 - 112</td>
                    <td className="py-2 px-3">75</td>
                    <td className="py-2 px-3">49</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold">XL</td>
                    <td className="py-2 px-3">114 - 118</td>
                    <td className="py-2 px-3">77</td>
                    <td className="py-2 px-3">51</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold">XXL</td>
                    <td className="py-2 px-3">120 - 126</td>
                    <td className="py-2 px-3">79</td>
                    <td className="py-2 px-3">53</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#20241F] dark:bg-[#D5FF3F] text-white dark:text-[#20241F] font-bold text-xs"
            >
              {t('فهمت، إغلاق الدليل', 'Got it, close guide')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
