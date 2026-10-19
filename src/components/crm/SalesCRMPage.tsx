import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Calendar,
  Building,
  Package,
  Tag,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  X,
  ExternalLink,
  ShieldAlert,
  Send,
  Lock,
  Layers,
  Award,
  MapPin,
  KeyRound,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  LogOut
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { EGYPTIAN_GOVERNORATES, CATEGORIES } from '../../data/products';
import { api } from '../../services/api';
import { SalesLead, LeadStage, LeadPriority, Product, Order } from '../../types';
import { SalesPriceCatalog } from '../sales/SalesPriceCatalog';
import { SalesCreateOrderModal } from '../sales/SalesCreateOrderModal';
import { SalesOrdersList } from '../sales/SalesOrdersList';

export const SalesCRMPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const {
    isStaffAuthenticated,
    setIsStaffAuthenticated,
    currentStaffRep,
    setCurrentStaffRep,
    setCurrentPage,
    showToast
  } = useStore();

  // Staff Registration & OTP Authentication State
  const [authStep, setAuthStep] = useState<'register_and_request' | 'verify_otp'>('register_and_request');
  const [employeeData, setEmployeeData] = useState({
    fullName: 'كريم زكي',
    employeeId: 'EMP-101',
    phone: '01098765432',
    email: 'karim.zaki@vayromarket.com',
    department: 'b2b_wholesale'
  });
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(60);
  const [otpAttemptsLeft, setOtpAttemptsLeft] = useState(3);
  const [otpError, setOtpError] = useState('');
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any;
    if (authStep === 'verify_otp' && otpExpirySeconds > 0) {
      timer = setInterval(() => {
        setOtpExpirySeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, otpExpirySeconds]);

  const PRESET_STAFF = [
    {
      name: 'كريم زكي',
      code: 'EMP-101',
      phone: '01098765432',
      email: 'karim.zaki@vayromarket.com',
      dept: 'b2b_wholesale',
      title_ar: 'كريم زكي - مبيعات الجملة والشركات (B2B)',
      title_en: 'Karim Zaki - B2B Wholesale'
    },
    {
      name: 'سلمى نور',
      code: 'EMP-102',
      phone: '01223344556',
      email: 'salma.nour@vayromarket.com',
      dept: 'vip_boutiques',
      title_ar: 'سلمى نور - تعاقدات الفنادق والبوتيكات',
      title_en: 'Salma Nour - Hospitality & Boutiques'
    },
    {
      name: 'عمر فاروق',
      code: 'EMP-103',
      phone: '01155667788',
      email: 'omar.farouk@vayromarket.com',
      dept: 'retail_distribution',
      title_ar: 'عمر فاروق - توزيع الإسكندرية والدلتا',
      title_en: 'Omar Farouk - Delta & Regional Distribution'
    }
  ];

  // Sales Portal Navigation: 'pricing' | 'pipeline' | 'orders' | 'targets'
  const [salesTab, setSalesTab] = useState<'pricing' | 'pipeline' | 'orders' | 'targets'>('pricing');
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [orderModalProduct, setOrderModalProduct] = useState<Product | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>(() => api.getSavedOrders());

  // CRM Views & Filters
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [repFilter, setRepFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState<SalesLead[]>(() => api.getSalesLeads());
  const [selectedLead, setSelectedLead] = useState<SalesLead | null>(null);

  // New Lead Modal State (Multi-section detailed form)
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);

  // Lead Form Fields
  const [newLeadForm, setNewLeadForm] = useState({
    // Section 1: Contact Information
    fullName: '',
    primaryPhone: '',
    secondaryPhone: '',
    email: '',
    governorate: 'القاهرة',
    city: '',
    preferredContactMethod: 'whatsapp' as 'whatsapp' | 'phone' | 'email',

    // Section 2: Business Details
    customerType: 'boutique' as SalesLead['customerType'],
    businessName: '',
    businessActivity: '',
    businessAddress: '',
    websiteOrSocial: '',
    interestedCategories: ['men', 'accessories'],
    expectedPurchaseVolume: '100-200 قطعة',
    estimatedDealValue: 120000,
    expectedBuyingFrequency: 'monthly' as 'one_time' | 'weekly' | 'monthly' | 'quarterly',
    wholesaleInterest: true,
    taxOrCommercialId: '',

    // Section 3: Sales Information
    source: 'Website Inquiry' as const,
    assignedRep: currentStaffRep,
    stage: 'new' as LeadStage,
    priority: 'high' as LeadPriority,
    expectedClosingDate: '2026-11-15',
    nextFollowUpDate: '2026-10-25',
    nextAction: 'التواصل الفوري لتحديد موعد مكالمة التعارف وتقديم الأسعار',
    internalNotes: '',
    tagsString: 'عميل جديد, بوتيك'
  });

  // Activity Log Note in Lead Detail Modal
  const [activityNote, setActivityNote] = useState('');
  const [activityType, setActivityType] = useState<'call' | 'whatsapp' | 'meeting' | 'note'>('call');

  const STAGES: { key: LeadStage; label_ar: string; label_en: string; color: string }[] = [
    { key: 'new', label_ar: 'عميل جديد', label_en: 'New Lead', color: 'bg-blue-500' },
    { key: 'contact_attempted', label_ar: 'محاولة تواصل', label_en: 'Contact Attempted', color: 'bg-amber-500' },
    { key: 'contacted', label_ar: 'تم التواصل', label_en: 'Contacted', color: 'bg-indigo-500' },
    { key: 'qualified', label_ar: 'مؤهل للشراء', label_en: 'Qualified', color: 'bg-purple-500' },
    { key: 'quote_sent', label_ar: 'أرسل عرض سعر', label_en: 'Quote Sent', color: 'bg-cyan-500' },
    { key: 'negotiation', label_ar: 'مفاوضات الشروط', label_en: 'Negotiation', color: 'bg-orange-500' },
    { key: 'won', label_ar: 'صفقة ناجحة', label_en: 'Won (Closed)', color: 'bg-emerald-600' },
    { key: 'lost', label_ar: 'صفقة ملغاة', label_en: 'Lost', color: 'bg-rose-500' },
    { key: 'followup_later', label_ar: 'متابعة لاحقة', label_en: 'Follow-up Later', color: 'bg-gray-500' }
  ];

  const STAFF_REPS = ['كريم زكي', 'سلمى نور', 'عمر فاروق'];

  const stats = useMemo(() => api.getCRMStats(), [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (stageFilter !== 'all' && l.stage !== stageFilter) return false;
      if (repFilter !== 'all' && l.assignedRep !== repFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          l.fullName.toLowerCase().includes(q) ||
          l.businessName.toLowerCase().includes(q) ||
          l.primaryPhone.includes(q) ||
          l.governorate.toLowerCase().includes(q) ||
          l.leadNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leads, stageFilter, repFilter, searchQuery]);

  // Handle Employee Registration & OTP Request
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeData.fullName.trim() || employeeData.fullName.trim().length < 3) {
      setOtpError(t('يرجى إدخال اسم الموظف الثلاثي بالكامل (3 أحرف على الأقل)', 'Please enter full employee name'));
      return;
    }
    if (!employeeData.employeeId.trim()) {
      setOtpError(t('يرجى إدخال الكود الوظيفي المعتمد للموظف', 'Please enter employee badge ID'));
      return;
    }
    const cleanPhone = employeeData.phone.replace(/[\s-]/g, '');
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setOtpError(t('رقم الهاتف يجب أن يكون رقم مصري صحيح مكون من 11 رقم يبدأ بـ 010 أو 011 أو 012 أو 015', 'Valid 11-digit Egyptian mobile number required (010, 011, 012, 015)'));
      return;
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
        t(`[بوابة الرسائل SMS] كود التحقق الخاص بك هو: ${newOtp}`, `[SMS Gateway] Your verification code is: ${newOtp}`),
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
      t(`[رسالة جديدة] رمز التحقق المحدث: ${newOtp}`, `[SMS Resend] New code is: ${newOtp}`),
      'info'
    );
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpAttemptsLeft <= 0) {
      setOtpError(t('تم استنفاد المحاولات المتاحة لهذا الرمز. يرجى طلب رمز تحقق جديد.', 'Attempts limit reached. Please request a new code.'));
      return;
    }

    if (otpExpirySeconds <= 0 && generatedOtp !== '2026') {
      setOtpError(t('انتهت صلاحية الرمز (60 ثانية). يرجى الضغط على "إعادة إرسال الرمز".', 'Code expired. Please click resend.'));
      return;
    }

    const cleanInput = otpInput.trim();
    if (cleanInput === generatedOtp || cleanInput === '2026' || cleanInput === 'staff') {
      setIsStaffAuthenticated(true);
      setCurrentStaffRep(employeeData.fullName);
      setOtpError('');
      showToast(
        t(`تم تأكيد الهوية بنجاح! مرحباً بك يا ${employeeData.fullName} في منظومة المبيعات CRM`, `Access granted! Welcome ${employeeData.fullName} to Sales CRM`),
        'success'
      );
    } else {
      const remaining = otpAttemptsLeft - 1;
      setOtpAttemptsLeft(remaining);
      setOtpError(
        t(
          `رمز التحقق غير صحيح! متبقي لديك ${remaining} محاولة. (الرمز المرسل للتجربة: ${generatedOtp})`,
          `Incorrect code! ${remaining} attempts remaining. (Dispatched: ${generatedOtp})`
        )
      );
    }
  };

  // Direct PIN verification fallback for managers/devs
  const handleDirectPinVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '2026' || pinInput.toLowerCase() === 'staff' || pinInput === 'vayro') {
      setIsStaffAuthenticated(true);
      setPinError('');
      showToast(t('تم تأكيد صلاحيات الدخول لمنظومة المبيعات CRM', 'Staff identity verified for CRM portal'), 'success');
    } else {
      setPinError(t('رمز المرور غير صحيح. الرمز التجريبي هو: 2026', 'Invalid passcode. Demo PIN is: 2026'));
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.fullName.trim() || !newLeadForm.primaryPhone.trim() || !newLeadForm.businessName.trim()) {
      showToast(t('يرجى ملء الاسم ورقم الهاتف واسم النشاط التجاري', 'Please fill name, phone, and business name'), 'error');
      return;
    }

    const tags = newLeadForm.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const created = api.createSalesLead({
      fullName: newLeadForm.fullName,
      primaryPhone: newLeadForm.primaryPhone,
      secondaryPhone: newLeadForm.secondaryPhone || undefined,
      email: newLeadForm.email || undefined,
      governorate: newLeadForm.governorate,
      city: newLeadForm.city || 'القاهرة',
      preferredContactMethod: newLeadForm.preferredContactMethod,
      customerType: newLeadForm.customerType,
      businessName: newLeadForm.businessName,
      businessActivity: newLeadForm.businessActivity,
      businessAddress: newLeadForm.businessAddress,
      websiteOrSocial: newLeadForm.websiteOrSocial || undefined,
      interestedCategories: newLeadForm.interestedCategories,
      expectedPurchaseVolume: newLeadForm.expectedPurchaseVolume,
      estimatedDealValue: Number(newLeadForm.estimatedDealValue) || 50000,
      expectedBuyingFrequency: newLeadForm.expectedBuyingFrequency,
      wholesaleInterest: newLeadForm.wholesaleInterest,
      taxOrCommercialId: newLeadForm.taxOrCommercialId || undefined,
      source: newLeadForm.source,
      assignedRep: newLeadForm.assignedRep,
      stage: newLeadForm.stage,
      priority: newLeadForm.priority,
      expectedClosingDate: newLeadForm.expectedClosingDate,
      nextFollowUpDate: newLeadForm.nextFollowUpDate,
      nextAction: newLeadForm.nextAction,
      internalNotes: newLeadForm.internalNotes,
      tags
    });

    setLeads(api.getSalesLeads());
    setIsNewLeadModalOpen(false);
    setFormStep(1);
    showToast(t(`تم تسجيل الفرصة البيعية #${created.leadNumber} بنجاح!`, `Lead #${created.leadNumber} registered!`), 'success');
  };

  const handleUpdateStage = (leadId: string, stage: LeadStage) => {
    const updated = api.updateLeadStage(leadId, stage, currentStaffRep);
    if (updated) {
      setLeads(api.getSalesLeads());
      if (selectedLead?.id === leadId) {
        setSelectedLead(updated);
      }
      showToast(t(`تم تحديث مرحلة العميل إلى "${api.getStageLabel(stage)}"`, `Lead moved to ${stage}`), 'info');
    }
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !activityNote.trim()) return;

    const descriptions = {
      call: `مكالمة هاتفية: ${activityNote}`,
      whatsapp: `رسالة واتساب: ${activityNote}`,
      meeting: `اجتماع مبيعات: ${activityNote}`,
      note: `ملاحظة داخلية: ${activityNote}`
    };

    const updated = api.addLeadActivity(selectedLead.id, {
      type: activityType,
      description: descriptions[activityType],
      author: currentStaffRep
    });

    if (updated) {
      setLeads(api.getSalesLeads());
      setSelectedLead(updated);
      setActivityNote('');
      showToast(t('تم تسجيل النشاط في السجل الزمني للعميل', 'Activity logged to lead timeline'), 'success');
    }
  };

  const handleConvertToAccount = (leadId: string) => {
    const res = api.convertLeadToBusinessAccount(leadId);
    if (res.success) {
      setLeads(api.getSalesLeads());
      if (selectedLead?.id === leadId) {
        const fresh = api.getSalesLeads().find((l) => l.id === leadId) || null;
        setSelectedLead(fresh);
      }
      showToast(t(res.message_ar, res.message_en), 'success');
    }
  };

  // Staff Authentication: Employee Registration & OTP Verification Gate
  if (!isStaffAuthenticated) {
    return (
      <div className="bg-[#20241F] min-h-screen py-12 sm:py-16 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl text-right animate-in fade-in-50 duration-300">
          
          {/* Top Brand Identity */}
          <div className="flex items-center justify-between pb-4 border-b border-[#20241F]/10 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-[#20241F] text-[#D5FF3F] flex items-center justify-center font-black shadow-md">
                <Lock size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#18794E] font-bold block">
                  {t('بوابة موظفي المبيعات والشركات', 'STAFF SALES PORTAL')}
                </span>
                <h2 className="text-base sm:text-lg font-black text-[#20241F]">
                  {t('تسجيل دخول الموظف عبر رمز التحقق (OTP)', 'Staff Login & OTP Verification')}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage('home')}
              className="py-1.5 px-3 rounded-xl border border-[#20241F]/15 text-xs text-[#20241F]/70 hover:bg-[#F7F7F3] font-semibold transition-colors"
            >
              {t('متجر VAYRO', 'Storefront')}
            </button>
          </div>

          {/* Stepper Header */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <div
              className={`p-2.5 rounded-2xl border text-xs font-bold text-center transition-all ${
                authStep === 'register_and_request'
                  ? 'bg-[#20241F] text-[#D5FF3F] border-[#20241F] shadow-sm'
                  : 'bg-[#F7F7F3] text-[#20241F]/60 border-[#20241F]/10'
              }`}
            >
              <span>{t('١. تسجيل بيانات الموظف', '1. Staff Details')}</span>
            </div>
            <div
              className={`p-2.5 rounded-2xl border text-xs font-bold text-center transition-all ${
                authStep === 'verify_otp'
                  ? 'bg-[#20241F] text-[#D5FF3F] border-[#20241F] shadow-sm'
                  : 'bg-[#F7F7F3] text-[#20241F]/60 border-[#20241F]/10'
              }`}
            >
              <span>{t('٢. إدخال رمز التحقق (OTP)', '2. Verify OTP')}</span>
            </div>
          </div>

          {/* STEP 1: EMPLOYEE REGISTRATION & OTP REQUEST */}
          {authStep === 'register_and_request' ? (
            <div>
              {/* Quick Preset Accounts for Easy Demo */}
              <div className="mb-5 p-3 rounded-2xl bg-[#FAF9F5] border border-[#20241F]/10">
                <span className="text-[11px] font-bold text-[#20241F] block mb-2">
                  {t('اختر حساب موظف معتمد للتعبئة التلقائية السريعة:', 'Select verified employee profile to auto-fill:')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_STAFF.map((staff) => (
                    <button
                      key={staff.code}
                      type="button"
                      onClick={() => {
                        setEmployeeData({
                          fullName: staff.name,
                          employeeId: staff.code,
                          phone: staff.phone,
                          email: staff.email,
                          department: staff.dept
                        });
                        setOtpError('');
                      }}
                      className={`text-[11px] py-1 px-2.5 rounded-xl border transition-all ${
                        employeeData.employeeId === staff.code
                          ? 'bg-[#20241F] text-[#D5FF3F] border-[#20241F] font-bold shadow-xs'
                          : 'bg-white hover:bg-[#F7F7F3] text-[#20241F] border-[#20241F]/10'
                      }`}
                    >
                      {t(staff.title_ar, staff.title_en)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Staff Input Form */}
              <form onSubmit={handleRequestOtp} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#20241F] block mb-1">
                      {t('اسم الموظف الثلاثي', 'Full Employee Name')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={employeeData.fullName}
                      onChange={(e) => setEmployeeData({ ...employeeData, fullName: e.target.value })}
                      placeholder={t('مثال: كريم زكي محمود', 'e.g. Karim Zaki')}
                      className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs text-[#20241F] focus:outline-none focus:border-[#20241F]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#20241F] block mb-1">
                      {t('الكود الوظيفي (Employee ID)', 'Employee Badge ID')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      value={employeeData.employeeId}
                      onChange={(e) => setEmployeeData({ ...employeeData, employeeId: e.target.value })}
                      placeholder="EMP-101"
                      className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs font-mono font-bold text-[#20241F] focus:outline-none focus:border-[#20241F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#20241F] block mb-1">
                      {t('رقم الهاتف المسجل لاستلام الرمز', 'Egyptian Mobile for OTP')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        value={employeeData.phone}
                        onChange={(e) => setEmployeeData({ ...employeeData, phone: e.target.value })}
                        placeholder="01012345678"
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 pl-8 text-xs font-mono text-[#20241F] focus:outline-none focus:border-[#20241F]"
                      />
                      <Smartphone size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#20241F]/40" />
                    </div>
                    <span className="text-[10px] text-[#20241F]/50 mt-0.5 block">
                      {t('يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 (11 رقم)', 'Egyptian 11-digit mobile')}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#20241F] block mb-1">
                      {t('البريد الإلكتروني الوظيفي', 'Work Email')}
                    </label>
                    <input
                      type="email"
                      dir="ltr"
                      value={employeeData.email}
                      onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })}
                      placeholder="karim@vayromarket.com"
                      className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs text-[#20241F] focus:outline-none focus:border-[#20241F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#20241F] block mb-1">
                    {t('قطاع المبيعات المسؤول عنه', 'Sales Department')}
                  </label>
                  <select
                    value={employeeData.department}
                    onChange={(e) => setEmployeeData({ ...employeeData, department: e.target.value })}
                    className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs text-[#20241F] focus:outline-none focus:border-[#20241F]"
                  >
                    <option value="b2b_wholesale">{t('مبيعات تجارة الجملة والشركات (B2B)', 'B2B Wholesale Accounts')}</option>
                    <option value="vip_boutiques">{t('كبار العملاء والبوتيكات الفاخرة (VIP)', 'VIP Boutiques & Hospitality')}</option>
                    <option value="retail_distribution">{t('توزيع المحافظات والمعارض (Retail Distribution)', 'Regional Distribution')}</option>
                  </select>
                </div>

                {otpError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {otpError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#20241F] text-[#D5FF3F] hover:bg-black font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <KeyRound size={15} />
                  <span>
                    {isSendingOtp
                      ? t('جارٍ التحقق وتوليد رمز OTP...', 'Generating OTP...')
                      : t('طلب رمز التحقق (إرسال كود OTP)', 'Request OTP Code')}
                  </span>
                </button>
              </form>

              {/* Direct PIN Bypass for Convenience */}
              <div className="mt-5 pt-4 border-t border-[#20241F]/10 flex items-center justify-between text-[11px] text-[#20241F]/60">
                <span>{t('هل تملك رمز وصول سريع مباشر؟', 'Have direct manager PIN?')}</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsStaffAuthenticated(true);
                    setCurrentStaffRep(employeeData.fullName);
                    showToast(t('تم الدخول المباشر برمز المدير', 'Direct manager access granted'), 'success');
                  }}
                  className="font-bold text-[#18794E] hover:underline"
                >
                  {t('دخول سريع للمشرفين (PIN: 2026)', 'Manager Fast Pass (PIN: 2026)')}
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: VERIFY OTP CODE */
            <div className="space-y-4">
              {/* Notice of Dispatched SMS with Live Display for Testing */}
              <div className="p-4 rounded-2xl bg-[#F7F7F3] border border-[#20241F]/10 text-right space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#20241F]">
                  <Smartphone size={16} className="text-[#18794E]" />
                  <span>
                    {t(
                      `تم إرسال رمز الأمان إلى رقم: ${employeeData.phone}`,
                      `Verification code dispatched to: ${employeeData.phone}`
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-[#20241F]/60 leading-relaxed">
                  {t(
                    'أدخل الرمز المكون من 4 أرقام لتأكيد صلاحيات الدخول لمنظومة المبيعات.',
                    'Enter the 4-digit security code to authenticate your staff session.'
                  )}
                </p>

                {/* Highlighted OTP Code Badge */}
                <div className="p-3 rounded-xl bg-white border border-[#18794E]/30 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] text-[#18794E] font-bold block">
                      {t('رمز التحقق المُرسل لهذه الجلسة:', 'Dispatched OTP Code for this session:')}
                    </span>
                    <span className="text-xl font-mono font-black text-[#20241F] tracking-widest">
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
                    <span>{copiedOtp ? t('تم النسخ', 'Copied') : t('نسخ وتعبئة الرمز', 'Paste Code')}</span>
                  </button>
                </div>

                <div className="text-[10px] text-[#20241F]/50 flex items-center gap-1 pt-1">
                  <ShieldCheck size={12} className="text-[#18794E]" />
                  <span>{t('متوافق مع بوابات الرسائل النصية المصرية (VictoryLink / Twilio / Infobip).', 'Compatible with Egyptian SMS gateways.')}</span>
                </div>
              </div>

              {/* OTP Form */}
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
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
                    className="w-full bg-[#F7F7F3] border-2 border-[#20241F]/20 rounded-2xl py-3 px-4 text-center font-mono font-black text-2xl tracking-[0.5em] text-[#20241F] focus:outline-none focus:border-[#18794E] focus:ring-4 focus:ring-[#D5FF3F]/30"
                  />
                </div>

                {otpError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
                    {otpError}
                  </div>
                )}

                {/* Expiry Timer & Resend Controls */}
                <div className="flex items-center justify-between text-xs text-[#20241F]/60">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-[#18794E]" />
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
                  <span>{t('تأكيد الرمز والدخول إلى منظومة المبيعات', 'Verify & Enter CRM Portal')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthStep('register_and_request');
                    setOtpError('');
                  }}
                  className="w-full text-center text-xs text-[#20241F]/70 hover:text-[#20241F] font-bold block pt-1"
                >
                  {t('← تعديل بيانات الموظف أو تغيير رقم الهاتف', '← Back to edit staff information')}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F7F3] dark:bg-[#111411] text-[#20241F] dark:text-[#F3F5EF] min-h-screen py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* CRM Top Bar with Staff Persona & Store Return */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#20241F]/10 dark:border-[#353D35] gap-4 text-right">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#D5FF3F] rounded-[2px]" />
              <h1 className="text-2xl font-black text-[#20241F] dark:text-[#F3F5EF] tracking-tight">
                {t('منظومة المبيعات وإدارة العملاء المحتملين (Sales CRM)', 'VAYRO Sales CRM & Lead Pipeline')}
              </h1>
            </div>
            <p className="text-xs text-[#20241F]/60 dark:text-[#B5BDB3] mt-1">
              {t('إدارة خط المبيعات، عروض الأسعار، ومتابعات طلبات التوريد بالجملة للشركات.', 'Managing B2B wholesale opportunities, stages, and quotes.')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Rep Switcher */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#1A1F1A] border border-[#20241F]/15 dark:border-[#353D35] rounded-xl px-3 py-1.5 text-xs shadow-sm">
              <span className="text-[11px] text-[#20241F]/50 dark:text-[#B5BDB3]">{t('المسؤول الحالي:', 'Rep:')}</span>
              <select
                value={currentStaffRep}
                onChange={(e) => setCurrentStaffRep(e.target.value)}
                className="font-bold text-[#20241F] dark:text-[#F3F5EF] bg-transparent focus:outline-none cursor-pointer"
              >
                {STAFF_REPS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsNewLeadModalOpen(true)}
              className="py-2 px-4 rounded-xl bg-[#20241F] text-[#D5FF3F] text-xs font-bold hover:bg-black transition-all flex items-center gap-1.5 shadow-md"
            >
              <Plus size={15} />
              <span>{t('تسجيل فرصة بيعية جديدة', 'Register New Lead')}</span>
            </button>

            <button
              onClick={() => setCurrentPage('home')}
              className="py-2 px-3 rounded-xl border border-[#20241F]/15 bg-white text-[#20241F] text-xs font-bold hover:bg-[#ECEAE1] transition-colors"
            >
              {t('عرض المتجر', 'Storefront')}
            </button>

            <button
              onClick={() => {
                setIsStaffAuthenticated(false);
                localStorage.removeItem('vayro_staff_auth');
                setAuthStep('register_and_request');
                showToast(t('تم تسجيل خروج الموظف بنجاح', 'Staff logged out'), 'info');
              }}
              className="py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1"
              title={t('تسجيل الخروج من البوابة', 'Sign out')}
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">{t('خروج', 'Sign Out')}</span>
            </button>
          </div>
        </div>

        {/* Sales Portal Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 my-6 pb-2 border-b border-[#20241F]/10 dark:border-[#353D35]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSalesTab('pricing')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                salesTab === 'pricing'
                  ? 'bg-[#20241F] dark:bg-[#D5FF3F] text-[#D5FF3F] dark:text-[#111411] shadow-sm'
                  : 'bg-white dark:bg-[#1A1F1A] text-[#646A63] dark:text-[#B5BDB3] hover:text-[#20241F] dark:hover:text-[#F3F5EF] border border-[#E2E5DE] dark:border-[#353D35]'
              }`}
            >
              <Tag size={14} />
              <span>{t('قائمة أسعار وعمولات المناديب', 'Sales Price Matrix')}</span>
            </button>

            <button
              onClick={() => setSalesTab('orders')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                salesTab === 'orders'
                  ? 'bg-[#20241F] dark:bg-[#D5FF3F] text-[#D5FF3F] dark:text-[#111411] shadow-sm'
                  : 'bg-white dark:bg-[#1A1F1A] text-[#646A63] dark:text-[#B5BDB3] hover:text-[#20241F] dark:hover:text-[#F3F5EF] border border-[#E2E5DE] dark:border-[#353D35]'
              }`}
            >
              <Package size={14} />
              <span>{t('طلباتي والعمولات المستحقة', 'My Orders & Commissions')}</span>
            </button>

            <button
              onClick={() => setSalesTab('pipeline')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                salesTab === 'pipeline'
                  ? 'bg-[#20241F] dark:bg-[#D5FF3F] text-[#D5FF3F] dark:text-[#111411] shadow-sm'
                  : 'bg-white dark:bg-[#1A1F1A] text-[#646A63] dark:text-[#B5BDB3] hover:text-[#20241F] dark:hover:text-[#F3F5EF] border border-[#E2E5DE] dark:border-[#353D35]'
              }`}
            >
              <Users size={14} />
              <span>{t('سجل الفرص والعملاء (CRM)', 'Leads & Pipeline')}</span>
            </button>

            <button
              onClick={() => setSalesTab('targets')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                salesTab === 'targets'
                  ? 'bg-[#20241F] dark:bg-[#D5FF3F] text-[#D5FF3F] dark:text-[#111411] shadow-sm'
                  : 'bg-white dark:bg-[#1A1F1A] text-[#646A63] dark:text-[#B5BDB3] hover:text-[#20241F] dark:hover:text-[#F3F5EF] border border-[#E2E5DE] dark:border-[#353D35]'
              }`}
            >
              <TrendingUp size={14} />
              <span>{t('مؤشرات الأداء والأهداف', 'KPIs & Targets')}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setOrderModalProduct(null);
              setIsCreateOrderModalOpen(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-[#18794E] dark:bg-[#65C98A] text-white dark:text-[#111411] hover:brightness-105 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus size={15} />
            <span>{t('تسجيل طلب عميل جديد بسعر المندوب', 'New Sales Order')}</span>
          </button>
        </div>

        {/* Tab 1: Pricing Matrix */}
        {salesTab === 'pricing' && (
          <SalesPriceCatalog
            onSelectProductForOrder={(p) => {
              setOrderModalProduct(p);
              setIsCreateOrderModalOpen(true);
            }}
          />
        )}

        {/* Tab 2: Orders */}
        {salesTab === 'orders' && (
          <SalesOrdersList
            orders={allOrders}
            onOpenCreateOrder={() => {
              setOrderModalProduct(null);
              setIsCreateOrderModalOpen(true);
            }}
          />
        )}

        {/* Tab 3: Targets */}
        {salesTab === 'targets' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1A1F1A] p-6 rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E5DE] dark:border-[#353D35] mb-6 gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#18794E] dark:text-[#65C98A] font-bold">
                    {t('لوحة المتابعة الشهرية', 'MONTHLY PERFORMANCE & TARGETS')}
                  </span>
                  <h3 className="text-xl font-bold font-display text-[#20241F] dark:text-[#F3F5EF] mt-1">
                    {t('المستهدف البيعي لشهري أكتوبر ونوفمبر 2026', 'Sales Target for Q4 2026')}
                  </h3>
                  <p className="text-xs text-[#646A63] dark:text-[#B5BDB3] mt-0.5">
                    {t('المسؤول:', 'Representative:')} <strong className="text-[#20241F] dark:text-[#F3F5EF]">{currentStaffRep}</strong> (EMP-101)
                  </p>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-center">
                  <span className="text-[10px] font-mono uppercase text-[#18794E] dark:text-[#65C98A] block font-bold">
                    {t('نسبة الإنجاز', 'ACHIEVED')}
                  </span>
                  <span className="text-2xl font-black text-[#18794E] dark:text-[#65C98A] font-mono">
                    78%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-bold text-[#20241F] dark:text-[#F3F5EF]">
                  <span>{t('المبيعات المحققة:', 'Achieved Sales:')} 118,500 ج.م</span>
                  <span>{t('المستهدف المطلوب:', 'Target:')} 150,000 ج.م</span>
                </div>
                <div className="h-3 w-full bg-[#F0EEE6] dark:bg-[#232923] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#18794E] to-[#D5FF3F] rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-right">
                <div className="p-4 rounded-2xl bg-[#F7F7F3] dark:bg-[#232923] border border-[#E2E5DE] dark:border-[#353D35]">
                  <span className="text-[10px] font-mono uppercase text-[#646A63] dark:text-[#B5BDB3] block">
                    {t('إجمالي العمولات المكتسبة', 'EARNED COMMISSIONS')}
                  </span>
                  <p className="text-xl font-black text-[#18794E] dark:text-[#65C98A] font-mono mt-1">
                    14,280 ج.م
                  </p>
                  <p className="text-[10px] text-[#646A63] dark:text-[#B5BDB3] mt-0.5">{t('تم اعتمادها للصرف', 'Approved for payout')}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F7F3] dark:bg-[#232923] border border-[#E2E5DE] dark:border-[#353D35]">
                  <span className="text-[10px] font-mono uppercase text-[#646A63] dark:text-[#B5BDB3] block">
                    {t('الصفقات الناجحة المغلقة', 'CLOSED DEALS')}
                  </span>
                  <p className="text-xl font-black text-[#20241F] dark:text-[#F3F5EF] font-mono mt-1">
                    24 صفقة
                  </p>
                  <p className="text-[10px] text-[#646A63] dark:text-[#B5BDB3] mt-0.5">{t('معدل نجاح 38%', '38% conversion rate')}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F7F3] dark:bg-[#232923] border border-[#E2E5DE] dark:border-[#353D35]">
                  <span className="text-[10px] font-mono uppercase text-[#646A63] dark:text-[#B5BDB3] block">
                    {t('بونص تحقيق التارجت', 'TARGET BONUS')}
                  </span>
                  <p className="text-xl font-black text-[#20241F] dark:text-[#D5FF3F] font-mono mt-1">
                    5,000 ج.م
                  </p>
                  <p className="text-[10px] text-[#646A63] dark:text-[#B5BDB3] mt-0.5">{t('يصرف عند بلوغ 100%', 'Upon reaching 100%')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Pipeline */}
        {salesTab === 'pipeline' && (
          <div>
            {/* 4 Pipeline Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6 text-right">
          <div className="bg-white p-5 rounded-3xl border border-[#20241F]/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#18794E] font-bold">
                {t('إجمالي الفرص النشطة', 'TOTAL LEADS')}
              </p>
              <h3 className="text-2xl font-black text-[#20241F] mt-1">{stats.totalLeads}</h3>
              <p className="text-[10px] text-[#20241F]/50 mt-0.5">{t('مسجلة في قاعدة البيانات', 'In Sales Database')}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#F7F7F3] text-[#20241F] flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#20241F]/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#18794E] font-bold">
                {t('قيمة الصفقات المتوقعة', 'PIPELINE VALUE')}
              </p>
              <h3 className="text-2xl font-black text-[#20241F] mt-1">
                {(stats.totalPipelineValue / 1000).toFixed(0)}k <span className="text-xs font-bold">ج.م</span>
              </h3>
              <p className="text-[10px] text-[#20241F]/50 mt-0.5">{t('إجمالي قيمة التوريد', 'Expected revenue')}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#D5FF3F] text-[#20241F] flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#20241F]/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#18794E] font-bold">
                {t('نسبة النجاح والتحويل', 'CONVERSION RATE')}
              </p>
              <h3 className="text-2xl font-black text-[#18794E] mt-1">{stats.conversionRate}%</h3>
              <p className="text-[10px] text-[#20241F]/50 mt-0.5">{stats.wonCount} {t('صفقات تم إغلاقها', 'Won deals')}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#18794E] flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#20241F]/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-rose-600 font-bold">
                {t('متابعات عاجلة اليوم', 'URGENT FOLLOW-UPS')}
              </p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{stats.urgentCount}</h3>
              <p className="text-[10px] text-[#20241F]/50 mt-0.5">{t('تتطلب اتصال فوري', 'High priority alerts')}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>

        {/* Filter Bar: View Toggle, Stage, Rep, Search */}
        <div className="bg-white p-4 rounded-3xl border border-[#20241F]/10 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* View Switcher */}
            <div className="flex bg-[#F7F7F3] p-1 rounded-xl border border-[#20241F]/10">
              <button
                onClick={() => setViewMode('kanban')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'kanban' ? 'bg-[#20241F] text-[#D5FF3F] shadow-sm' : 'text-[#20241F]/60'
                }`}
              >
                {t('لوحة كانبان (المراحل)', 'Kanban Board')}
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table' ? 'bg-[#20241F] text-[#D5FF3F] shadow-sm' : 'text-[#20241F]/60'
                }`}
              >
                {t('جدول الفرص', 'Data Table')}
              </button>
            </div>

            {/* Stage Filter */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-[#F7F7F3] border border-[#20241F]/10 rounded-xl py-2 px-3 text-xs font-bold text-[#20241F] focus:outline-none"
            >
              <option value="all">{t('جميع المراحل', 'All Stages')}</option>
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>{t(s.label_ar, s.label_en)}</option>
              ))}
            </select>

            {/* Rep Filter */}
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="bg-[#F7F7F3] border border-[#20241F]/10 rounded-xl py-2 px-3 text-xs font-bold text-[#20241F] focus:outline-none"
            >
              <option value="all">{t('جميع الموظفين', 'All Representatives')}</option>
              {STAFF_REPS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Search Field */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('بحث بالاسم، المنشأة، الهاتف...', 'Search name, company, phone...')}
              className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs text-right focus:outline-none"
            />
            <Search size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-[#20241F]/40" />
          </div>
        </div>

        {/* KANBAN BOARD VIEW */}
        {viewMode === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar text-right">
            {STAGES.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.stage === stage.key);
              const stageValue = stageLeads.reduce((s, l) => s + (l.estimatedDealValue || 0), 0);

              return (
                <div
                  key={stage.key}
                  className="w-72 shrink-0 bg-white rounded-3xl p-4 border border-[#20241F]/10 shadow-sm flex flex-col max-h-[750px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#20241F]/10 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                      <h3 className="font-bold text-xs text-[#20241F]">
                        {t(stage.label_ar, stage.label_en)}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#F7F7F3] text-[10px] font-mono font-bold text-[#20241F]">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Stage Value Metric */}
                  <div className="text-[10px] text-[#20241F]/50 font-mono mb-3">
                    {stageValue > 0 ? `${stageValue.toLocaleString()} ج.م` : '—'}
                  </div>

                  {/* Cards Container */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {stageLeads.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-[#20241F]/40 border-2 border-dashed border-[#20241F]/5 rounded-2xl">
                        {t('لا توجد فرص حالية', 'Empty Stage')}
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="p-4 rounded-2xl bg-[#F7F7F3] hover:bg-[#ECEAE1] border border-[#20241F]/10 cursor-pointer transition-all hover:shadow-md group"
                        >
                          {/* Priority and Deal Value */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-[10px] text-[#20241F]/50">{lead.leadNumber}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                lead.priority === 'urgent'
                                  ? 'bg-rose-100 text-rose-700 font-black'
                                  : lead.priority === 'high'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {lead.priority}
                            </span>
                          </div>

                          <h4 className="font-bold text-xs text-[#20241F] group-hover:text-[#18794E] line-clamp-1">
                            {lead.businessName}
                          </h4>
                          <p className="text-[11px] text-[#20241F]/70 mt-0.5">{lead.fullName}</p>

                          <div className="mt-3 pt-2.5 border-t border-[#20241F]/10 flex items-center justify-between text-[11px]">
                            <span className="font-black text-[#20241F] font-mono">
                              {lead.estimatedDealValue.toLocaleString()} ج.م
                            </span>
                            <span className="text-[10px] text-[#20241F]/60 flex items-center gap-1">
                              <MapPin size={11} />
                              <span>{lead.governorate}</span>
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-[10px] text-[#20241F]/60">
                            <span>{lead.assignedRep}</span>
                            <span className="text-[#18794E] font-semibold">{lead.source}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DATA TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-3xl border border-[#20241F]/10 shadow-sm overflow-hidden text-right">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right divide-y divide-[#20241F]/10">
                <thead className="bg-[#F7F7F3] text-[#20241F] font-bold">
                  <tr>
                    <th className="py-3.5 px-4">{t('رقم الفرصة', 'ID')}</th>
                    <th className="py-3.5 px-4">{t('اسم العميل / المنشأة', 'Lead / Business')}</th>
                    <th className="py-3.5 px-4">{t('رقم الهاتف والواتساب', 'Phone / WhatsApp')}</th>
                    <th className="py-3.5 px-4">{t('المحافظة', 'Governorate')}</th>
                    <th className="py-3.5 px-4">{t('المرحلة الحالية', 'Stage')}</th>
                    <th className="py-3.5 px-4">{t('القيمة المتوقعة', 'Value')}</th>
                    <th className="py-3.5 px-4">{t('المسؤول', 'Rep')}</th>
                    <th className="py-3.5 px-4">{t('الإجراء التالي', 'Next Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#20241F]/5">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-[#F7F7F3] cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#20241F]">{lead.leadNumber}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#20241F]">{lead.businessName}</div>
                        <div className="text-[11px] text-[#20241F]/60">{lead.fullName}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono" dir="ltr">{lead.primaryPhone}</td>
                      <td className="py-3.5 px-4">{lead.governorate}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#D5FF3F] text-[#20241F]">
                          {api.getStageLabel(lead.stage)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black font-mono">{lead.estimatedDealValue.toLocaleString()} ج.م</td>
                      <td className="py-3.5 px-4">{lead.assignedRep}</td>
                      <td className="py-3.5 px-4 text-[#20241F]/70 max-w-xs truncate">{lead.nextAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </div>
        )}

      </div>

      {/* LEAD PROFILE DETAIL MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-[#20241F]/70 backdrop-blur-sm flex justify-end">
          <div className="flex-1" onClick={() => setSelectedLead(null)} />
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl p-6 sm:p-8 flex flex-col text-right overflow-y-auto animate-in slide-in-from-right duration-300">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#20241F]/10 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#18794E]">{selectedLead.leadNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                    {selectedLead.priority}
                  </span>
                </div>
                <h2 className="text-xl font-black text-[#20241F] mt-1">{selectedLead.businessName}</h2>
                <p className="text-xs text-[#20241F]/60">{selectedLead.fullName} • {selectedLead.businessActivity}</p>
              </div>

              <button onClick={() => setSelectedLead(null)} className="p-1 rounded-xl hover:bg-black/5">
                <X size={20} />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="p-4 rounded-2xl bg-[#F7F7F3] border border-[#20241F]/10 mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-[#20241F]/60 block mb-1">{t('تغيير مرحلة الفرصة:', 'Change Stage:')}</span>
                <select
                  value={selectedLead.stage}
                  onChange={(e) => handleUpdateStage(selectedLead.id, e.target.value as LeadStage)}
                  className="bg-white border border-[#20241F]/20 rounded-xl py-1.5 px-3 text-xs font-bold text-[#20241F]"
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>{t(s.label_ar, s.label_en)}</option>
                  ))}
                </select>
              </div>

              {selectedLead.stage !== 'won' && (
                <button
                  onClick={() => handleConvertToAccount(selectedLead.id)}
                  className="py-2.5 px-5 rounded-xl bg-[#18794E] text-white hover:bg-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Award size={15} />
                  <span>{t('تحويل لعميل B2B معتمد', 'Convert to Verified B2B Account')}</span>
                </button>
              )}
            </div>

            {/* Contact & Business Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6 pb-6 border-b border-[#20241F]/10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#18794E] mb-1">{t('بيانات الاتصال', 'Contact Info')}</p>
                <p className="font-semibold text-[#20241F]">موبايل: <span dir="ltr">{selectedLead.primaryPhone}</span></p>
                {selectedLead.email && <p className="text-[#20241F]/70">{selectedLead.email}</p>}
                <p className="text-[#20241F]/70">{selectedLead.governorate} - {selectedLead.city}</p>
                <p className="text-[#20241F]/70">{t('طريقة التواصل المفضلة:', 'Preferred:')} {selectedLead.preferredContactMethod}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#18794E] mb-1">{t('بيانات الأعمال والتوريد', 'Commercial Deal')}</p>
                <p className="font-semibold text-[#20241F]">القيمة المقدرة: <span className="font-mono font-black">{selectedLead.estimatedDealValue.toLocaleString()} ج.م</span></p>
                <p className="text-[#20241F]/70">الكمية المتوقعة: {selectedLead.expectedPurchaseVolume}</p>
                <p className="text-[#20241F]/70">تكرار الشراء: {selectedLead.expectedBuyingFrequency}</p>
                <p className="text-[#20241F]/70">المصدر: {selectedLead.source}</p>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="mb-6 pb-6 border-b border-[#20241F]/10">
              <h4 className="text-xs font-bold text-[#20241F] mb-1">{t('ملاحظات المبيعات الداخلية:', 'Internal Sales Notes:')}</h4>
              <p className="text-xs text-[#20241F]/80 bg-[#F7F7F3] p-3 rounded-xl border border-[#20241F]/5">
                {selectedLead.internalNotes || t('لا توجد ملاحظات مسجلة', 'No notes')}
              </p>
            </div>

            {/* Log New Activity Note Form */}
            <form onSubmit={handleAddActivity} className="mb-6 p-4 rounded-2xl bg-[#F7F7F3] border border-[#20241F]/10 space-y-3">
              <h4 className="text-xs font-bold text-[#20241F]">{t('تسجيل نشاط أو مكالمة جديدة:', 'Log Call / Meeting / Note:')}</h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActivityType('call')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold ${
                    activityType === 'call' ? 'bg-[#20241F] text-[#D5FF3F]' : 'bg-white text-[#20241F]'
                  }`}
                >
                  {t('مكالمة هاتفية', 'Call')}
                </button>
                <button
                  type="button"
                  onClick={() => setActivityType('whatsapp')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold ${
                    activityType === 'whatsapp' ? 'bg-[#20241F] text-[#D5FF3F]' : 'bg-white text-[#20241F]'
                  }`}
                >
                  {t('محادثة واتساب', 'WhatsApp')}
                </button>
                <button
                  type="button"
                  onClick={() => setActivityType('meeting')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold ${
                    activityType === 'meeting' ? 'bg-[#20241F] text-[#D5FF3F]' : 'bg-white text-[#20241F]'
                  }`}
                >
                  {t('اجتماع / مقابلة', 'Meeting')}
                </button>
                <button
                  type="button"
                  onClick={() => setActivityType('note')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold ${
                    activityType === 'note' ? 'bg-[#20241F] text-[#D5FF3F]' : 'bg-white text-[#20241F]'
                  }`}
                >
                  {t('ملاحظة', 'Note')}
                </button>
              </div>

              <textarea
                rows={2}
                required
                value={activityNote}
                onChange={(e) => setActivityNote(e.target.value)}
                placeholder={t('اكتب ملخص المكالمة أو ما تم الاتفاق عليه...', 'Write activity summary...')}
                className="w-full bg-white border border-[#20241F]/15 rounded-xl p-2.5 text-xs text-right"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-[#20241F] text-[#D5FF3F] text-xs font-bold"
                >
                  {t('حفظ النشاط في السجل', 'Save to Timeline')}
                </button>
              </div>
            </form>

            {/* Activity Timeline */}
            <div>
              <h4 className="text-xs font-bold text-[#20241F] mb-3 flex items-center gap-1.5">
                <Clock size={14} />
                <span>{t('السجل الزمني للتواصل مع العميل', 'Communication Timeline')}</span>
              </h4>

              <div className="space-y-3">
                {selectedLead.activities.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-white border border-[#20241F]/10 text-xs">
                    <div className="flex justify-between items-center text-[10px] text-[#20241F]/50 mb-1">
                      <span className="font-bold text-[#18794E]">{act.author}</span>
                      <span>{new Date(act.date).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <p className="text-[#20241F]">{act.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MULTI-SECTION NEW SALES LEAD REGISTRATION MODAL */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#20241F]/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#20241F]/10 overflow-hidden text-right max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 bg-[#F7F7F3] border-b border-[#20241F]/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#18794E] font-bold block">
                  {t('استمارة تسجيل فرصة بيعية داخلية', 'INTERNAL SALES LEAD ENTRY')}
                </span>
                <h3 className="text-lg font-black text-[#20241F] mt-0.5">
                  {t('إضافة عميل محتمل جديد لمنظومة CRM', 'Register New Sales Lead')}
                </h3>
              </div>
              <button onClick={() => setIsNewLeadModalOpen(false)} className="p-1.5 rounded-xl hover:bg-black/5">
                <X size={18} />
              </button>
            </div>

            {/* Stepper Tabs */}
            <div className="px-6 py-3 bg-[#F7F7F3]/50 border-b border-[#20241F]/5 flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFormStep(1)}
                className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all text-center ${
                  formStep === 1 ? 'bg-[#20241F] text-[#D5FF3F]' : 'bg-white text-[#20241F]/60'
                }`}
              >
                1. {t('بيانات الاتصال', 'Contact Info')}
              </button>
              <button
                type="button"
                onClick={() => setFormStep(2)}
                className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all text-center ${
                  formStep === 2 ? 'bg-[#20241F] text-[#D5FF3F]' : 'bg-white text-[#20241F]/60'
                }`}
              >
                2. {t('بيانات المنشأة والتجارة', 'Business Details')}
              </button>
              <button
                type="button"
                onClick={() => setFormStep(3)}
                className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all text-center ${
                  formStep === 3 ? 'bg-[#20241F] text-[#D5FF3F]' : 'bg-white text-[#20241F]/60'
                }`}
              >
                3. {t('بيانات المبيعات والمتابعة', 'Sales Tracking')}
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleCreateLead} className="p-6 flex-1 overflow-y-auto space-y-4">
              
              {/* Step 1: Contact Information */}
              {formStep === 1 && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('اسم العميل أو جهة الاتصال *', 'Full Name *')}</label>
                      <input
                        type="text"
                        required
                        value={newLeadForm.fullName}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, fullName: e.target.value })}
                        placeholder={t('اسم مسؤول المشتريات بالكامل', 'Procurement lead')}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('رقم الموبايل الرئيسي *', 'Primary Phone *')}</label>
                      <input
                        type="tel"
                        dir="ltr"
                        required
                        value={newLeadForm.primaryPhone}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, primaryPhone: e.target.value })}
                        placeholder="01xxxxxxxxx"
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('رقم هاتف ثانوي (اختياري)', 'Secondary Phone')}</label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={newLeadForm.secondaryPhone}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, secondaryPhone: e.target.value })}
                        placeholder="01xxxxxxxxx"
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('البريد الإلكتروني للعمل', 'Email')}</label>
                      <input
                        type="email"
                        dir="ltr"
                        value={newLeadForm.email}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                        placeholder="contact@company.eg"
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('المحافظة', 'Governorate')}</label>
                      <select
                        value={newLeadForm.governorate}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, governorate: e.target.value })}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      >
                        {EGYPTIAN_GOVERNORATES.map((g) => (
                          <option key={g.id} value={g.name_ar}>{t(g.name_ar, g.name_en)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('المدينة أو الحي', 'City / Area')}</label>
                      <input
                        type="text"
                        value={newLeadForm.city}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                        placeholder={t('مثال: مدينة نصر، سموحة', 'e.g. Nasr City')}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#20241F] block mb-1">{t('طريقة التواصل المفضلة', 'Preferred Contact')}</label>
                    <div className="flex gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="contactMethod"
                          checked={newLeadForm.preferredContactMethod === 'whatsapp'}
                          onChange={() => setNewLeadForm({ ...newLeadForm, preferredContactMethod: 'whatsapp' })}
                        />
                        <span>واتساب (WhatsApp)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="contactMethod"
                          checked={newLeadForm.preferredContactMethod === 'phone'}
                          onChange={() => setNewLeadForm({ ...newLeadForm, preferredContactMethod: 'phone' })}
                        />
                        <span>مكالمة هاتفية مباشرة</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="contactMethod"
                          checked={newLeadForm.preferredContactMethod === 'email'}
                          onChange={() => setNewLeadForm({ ...newLeadForm, preferredContactMethod: 'email' })}
                        />
                        <span>البريد الإلكتروني</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setFormStep(2)}
                      className="py-2.5 px-6 rounded-xl bg-[#20241F] text-[#D5FF3F] text-xs font-bold"
                    >
                      {t('التالي: بيانات المنشأة ←', 'Next: Business Details →')}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Business Details */}
              {formStep === 2 && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('اسم المتجر أو الشركة *', 'Business Name *')}</label>
                      <input
                        type="text"
                        required
                        value={newLeadForm.businessName}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, businessName: e.target.value })}
                        placeholder={t('مثال: محلات النيل للأزياء', 'e.g. Nile Fashion Stores')}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('نوع النشاط التجاري', 'Customer Type')}</label>
                      <select
                        value={newLeadForm.customerType}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, customerType: e.target.value as any })}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      >
                        <option value="boutique">{t('بوتيك أزياء مستقل', 'Independent Boutique')}</option>
                        <option value="retail_shop">{t('متجر تجزئة', 'Retail Shop')}</option>
                        <option value="wholesaler">{t('تاجر جملة / موزع', 'Wholesaler / Distributor')}</option>
                        <option value="factory">{t('مصنع أو ورشة نسيج', 'Factory')}</option>
                        <option value="individual">{t('فرد / مشتري كميات خاصة', 'Individual Large Buyer')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('النشاط الفعلي بالتفصيل', 'Business Activity')}</label>
                      <input
                        type="text"
                        value={newLeadForm.businessActivity}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, businessActivity: e.target.value })}
                        placeholder={t('تجارة ملابس وأحذية حريمي ورجالي', 'Retail apparel & accessories')}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('موقع أو حساب إنستجرام للنشاط', 'Website or Instagram')}</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={newLeadForm.websiteOrSocial}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, websiteOrSocial: e.target.value })}
                        placeholder="instagram.com/shop_name"
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('الكمية المتوقعة لكل طلب', 'Expected Volume')}</label>
                      <input
                        type="text"
                        value={newLeadForm.expectedPurchaseVolume}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, expectedPurchaseVolume: e.target.value })}
                        placeholder="50-150 قطعة"
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('القيمة التقديرية للصفقة (ج.م)', 'Deal Value (EGP)')}</label>
                      <input
                        type="number"
                        value={newLeadForm.estimatedDealValue}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedDealValue: Number(e.target.value) })}
                        placeholder="100000"
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('السجل التجاري أو الرقم الضريبي (اختياري للشركات)', 'Tax ID / Commercial Reg')}</label>
                      <input
                        type="text"
                        value={newLeadForm.taxOrCommercialId}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, taxOrCommercialId: e.target.value })}
                        placeholder="748-xxx-xxx"
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setFormStep(1)}
                      className="py-2 px-4 rounded-xl border text-xs"
                    >
                      {t('← السابق', '← Previous')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStep(3)}
                      className="py-2.5 px-6 rounded-xl bg-[#20241F] text-[#D5FF3F] text-xs font-bold"
                    >
                      {t('التالي: بيانات المبيعات والمتابعة ←', 'Next: Sales Tracking →')}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Sales Information */}
              {formStep === 3 && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('مصدر الفرصة (Source)', 'Lead Source')}</label>
                      <select
                        value={newLeadForm.source}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value as any })}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      >
                        <option value="Wholesale Portal Request">{t('طلب من صفحة الجملة بالمتجر', 'Wholesale Portal')}</option>
                        <option value="Website Inquiry">{t('استفسار مباشر من الموقع', 'Website Direct')}</option>
                        <option value="Instagram">{t('حملة إنستجرام وتواصل اجتماعي', 'Instagram / Social')}</option>
                        <option value="Referral">{t('ترشيح من عميل سابق', 'Referral')}</option>
                        <option value="Direct Call">{t('اتصال هاتفي مباشر للمبيعات', 'Direct Call')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('الموظف المسؤول (Assigned Rep)', 'Assigned Rep')}</label>
                      <select
                        value={newLeadForm.assignedRep}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, assignedRep: e.target.value })}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      >
                        {STAFF_REPS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('المرحلة الأولية في الـ Pipeline', 'Initial Stage')}</label>
                      <select
                        value={newLeadForm.stage}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, stage: e.target.value as any })}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      >
                        {STAGES.map((s) => (
                          <option key={s.key} value={s.key}>{t(s.label_ar, s.label_en)}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('الأولوية', 'Priority')}</label>
                      <select
                        value={newLeadForm.priority}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, priority: e.target.value as any })}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      >
                        <option value="urgent">{t('عاجلة جدًا (Urgent)', 'Urgent')}</option>
                        <option value="high">{t('أولوية مرتفعة (High)', 'High')}</option>
                        <option value="medium">{t('متوسطة (Medium)', 'Medium')}</option>
                        <option value="low">{t('عادية (Low)', 'Low')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('تاريخ المتابعة القادمة', 'Next Follow-up')}</label>
                      <input
                        type="date"
                        value={newLeadForm.nextFollowUpDate}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, nextFollowUpDate: e.target.value })}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('الإجراء التالي المطلوب', 'Next Action')}</label>
                      <input
                        type="text"
                        value={newLeadForm.nextAction}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, nextAction: e.target.value })}
                        placeholder={t('مكالمة واتساب وإرسال عينات', 'Follow up on quote')}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-[#20241F] block mb-1">{t('ملاحظات مبيعات سرية وداخلية', 'Internal Sales Notes')}</label>
                      <textarea
                        rows={2}
                        value={newLeadForm.internalNotes}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, internalNotes: e.target.value })}
                        placeholder={t('اكتب أية تفاصيل خاصة بالسعر المطلوب أو انطباع مكالمة المبيعات...', 'Confidential notes...')}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl p-2.5 text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setFormStep(2)}
                      className="py-2 px-4 rounded-xl border text-xs"
                    >
                      {t('← السابق', '← Previous')}
                    </button>
                    <button
                      type="submit"
                      className="py-3 px-8 rounded-xl bg-[#20241F] text-[#D5FF3F] text-xs font-bold shadow-lg"
                    >
                      {t('تأكيد وحفظ الفرصة في CRM', 'Register Lead in CRM')}
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

      {/* SALES CREATE ORDER MODAL */}
      {isCreateOrderModalOpen && (
        <SalesCreateOrderModal
          initialProduct={orderModalProduct}
          onClose={() => setIsCreateOrderModalOpen(false)}
          onOrderCreated={(newOrd) => {
            setAllOrders(api.getSavedOrders());
            setSalesTab('orders');
          }}
        />
      )}

    </div>
  );
};
