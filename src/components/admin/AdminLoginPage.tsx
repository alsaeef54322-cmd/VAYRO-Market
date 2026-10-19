import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Store,
  Sparkles,
  Building2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';

export const AdminLoginPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const { loginAdmin, setCurrentPage } = useStore();

  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!pinInput.trim()) {
      setError(t('يرجى إدخال رمز الأمان أو كلمة المرور', 'Please enter PIN or password'));
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const ok = loginAdmin(pinInput);
      setIsLoading(false);
      if (!ok) {
        setError(t('رمز المرور غير صحيح. الرمز الافتراضي للإدارة هو: 8899', 'Invalid credentials. Default admin PIN: 8899'));
      }
    }, 350);
  };

  const handleQuickDemoAdmin = () => {
    setPinInput('8899');
    loginAdmin('8899');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-[#F7F7F3] dark:bg-[#111411] transition-colors">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#1A1F1A] p-8 sm:p-10 rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-xl relative overflow-hidden">
        
        {/* Subtle Luxury Egyptian Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#18794E] via-[#D5FF3F] to-[#18794E]" />

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#111411] dark:bg-[#232923] text-[#D5FF3F] mb-4 shadow-md border border-[#353D35]">
            <Building2 size={32} />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-display font-black text-2xl tracking-tight text-[#20241F] dark:text-[#F3F5EF]">
              VAYRO
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#18794E] text-white">
              BUSINESS
            </span>
          </div>

          <h2 className="text-lg font-bold text-[#20241F] dark:text-[#F3F5EF]">
            {t('بوابة الإدارة المركزية والعمليات', 'Central Operations & Admin Portal')}
          </h2>
          <p className="text-xs text-[#646A63] dark:text-[#B5BDB3] mt-1.5 leading-relaxed">
            {t(
              'تسجيل الدخول المصرح به لإدارة المنتجات، قوائم الأسعار، الموردين، المحاسبة، وعمولات المبيعات.',
              'Authorized access to manage products, pricing matrices, suppliers, accounting, and sales commissions.'
            )}
          </p>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F0EEE6] dark:bg-[#232923] border border-[#E2E5DE] dark:border-[#353D35] text-xs text-[#646A63] dark:text-[#B5BDB3]">
          <ShieldCheck size={18} className="text-[#18794E] dark:text-[#65C98A] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t(
              'هذه البوابة مخصصة للإدارة التنفيذية والمالية فقط. تُسجل جميع العمليات في سجل التدقيق المالي المعتمد.',
              'Strictly reserved for Executive and Finance staff. All administrative updates are immutably logged.'
            )}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#20241F] dark:text-[#F3F5EF] mb-2">
              {t('رمز الدخول السري (Master PIN / Password)', 'Master PIN or Password')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-[#646A63] dark:text-[#B5BDB3]">
                <KeyRound size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setError('');
                }}
                placeholder={t('أدخل PIN الإدارة (مثال: 8899)...', 'Enter admin PIN (e.g. 8899)...')}
                className="w-full bg-[#F7F7F3] dark:bg-[#232923] text-[#20241F] dark:text-[#F3F5EF] text-sm py-3 ps-10 pe-11 rounded-2xl border border-[#E2E5DE] dark:border-[#353D35] focus:outline-none focus:border-[#18794E] dark:focus:border-[#65C98A]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-[#646A63] dark:text-[#B5BDB3] hover:text-[#20241F] dark:hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1 font-semibold">
                <AlertCircle size={14} />
                <span>{error}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#111411] dark:bg-[#D5FF3F] text-white dark:text-[#111411] hover:bg-black dark:hover:bg-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            {isLoading ? (
              <span className="inline-block animate-pulse">{t('جار التحقق...', 'Authenticating...')}</span>
            ) : (
              <>
                <Lock size={15} />
                <span>{t('تسجيل الدخول إلى لوحة الإدارة', 'Sign In to Business Portal')}</span>
                <ArrowLeft size={16} className={dir === 'ltr' ? 'rotate-180' : ''} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Button */}
        <div className="pt-2 border-t border-[#E2E5DE] dark:border-[#353D35]">
          <button
            type="button"
            onClick={handleQuickDemoAdmin}
            className="w-full py-2.5 px-4 rounded-xl bg-[#F0EEE6] dark:bg-[#232923] text-[#20241F] dark:text-[#F3F5EF] hover:bg-[#E2E5DE] dark:hover:bg-[#2E362E] text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-[#E2E5DE] dark:border-[#353D35]"
          >
            <Sparkles size={14} className="text-[#18794E] dark:text-[#65C98A]" />
            <span>{t('دخول سريع للمعاينة (PIN: 8899)', 'Quick One-Click Demo Access (PIN: 8899)')}</span>
          </button>
        </div>

        {/* Link back to storefront */}
        <div className="text-center pt-2">
          <button
            onClick={() => setCurrentPage('home')}
            className="inline-flex items-center gap-1.5 text-xs text-[#646A63] dark:text-[#B5BDB3] hover:text-[#20241F] dark:hover:text-white transition-colors"
          >
            <Store size={14} />
            <span>{t('العودة إلى متجر VAYRO Market الرئيسي', 'Return to VAYRO Market Storefront')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
