import React, { useState, useMemo } from 'react';
import { Star, ShieldCheck, ThumbsUp, MessageSquarePlus, Filter, CheckCircle, Package } from 'lucide-react';
import { Product, ProductReview } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';

interface ProductReviewsSectionProps {
  product: Product;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ product }) => {
  const { getProductReviews, voteReviewHelpful, openReviewModal, checkUserPurchased } = useStore();
  const { t, language } = useLanguage();

  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'all'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'rating-high' | 'helpful'>('newest');

  const productReviews = useMemo(() => {
    return getProductReviews(product.id);
  }, [getProductReviews, product.id]);

  const purchaseStatus = useMemo(() => {
    return checkUserPurchased(product.id);
  }, [checkUserPurchased, product.id]);

  // Aggregate stats
  const totalReviewsCount = productReviews.length;
  const averageRating = totalReviewsCount > 0
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)
    : product.rating.toFixed(1);

  const recommendedCount = productReviews.filter((r) => r.recommended).length;
  const recommendedPercentage = totalReviewsCount > 0
    ? Math.round((recommendedCount / totalReviewsCount) * 100)
    : 95;

  const starCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    productReviews.forEach((r) => {
      counts[r.rating] = (counts[r.rating] || 0) + 1;
    });
    return counts;
  }, [productReviews]);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let list = [...productReviews];

    if (selectedRatingFilter !== 'all') {
      list = list.filter((r) => r.rating === selectedRatingFilter);
    }

    if (verifiedOnly) {
      list = list.filter((r) => r.isVerifiedPurchase);
    }

    switch (sortBy) {
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating-high':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'helpful':
        list.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        break;
    }

    return list;
  }, [productReviews, selectedRatingFilter, verifiedOnly, sortBy]);

  const handleOpenReview = () => {
    openReviewModal(product, purchaseStatus.orderNumber);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <section id="reviews-section" className="mt-16 pt-12 border-t border-[#20241F]/10 text-right">
      {/* Header and Call to Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#586249] font-black block mb-1">
            {t('تجارب وآراء العملاء', 'CUSTOMER REVIEWS & FEEDBACK')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#20241F]">
            {t('تقييمات المشترين للمنتج', 'Ratings & Verified Feedback')}
          </h2>
        </div>

        <button
          onClick={handleOpenReview}
          className="py-3 px-6 rounded-2xl bg-[#20241F] text-[#D5FF3F] hover:bg-black font-black text-xs flex items-center gap-2 transition-all shadow-md group shrink-0"
        >
          <MessageSquarePlus size={16} className="text-[#D5FF3F] group-hover:scale-110 transition-transform" />
          <span>{t('أضف تقييمك للمنتج', 'Write a Review')}</span>
        </button>
      </div>

      {/* Verified Buyer Banner (If user purchased this product) */}
      {purchaseStatus.purchased && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Package size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-950 flex items-center gap-2">
                <span>{t('لقد قمت بشراء هذا المنتج سابقاً!', 'You purchased this product!')}</span>
                {purchaseStatus.orderNumber && (
                  <span className="font-mono text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-full text-emerald-900 font-bold">
                    #{purchaseStatus.orderNumber}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                {t(
                  'رأيك الصادق يساعد عملاء VAYRO الآخرين على اتخاذ القرار السليم حول المقاس والخامات.',
                  'Your verified review helps the community make informed sizing and quality choices.'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenReview}
            className="py-2.5 px-4 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 font-bold text-xs transition-colors shrink-0 shadow-sm"
          >
            {t('تقييم هذا المنتج الآن', 'Review Now')}
          </button>
        </div>
      )}

      {/* Aggregate Stats Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20241F]/10 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Score & Stars */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-l border-[#20241F]/10">
          <div className="text-5xl font-black text-[#20241F] tracking-tight font-mono">
            {averageRating}
          </div>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                className={
                  star <= Math.round(Number(averageRating))
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-[#20241F]/20'
                }
              />
            ))}
          </div>
          <p className="text-xs text-[#20241F]/60 font-semibold">
            {t(`بناءً على ${totalReviewsCount} تقييم موثق`, `Based on ${totalReviewsCount} verified reviews`)}
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D5FF3F]/40 border border-[#20241F]/10 text-[#20241F] text-[11px] font-bold">
            <ThumbsUp size={13} className="text-[#18794E]" />
            <span>{recommendedPercentage}% {t('يوصون بهذا المنتج', 'recommend this item')}</span>
          </div>
        </div>

        {/* Star Rating Breakdown Bars */}
        <div className="md:col-span-5 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = starCounts[stars] || 0;
            const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
            const isSelected = selectedRatingFilter === stars;

            return (
              <button
                key={stars}
                type="button"
                onClick={() => setSelectedRatingFilter(isSelected ? 'all' : stars)}
                className={`w-full flex items-center gap-3 text-xs font-bold transition-all p-1.5 rounded-xl hover:bg-[#F7F7F3] ${
                  isSelected ? 'ring-2 ring-[#20241F] bg-[#F7F7F3]' : ''
                }`}
              >
                <div className="flex items-center gap-1 w-14 shrink-0 text-[#20241F]">
                  <span>{stars}</span>
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                </div>

                <div className="flex-1 h-2.5 bg-[#F7F7F3] rounded-full overflow-hidden border border-[#20241F]/10">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="w-12 text-left font-mono text-[11px] text-[#20241F]/60 shrink-0">
                  {pct}%
                </span>
                <span className="w-8 text-[11px] text-[#20241F]/40 font-normal shrink-0">
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Community Trust Pitch */}
        <div className="md:col-span-3 p-4 rounded-2xl bg-[#F7F7F3] border border-[#20241F]/10 text-xs space-y-2.5 text-[#20241F]/80">
          <div className="flex items-center gap-2 text-[#18794E] font-black">
            <ShieldCheck size={18} />
            <span>{t('ضمان الشفافية والموثوقية', 'Verified Buyer Policy')}</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {t(
              'كل التقييمات صادرة من عملاء حقيقيين استلموا القطعة بالفعل عبر شحن VAYRO لكافة المحافظات.',
              'Reviews are gathered from genuine customers who ordered and received the product.'
            )}
          </p>
          <div className="pt-1 border-t border-[#20241F]/10 flex items-center gap-1 text-[11px] font-bold text-[#20241F]">
            <CheckCircle size={14} className="text-[#18794E]" />
            <span>{t('لا يتم حذف التقييمات السلبية أو تعديلها', 'Unedited authentic experiences')}</span>
          </div>
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-white border border-[#20241F]/10 text-xs">
        {/* Rating filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-[#20241F] flex items-center gap-1 ml-2">
            <Filter size={14} />
            <span>{t('تصفية حسب:', 'Filter:')}</span>
          </span>

          <button
            onClick={() => setSelectedRatingFilter('all')}
            className={`py-1.5 px-3 rounded-xl font-bold transition-all ${
              selectedRatingFilter === 'all'
                ? 'bg-[#20241F] text-[#D5FF3F]'
                : 'bg-[#F7F7F3] text-[#20241F] hover:bg-[#20241F]/10'
            }`}
          >
            {t('كل التقييمات', 'All')} ({totalReviewsCount})
          </button>

          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => setSelectedRatingFilter(star)}
              className={`py-1.5 px-3 rounded-xl font-bold flex items-center gap-1 transition-all ${
                selectedRatingFilter === star
                  ? 'bg-[#20241F] text-[#D5FF3F]'
                  : 'bg-[#F7F7F3] text-[#20241F] hover:bg-[#20241F]/10'
              }`}
            >
              <span>{star}</span>
              <Star size={11} className={selectedRatingFilter === star ? 'fill-[#D5FF3F]' : 'fill-amber-400 text-amber-400'} />
              <span>({starCounts[star] || 0})</span>
            </button>
          ))}
        </div>

        {/* Secondary options: Verified only & Sort */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#20241F]">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="w-4 h-4 rounded border-[#20241F]/20 text-[#20241F] focus:ring-0"
            />
            <span>{t('المشترون الموثقون فقط', 'Verified only')}</span>
          </label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-1.5 px-3 text-xs font-bold text-[#20241F] focus:outline-none"
          >
            <option value="newest">{t('الأحدث أولاً', 'Most Recent')}</option>
            <option value="rating-high">{t('الأعلى تقييماً', 'Highest Rating')}</option>
            <option value="helpful">{t('الأكثر إفادة', 'Most Helpful')}</option>
          </select>
        </div>
      </div>

      {/* Reviews Cards List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#20241F]/10 text-center">
          <Star size={36} className="mx-auto text-amber-300 stroke-[1.5] mb-3" />
          <h3 className="text-base font-black text-[#20241F]">
            {t('لا توجد تقييمات مطابقة لهذا الفلتر', 'No reviews matching this filter')}
          </h3>
          <p className="text-xs text-[#20241F]/60 mt-1 max-w-sm mx-auto">
            {t('جرّب إعادة ضبط خيارات التصفية أو شارك أول تقييم لهذا المنتج.', 'Try resetting your filters or be the first to leave feedback.')}
          </p>
          <button
            onClick={() => {
              setSelectedRatingFilter('all');
              setVerifiedOnly(false);
            }}
            className="mt-4 py-2 px-4 rounded-xl border border-[#20241F]/20 text-xs font-bold text-[#20241F] hover:bg-[#F7F7F3]"
          >
            {t('عرض كل التقييمات', 'Reset Filters')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-[#20241F]/10 shadow-sm transition-all hover:border-[#20241F]/25"
            >
              {/* Card Top: Author, Verified badge, Date, Stars */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#20241F]/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#20241F] text-[#D5FF3F] font-black text-sm flex items-center justify-center shrink-0">
                    {review.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-[#20241F]">
                        {review.authorName}
                      </span>
                      {review.authorGovernorate && (
                        <span className="text-[11px] text-[#20241F]/50">
                          • {review.authorGovernorate}
                        </span>
                      )}
                    </div>
                    {review.isVerifiedPurchase && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-0.5">
                        <ShieldCheck size={13} />
                        <span>{t('شراء موثق', 'Verified Purchase')}</span>
                        {review.orderNumber && (
                          <span className="font-mono text-[#20241F]/40 font-normal">
                            (#{review.orderNumber})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star <= review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-[#20241F]/20'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#20241F]/40 font-mono">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>

              {/* Review Headline & Body */}
              <div className="py-4">
                <h4 className="text-sm font-black text-[#20241F] mb-2">
                  {review.title}
                </h4>
                <p className="text-xs text-[#20241F]/80 leading-relaxed whitespace-pre-line">
                  {review.comment}
                </p>
              </div>

              {/* Recommendation pill & Helpful vote */}
              <div className="pt-3 border-t border-[#20241F]/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  {review.recommended ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                      <ThumbsUp size={12} className="text-emerald-600" />
                      <span>{t('يوصي بهذا المنتج', 'Recommends this item')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-bold">
                      <span>{t('لديه بعض الملاحظات', 'Has reservations')}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#20241F]/50">
                    {t('هل كان هذا التقييم مفيداً؟', 'Was this helpful?')}
                  </span>
                  <button
                    onClick={() => voteReviewHelpful(review.id)}
                    className="py-1 px-3 rounded-xl border border-[#20241F]/15 hover:border-[#20241F] hover:bg-[#F7F7F3] text-[#20241F] text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <ThumbsUp size={12} />
                    <span>{t('مفيد', 'Helpful')}</span>
                    {review.helpfulCount > 0 && (
                      <span className="font-mono text-[#586249]">({review.helpfulCount})</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
