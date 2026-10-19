import React, { useState } from 'react';
import {
  Building2,
  Package,
  Layers,
  Truck,
  CheckCircle,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS, EGYPTIAN_GOVERNORATES } from '../../data/products';
import { api } from '../../services/api';

export const WholesalePage: React.FC = () => {
  const { t, dir } = useLanguage();
  const { setCurrentPage, showToast } = useStore();

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    businessType: 'retailer' as const,
    governorate: 'القاهرة',
    interestedCategories: ['men', 'home'],
    estimatedMonthlyBudget: '50,000 - 150,000 ج.م',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Products with supplier-configured wholesale pricing
  const wholesaleProducts = PRODUCTS.filter((p) => p.wholesaleAvailable);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      showToast(t('يرجى ملء بيانات الشركة ورقم الهاتف والبريد', 'Please fill all required business fields'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitWholesaleInquiry(formData);
      setSubmitted(true);
      showToast(t('تم إرسال طلب عروض الأسعار بنجاح! سيتم التواصل معكم عبر فريق المبيعات.', 'B2B quote request submitted successfully.'), 'success');
    } catch {
      showToast(t('تعذر إرسال الطلب، يرجى المحاولة لاحقًا', 'Failed to submit inquiry'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F7F7F3] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Editorial Wholesale Hero Header (2D Luxury Banner) */}
        <div className="bg-[#20241F] text-[#F7F7F3] rounded-3xl p-8 sm:p-14 mb-12 border border-white/5 relative overflow-hidden text-right">
          <div className="max-w-2xl relative z-10">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#D5FF3F] font-bold block mb-2">
              {t('حلول الأعمال والشركات', 'VAYRO B2B & ENTERPRISE')}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {t('توريد مباشر للشركات، البوتيكات والفنادق.', 'Direct Wholesale Sourcing for Modern Commercial Brands.')}
            </h1>
            <p className="text-xs sm:text-sm text-[#F7F7F3]/75 mt-3 leading-relaxed">
              {t(
                'استفد من أسعار المصنع الحقيقية والحدود الدنيا المرنة للكميات (MOQ). نربط أعمالك مباشرة مع نخبة ورش الجلود، مصانع النسيج القطني، واستوديوهات الفخار في مصر.',
                'Procure curated Egyptian merchandise at supplier-direct rates. Scalable volume fulfillment for boutiques, concept stores, hotels, and corporate gifting.'
              )}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#rfq-form"
                className="py-3 px-6 rounded-xl bg-[#D5FF3F] text-[#20241F] font-bold text-xs hover:brightness-105 transition-all inline-flex items-center gap-2 shadow-md"
              >
                <span>{t('طلب عرض أسعار مخصص (RFQ)', 'Request Volume Quote')}</span>
                <ArrowLeft size={14} className={dir === 'ltr' ? 'rotate-180' : ''} />
              </a>
              <button
                onClick={() => setCurrentPage('catalog')}
                className="py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/15"
              >
                {t('تصفح الكتالوج في المتجر', 'Browse Retail Catalog')}
              </button>
            </div>
          </div>

          {/* Clean decorative accent */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#18794E]/20 rounded-full blur-[80px] pointer-events-none" />
        </div>

        {/* 3 Pillars of B2B Wholesale */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 text-right">
          <div className="bg-white p-6 rounded-3xl border border-[#20241F]/10 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F7F3] text-[#20241F] flex items-center justify-center mb-4">
              <Layers size={22} />
            </div>
            <h3 className="text-base font-bold text-[#20241F]">
              {t('حدود كمية مرنة (MOQ)', 'Low Minimums (MOQs)')}
            </h3>
            <p className="text-xs text-[#20241F]/70 mt-2 leading-relaxed">
              {t(
                'تبدأ طلبات الجملة من 10 إلى 30 قطعة فقط لكل تصميم لمساعدة المشاريع الناشئة والبوتيكات على اختبار السوق بأمان.',
                'Starting from only 10-30 units per SKU to enable boutiques to test seasonal demand without excessive capital tie-up.'
              )}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#20241F]/10 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#D5FF3F] text-[#20241F] flex items-center justify-center mb-4">
              <Truck size={22} />
            </div>
            <h3 className="text-base font-bold text-[#20241F]">
              {t('شحن وتوزيع لكافة المحافظات والخليج', 'Egypt & GCC Logistics')}
            </h3>
            <p className="text-xs text-[#20241F]/70 mt-2 leading-relaxed">
              {t(
                'شبكة لوجستية متكاملة تضمن تسليم البضائع للمستودعات والمتاجر في كافة محافظات مصر، مع دعم الشحن الإقليمي للخليج العربي.',
                'Full logistics coordination with palletized freight across Cairo, Alexandria, and cross-border shipping across the GCC.'
              )}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#20241F]/10 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F7F3] text-[#20241F] flex items-center justify-center mb-4">
              <FileSpreadsheet size={22} />
            </div>
            <h3 className="text-base font-bold text-[#20241F]">
              {t('فواتير ضريبية وخصم كميات رسمي', 'Official Tax Invoices & Tiers')}
            </h3>
            <p className="text-xs text-[#20241F]/70 mt-2 leading-relaxed">
              {t(
                'فواتير إلكترونية معتمدة من مصلحة الضرائب المصرية وعقود توريد رسمية تضمن حقوق الشركاء والموردين.',
                'Full compliance with Egyptian ETA e-invoicing standards and formal supply contracts with commercial warranties.'
              )}
            </p>
          </div>
        </div>

        {/* Supplier Configured Wholesale Catalog Preview */}
        <div className="mb-16">
          <div className="text-right mb-6">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#18794E] font-bold block mb-1">
              {t('الكتالوج التجاري المعتمد', 'CONFIGURED WHOLESALE CATALOG')}
            </span>
            <h2 className="text-2xl font-black text-[#20241F]">
              {t('نماذج من أسعار التوريد والحد الأدنى للكميات', 'Configured Supplier Tiers & MOQ Rates')}
            </h2>
            <p className="text-xs text-[#20241F]/60 mt-1">
              {t('الأسعار محددة وفقًا لاتفاقيات التوريد الحقيقية مع ورش التصنيع المصرية.', 'Wholesale rates directly negotiated with Egyptian manufacturer collectives.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wholesaleProducts.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-[#20241F]/10 shadow-sm text-right flex flex-col justify-between">
                <div>
                  <img
                    src={p.images[0]}
                    alt=""
                    className="w-full aspect-[4/3] object-cover rounded-xl bg-[#F7F7F3] mb-3"
                  />
                  <span className="font-mono text-[10px] uppercase font-bold text-[#18794E]">{p.brand}</span>
                  <h4 className="font-bold text-xs text-[#20241F] line-clamp-1">{t(p.name_ar, p.name_en)}</h4>
                  <p className="text-[10px] text-[#20241F]/60">{t(p.subCategory_ar, p.subCategory_en)}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#20241F]/5 space-y-1 text-xs">
                  <div className="flex justify-between text-[#20241F]/60">
                    <span>{t('سعر التجزئة:', 'Retail:')}</span>
                    <span className="line-through">{p.price} ج.م</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#20241F]">
                    <span>{t('سعر الجملة (B2B):', 'Wholesale Rate:')}</span>
                    <span className="text-emerald-800 font-mono font-black">{p.wholesalePrice} ج.م</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#18794E]">
                    <span>{t('أدنى كمية للطلب (MOQ):', 'Min Order:')}</span>
                    <span className="font-bold font-mono">{p.wholesaleMinQty} {t('قطعة', 'units')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Request-A-Quote Form Section */}
        <div id="rfq-form" className="bg-white rounded-3xl p-8 sm:p-12 border border-[#20241F]/10 shadow-sm text-right">
          <div className="max-w-xl mb-8">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#18794E] font-bold block mb-1">
              {t('طلب تسعير مخصص', 'REQUEST FOR QUOTE')}
            </span>
            <h3 className="text-2xl font-black text-[#20241F]">
              {t('سجل بيانات منشأتك لاستلام كتالوج B2B الشامل', 'Register Your Business for Custom Volume Quotes')}
            </h3>
            <p className="text-xs text-[#20241F]/60 mt-1">
              {t('سيقوم مدير حسابات الشركات بالتواصل معك خلال 24 ساعة بعرض أسعار مفصل ونماذج عينات.', 'Our B2B account director will reply within 24 hours with fabric swatches and tailored price sheets.')}
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center max-w-lg mx-auto">
              <CheckCircle size={44} className="mx-auto text-emerald-600 mb-3" />
              <h4 className="text-lg font-bold text-emerald-950">{t('تم استلام طلبكم بنجاح!', 'Application Received!')}</h4>
              <p className="text-xs text-emerald-800 mt-2 leading-relaxed">
                {t(
                  `شكرًا لتواصلك معنا. تم تحويل بيانات شركة "${formData.companyName}" إلى قسم مبيعات الجملة وسيتم الاتصال على رقم ${formData.phone}.`,
                  `Thank you. Details for ${formData.companyName} have been assigned to our wholesale account manager.`
                )}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 py-2.5 px-6 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800"
              >
                {t('تقديم طلب تسعير لشركة أخرى', 'Submit another inquiry')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-[#20241F] block mb-1.5">{t('اسم الشركة أو المتجر *', 'Company or Store Name *')}</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder={t('مثال: شركة النيل للتجزئة', 'e.g. Nile Retail Co.')}
                  className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2.5 px-3.5 text-xs text-[#20241F] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#20241F] block mb-1.5">{t('اسم المسؤول أو المشتريات *', 'Contact Person *')}</label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder={t('الاسم بالكامل', 'Full Name')}
                  className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2.5 px-3.5 text-xs text-[#20241F] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#20241F] block mb-1.5">{t('البريد الإلكتروني للعمل *', 'Business Email *')}</label>
                <input
                  type="email"
                  dir="ltr"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="procurement@company.com"
                  className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2.5 px-3.5 text-xs text-[#20241F] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#20241F] block mb-1.5">{t('رقم الهاتف والواتساب *', 'Phone / WhatsApp *')}</label>
                <input
                  type="tel"
                  dir="ltr"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="010xxxxxxxxx"
                  className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2.5 px-3.5 text-xs text-[#20241F] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#20241F] block mb-1.5">{t('نوع النشاط التجاري', 'Business Type')}</label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value as any })}
                  className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2.5 px-3 text-xs"
                >
                  <option value="boutique">{t('بوتيك أو متجر ملابس مستقل', 'Independent Fashion Boutique')}</option>
                  <option value="retailer">{t('سلسلة متاجر تجزئة', 'Retail Chain')}</option>
                  <option value="hotel">{t('فندق أو منتجع سياحي (ضيافة وديكور)', 'Hotel & Hospitality')}</option>
                  <option value="distributor">{t('موزع تجاري للمحافظات أو الخليج', 'Regional Distributor')}</option>
                  <option value="corporate">{t('هدايا شركات وفعاليات خاصة', 'Corporate Gifting')}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#20241F] block mb-1.5">{t('المحافظة الرئيسية', 'Primary Governorate')}</label>
                <select
                  value={formData.governorate}
                  onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                  className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2.5 px-3 text-xs"
                >
                  {EGYPTIAN_GOVERNORATES.map((gov) => (
                    <option key={gov.id} value={gov.name_ar}>
                      {t(gov.name_ar, gov.name_en)}
                    </option>
                  ))}
                  <option value="gcc">{t('خارج مصر - دول مجلس التعاون الخليجي', 'GCC Countries')}</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[#20241F] block mb-1.5">{t('ملاحظات إضافية أو تفاصيل الكميات المطلوبة', 'Specific Quantities / Requirements')}</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('اكتب أية استفسارات بخصوص الألوان، المقاسات، أو وضع شعار شركتكم الخاص...', 'Mention quantities, custom branding/tagging, or desired timeline...')}
                  className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl p-3 text-xs"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-3.5 px-8 rounded-xl bg-[#20241F] text-[#D5FF3F] font-bold text-xs hover:bg-black transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <span>{isSubmitting ? t('جاري الإرسال...', 'Submitting...') : t('إرسال طلب التسعير المباشر', 'Submit Wholesale Request')}</span>
                  <ArrowLeft size={14} className={dir === 'ltr' ? 'rotate-180' : ''} />
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
