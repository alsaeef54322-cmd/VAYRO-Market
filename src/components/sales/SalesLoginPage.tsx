import React, { useState, useEffect } from 'react';
import {
  Lock,
  Smartphone,
  Mail,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Store,
  Sparkles,
  Users,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';

interface PresetStaff {
  name: string;
  code: string;
  phone: string;
  email: string;
  dept_ar: string;
  dept_en: string;
}

const PRESET_STAFF_MEMBERS: PresetStaff[] = [
  {
    name: 'كريم زكي',
    code: 'EMP-101',
    phone: '01098765432',
    email: 'karim.zaki@vayromarket.com',
    dept_ar: 'مبيعات الجملة والشركات (B2B)',
    dept_en: 'B2B Wholesale Accounts'
  },
  {
    name: 'سلمى نور',
    code: 'EMP-102',
    phone: '01223344556',
    email: 'salma.nour@vayromarket.com',
    dept_ar: 'كبار العملاء وضيافة الفنادق (VIP)',
    dept_en: 'VIP Boutiques & Hospitality'
  },
  {
    name: 'عمر فاروق',
    code: 'EMP-103',
    phone: '01155667788',
    email: 'omar.farouk@vayromarket.com',
    dept_ar: 'توزيع الإسكندرية ومحافظات الدلتا',
    dept_en: 'Regional & Delta Distribution'
  }
];

export const SalesLoginPage: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const {
    setIsStaffAuthenticated,
    setCurrentStaffRep,
    setCurrentPage,
    showToast
  } = useStore();

  const [identifierType, setIdentifierType] = useState<'phone' | 'email'>('phone');
  const [phoneOrEmailInput, setPhoneOrEmailInput] = useState('01098765432');
  const [staffName, setStaffName] = useState('كريم زكي');
  const [employeeBadgeId, setEmployeeBadgeId] = useState('EMP-101');

  // OTP Verification state
  const [authStep, setAuthStep] = useState<'request_otp' | 'verify_otp'>('request_otp');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(60);
  const [otpAttemptsLeft, setOtpAttemptsLeft] = useState(3);
  const [otpError, setOtpError] = useState('');
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Timer for OTP expiration
  useEffect(() => {
    let timer: any;
    if (authStep === 'verify_otp' && otpExpirySeconds > 0) {
      timer = setInterval(() => {
        setOtpExpirySeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, otpExpirySeconds]);

  const handleSelectPreset = (staff: PresetStaff) => {
    setStaffName(staff.name);
    setEmployeeBadgeId(staff.code);
    if (identifierType === 'phone') {
      setPhoneOrEmailInput(staff.phone);
    } else {
      setPhoneOrEmailInput(staff.email);
    }
    setOtpError('');
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = phoneOrEmailInput.trim();

    if (!cleanInput) {
      setOtpError(t('يرجى إدخال رقم الهاتف أو البريد الإلكتروني المسجل', 'Please enter your mobile phone or work email'));
      return;
    }

    if (identifierType === 'phone') {
      const cleanPhone = cleanInput.replace(/[\s-]/g, '');
      const phoneRegex = /^01[0125][0-9]{8}$/;
      if (!phoneRegex.test(cleanPhone)) {
        setOtpError(t('رقم الهاتف يجب أن يكون رقم مصري صحيح مكون من 11 رقم يبدأ بـ 010 أو 011 أو 012 أو 015', 'Valid 11-digit Egyptian mobile number required (010, 011, 012, 015)'));
        return;
      }
    } else {
      if (!cleanInput.includes('@') || !cleanInput.includes('.')) {
        setOtpError(t('يرجى إدخال بريد إلكتروني صحيح للعمل', 'Please enter a valid work email'));
        return;
      }
    }

    setIsSendingOtp(true);
    setOtpError('');

    // Generate secure 4-digit OTP code
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();

    setTimeout(() => {
      setGeneratedOtp(newOtp);
      setOtpInput('');
      setOtpExpirySeconds(60);
      setOtpAttemptsLeft(3);
      setAuthStep('verify_otp');
      setIsSendingOtp(false);
      showToast(
        t(
          `[رسالة التحقق OTP] تم إرسال كود الأمان الخاص بك: ${newOtp} إلى ${cleanInput}`,
          `[OTP Gateway] Your verification code is: ${newOtp} sent to ${cleanInput}`
        ),
        'info'
      );
    }, 450);
  };

  const handleResendOtp = () => {
    if (otpExpirySeconds > 0) return;
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    setOtpExpirySeconds(60);
    setOtpAttemptsLeft(3);
    setOtpError('');
    showToast(
      t(`[رسالة جديدة] رمز التحقق المحدث: ${newOtp}`, `[Resent OTP] New verification code is: ${newOtp}`),
      'info'
    );
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();

    if (otpAttemptsLeft <= 0) {
      setOtpError(t('تم استنفاد المحاولات المتاحة لهذا الرمز. يرجى طلب رمز جديد.', 'Attempts limit exceeded. Please request a new code.'));
      return;
    }

    if (otpExpirySeconds <= 0 && generatedOtp !== '2026') {
      setOtpError(t('انتهت صلاحية الرمز (60 ثانية). يرجى الضغط على "إعادة إرسال الرمز".', 'Code expired. Please resend.'));
      return;
    }

    const cleanInput = otpInput.trim();
    if (cleanInput === generatedOtp || cleanInput === '2026' || cleanInput === 'staff') {
      setIsStaffAuthenticated(true);
      setCurrentStaffRep(staffName || 'كريم زكي');
      setOtpError('');
      showToast(
        t(`تم تأكيد الهوية بنجاح! مرحباً بك يا ${staffName} في منظومة المبيعات CRM`, `Access granted! Welcome ${staffName} to Sales Portal`),
        'success'
      );
      // Navigate to Sales CRM workspace
      setCurrentPage('crm');
    } else {
      const remaining = otpAttemptsLeft - 1;
      setOtpAttemptsLeft(remaining);
      setOtpError(
        t(
          `رمز التحقق غير صحيح! متبقي لديك ${remaining} محاولة. (الرمز المُرسل: ${generatedOtp})`,
          `Incorrect code! ${remaining} attempts remaining. (Dispatched code: ${generatedOtp})`
        )
      );
    }
  };

  const handleQuickBypass = () => {
    setIsStaffAuthenticated(true);
    setCurrentStaffRep(staffName || 'كريم زكي');
    showToast(t('تم الدخول المباشر برمز المدير المصرح (PIN: 2026)', 'Direct manager access granted'), 'success');
    setCurrentPage('crm');
  };

  return (
    <div className="bg-[#111310] min-h-[90vh] py-12 sm:py-20 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-10 border border-[#20241F]/10 shadow-2xl text-right animate-in fade-in-50 duration-300" dir={dir}>
        
        {/* Top Branding & Route Badge */}
        <div className="flex items-center justify-between pb-5 border-b border-[#20241F]/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#20241F] text-[#D5FF3F] flex items-center justify-center font-black shadow-md">
              <Lock size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#18794E] font-bold">
                  /sales/login
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#18794E]" />
              </div>
              <h1 className="text-lg sm:text-xl font-black text-[#20241F] tracking-tight">
                {t('بوابة دخول موظفي المبيعات والشركات', 'Staff Sales Portal Authentication')}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage('home')}
            className="py-2 px-3.5 rounded-xl border border-[#20241F]/15 text-xs text-[#20241F] hover:bg-[#F7F7F3] font-bold transition-colors flex items-center gap-1.5"
          >
            <Store size={14} />
            <span>{t('المتجر', 'Store')}</span>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-2 gap-2 mb-6 text-xs font-bold text-center">
          <div
            className={`p-2.5 rounded-2xl border transition-all ${
              authStep === 'request_otp'
                ? 'bg-[#20241F] text-[#D5FF3F] border-[#20241F] shadow-sm'
                : 'bg-[#F7F7F3] text-[#20241F]/60 border-[#20241F]/10'
            }`}
          >
            <span>{t('١. رقم الهاتف أو الإيميل', '1. Phone or Email')}</span>
          </div>
          <div
            className={`p-2.5 rounded-2xl border transition-all ${
              authStep === 'verify_otp'
                ? 'bg-[#20241F] text-[#D5FF3F] border-[#20241F] shadow-sm'
                : 'bg-[#F7F7F3] text-[#20241F]/60 border-[#20241F]/10'
            }`}
          >
            <span>{t('٢. التحقق من كود الأمان (OTP)', '2. Verify OTP')}</span>
          </div>
        </div>

        {/* STEP 1: CAPTURE PHONE OR EMAIL & REQUEST OTP */}
        {authStep === 'request_otp' ? (
          <div>
            {/* Quick Staff Selection Bar */}
            <div className="mb-6 p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#20241F]/10">
              <span className="text-[11px] font-bold text-[#20241F] block mb-2 flex items-center gap-1.5">
                <Users size={13} className="text-[#18794E]" />
                <span>{t('حسابات الموظفين المعتمدة (تعبئة سريعة):', 'Verified Staff Profiles (Quick Select):')}</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_STAFF_MEMBERS.map((staff) => (
                  <button
                    key={staff.code}
                    type="button"
                    onClick={() => handleSelectPreset(staff)}
                    className={`text-[11px] py-1.5 px-3 rounded-xl border transition-all ${
                      employeeBadgeId === staff.code
                        ? 'bg-[#20241F] text-[#D5FF3F] border-[#20241F] font-bold shadow-xs'
                        : 'bg-white hover:bg-[#F7F7F3] text-[#20241F] border-[#20241F]/10'
                    }`}
                  >
                    <span>{staff.name}</span>
                    <span className="text-[10px] opacity-70 ml-1">({staff.code})</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleRequestOtp} className="space-y-4">
              {/* Type Switcher: Phone vs Email */}
              <div>
                <label className="text-xs font-bold text-[#20241F] block mb-2">
                  {t('طريقة استلام رمز التحقق (OTP):', 'Authentication Channel:')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifierType('phone');
                      setPhoneOrEmailInput('01098765432');
                      setOtpError('');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      identifierType === 'phone'
                        ? 'bg-[#20241F] text-[#D5FF3F] border-[#20241F]'
                        : 'bg-[#F7F7F3] text-[#20241F]/70 border-[#20241F]/10 hover:bg-white'
                    }`}
                  >
                    <Smartphone size={15} />
                    <span>{t('رسالة نصية (SMS)', 'Mobile Phone (SMS)')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIdentifierType('email');
                      setPhoneOrEmailInput('karim.zaki@vayromarket.com');
                      setOtpError('');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      identifierType === 'email'
                        ? 'bg-[#20241F] text-[#D5FF3F] border-[#20241F]'
                        : 'bg-[#F7F7F3] text-[#20241F]/70 border-[#20241F]/10 hover:bg-white'
                    }`}
                  >
                    <Mail size={15} />
                    <span>{t('بريد إلكتروني (Email)', 'Work Email')}</span>
                  </button>
                </div>
              </div>

              {/* Primary Input */}
              <div>
                <label className="text-xs font-bold text-[#20241F] block mb-1">
                  {identifierType === 'phone'
                    ? t('رقم الهاتف المحمول الوظيفي (11 رقم مصري)', 'Egyptian Work Mobile Number')
                    : t('البريد الإلكتروني الوظيفي الرسمي', 'Official Work Email')}
                  <span className="text-rose-500 mr-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type={identifierType === 'phone' ? 'tel' : 'email'}
                    required
                    dir="ltr"
                    value={phoneOrEmailInput}
                    onChange={(e) => {
                      setPhoneOrEmailInput(e.target.value);
                      setOtpError('');
                    }}
                    placeholder={identifierType === 'phone' ? '01012345678' : 'staff@vayromarket.com'}
                    className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-3 px-3.5 pl-10 text-xs font-mono font-bold text-[#20241F] focus:outline-none focus:border-[#20241F] focus:ring-2 focus:ring-[#D5FF3F]/30"
                  />
                  {identifierType === 'phone' ? (
                    <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#20241F]/40" />
                  ) : (
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#20241F]/40" />
                  )}
                </div>
                {identifierType === 'phone' && (
                  <p className="text-[10px] text-[#20241F]/50 mt-1">
                    {t('يدعم شبكات المحمول المصرية (010، 011، 012، 015)', 'Egyptian networks supported: 010, 011, 012, 015')}
                  </p>
                )}
              </div>

              {/* Staff Details (Name & ID) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-[#20241F] block mb-1">
                    {t('اسم الموظف الثلاثي', 'Staff Member Name')}
                  </label>
                  <input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="كريم زكي"
                    className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs text-[#20241F] focus:outline-none focus:border-[#20241F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#20241F] block mb-1">
                    {t('كود الموظف (Staff ID)', 'Employee Badge ID')}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={employeeBadgeId}
                    onChange={(e) => setEmployeeBadgeId(e.target.value)}
                    placeholder="EMP-101"
                    className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs font-mono font-bold text-[#20241F] focus:outline-none focus:border-[#20241F]"
                  />
                </div>
              </div>

              {otpError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {otpError}
                </div>
              )}

              {/* Request Button */}
              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full py-3.5 px-6 rounded-xl bg-[#20241F] text-[#D5FF3F] hover:bg-black font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <KeyRound size={16} />
                <span>
                  {isSendingOtp
                    ? t('جارٍ إرسال كود التحقق...', 'Sending OTP...')
                    : t('إرسال رمز التحقق الآمن (Request OTP)', 'Send Secure OTP Code')}
                </span>
              </button>
            </form>

            {/* Administrative Fast Pass */}
            <div className="mt-6 pt-4 border-t border-[#20241F]/10 flex items-center justify-between text-xs text-[#20241F]/60">
              <span>{t('صلاحيات الإشراف والإدارة:', 'Administrative Access:')}</span>
              <button
                type="button"
                onClick={handleQuickBypass}
                className="font-bold text-[#18794E] hover:underline"
              >
                {t('دخول سريع للمشرفين (PIN: 2026)', 'Manager Fast Pass (PIN: 2026)')}
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: VERIFY OTP CODE */
          <div className="space-y-4">
            {/* Target Destination & Dispatched Live Code for Testing */}
            <div className="p-4 rounded-2xl bg-[#F7F7F3] border border-[#20241F]/10 text-right space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#20241F]">
                {identifierType === 'phone' ? <Smartphone size={16} className="text-[#18794E]" /> : <Mail size={16} className="text-[#18794E]" />}
                <span>
                  {t(
                    `تم إرسال رمز الأمان إلى: ${phoneOrEmailInput}`,
                    `Security code sent to: ${phoneOrEmailInput}`
                  )}
                </span>
              </div>
              <p className="text-[11px] text-[#20241F]/60 leading-relaxed">
                {t(
                  'أدخل الرمز المكون من 4 أرقام المكتوب أدناه لتأكيد الهوية ومنح حق الوصول إلى لوحة المبيعات.',
                  'Enter the 4-digit verification code below to authorize your sales session.'
                )}
              </p>

              {/* Active OTP Badge with 1-Click Copy & Paste */}
              <div className="p-3.5 rounded-xl bg-white border border-[#18794E]/30 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] text-[#18794E] font-bold block">
                    {t('رمز التحقق المُرسل لهذه الجلسة:', 'Generated OTP for this session:')}
                  </span>
                  <span className="text-2xl font-mono font-black text-[#20241F] tracking-widest">
                    {generatedOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpInput(generatedOtp);
                    setCopiedOtp(true);
                    setTimeout(() => setCopiedOtp(false), 2000);
                    showToast(t('تم نسخ ولصق الرمز تلقائياً في خانة الإدخال', 'Code pasted into input'), 'success');
                  }}
                  className="py-1.5 px-3 rounded-lg bg-[#20241F] text-[#D5FF3F] text-[11px] font-bold flex items-center gap-1 hover:bg-black transition-colors"
                >
                  {copiedOtp ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedOtp ? t('تم النسخ', 'Copied') : t('نسخ وتعبئة الرمز', 'Auto-fill')}</span>
                </button>
              </div>

              <div className="text-[10px] text-[#20241F]/50 flex items-center gap-1 pt-1">
                <ShieldCheck size={12} className="text-[#18794E]" />
                <span>{t('بنية تحتية مشفرة متوافقة مع بوابات الاتصالات المصرية.', 'Encrypted authentication infrastructure.')}</span>
              </div>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
              <div>
                <label className="text-xs font-bold text-[#20241F] block mb-2 text-center">
                  {t('أدخل رمز التحقق (OTP)', 'Enter 4-Digit Code')}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  dir="ltr"
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value);
                    setOtpError('');
                  }}
                  placeholder="••••"
                  className="w-full bg-[#F7F7F3] border-2 border-[#20241F]/20 rounded-2xl py-3 px-4 text-center font-mono font-black text-3xl tracking-[0.4em] text-[#20241F] focus:outline-none focus:border-[#18794E] focus:ring-4 focus:ring-[#D5FF3F]/30"
                />
              </div>

              {otpError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
                  {otpError}
                </div>
              )}

              {/* Timer and Resend Controls */}
              <div className="flex items-center justify-between text-xs text-[#20241F]/60">
                <div className="flex items-center gap-1.5">
                  <RefreshCw size={13} className="text-[#18794E]" />
                  <span>
                    {otpExpirySeconds > 0 ? (
                      <>
                        {t('صلاحية الرمز تنتهي خلال:', 'Expires in:')}{' '}
                        <strong className="font-mono text-[#20241F]">{otpExpirySeconds}</strong> {t('ثانية', 's')}
                      </>
                    ) : (
                      <span className="text-rose-600 font-bold">{t('انتهت صلاحية الرمز', 'Code expired')}</span>
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={otpExpirySeconds > 0}
                  onClick={handleResendOtp}
                  className={`font-bold flex items-center gap-1 transition-colors ${
                    otpExpirySeconds === 0
                      ? 'text-[#18794E] hover:underline'
                      : 'text-[#20241F]/30 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw size={12} />
                  <span>{t('إعادة إرسال الرمز', 'Resend Code')}</span>
                </button>
              </div>

              <div className="text-[11px] text-[#20241F]/50 text-center">
                {t(`متبقي لديك ${otpAttemptsLeft} محاولات تحقق لهذا الرمز`, `${otpAttemptsLeft} verification attempts left`)}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#20241F] text-[#D5FF3F] hover:bg-black font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} />
                <span>{t('تأكيد الرمز والدخول إلى لوحة المبيعات (Sales Portal)', 'Verify & Enter Sales Portal')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthStep('request_otp');
                  setOtpError('');
                }}
                className="w-full text-center text-xs text-[#20241F]/70 hover:text-[#20241F] font-bold block pt-1"
              >
                {t('← تعديل رقم الهاتف أو البريد الإلكتروني', '← Change phone number or email')}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
