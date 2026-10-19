import React from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';

export const EditorialStorySection: React.FC = () => {
  const { t, dir } = useLanguage();
  const { setCurrentPage, navigateToCategory } = useStore();

  return (
    <section className="py-14 sm:py-20 bg-[#111310] text-[#F5F2E9] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 text-right">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#D5FF3F] font-bold block mb-1">
              {t('رؤية VAYRO', 'OUR PERSPECTIVE')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {t('ذوق مصري، منظور جديد.', 'Egyptian Taste, Fresh Perspective.')}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#F5F2E9]/60 max-w-md mt-2 sm:mt-0 leading-relaxed">
            {t(
              'نجمع بين التراث المعماري والحرفي العريق في مصر وبين أحدث معايير الموضة والتصميم المعاصر.',
              'Bridging rich architectural craft traditions with modernist silhouettes and enduring materials.'
            )}
          </p>
        </div>

        {/* Split Editorial Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Card 1: Story, Vase Art & Chartreuse Action (5 Cols) */}
          <div className="lg:col-span-5 bg-[#292C27] rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-white/5 relative overflow-hidden">
            <div className="z-10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D5FF3F] font-bold">
                {t('صناعة محلية فاخرة', 'LOCAL EXCELLENCE')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-2 leading-snug">
                {t('تفاصيل من هنا، لحياة تشبهك.', 'Details from here, made for your pace.')}
              </h3>
              <p className="text-xs sm:text-sm text-[#F5F2E9]/75 mt-3 leading-relaxed">
                {t(
                  'خامات وأقمشة منتقاة بعناية لتعكس روح الابتكار والجمال وتواكب تطلعاتك اليومية، بأيدي صانعين مصريين يفخرون بكل غرزة وقطعة.',
                  'Textiles and ceramics hand-selected to reflect authentic spirit, comfort, and distinction across every stitch.'
                )}
              </p>

              <div className="mt-6">
                <button
                  onClick={() => navigateToCategory('home')}
                  className="py-3 px-6 rounded-xl bg-[#D5FF3F] text-[#111310] font-bold text-xs hover:brightness-105 transition-all inline-flex items-center gap-2 shadow-lg"
                >
                  <span>{t('تسوق الدفعة الآن', 'Shop the Drop')}</span>
                  <ArrowLeft size={14} className={dir === 'ltr' ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>

            {/* Inset Product Imagery */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4 z-10">
              <img
                src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80"
                alt="Fayoum Ceramics"
                className="w-20 h-20 rounded-2xl object-cover bg-black/40 border border-white/10 shadow-md"
              />
              <div className="text-right">
                <p className="text-xs font-bold text-white">
                  {t('فخار وأشغال يدوية من تونس، الفيوم', 'Tunis Village Pottery, Fayoum')}
                </p>
                <p className="text-[11px] text-[#AAB5A0] mt-0.5">
                  {t('طمي أسواني طبيعي محروق على 1000°', 'Natural earthen stoneware baked at 1000°C')}
                </p>
              </div>
            </div>

            {/* Background geometric blur */}
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#D5FF3F]/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Card 2: Full-Bleed Editorial Visual Banner (7 Cols) */}
          <div className="lg:col-span-7 relative min-h-[380px] sm:min-h-[440px] rounded-3xl overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80"
              alt="Egyptian Editorial Fashion"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

            {/* Campaign Tag Badge */}
            <div className="absolute top-6 right-6">
              <span className="px-3 py-1 rounded-md bg-[#D5FF3F] text-[#111310] text-xs font-mono font-bold tracking-wider uppercase shadow-md">
                {t('تشكيلة الموسم الجديد 2026', 'SEASON COLLECTION 2026')}
              </span>
            </div>

            {/* Bottom Inset Content */}
            <div className="absolute bottom-6 right-6 left-6 text-right flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {t('أزياء تحاكي رقي المكان وهدوء الطبيعة', 'Attire reflecting architectural serenity')}
                </h3>
                <p className="text-xs text-white/70 mt-1 max-w-md">
                  {t('تصاميم متزنة بألوان مستوحاة من رمال الصحراء وأحجار مصر العتيقة.', 'Balanced silhouettes inspired by desert sands and timeless masonry.')}
                </p>
              </div>

              <button
                onClick={() => navigateToCategory('women')}
                className="py-2.5 px-5 rounded-xl bg-white/95 backdrop-blur-md text-[#111310] hover:bg-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
              >
                {t('استكشف الكتالوج', 'View Lookbook')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
