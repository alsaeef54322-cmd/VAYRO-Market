import React, { useState, useEffect } from 'react';
import { X, Star, ShieldCheck, CheckCircle2, ThumbsUp, ThumbsDown, PackageCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import { EGYPTIAN_GOVERNORATES } from '../../data/products';

export const WriteReviewModal: React.FC = () => {
  const {
    isReviewModalOpen,
    closeReviewModal,
    reviewModalProduct,
    reviewModalOrderNumber,
    submitProductReview,
    currentUser,
    checkUserPurchased
  } = useStore();
  const { t, language } = useLanguage();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [governorate, setGovernorate] = useState<string>('القاهرة');
  const [recommended, setRecommended] = useState<boolean>(true);
  const [orderNumberInput, setOrderNumberInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isReviewModalOpen && reviewModalProduct) {
      setRating(5);
      setHoverRating(0);
      setTitle('');
      setComment('');
      setErrorMsg(null);
      setRecommended(true);

      // Pre-fill author info if logged in
      if (currentUser) {
        setAuthorName(currentUser.name || '');
        const gov = EGYPTIAN_GOVERNORATES.find((g) => g.id === currentUser.governorateId);
        setGovernorate(gov ? gov.name_ar : 'القاهرة');
      } else {
        setAuthorName('');
        setGovernorate('القاهرة');
      }

      // Check purchase verification
      const purchaseInfo = checkUserPurchased(reviewModalProduct.id);
      if (reviewModalOrderNumber) {
        setOrderNumberInput(reviewModalOrderNumber);
      } else if (purchaseInfo.purchased && purchaseInfo.orderNumber) {
        setOrderNumberInput(purchaseInfo.orderNumber);
      } else {
        setOrderNumberInput('');
      }
    }
  }, [isReviewModalOpen, reviewModalProduct, reviewModalOrderNumber, currentUser]);

  if (!isReviewModalOpen || !reviewModalProduct) return null;

  const isVerified = Boolean(
    orderNumberInput.trim() ||
    reviewModalOrderNumber ||
    checkUserPurchased(reviewModalProduct.id).purchased
  );

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return t('ممتاز (5/5) — يفوق التوقعات', 'Excellent (5/5) — Exceeds expectations');
      case 4:
        return t('جيد جداً (4/5) — أنصح به بشدة', 'Very Good (4/5) — Highly recommended');
      case 3:
        return t('جيد (3/5) — يلبي الاحتياجات', 'Good (3/5) — Meets expectations');
      case 2:
        return t('مقبول (2/5) — توجد بعض الملاحظات', 'Fair (2/5) — Needs improvement');
      case 1:
        return t('يحتاج تحسين (1/5) — لم ينل إعجابي', 'Poor (1/5) — Unsatisfied');
      default:
        return t('اختر تقييمك بالنجوم', 'Select star rating');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (rating < 1 || rating > 5) {
      setErrorMsg(t('يرجى تحديد تقييم من 1 إلى 5 نجوم', 'Please select a star rating from 1 to 5.'));
      return;
    }

    if (!title.trim() || title.trim().length < 3) {
      setErrorMsg(t('يرجى كتابة عنوان مختصر لتقييمك (على الأقل 3 أحرف)', 'Please provide a short headline (at least 3 characters).'));
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      setErrorMsg(t('يرجى كتابة تعليقك وملاحظاتك بالتفصيل (على الأقل 10 أحرف)', 'Please write detailed feedback (at least 10 characters).'));
      return;
    }

    if (!authorName.trim()) {
      setErrorMsg(t('يرجى إدخال اسمك أو الاسم المستعار', 'Please provide your name.'));
      return;
    }

    setIsSubmitting(true);

    try {
      submitProductReview({
        productId: reviewModalProduct.id,
        orderNumber: orderNumberInput.trim() || undefined,
        authorName: authorName.trim(),
        authorGovernorate: governorate,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        isVerifiedPurchase: isVerified,
        recommended
      });
    } catch {
      setErrorMsg(t('حدث خطأ أثناء حفظ التقييم. حاول مرة أخرى.', 'Error submitting review. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={closeReviewModal}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#20241F]/10 text-right"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#20241F]/10 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#18794E] font-black block">
              {t('تقييمات مجتمع VAYRO', 'VAYRO COMMUNITY REVIEWS')}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#20241F]">
              {t('تقييم وتجربة المنتج', 'Review Your Purchased Product')}
            </h2>
          </div>
          <button
            onClick={closeReviewModal}
            className="w-9 h-9 rounded-full bg-[#F7F7F3] hover:bg-[#20241F]/10 text-[#20241F] flex items-center justify-center transition-colors"
            aria-label={t('إغلاق', 'Close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Inset Card */}
        <div className="p-6 bg-[#F7F7F3] border-b border-[#20241F]/5 flex items-center gap-4">
          <img
            src={reviewModalProduct.images[0]}
            alt={reviewModalProduct.name_ar}
            className="w-16 h-20 object-cover rounded-2xl bg-white shadow-sm shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#20241F]/60 font-bold block">
              {reviewModalProduct.brand}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[#20241F] truncate">
              {t(reviewModalProduct.name_ar, reviewModalProduct.name_en)}
            </h3>
            <p className="text-xs font-black text-[#20241F] mt-0.5">
              {reviewModalProduct.price.toLocaleString()} {t('ج.م', 'EGP')}
            </p>
          </div>
        </div>

        {/* Verification Alert Badge */}
        <div className="px-6 pt-5">
          {isVerified ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3">
              <ShieldCheck className="text-emerald-700 shrink-0" size={20} />
              <div className="text-xs">
                <p className="font-bold text-emerald-900">
                  {t('شراء موثق ومؤكد من VAYRO Market', 'Verified Purchase on VAYRO Market')}
                </p>
                <p className="text-emerald-700 text-[11px] mt-0.5">
                  {orderNumberInput
                    ? t(`مرتبط بطلب الشراء رقم: #${orderNumberInput}`, `Linked to order #${orderNumberInput}`)
                    : t('تم تأكيد شرائك لهذا المنتج من سجل طلبات حسابك.', 'Confirmed from your account order history.')}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
              <PackageCheck className="text-amber-700 shrink-0 mt-0.5" size={17} />
              <div>
                <span className="font-bold">{t('هل قمت بشراء هذا المنتج؟', 'Did you purchase this item?')}</span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  {t('إذا كان لديك رقم طلب (مثل VYR-12345)، أدخله أدناه للحصول على شارة "مشتري موثق".', 'If you have an order number (e.g. VYR-12345), enter it below for a Verified Buyer badge.')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* 1. Star Rating Selector */}
          <div>
            <label className="block text-xs font-black text-[#20241F] mb-2">
              {t('تقييمك العام للمنتج *', 'Overall Star Rating *')}
            </label>
            <div className="flex items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled = (hoverRating || rating) >= starValue;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1.5 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    aria-label={`${starValue} ${t('نجوم', 'stars')}`}
                  >
                    <Star
                      size={28}
                      className={
                        isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'text-[#20241F]/20 hover:text-amber-300'
                      }
                    />
                  </button>
                );
              })}
              <span className="mr-3 text-xs font-bold text-[#20241F]/80">
                {getRatingLabel(hoverRating || rating)}
              </span>
            </div>
          </div>

          {/* 2. Review Headline / Title */}
          <div>
            <label className="block text-xs font-black text-[#20241F] mb-1.5">
              {t('عنوان التقييم / الخلاصة *', 'Review Headline *')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('مثال: خامة قطن فاخرة وتفوق التوقعات، المقاس مضبوط جداً', 'e.g. Exceptional fabric quality and true-to-size fit')}
              className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-2xl py-3 px-4 text-xs font-semibold text-[#20241F] focus:outline-none focus:border-[#20241F] focus:bg-white transition-all"
              required
            />
          </div>

          {/* 3. Written Feedback Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-[#20241F]">
                {t('رأيك وتجربتك بالتفصيل *', 'Detailed Written Feedback *')}
              </label>
              <span className="text-[10px] text-[#20241F]/50 font-mono">
                {comment.length} / 1000
              </span>
            </div>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t(
                'شارك تفاصيل الخامة، الراحة، ثبات الألوان بعد الاستخدام، المقاس، سرعة التوصيل، ومدى ملاءمة المنتج للاستخدام اليومي لمساعدة باقي العملاء...',
                'Describe the craftsmanship, comfort, fit accuracy, packaging, and daily wear experience to help other buyers...'
              )}
              className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-2xl py-3 px-4 text-xs font-semibold text-[#20241F] focus:outline-none focus:border-[#20241F] focus:bg-white transition-all leading-relaxed"
              required
            />
          </div>

          {/* 4. Recommend Product Toggle */}
          <div className="p-4 rounded-2xl bg-[#F7F7F3] border border-[#20241F]/10">
            <span className="block text-xs font-black text-[#20241F] mb-2.5">
              {t('هل توصي بهذا المنتج لعملاء VAYRO آخرين؟', 'Would you recommend this item to other shoppers?')}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRecommended(true)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  recommended
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-white text-[#20241F] border-[#20241F]/15 hover:bg-emerald-50'
                }`}
              >
                <ThumbsUp size={15} />
                <span>{t('نعم، أوصي به بشدة', 'Yes, I recommend it')}</span>
              </button>

              <button
                type="button"
                onClick={() => setRecommended(false)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  !recommended
                    ? 'bg-[#20241F] text-white border-[#20241F] shadow-sm'
                    : 'bg-white text-[#20241F] border-[#20241F]/15 hover:bg-rose-50'
                }`}
              >
                <ThumbsDown size={15} />
                <span>{t('لا، لدي تحفظات', 'No, not recommended')}</span>
              </button>
            </div>
          </div>

          {/* 5. Author Name & Governorate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-[#20241F] mb-1.5">
                {t('اسم صاحب التقييم *', 'Your Name / Nickname *')}
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder={t('اسمك الكامل أو الأول', 'Your name')}
                className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-2xl py-2.5 px-3.5 text-xs font-semibold text-[#20241F] focus:outline-none focus:border-[#20241F] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#20241F] mb-1.5">
                {t('المحافظة', 'Governorate')}
              </label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-2xl py-2.5 px-3.5 text-xs font-semibold text-[#20241F] focus:outline-none focus:border-[#20241F] focus:bg-white"
              >
                {EGYPTIAN_GOVERNORATES.map((gov) => (
                  <option key={gov.id} value={gov.name_ar}>
                    {t(gov.name_ar, gov.name_en)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6. Order Number Reference (Optional or Verified) */}
          <div>
            <label className="block text-xs font-black text-[#20241F] mb-1">
              {t('رقم طلب الشراء (اختياري لتوثيق الشراء)', 'Order Number (Optional for Verified Badge)')}
            </label>
            <input
              type="text"
              value={orderNumberInput}
              onChange={(e) => setOrderNumberInput(e.target.value)}
              placeholder="VYR-XXXXX"
              className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-2xl py-2.5 px-3.5 text-xs font-mono font-bold text-[#20241F] focus:outline-none focus:border-[#20241F] focus:bg-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#20241F]/10">
            <button
              type="button"
              onClick={closeReviewModal}
              className="py-3 px-5 rounded-2xl border border-[#20241F]/20 text-[#20241F] text-xs font-bold hover:bg-[#F7F7F3] transition-colors"
            >
              {t('إلغاء', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-7 rounded-2xl bg-[#20241F] text-[#D5FF3F] hover:bg-black font-black text-xs flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? t('جارٍ النشر...', 'Publishing...') : t('نشر التقييم الآن', 'Submit & Publish Review')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
