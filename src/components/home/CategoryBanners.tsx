import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { CATEGORIES } from '../../data/products';

export const CategoryBanners: React.FC = () => {
  const { t, dir } = useLanguage();
  const { navigateToCategory } = useStore();

  return (
    <section className="py-12 sm:py-16 bg-[#F5F2E9] border-t border-[#111310]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10 text-right">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#AAB5A0] font-bold block mb-1">
              {t('تصفح حسب الاهتمام', 'CURATED DEPARTMENTS')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111310] tracking-tight">
              {t('كل يوم، اكتشاف جديد', 'Every Day, a Fresh Discovery')}
            </h2>
          </div>

          <button
            onClick={() => navigateToCategory(null)}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#111310] hover:text-[#586249] transition-colors pb-1 border-b border-[#111310]"
          >
            <span>{t('تصفح جميع الأقسام', 'Explore all categories')}</span>
            <ArrowUpRight size={14} className={dir === 'rtl' ? 'rotate-90' : ''} />
          </button>
        </div>

        {/* 5-Column Distinctive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigateToCategory(cat.slug)}
              className="group relative cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden border border-[#111310]/10 hover:shadow-xl transition-all duration-300"
            >
              {/* Aspect Ratio Box with Photo */}
              <div className="relative aspect-square w-full overflow-hidden bg-[#EAE6DC]">
                <img
                  src={cat.image}
                  alt={cat.name_ar}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                
                {/* Arrow indicator */}
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-[#111310] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                  <ArrowUpRight size={13} className={dir === 'rtl' ? 'rotate-90' : ''} />
                </div>
              </div>

              {/* Title & Item count */}
              <div className="p-3.5 text-right flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#111310] group-hover:text-black">
                    {t(cat.name_ar, cat.name_en)}
                  </h3>
                  <p className="text-[11px] text-[#111310]/50 mt-0.5 line-clamp-1">
                    {t(cat.tagline_ar, cat.tagline_en)}
                  </p>
                </div>
                <span className="text-[11px] font-mono font-semibold text-[#AAB5A0] shrink-0">
                  {cat.itemCount}+
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
