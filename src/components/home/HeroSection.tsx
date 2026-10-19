import React from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Truck, RotateCcw, Award, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { HeroVisual2D } from './HeroVisual2D';

export const HeroSection: React.FC = () => {
  const { t, dir } = useLanguage();
  const { setCurrentPage, navigateToCategory } = useStore();

  return (
    <section className="relative overflow-hidden pt-6 pb-12 lg:pt-10 lg:pb-16 bg-[#F7F7F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Editorial Content (Text Column) */}
          <div className="lg:col-span-5 text-right flex flex-col justify-center">
            {/* Pill/Tag Kicker */}
            <div className="inline-flex items-center gap-2 self-start mb-4 text-xs font-mono font-bold tracking-wider uppercase text-[#20241F] bg-[#D5FF3F] px-3 py-1 rounded-md shadow-sm">
              <Sparkles size={13} />
              <span>{t('تشكيلة استثنائية 2026', 'EDITORIAL COLLECTION 2026')}</span>
            </div>

            {/* Oversized Cinematic Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#20241F] tracking-tight leading-[1.1] mb-6">
              {t('اختياراتك.', 'DISCOVER')}
              <br />
              <span className="text-[#20241F]/90">
                {t('بطريقتك.', 'YOUR NEXT.')}
              </span>
            </h1>

            {/* Subtitle / Editorial description */}
            <p className="text-sm sm:text-base text-[#20241F]/70 leading-relaxed mb-8 max-w-lg">
              {t(
                'من التفاصيل نوصل لأناقتك المفضلة. اكتشف خامات ومنتجات بمستوى استثنائي، واختيارات تلائمك بدقة من أرقى بيوت التصميم والحرفيين في مصر.',
                'Curated for your distinct aesthetic. Experience extraordinary craftsmanship, refined natural textiles, and sculptural everyday essentials.'
              )}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 mb-10">
              <button
                onClick={() => setCurrentPage('catalog')}
                className="py-3.5 px-7 rounded-xl bg-[#20241F] text-white hover:bg-black font-bold text-sm flex items-center gap-2 transition-all shadow-md group"
              >
                <span>{t('ابدأ التسوق', 'Explore Collection')}</span>
                <ArrowLeft
                  size={16}
                  className={`group-hover:-translate-x-1 transition-transform ${
                    dir === 'ltr' ? 'rotate-180 group-hover:translate-x-1' : ''
                  }`}
                />
              </button>

              <button
                onClick={() => navigateToCategory('accessories')}
                className="py-3.5 px-6 rounded-xl bg-white border border-[#20241F]/15 hover:border-[#20241F] text-[#20241F] font-bold text-sm transition-all shadow-sm"
              >
                {t('اكتشف مجموعة VAYRO', 'Discover VAYRO')}
              </button>
            </div>

            {/* Micro-trust indicators under hero */}
            <div className="pt-6 border-t border-[#20241F]/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#20241F]/70">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-[#18794E] shrink-0" />
                <span className="font-semibold text-[11px] leading-tight">
                  {t('توصيل سريع لكافة المحافظات', 'Fast Egypt Delivery')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#18794E] shrink-0" />
                <span className="font-semibold text-[11px] leading-tight">
                  {t('دفع آمن بالبطاقة أو عند الاستلام', 'Secure Pay or COD')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <RotateCcw size={16} className="text-[#18794E] shrink-0" />
                <span className="font-semibold text-[11px] leading-tight">
                  {t('إرجاع مجاني خلال 14 يوم', '14-Day Free Returns')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Award size={16} className="text-[#18794E] shrink-0" />
                <span className="font-semibold text-[11px] leading-tight">
                  {t('منتجات أصلية 100%', '100% Authentic')}
                </span>
              </div>
            </div>
          </div>

          {/* 2D Luxury Editorial Visual Column */}
          <div className="lg:col-span-7">
            <HeroVisual2D />
          </div>

        </div>
      </div>
    </section>
  );
};
