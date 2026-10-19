import React from 'react';
import { PackageCheck, Sparkles, MessageSquare, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';

export const TrustHighlights: React.FC = () => {
  const { t, dir } = useLanguage();
  const { setCurrentPage } = useStore();

  return (
    <section className="py-14 sm:py-20 bg-[#F5F2E9] border-t border-[#111310]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Title */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#AAB5A0] font-bold block mb-1">
            {t('التزام VAYRO', 'OUR PROMISE')}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111310] tracking-tight">
            {t('تسوق براحتك، التفاصيل واضحة.', 'Shop with Clarity & Confidence.')}
          </h2>
          <p className="text-xs text-[#111310]/60 mt-2">
            {t(
              'لا مفاجآت، لا مصاريف خفية، وتجربة تسوق شفافة من أول نظرة وحتى استلام الطلب.',
              'Transparent pricing, verified Egyptian inventory, and attentive care from browsing to unboxing.'
            )}
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white p-8 rounded-3xl border border-[#111310]/10 hover:border-[#111310] transition-colors text-right flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F5F2E9] text-[#111310] flex items-center justify-center mb-6">
                <PackageCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#111310]">
                {t('من المستودع لبابك', 'Warehouse to Door')}
              </h3>
              <p className="text-xs text-[#111310]/70 mt-2.5 leading-relaxed">
                {t(
                  'توصيل سريع وموثوق لكافة محافظات مصر من الإسكندرية لأسوان مع تتبع حي لخط سير الشحنة واستلام مريح.',
                  'Direct insured delivery across all 27 Egyptian governorates with live SMS tracking and flexible delivery scheduling.'
                )}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#111310]/5 text-[11px] font-bold text-[#586249]">
              {t('شحن قياسي وسريع متاح', 'Standard & Express fulfillment')}
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-8 rounded-3xl border border-[#111310]/10 hover:border-[#111310] transition-colors text-right flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#D5FF3F] text-[#111310] flex items-center justify-center mb-6">
                <Sparkles size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#111310]">
                {t('اختيارات من درك فائق', 'Uncompromising Quality')}
              </h3>
              <p className="text-xs text-[#111310]/70 mt-2.5 leading-relaxed">
                {t(
                  'نفحص جودة الخامات وتشطيب كل قطعة بدقة متناهية، من القطن المصري فائق النعومة إلى الجلود الطبيعية والفخار.',
                  'Every item is inspected by our quality control atelier. Zero imitation, pure craftsmanship and durable materials.'
                )}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#111310]/5 text-[11px] font-bold text-[#586249]">
              {t('ضمان أصالة واسترجاع 14 يوم', '14-Day easy exchange guarantee')}
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-8 rounded-3xl border border-[#111310]/10 hover:border-[#111310] transition-colors text-right flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F5F2E9] text-[#111310] flex items-center justify-center mb-6">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#111310]">
                {t('ناس حقيقية، جاهزة لمساعدتك', 'Human-Centric Support')}
              </h3>
              <p className="text-xs text-[#111310]/70 mt-2.5 leading-relaxed">
                {t(
                  'فريق خدمة عملاء متاح يوميًا عبر الهاتف والواتساب لمساعدتك في اختيار المقاسات، تتبع طلبك، أو استبدال أي قطعة.',
                  'Real customer care specialists on WhatsApp and phone ready to assist with sizing, bespoke styling, and tracking.'
                )}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#111310]/5">
              <button
                onClick={() => setCurrentPage('account')}
                className="text-[11px] font-bold text-[#111310] hover:underline flex items-center gap-1"
              >
                <span>{t('تواصل مع خدمة العملاء', 'Contact concierge')}</span>
                <ArrowLeft size={12} className={dir === 'ltr' ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
