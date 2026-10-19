import React, { useState } from 'react';
import { X, Lock, Phone, User, Mail, MapPin, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { EGYPTIAN_GOVERNORATES } from '../../data/products';
import { api } from '../../services/api';

export const AuthModal: React.FC = () => {
  const { t, dir } = useLanguage();
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    setCurrentUser,
    setCurrentPage,
    showToast
  } = useStore();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(authModalMode || 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [phone, setPhone] = useState('01012345678');
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [governorateId, setGovernorateId] = useState('cairo');
  const [city, setCity] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync mode with context
  React.useEffect(() => {
    setMode(authModalMode);
    setErrors({});
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const validatePhone = (val: string) => {
    const clean = val.replace(/[\s-]/g, '');
    return /^01[0125][0-9]{8}$/.test(clean);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validatePhone(phone)) {
      setErrors({ phone: t('يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 010 أو 011 أو 012 أو 015', 'Valid Egyptian mobile number required (010, 011, 012, 015)') });
      return;
    }

    if (!password || password.length < 6) {
      setErrors({ password: t('كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل', 'Password must be at least 6 characters') });
      return;
    }

    setIsSubmitting(true);
    const res = await api.loginCustomer({ phone, password });
    setIsSubmitting(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      showToast(t(`مرحبًا بك مجددًا يا ${res.user.name}!`, `Welcome back, ${res.user.name}!`), 'success');
      closeAuthModal();
      setCurrentPage('account');
    } else {
      setErrors({ general: t(res.error_ar || 'خطأ في تسجيل الدخول', res.error_en || 'Login failed') });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const errs: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = t('يرجى كتابة الاسم بالكامل (3 أحرف على الأقل)', 'Full name is required (min 3 chars)');
    }

    if (!validatePhone(phone)) {
      errs.phone = t('رقم الموبايل المصري غير صحيح (11 رقم يبدأ بـ 010, 011, 012, 015)', 'Valid Egyptian phone required (010, 011, 012, 015)');
    }

    if (!password || password.length < 6) {
      errs.password = t('كلمة المرور يجب أن تكون 6 خانات على الأقل', 'Password must be at least 6 characters');
    }

    if (email.trim() && !email.includes('@')) {
      errs.email = t('البريد الإلكتروني غير صحيح', 'Invalid email address');
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    const res = await api.registerCustomer({
      name: fullName,
      phone,
      password,
      email: email || undefined,
      governorateId,
      city: city || undefined,
      addressLine: addressLine || undefined
    });
    setIsSubmitting(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      showToast(t(`تم إنشاء حسابك بنجاح! أهلاً بك في VAYRO يا ${res.user.name}.`, `Account created successfully! Welcome to VAYRO.`), 'success');
      closeAuthModal();
      setCurrentPage('account');
    } else {
      setErrors({ general: t(res.error_ar || 'تعذر إنشاء الحساب', res.error_en || 'Registration failed') });
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      setErrors({ phone: t('يرجى إدخال رقم هاتفك المسجل', 'Please enter your registered Egyptian phone number') });
      return;
    }
    showToast(t(`تم إرسال كود استعادة كلمة المرور في رسالة SMS إلى رقمك ${phone}`, `Password reset code dispatched via SMS to ${phone}`), 'info');
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#20241F]/70 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Backdrop dismissal */}
      <div className="absolute inset-0" onClick={closeAuthModal} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#181C17] text-[#20241F] dark:text-[#F7F7F3] rounded-3xl shadow-2xl border border-[#20241F]/10 dark:border-white/10 overflow-hidden z-10 text-right animate-in zoom-in-95 duration-200">
        
        {/* Header with Title and Mode Switcher */}
        <div className="p-6 bg-[#F7F7F3] dark:bg-[#141713] border-b border-[#20241F]/10 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xl text-[#20241F] dark:text-[#F7F7F3]">VAYRO</span>
            <span className="w-2 h-2 bg-[#D5FF3F] rounded-[2px]" />
            <span className="text-xs font-mono font-bold text-[#18794E] dark:text-[#D5FF3F]">
              {mode === 'login' ? t('تسجيل الدخول', 'Sign In') : mode === 'register' ? t('حساب عميل جديد', 'Register') : t('استعادة كلمة المرور', 'Reset')}
            </span>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-[#20241F] dark:text-[#F7F7F3] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher for Login / Register */}
        {mode !== 'forgot_password' && (
          <div className="p-2 bg-[#F7F7F3]/60 dark:bg-[#141713] border-b border-[#20241F]/5 dark:border-white/5 flex gap-1">
            <button
              onClick={() => {
                setMode('login');
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#20241F] shadow-sm'
                  : 'text-[#20241F]/60 hover:text-[#20241F]'
              }`}
            >
              {t('تسجيل الدخول للعملاء', 'Customer Sign In')}
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#20241F] shadow-sm'
                  : 'text-[#20241F]/60 hover:text-[#20241F]'
              }`}
            >
              {t('إنشاء حساب جديد', 'Create Account')}
            </button>
          </div>
        )}

        {/* Body Form */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {errors.general && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#20241F] block mb-1.5">
                  {t('رقم الموبايل المصري *', 'Egyptian Phone Number *')}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className={`w-full bg-[#F7F7F3] border rounded-xl py-2.5 px-3.5 text-xs text-[#20241F] focus:outline-none focus:border-[#20241F] ${
                      errors.phone ? 'border-rose-500' : 'border-[#20241F]/15'
                    }`}
                  />
                  <Phone size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-[#20241F]/40" />
                </div>
                {errors.phone && <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>}
                <p className="text-[10px] text-[#20241F]/50 mt-1">
                  {t('مثال تجريبي للتجربة: 01012345678', 'Demo test phone: 01012345678')}
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-[#20241F]">
                    {t('كلمة المرور *', 'Password *')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot_password')}
                    className="text-[11px] text-[#18794E] hover:underline font-semibold"
                  >
                    {t('نسيت كلمة المرور؟', 'Forgot Password?')}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-[#F7F7F3] border rounded-xl py-2.5 px-3.5 text-xs text-[#20241F] focus:outline-none focus:border-[#20241F] ${
                      errors.password ? 'border-rose-500' : 'border-[#20241F]/15'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 left-3 text-[#20241F]/40 hover:text-[#20241F]"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-rose-600 mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#20241F] text-[#D5FF3F] hover:bg-black font-bold text-xs transition-all shadow-md mt-2 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? t('جاري التحقق...', 'Authenticating...') : t('تسجيل الدخول للمتجر', 'Sign In to VAYRO')}</span>
              </button>

              <div className="pt-3 text-center text-xs text-[#20241F]/60">
                <span>{t('ليس لديك حساب بعد؟', "Don't have an account?")}</span>{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-[#20241F] underline hover:text-[#18794E]"
                >
                  {t('سجّل حساب عميل جديد', 'Register now')}
                </button>
              </div>
            </form>
          )}

          {/* REGISTRATION FORM (SIMPLE RETAIL CUSTOMER) */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <p className="text-[11px] text-[#20241F]/60 mb-2">
                {t('أنشئ حسابك لتتبع مشترياتك، حفظ العناوين، وإدارة قائمة المفضلة بسهولة.', 'Create your personal retail profile for seamless ordering and tracking.')}
              </p>

              {/* Required 1: Full name */}
              <div>
                <label className="text-xs font-bold text-[#20241F] block mb-1">
                  {t('الاسم بالكامل *', 'Full Name *')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('مثال: سارة أحمد محمود', 'e.g. Sarah Ahmed')}
                    className={`w-full bg-[#F7F7F3] border rounded-xl py-2 px-3 text-xs text-[#20241F] focus:outline-none ${
                      errors.fullName ? 'border-rose-500' : 'border-[#20241F]/15'
                    }`}
                  />
                  <User size={13} className="absolute top-1/2 -translate-y-1/2 left-3 text-[#20241F]/40" />
                </div>
                {errors.fullName && <p className="text-[10px] text-rose-600 mt-1">{errors.fullName}</p>}
              </div>

              {/* Required 2: Mobile Phone */}
              <div>
                <label className="text-xs font-bold text-[#20241F] block mb-1">
                  {t('رقم الموبايل المصري * (لتأكيد الشحنات)', 'Egyptian Mobile Number *')}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className={`w-full bg-[#F7F7F3] border rounded-xl py-2 px-3 text-xs text-[#20241F] focus:outline-none ${
                      errors.phone ? 'border-rose-500' : 'border-[#20241F]/15'
                    }`}
                  />
                  <Phone size={13} className="absolute top-1/2 -translate-y-1/2 left-3 text-[#20241F]/40" />
                </div>
                {errors.phone && <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              {/* Required 3: Password */}
              <div>
                <label className="text-xs font-bold text-[#20241F] block mb-1">
                  {t('كلمة المرور * (6 أحرف أو أرقام على الأقل)', 'Password * (min 6 characters)')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-[#F7F7F3] border rounded-xl py-2 px-3 text-xs text-[#20241F] focus:outline-none ${
                      errors.password ? 'border-rose-500' : 'border-[#20241F]/15'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 left-3 text-[#20241F]/40 hover:text-[#20241F]"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-rose-600 mt-1">{errors.password}</p>}
              </div>

              {/* Optional Section: Shipping Defaults */}
              <div className="pt-2 border-t border-[#20241F]/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#18794E] mb-2">
                  {t('بيانات الشحن التلقائي (اختيارية لتسريع الدفع)', 'Optional Shipping Defaults')}
                </p>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] font-medium text-[#20241F]/80 block mb-1">
                      {t('البريد الإلكتروني (اختياري)', 'Email (Optional)')}
                    </label>
                    <input
                      type="email"
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-1.5 px-3 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-[#20241F]/80 block mb-1">
                        {t('المحافظة', 'Governorate')}
                      </label>
                      <select
                        value={governorateId}
                        onChange={(e) => setGovernorateId(e.target.value)}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-1.5 px-2 text-xs"
                      >
                        {EGYPTIAN_GOVERNORATES.map((gov) => (
                          <option key={gov.id} value={gov.id}>
                            {t(gov.name_ar, gov.name_en)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-[#20241F]/80 block mb-1">
                        {t('المدينة أو الحي', 'City / District')}
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={t('مثال: المعادي', 'e.g. Maadi')}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-1.5 px-3 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#20241F]/80 block mb-1">
                      {t('عنوان التوصيل', 'Address Line')}
                    </label>
                    <input
                      type="text"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder={t('اسم الشارع ورقم العمارة', 'Street and building')}
                      className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-1.5 px-3 text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#20241F] text-[#D5FF3F] hover:bg-black font-bold text-xs transition-all shadow-md mt-3 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? t('جاري إنشاء الحساب...', 'Creating account...') : t('تأكيد إنشاء حساب العميل', 'Create My Customer Account')}</span>
              </button>

              <div className="pt-2 text-center text-xs text-[#20241F]/60">
                <span>{t('لديك حساب بالفعل؟', 'Already registered?')}</span>{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-[#20241F] underline hover:text-[#18794E]"
                >
                  {t('تسجيل الدخول', 'Sign in')}
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-[#20241F]/70 leading-relaxed">
                {t(
                  'أدخل رقم هاتفك المصري المسجل وسنرسل لك رمز تأكيد مكون من 6 أرقام عبر رسالة SMS لتعيين كلمة مرور جديدة.',
                  'Enter your registered Egyptian mobile number to receive a 6-digit SMS reset code.'
                )}
              </p>

              <div>
                <label className="text-xs font-bold text-[#20241F] block mb-1.5">
                  {t('رقم الموبايل المصري *', 'Egyptian Phone *')}
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2.5 px-3.5 text-xs"
                />
                {errors.phone && <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-[#20241F] text-[#D5FF3F] hover:bg-black font-bold text-xs shadow-md"
              >
                {t('إرسال رمز الاستعادة (SMS)', 'Send Reset Code')}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-[#20241F]/70 hover:text-black font-semibold"
                >
                  {t('← العودة لتسجيل الدخول', '← Back to Sign In')}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer Security Assurance */}
        <div className="p-3.5 bg-[#F7F7F3] border-t border-[#20241F]/10 flex items-center justify-center gap-1.5 text-[10px] text-[#20241F]/60">
          <ShieldCheck size={13} className="text-[#18794E]" />
          <span>{t('حسابات العملاء محمية ومشفرة بمعايير الخصوصية المصرية', 'Customer accounts encrypted with Egyptian data privacy compliance')}</span>
        </div>

      </div>
    </div>
  );
};
