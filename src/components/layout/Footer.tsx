import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, ShieldCheck, Truck, RefreshCw, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const { setCurrentPage, navigateToCategory, showToast, isStaffAuthenticated } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setIsSubscribed(true);
      showToast(t('شكرًا لاشتراكك في نشرة VAYRO الحصرية!', 'Thank you for subscribing to VAYRO journal!'));
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#111310] text-[#F5F2E9] pt-16 pb-12 border-t border-[#292C27]">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16 pb-12 border-b border-[#292C27]">
        <div className="bg-[#292C27]/50 rounded-3xl p-8 md:p-12 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-right">
            <span className="text-[11px] font-mono tracking-widest text-[#D5FF3F] uppercase font-bold">
              {t('مجتمع VAYRO الحصري', 'THE VAYRO JOURNAL')}
            </span>
            <h3 className="text-2xl md:text-3xl font-display font-black text-white mt-1">
              {t('خليك أول واحد يكتشف.', 'Stay ahead of the next release.')}
            </h3>
            <p className="text-xs md:text-sm text-[#F5F2E9]/70 mt-2 leading-relaxed">
              {t(
                'اشترك ليصلك إشعار بالقطع الحصرية، إطلاقات المجموعات المحدودة، وعروض التخفيضات قبل الجميع.',
                'Receive private invitations to seasonal drops, designer collaborations, and exclusive preview events.'
              )}
            </p>
          </div>

          <div className="w-full md:w-auto">
            {isSubscribed ? (
              <div className="flex items-center gap-2 text-[#D5FF3F] font-bold text-sm bg-[#111310] px-5 py-3 rounded-2xl border border-[#D5FF3F]/30">
                <CheckCircle size={18} />
                <span>{t('تم تسجيل بريدك بنجاح. أهلاً بك في VAYRO!', 'Subscribed successfully. Welcome to VAYRO!')}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 w-full md:min-w-[380px]">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder={t('أدخل بريدك الإلكتروني...', 'Enter your email address...')}
                    className="w-full bg-[#111310] text-white text-xs py-3 px-4 rounded-xl border border-white/10 focus:outline-none focus:border-[#D5FF3F] placeholder:text-white/30"
                  />
                </div>
                <button
                  type="submit"
                  className="py-3 px-6 bg-[#D5FF3F] text-[#111310] font-bold text-xs rounded-xl hover:brightness-105 transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>{t('انضمام', 'Subscribe')}</span>
                  <Send size={13} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        {/* Brand Summary */}
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-display font-black text-3xl tracking-tight text-white">
              VAYRO
            </span>
            <span className="w-2.5 h-2.5 bg-[#D5FF3F] rounded-[2px]" />
            <span className="text-[10px] tracking-widest font-mono text-[#D5FF3F] border border-[#D5FF3F]/40 px-1.5 py-0.5 rounded">
              EGYPT
            </span>
          </div>

          <p className="text-xs text-[#F5F2E9]/70 leading-relaxed max-w-sm">
            {t(
              'سوق تجاري مصري بمعايير عالمية يجمع أحدث صيحات الموضة، المنتجات الجلدية، الفخار اليدوي والقطع الديكورية المصنوعة بأيدي أمهر الحرفيين.',
              'A premier Egyptian marketplace bridging contemporary aesthetics, fine leather craftsmanship, artisanal ceramics, and modern living.'
            )}
          </p>

          <div className="mt-6 flex flex-col gap-2 text-xs text-[#F5F2E9]/80">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#D5FF3F]" />
              <span>{t('القاهرة، التجمع الخامس - مصر', 'New Cairo, Egypt')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[#D5FF3F]" />
              <span dir="ltr">+20 (02) 19820 / +20 10 1234 5678</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-[#D5FF3F]" />
              <span>care@vayromarket.com</span>
            </div>
          </div>
        </div>

        {/* Discovery Links */}
        <div>
          <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-[#D5FF3F] mb-4">
            {t('اكتشف الأقسام', 'EXPLORE')}
          </h4>
          <ul className="space-y-2.5 text-xs text-[#F5F2E9]/70">
            <li>
              <button onClick={() => navigateToCategory('women')} className="hover:text-white transition-colors">
                {t('أزياء نسائية', "Women's Collection")}
              </button>
            </li>
            <li>
              <button onClick={() => navigateToCategory('men')} className="hover:text-white transition-colors">
                {t('أزياء رجالية', "Men's Collection")}
              </button>
            </li>
            <li>
              <button onClick={() => navigateToCategory('accessories')} className="hover:text-white transition-colors">
                {t('حقائب وإكسسوارات', 'Leather & Bags')}
              </button>
            </li>
            <li>
              <button onClick={() => navigateToCategory('home')} className="hover:text-white transition-colors">
                {t('البيت والمعيشة', 'Home Ceramics')}
              </button>
            </li>
            <li>
              <button onClick={() => navigateToCategory('shoes')} className="hover:text-white transition-colors">
                {t('أحذية وسنيكرز', 'Footwear')}
              </button>
            </li>
            <li>
              <button onClick={() => navigateToCategory('beauty')} className="hover:text-white transition-colors">
                {t('العناية الشخصية', 'Grooming & Care')}
              </button>
            </li>
          </ul>
        </div>

        {/* Corporate & Wholesale */}
        <div>
          <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-[#D5FF3F] mb-4">
            {t('منظومة VAYRO', 'VAYRO ECOSYSTEM')}
          </h4>
          <ul className="space-y-2.5 text-xs text-[#F5F2E9]/70">
            <li>
              <button onClick={() => setCurrentPage('wholesale')} className="text-[#D5FF3F] font-semibold hover:underline">
                {t('بوابة تجارة الجملة (B2B)', 'Wholesale B2B Portal')}
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentPage(isStaffAuthenticated ? 'crm' : 'sales-login')}
                className="text-[#F5F2E9]/80 hover:text-[#D5FF3F] text-xs transition-colors flex items-center gap-1.5"
                title={t('دخول الموظفين ومنظومة المبيعات', 'Staff & Sales Login')}
              >
                <Lock size={12} className="text-[#D5FF3F]" />
                <span>{t('دخول الموظفين (Sales Portal)', 'Staff Login (Sales)')}</span>
              </button>
            </li>
            <li>
              <span className="hover:text-white cursor-pointer">{t('قصة العلامة التجارية', 'Our Story')}</span>
            </li>
            <li>
              <span className="hover:text-white cursor-pointer">{t('الحرفية المصرية', 'Egyptian Craft')}</span>
            </li>
            <li>
              <span className="hover:text-white cursor-pointer">{t('الاستدامة والمسؤولية', 'Sustainability')}</span>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-[#D5FF3F] mb-4">
            {t('خدمة العملاء', 'CUSTOMER CARE')}
          </h4>
          <ul className="space-y-2.5 text-xs text-[#F5F2E9]/70">
            <li>
              <button onClick={() => setCurrentPage('account')} className="hover:text-white transition-colors">
                {t('تتبع الشحنات والطلبات', 'Track Order')}
              </button>
            </li>
            <li>
              <span className="hover:text-white cursor-pointer">{t('الشحن والتوصيل للمحافظات', 'Egypt Delivery')}</span>
            </li>
            <li>
              <span className="hover:text-white cursor-pointer">{t('سياسة الاستبدال والاسترجاع', 'Returns & Exchanges')}</span>
            </li>
            <li>
              <span className="hover:text-white cursor-pointer">{t('طرق الدفع المعتمدة', 'Accepted Payment Methods')}</span>
            </li>
            <li>
              <span className="hover:text-white cursor-pointer">{t('الأسئلة الشائعة', 'FAQs')}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Trust Highlights & Approved Payment Methods */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6 border-t border-[#292C27] flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-[#F5F2E9]/60">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
          <span className="flex items-center gap-1.5 text-white/80">
            <ShieldCheck size={15} className="text-[#D5FF3F]" />
            {t('دفع آمن ومشفر 100%', '100% Secure Checkout')}
          </span>
          <span className="flex items-center gap-1.5 text-white/80">
            <Truck size={15} className="text-[#D5FF3F]" />
            {t('توصيل لباب المنزل في 27 محافظة', 'Delivering to 27 Governorates')}
          </span>
          <span className="flex items-center gap-1.5 text-white/80">
            <RefreshCw size={15} className="text-[#D5FF3F]" />
            {t('14 يوم استبدال واسترجاع مجاني', '14-Day Free Returns')}
          </span>
        </div>

        {/* Verified Payment Badges Only */}
        <div className="flex items-center flex-wrap justify-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-white/10 text-white font-mono text-[10px] font-semibold tracking-wider">VISA</span>
          <span className="px-2.5 py-1 rounded-md bg-white/10 text-white font-mono text-[10px] font-semibold tracking-wider">MASTERCARD</span>
          <span className="px-2.5 py-1 rounded-md bg-white/10 text-white font-mono text-[10px] font-semibold tracking-wider">MEEZA ميزة</span>
          <span className="px-2.5 py-1 rounded-md bg-[#D5FF3F]/15 text-[#D5FF3F] font-mono text-[10px] font-semibold border border-[#D5FF3F]/30">
            {t('الدفع عند الاستلام (COD)', 'Cash on Delivery (COD)')}
          </span>
        </div>
      </div>

      {/* Clean Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F5F2E9]/50">
        <p>
          © 2026 VAYRO Market. {t('جميع الحقوق محفوظة لصالح متجر فايرو مصر.', 'All rights reserved.')}
        </p>
        <p className="text-[11px] text-[#F5F2E9]/40 font-mono">
          {t('صُنع بفخر واعتزاز في مصر', 'Crafted with pride in Egypt')}
        </p>
      </div>
    </footer>
  );
};
