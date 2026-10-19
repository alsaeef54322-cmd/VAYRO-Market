import React from 'react';
import { ArrowLeft, ArrowRight, Tag, Copy, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';

export const PromoBanner: React.FC = () => {
  const { t, dir } = useLanguage();
  const { setCurrentPage, setAppliedCoupon, showToast } = useStore();
  const [copied, setCopied] = React.useState(false);

  const applyPromo = () => {
    setAppliedCoupon({ code: 'VAYRO10', discountPercentage: 10 });
    setCopied(true);
    showToast(t('تم تفعيل كود VAYRO10 وتطبيق خصم 10% على سلتك!', 'Code VAYRO10 applied with 10% discount to your bag!'));
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section className="py-8 sm:py-12 bg-[#F5F2E9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#D5FF3F] p-8 sm:p-12 text-[#111310] shadow-xl border border-[#111310]/10 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Big 10% typography block */}
          <div className="flex items-center gap-6">
            <div className="text-6xl sm:text-7xl lg:text-8xl font-display font-black tracking-tighter leading-none select-none">
              10%
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono uppercase tracking-widest font-black bg-[#111310] text-[#D5FF3F] px-2.5 py-0.5 rounded">
                {t('عرض الترحيب', 'WELCOME OFFER')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black mt-1 leading-tight">
                {t('أول اختيار، بداية أحلى.', 'Your first step, elevated.')}
              </h3>
              <p className="text-xs sm:text-sm text-[#111310]/80 mt-1 max-w-md">
                {t(
                  'استخدم الكوبون: VAYRO10 عند إتمام أول طلب لتستمتع بخصم فوري 10% على إجمالي مشترياتك.',
                  'Apply promo code VAYRO10 during checkout to enjoy an instant 10% saving on your debut order.'
                )}
              </p>
            </div>
          </div>

          {/* Action & Coupon Copy */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={applyPromo}
              className="py-3 px-4 rounded-xl bg-white/80 hover:bg-white text-xs font-mono font-bold flex items-center gap-2 border border-[#111310]/15 transition-all shadow-sm"
              title={t('نسخ وتفعيل الكوبون', 'Copy and activate')}
            >
              <Tag size={14} />
              <span>VAYRO10</span>
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>

            <button
              onClick={() => {
                applyPromo();
                setCurrentPage('catalog');
              }}
              className="py-3.5 px-7 rounded-xl bg-[#111310] text-white hover:bg-black font-bold text-xs flex items-center gap-2 transition-all shadow-lg group"
            >
              <span>{t('تسوق الآن', 'Shop Now')}</span>
              <ArrowLeft size={14} className={dir === 'ltr' ? 'rotate-180' : ''} />
            </button>
          </div>

          {/* Decorative geometric background shape */}
          <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full border-8 border-[#111310]/5 pointer-events-none" />
        </div>
      </div>
    </section>
  );
};
