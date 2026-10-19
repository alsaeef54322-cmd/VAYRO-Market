import {
  Product,
  Category,
  Order,
  CartItem,
  WholesaleInquiry,
  EgyptianGovernorate,
  UserAccount,
  AddressItem,
  ReturnRequest,
  SupportTicket,
  SalesLead,
  LeadStage,
  LeadPriority,
  LeadActivity,
  ProductReview,
  Supplier,
  StaffMember,
  AuditLogEntry,
  FinancialSummary
} from '../types';
import { PRODUCTS, CATEGORIES, EGYPTIAN_GOVERNORATES, SUPPLIERS, STAFF_MEMBERS } from '../data/products';

export interface FilterParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  inStockOnly?: boolean;
  sortBy?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    isDemoMode: boolean;
    backendDriver: string;
    total?: number;
  };
}

class ApiService {
  private isDemoMode: boolean = true;
  private ordersStorageKey = 'vayro_demo_orders';
  private inquiriesStorageKey = 'vayro_demo_inquiries';
  private usersStorageKey = 'vayro_customer_accounts';
  private currentSessionKey = 'vayro_current_session';
  private addressesStorageKey = 'vayro_user_addresses';
  private returnsStorageKey = 'vayro_return_requests';
  private ticketsStorageKey = 'vayro_support_tickets';
  private leadsStorageKey = 'vayro_crm_sales_leads';
  private reviewsStorageKey = 'vayro_product_reviews';
  private productsStorageKey = 'vayro_managed_products';
  private suppliersStorageKey = 'vayro_suppliers';
  private staffStorageKey = 'vayro_staff_roster';
  private auditLogsStorageKey = 'vayro_audit_logs';

  constructor() {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (apiUrl) {
      this.isDemoMode = false;
    }
    this.initDefaultCRMData();
    this.initDefaultReviews();
    this.initDefaultAuditLogs();
  }

  getDemoStatus() {
    return {
      isDemoMode: this.isDemoMode,
      notice_ar: '',
      notice_en: ''
    };
  }

  // ==========================================
  // CUSTOMER AUTHENTICATION & PROFILE
  // ==========================================

  async registerCustomer(payload: {
    name: string;
    phone: string;
    password: string;
    email?: string;
    governorateId?: string;
    city?: string;
    addressLine?: string;
  }): Promise<{ success: boolean; user?: UserAccount; error_ar?: string; error_en?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const cleanPhone = payload.phone.replace(/[\s-]/g, '');
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return {
        success: false,
        error_ar: 'رقم الهاتف يجب أن يكون رقم مصري صحيح مكون من 11 رقم يبدأ بـ 010 أو 011 أو 012 أو 015',
        error_en: 'Phone must be a valid 11-digit Egyptian mobile number (010, 011, 012, 015)'
      };
    }

    if (!payload.name || payload.name.trim().length < 3) {
      return {
        success: false,
        error_ar: 'الاسم بالكامل يجب ألا يقل عن 3 أحرف',
        error_en: 'Full name must be at least 3 characters'
      };
    }

    if (!payload.password || payload.password.length < 6) {
      return {
        success: false,
        error_ar: 'كلمة المرور يجب ألا تقل عن 6 خانات',
        error_en: 'Password must be at least 6 characters'
      };
    }

    const users = this.getStoredUsers();
    const existing = users.find((u) => u.phone === cleanPhone);
    if (existing) {
      return {
        success: false,
        error_ar: 'يوجد حساب مسجل بالفعل برقم الهاتف هذا. يرجى تسجيل الدخول.',
        error_en: 'An account with this phone number already exists. Please sign in.'
      };
    }

    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      name: payload.name.trim(),
      phone: cleanPhone,
      email: payload.email?.trim() || undefined,
      governorateId: payload.governorateId || 'cairo',
      city: payload.city?.trim() || 'القاهرة',
      addressLine: payload.addressLine?.trim() || '',
      createdAt: new Date().toISOString(),
      communicationPreferences: {
        smsUpdates: true,
        whatsappAlerts: true,
        newsletter: true
      }
    };

    users.push(newUser);
    localStorage.setItem(this.usersStorageKey, JSON.stringify(users));
    localStorage.setItem(this.currentSessionKey, JSON.stringify(newUser));

    // Also register default address if provided
    if (payload.addressLine) {
      this.addAddress(newUser.id, {
        label: 'العنوان الرئيسي',
        recipientName: newUser.name,
        phone: newUser.phone,
        governorateId: newUser.governorateId || 'cairo',
        city: newUser.city || 'القاهرة',
        addressLine: payload.addressLine,
        isDefault: true
      });
    }

    return { success: true, user: newUser };
  }

  async loginCustomer(credentials: {
    phone: string;
    password?: string;
  }): Promise<{ success: boolean; user?: UserAccount; error_ar?: string; error_en?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const cleanPhone = credentials.phone.replace(/[\s-]/g, '');
    const users = this.getStoredUsers();
    let user = users.find((u) => u.phone === cleanPhone);

    // If initial demo login, create default account if not exists
    if (!user && cleanPhone === '01012345678') {
      user = {
        id: 'usr_default_cairo',
        name: 'أحمد محمود العبد',
        phone: '01012345678',
        email: 'ahmed.m@example.com',
        governorateId: 'cairo',
        city: 'المعادي',
        addressLine: 'شارع 9، عمارة 14، الدور الثالث',
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        communicationPreferences: {
          smsUpdates: true,
          whatsappAlerts: true,
          newsletter: true
        }
      };
      users.push(user);
      localStorage.setItem(this.usersStorageKey, JSON.stringify(users));
    }

    if (!user) {
      return {
        success: false,
        error_ar: 'رقم الهاتف غير مسجل. يرجى إنشاء حساب جديد أولاً.',
        error_en: 'Phone number is not registered. Please create an account.'
      };
    }

    localStorage.setItem(this.currentSessionKey, JSON.stringify(user));
    return { success: true, user };
  }

  getCurrentUser(): UserAccount | null {
    try {
      const stored = localStorage.getItem(this.currentSessionKey);
      if (stored) return JSON.parse(stored);
    } catch {}
    // Return sample logged-in user by default
    return {
      id: 'usr_default_cairo',
      name: 'أحمد محمود العبد',
      phone: '01012345678',
      email: 'ahmed.m@example.com',
      governorateId: 'cairo',
      city: 'المعادي',
      addressLine: 'شارع 9، عمارة 14، الدور الثالث',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      communicationPreferences: {
        smsUpdates: true,
        whatsappAlerts: true,
        newsletter: true
      }
    };
  }

  logoutCustomer(): void {
    localStorage.removeItem(this.currentSessionKey);
  }

  updateCustomerProfile(userId: string, updates: Partial<UserAccount>): UserAccount | null {
    const users = this.getStoredUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      localStorage.setItem(this.usersStorageKey, JSON.stringify(users));
      localStorage.setItem(this.currentSessionKey, JSON.stringify(users[idx]));
      return users[idx];
    }
    return null;
  }

  private getStoredUsers(): UserAccount[] {
    try {
      const stored = localStorage.getItem(this.usersStorageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // ==========================================
  // SAVED ADDRESSES
  // ==========================================

  getAddresses(userId: string): AddressItem[] {
    try {
      const stored = localStorage.getItem(`${this.addressesStorageKey}_${userId}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'addr_default_1',
        label: 'المنزل - المعادي',
        recipientName: 'أحمد محمود العبد',
        phone: '01012345678',
        governorateId: 'cairo',
        city: 'المعادي',
        addressLine: 'شارع 9، عمارة 14، الدور الثالث',
        isDefault: true
      },
      {
        id: 'addr_office_2',
        label: 'مكتب العمل - التجمع الخامس',
        recipientName: 'أحمد محمود',
        phone: '01012345678',
        governorateId: 'cairo',
        city: 'التجمع الخامس',
        addressLine: 'شارع التسعين الشمالي، مول تريفيوم',
        isDefault: false
      }
    ];
  }

  addAddress(userId: string, address: Omit<AddressItem, 'id'>): AddressItem {
    const list = this.getAddresses(userId);
    const newAddr: AddressItem = {
      ...address,
      id: `addr_${Date.now()}`
    };
    if (newAddr.isDefault) {
      list.forEach((a) => (a.isDefault = false));
    }
    list.push(newAddr);
    localStorage.setItem(`${this.addressesStorageKey}_${userId}`, JSON.stringify(list));
    return newAddr;
  }

  deleteAddress(userId: string, addressId: string): void {
    const list = this.getAddresses(userId).filter((a) => a.id !== addressId);
    if (list.length > 0 && !list.some((a) => a.isDefault)) {
      list[0].isDefault = true;
    }
    localStorage.setItem(`${this.addressesStorageKey}_${userId}`, JSON.stringify(list));
  }

  // ==========================================
  // RETURN & SUPPORT REQUESTS
  // ==========================================

  getReturnRequests(userId: string): ReturnRequest[] {
    try {
      const stored = localStorage.getItem(`${this.returnsStorageKey}_${userId}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'ret_1',
        orderId: 'ord_sample_1',
        orderNumber: 'VYR-72819',
        itemName: 'قميص كاجوال بخامة مريحة - مقاس L',
        reason: 'size_mismatch',
        status: 'inspecting',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        notes: 'المقاس كان أكبر قليلاً، والمطلوب استبداله بمقاس M'
      }
    ];
  }

  createReturnRequest(userId: string, data: Omit<ReturnRequest, 'id' | 'createdAt' | 'status'>): ReturnRequest {
    const list = this.getReturnRequests(userId);
    const newRet: ReturnRequest = {
      ...data,
      id: `ret_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    list.unshift(newRet);
    localStorage.setItem(`${this.returnsStorageKey}_${userId}`, JSON.stringify(list));
    return newRet;
  }

  getSupportTickets(userId: string): SupportTicket[] {
    try {
      const stored = localStorage.getItem(`${this.ticketsStorageKey}_${userId}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'tkt_1',
        ticketNumber: 'TCK-4921',
        subject: 'استفسار عن موعد تسليم شحنة الإسكندرية',
        category: 'shipping',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        lastUpdated: new Date(Date.now() - 3600000 * 3).toISOString(),
        messages: [
          {
            id: 'm1',
            sender: 'customer',
            text: 'مرحبًا، أود التأكد إن كان المندوب سيتصل قبل الحضور بساعة؟',
            timestamp: 'منذ يومين'
          },
          {
            id: 'm2',
            sender: 'staff',
            text: 'أهلاً بحضرتك يا فندم. نعم، مندوب الشحن يتصل هاتفيًا قبل التحرك بـ 45-60 دقيقة لتأكيد التواجد.',
            timestamp: 'منذ 3 ساعات'
          }
        ]
      }
    ];
  }

  createSupportTicket(userId: string, payload: { subject: string; category: SupportTicket['category']; initialMessage: string }): SupportTicket {
    const list = this.getSupportTickets(userId);
    const newTicket: SupportTicket = {
      id: `tkt_${Date.now()}`,
      ticketNumber: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: payload.subject,
      category: payload.category,
      status: 'open',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: 'customer',
          text: payload.initialMessage,
          timestamp: 'الآن'
        }
      ]
    };
    list.unshift(newTicket);
    localStorage.setItem(`${this.ticketsStorageKey}_${userId}`, JSON.stringify(list));
    return newTicket;
  }

  // ==========================================
  // SALES CRM WORKFLOW & PIPELINE (STAFF ONLY)
  // ==========================================

  getSalesLeads(filter?: { stage?: LeadStage; rep?: string; query?: string }): SalesLead[] {
    let leads: SalesLead[] = [];
    try {
      const stored = localStorage.getItem(this.leadsStorageKey);
      leads = stored ? JSON.parse(stored) : [];
    } catch {
      leads = [];
    }

    if (filter?.stage) {
      leads = leads.filter((l) => l.stage === filter.stage);
    }
    if (filter?.rep && filter.rep !== 'all') {
      leads = leads.filter((l) => l.assignedRep === filter.rep);
    }
    if (filter?.query && filter.query.trim()) {
      const q = filter.query.toLowerCase();
      leads = leads.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.businessName.toLowerCase().includes(q) ||
          l.primaryPhone.includes(q) ||
          l.governorate.toLowerCase().includes(q) ||
          l.leadNumber.toLowerCase().includes(q)
      );
    }
    return leads;
  }

  createSalesLead(leadPayload: Omit<SalesLead, 'id' | 'leadNumber' | 'createdAt' | 'updatedAt' | 'activities'>): SalesLead {
    const leads = this.getSalesLeads();
    const leadNumber = `LEAD-${1000 + leads.length + 1}`;
    const now = new Date().toISOString();

    const newLead: SalesLead = {
      ...leadPayload,
      id: `lead_${Date.now()}`,
      leadNumber,
      createdAt: now,
      updatedAt: now,
      activities: [
        {
          id: `act_${Date.now()}`,
          type: 'note',
          description: `تم إنشاء فرصة المبيعات عبر: ${leadPayload.source}`,
          author: leadPayload.assignedRep || 'نظام VAYRO',
          date: now
        }
      ]
    };

    leads.unshift(newLead);
    localStorage.setItem(this.leadsStorageKey, JSON.stringify(leads));
    return newLead;
  }

  updateLeadStage(leadId: string, newStage: LeadStage, authorName = 'فريق المبيعات'): SalesLead | null {
    const leads = this.getSalesLeads();
    const idx = leads.findIndex((l) => l.id === leadId);
    if (idx !== -1) {
      const oldStage = leads[idx].stage;
      leads[idx].stage = newStage;
      leads[idx].updatedAt = new Date().toISOString();
      leads[idx].activities.unshift({
        id: `act_${Date.now()}`,
        type: 'stage_change',
        description: `تم تحديث مرحلة الفرصة من "${this.getStageLabel(oldStage)}" إلى "${this.getStageLabel(newStage)}"`,
        author: authorName,
        date: new Date().toISOString()
      });
      localStorage.setItem(this.leadsStorageKey, JSON.stringify(leads));
      return leads[idx];
    }
    return null;
  }

  addLeadActivity(leadId: string, activity: Omit<LeadActivity, 'id' | 'date'>): SalesLead | null {
    const leads = this.getSalesLeads();
    const idx = leads.findIndex((l) => l.id === leadId);
    if (idx !== -1) {
      const newAct: LeadActivity = {
        ...activity,
        id: `act_${Date.now()}`,
        date: new Date().toISOString()
      };
      leads[idx].activities.unshift(newAct);
      leads[idx].updatedAt = new Date().toISOString();
      localStorage.setItem(this.leadsStorageKey, JSON.stringify(leads));
      return leads[idx];
    }
    return null;
  }

  updateSalesLead(leadId: string, updates: Partial<SalesLead>): SalesLead | null {
    const leads = this.getSalesLeads();
    const idx = leads.findIndex((l) => l.id === leadId);
    if (idx !== -1) {
      leads[idx] = { ...leads[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(this.leadsStorageKey, JSON.stringify(leads));
      return leads[idx];
    }
    return null;
  }

  convertLeadToBusinessAccount(leadId: string): { success: boolean; message_ar: string; message_en: string } {
    const lead = this.updateLeadStage(leadId, 'won', 'إدارة المبيعات');
    if (!lead) {
      return { success: false, message_ar: 'العميل غير موجود', message_en: 'Lead not found' };
    }

    this.addLeadActivity(leadId, {
      type: 'note',
      author: 'إدارة المبيعات',
      description: `تمت ترقية الحساب بنجاح إلى "شريك تجاري معتمد (B2B Verified)" وتم تفعيل شروط الدفع الآجل والكميات.`
    });

    return {
      success: true,
      message_ar: `تم تحويل العميل "${lead.businessName || lead.fullName}" بنجاح إلى حساب أعمال B2B معتمد في النظام!`,
      message_en: `Lead converted successfully to an official B2B Wholesale account.`
    };
  }

  getCRMStats() {
    const leads = this.getSalesLeads();
    const totalLeads = leads.length;
    const totalPipelineValue = leads
      .filter((l) => l.stage !== 'lost')
      .reduce((sum, l) => sum + (l.estimatedDealValue || 0), 0);
    const wonCount = leads.filter((l) => l.stage === 'won').length;
    const conversionRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0;
    const urgentCount = leads.filter((l) => l.priority === 'urgent' && l.stage !== 'won' && l.stage !== 'lost').length;

    return {
      totalLeads,
      totalPipelineValue,
      wonCount,
      conversionRate,
      urgentCount
    };
  }

  getStageLabel(stage: LeadStage): string {
    const labels: Record<LeadStage, string> = {
      new: 'عميل جديد',
      contact_attempted: 'محاولة تواصل',
      contacted: 'تم التواصل',
      qualified: 'مؤهل للشراء',
      quote_sent: 'أرسل عرض سعر',
      negotiation: 'مفاوضات',
      won: 'صفقة ناجحة',
      lost: 'صفقة ملغاة',
      followup_later: 'متابعة لاحقة'
    };
    return labels[stage] || stage;
  }

  private initDefaultCRMData() {
    try {
      const existing = localStorage.getItem(this.leadsStorageKey);
      if (!existing || JSON.parse(existing).length === 0) {
        const seedLeads: SalesLead[] = [
          {
            id: 'lead_seed_1',
            leadNumber: 'LEAD-1001',
            fullName: 'سيف الدين الألفي',
            primaryPhone: '01098765432',
            secondaryPhone: '01123456789',
            email: 'seif@nileboutique.com',
            governorate: 'القاهرة',
            city: 'الزمالك',
            preferredContactMethod: 'whatsapp',
            customerType: 'boutique',
            businessName: 'بوتيك نايل ستايل الزمالك',
            businessActivity: 'متجر ملابس راقية وإكسسوارات حريمي ورجالي',
            businessAddress: 'شارع 26 يوليو، الزمالك، القاهرة',
            websiteOrSocial: 'instagram.com/nile_style_eg',
            interestedCategories: ['men', 'women', 'accessories'],
            expectedPurchaseVolume: '100-250 قطعة شهريًا',
            estimatedDealValue: 185000,
            expectedBuyingFrequency: 'monthly',
            wholesaleInterest: true,
            taxOrCommercialId: '748-291-032',
            source: 'Wholesale Portal Request',
            assignedRep: 'كريم زكي',
            stage: 'qualified',
            priority: 'high',
            expectedClosingDate: '2026-11-05',
            nextFollowUpDate: '2026-10-22',
            nextAction: 'إرسال عينات أقمشة الكتان وكتالوج أسعار B2B المحدث',
            internalNotes: 'العميل مهتم بالقمصان الكتان والشنط الجلدية المجدولة. طلب خصم 30% على دفعة أولى 150 قطعة.',
            tags: ['أقمشة كتان', 'بوتيك الزمالك', 'عميل VIP'],
            activities: [
              {
                id: 'a1',
                type: 'whatsapp',
                description: 'تم إرسال كتالوج المنتجات عبر الواتساب ومناقشة مقاسات القمصان.',
                author: 'كريم زكي',
                date: new Date(Date.now() - 86400000 * 2).toISOString()
              },
              {
                id: 'a2',
                type: 'call',
                description: 'مكالمة هاتفية مدتها 14 دقيقة لتحديد مواصفات طلبية البوتيك.',
                author: 'كريم زكي',
                date: new Date(Date.now() - 86400000).toISOString()
              }
            ],
            createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'lead_seed_2',
            leadNumber: 'LEAD-1002',
            fullName: 'مها عبد الرحمن',
            primaryPhone: '01223344556',
            email: 'maha@redseahospitality.com',
            governorate: 'البحر الأحمر - الغردقة',
            city: 'الجونة',
            preferredContactMethod: 'phone',
            customerType: 'hotel',
            businessName: 'مجموعة منتجعات الجونة الفندقية',
            businessActivity: 'فنادق وضيافة بوتيكية فاخرة',
            businessAddress: 'مارينا الجونة، الغردقة',
            websiteOrSocial: 'www.redseahospitality.eg',
            interestedCategories: ['home'],
            expectedPurchaseVolume: '150 فازة سيراميك ووسائد كتان',
            estimatedDealValue: 95000,
            expectedBuyingFrequency: 'quarterly',
            wholesaleInterest: true,
            taxOrCommercialId: '918-442-109',
            source: 'Website Inquiry',
            assignedRep: 'سلمى نور',
            stage: 'quote_sent',
            priority: 'urgent',
            expectedClosingDate: '2026-10-28',
            nextFollowUpDate: '2026-10-20',
            nextAction: 'متابعة الموافقة على أمر الشراء مع مدير مشتريات الفندق',
            internalNotes: 'المطلوب توريد فخار قرية تونس بالفيوم لتأثيث أجنحة الفندق الجديدة في الجونة.',
            tags: ['فنادق وضيافة', 'الجونة', 'فخار الفيوم'],
            activities: [
              {
                id: 'b1',
                type: 'meeting',
                description: 'اجتماع فيديو مع فريق المشتريات ومعاينة عينات الفخار الطبيعي.',
                author: 'سلمى نور',
                date: new Date(Date.now() - 86400000 * 3).toISOString()
              }
            ],
            createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
          },
          {
            id: 'lead_seed_3',
            leadNumber: 'LEAD-1003',
            fullName: 'طارق الدسوقي',
            primaryPhone: '01155667788',
            governorate: 'الإسكندرية',
            city: 'سموحة',
            preferredContactMethod: 'whatsapp',
            customerType: 'wholesaler',
            businessName: 'الدسوقي لتجارة وتوزيع الملابس الجاهزة',
            businessActivity: 'توزيع جملة في محافظات الدلتا والإسكندرية',
            businessAddress: 'شارع فوزي معاذ، سموحة، الإسكندرية',
            interestedCategories: ['men', 'accessories'],
            expectedPurchaseVolume: '500+ قطعة',
            estimatedDealValue: 340000,
            expectedBuyingFrequency: 'monthly',
            wholesaleInterest: true,
            source: 'Referral',
            assignedRep: 'عمر فاروق',
            stage: 'negotiation',
            priority: 'high',
            expectedClosingDate: '2026-11-10',
            nextFollowUpDate: '2026-10-24',
            nextAction: 'مراجعة جدول مواعيد التسليم في مستودع الإسكندرية',
            internalNotes: 'تاجر جملة كبير في الدلتا. يطلب توريد التيشيرتات القطن الثقيل 320g وسنيكرز السويد.',
            tags: ['تاجر جملة', 'الإسكندرية', 'كميات كبرى'],
            activities: [
              {
                id: 'c1',
                type: 'call',
                description: 'مناقشة خطة توريد شهري مستمرة وتأكيد الأسعار المعتمدة.',
                author: 'عمر فاروق',
                date: new Date(Date.now() - 86400000 * 5).toISOString()
              }
            ],
            createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
          }
        ];
        localStorage.setItem(this.leadsStorageKey, JSON.stringify(seedLeads));
      }
    } catch {}
  }

  // ==========================================
  // PRODUCTS & PUBLIC CATALOG
  // ==========================================

  // ==========================================
  // PRODUCTS & MULTI-TIER PRICING ENGINE
  // ==========================================

  getManagedProducts(): Product[] {
    try {
      const stored = localStorage.getItem(this.productsStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return PRODUCTS;
  }

  updateProductPrices(
    productId: string,
    updates: {
      price?: number;
      salesPrice?: number;
      wholesalePrice?: number;
      supplierCost?: number;
      salesCommission?: number;
      stock?: number;
    },
    adminName = 'Super Admin'
  ): Product | null {
    const products = this.getManagedProducts();
    const idx = products.findIndex((p) => p.id === productId);
    if (idx !== -1) {
      const old = { ...products[idx] };
      products[idx] = {
        ...products[idx],
        ...updates
      };
      try {
        localStorage.setItem(this.productsStorageKey, JSON.stringify(products));
      } catch (e) {
        console.warn(e);
      }
      this.addAuditLog({
        action_ar: `تعديل تسعير منتج: ${products[idx].name_ar}`,
        action_en: `Updated pricing for product: ${products[idx].name_en}`,
        user: adminName,
        role: 'Super Admin',
        category: 'pricing',
        details: `تجزئة: ${old.price} -> ${products[idx].price} ج.م | مندوب: ${old.salesPrice} -> ${products[idx].salesPrice} ج.م | جملة: ${old.wholesalePrice} -> ${products[idx].wholesalePrice} ج.م | تكلفة المورد: ${old.supplierCost} -> ${products[idx].supplierCost} ج.م | عمولة: ${old.salesCommission} -> ${products[idx].salesCommission} ج.م`
      });
      return products[idx];
    }
    return null;
  }

  updateProductStock(productId: string, newStock: number, adminName = 'إدارة المخزون'): Product | null {
    const products = this.getManagedProducts();
    const idx = products.findIndex((p) => p.id === productId);
    if (idx !== -1) {
      const oldStock = products[idx].stock;
      products[idx].stock = newStock;
      try {
        localStorage.setItem(this.productsStorageKey, JSON.stringify(products));
      } catch {}
      this.addAuditLog({
        action_ar: `تحديث مخزون: ${products[idx].name_ar}`,
        action_en: `Stock update: ${products[idx].name_en}`,
        user: adminName,
        role: 'Operations',
        category: 'pricing',
        details: `المخزون السابق: ${oldStock} -> الجديد: ${newStock} قطعة`
      });
      return products[idx];
    }
    return null;
  }

  addProduct(productData: Omit<Product, 'id'>, adminName = 'Super Admin'): Product {
    const products = this.getManagedProducts();
    const newId = `vayro-p${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId
    };
    products.unshift(newProduct);
    try {
      localStorage.setItem(this.productsStorageKey, JSON.stringify(products));
    } catch (e) {
      console.warn(e);
    }
    this.addAuditLog({
      action_ar: `إضافة منتج جديد: ${newProduct.name_ar}`,
      action_en: `Added new product: ${newProduct.name_en}`,
      user: adminName,
      role: 'Super Admin',
      category: 'pricing',
      details: `السعر: ${newProduct.price} ج.م | المخزون: ${newProduct.stock} | كود SKU: ${newProduct.sku || 'N/A'}`
    });
    return newProduct;
  }

  deleteProduct(productId: string, adminName = 'Super Admin'): boolean {
    const products = this.getManagedProducts();
    const target = products.find((p) => p.id === productId);
    if (!target) return false;
    const remaining = products.filter((p) => p.id !== productId);
    try {
      localStorage.setItem(this.productsStorageKey, JSON.stringify(remaining));
    } catch (e) {
      console.warn(e);
    }
    this.addAuditLog({
      action_ar: `حذف منتج: ${target.name_ar}`,
      action_en: `Deleted product: ${target.name_en}`,
      user: adminName,
      role: 'Super Admin',
      category: 'pricing',
      details: `تم حذف المنتج ${target.sku || target.id} نهائيًا من الكتالوج`
    });
    return true;
  }

  async getProducts(filters?: FilterParams): Promise<ApiResponse<Product[]>> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    let filtered = [...this.getManagedProducts()];

    if (filters?.category && filters.category !== 'all') {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name_ar.toLowerCase().includes(q) ||
          p.name_en.toLowerCase().includes(q) ||
          p.subtitle_ar.toLowerCase().includes(q) ||
          p.subtitle_en.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.subCategory_ar.toLowerCase().includes(q) ||
          p.subCategory_en.toLowerCase().includes(q)
      );
    }

    if (filters?.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= (filters.minPrice ?? 0));
    }

    if (filters?.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= (filters.maxPrice ?? Infinity));
    }

    if (filters?.inStockOnly) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    if (filters?.color) {
      filtered = filtered.filter((p) =>
        p.colors.some((c) => c.name_ar === filters.color || c.name_en === filters.color)
      );
    }

    if (filters?.size) {
      filtered = filtered.filter((p) => p.sizes.includes(filters.size as string));
    }

    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        default:
          break;
      }
    }

    return {
      data: filtered,
      meta: {
        isDemoMode: this.isDemoMode,
        backendDriver: 'VAYRO Storefront Service',
        total: filtered.length
      }
    };
  }

  async getProductById(id: string): Promise<ApiResponse<Product | null>> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    const products = this.getManagedProducts();
    const item = products.find((p) => p.id === id || p.slug === id) || null;
    return {
      data: item,
      meta: {
        isDemoMode: this.isDemoMode,
        backendDriver: 'VAYRO Catalog Service'
      }
    };
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return {
      data: CATEGORIES,
      meta: {
        isDemoMode: this.isDemoMode,
        backendDriver: 'VAYRO Catalog Service'
      }
    };
  }

  async getGovernorates(): Promise<ApiResponse<EgyptianGovernorate[]>> {
    return {
      data: EGYPTIAN_GOVERNORATES,
      meta: {
        isDemoMode: this.isDemoMode,
        backendDriver: 'VAYRO Locations Service'
      }
    };
  }

  async validateCoupon(code: string): Promise<{ valid: boolean; discountPercentage: number; message_ar: string; message_en: string }> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const upper = code.trim().toUpperCase();
    if (upper === 'VAYRO10') {
      return {
        valid: true,
        discountPercentage: 10,
        message_ar: 'تم تفعيل خصم 10% بنجاح عبر كود VAYRO10!',
        message_en: '10% discount applied successfully with code VAYRO10!'
      };
    }
    if (upper === 'VIP15') {
      return {
        valid: true,
        discountPercentage: 15,
        message_ar: 'تم تفعيل خصم VIP بقيمة 15%!',
        message_en: 'VIP 15% discount applied successfully!'
      };
    }
    return {
      valid: false,
      discountPercentage: 0,
      message_ar: 'كوبون الخصم غير صالح أو منتهي الصلاحية.',
      message_en: 'Discount coupon is invalid or expired.'
    };
  }

  async createOrder(orderPayload: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status' | 'estimatedDeliveryDate'>): Promise<ApiResponse<Order>> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `VYR-${randomSuffix}`;
    const now = new Date();

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (orderPayload.deliveryMethod === 'express' ? 1 : 2));

    // Freeze unit prices and calculate confidential cost & commissions
    let supplierTotalCost = 0;
    let salesCommissionEarned = 0;

    const frozenItems = orderPayload.items.map((item) => {
      const unitPrice =
        item.unitPrice ??
        (orderPayload.orderTier === 'sales_portal'
          ? (item.product.salesPrice ?? item.product.price)
          : orderPayload.orderTier === 'wholesale'
          ? (item.product.wholesalePrice ?? item.product.price)
          : item.product.price);

      const itemSupplierCost = item.product.supplierCost ?? Math.round(unitPrice * 0.42);
      const itemCommission = item.product.salesCommission ?? Math.round(unitPrice * 0.08);

      supplierTotalCost += itemSupplierCost * item.quantity;
      if (orderPayload.orderTier === 'sales_portal') {
        salesCommissionEarned += itemCommission * item.quantity;
      }

      return {
        ...item,
        unitPrice,
        priceType: (orderPayload.orderTier === 'sales_portal' ? 'sales' : orderPayload.orderTier === 'wholesale' ? 'wholesale' : 'retail') as 'retail' | 'sales' | 'wholesale'
      };
    });

    // Realistic Net Margin Calculation (Revenue - COGS - Commissions - Courier Logistics)
    const netMargin = Math.max(0, orderPayload.total - supplierTotalCost - salesCommissionEarned - (orderPayload.shippingFee || 50));

    const newOrder: Order = {
      ...orderPayload,
      items: frozenItems,
      id: `ord_${Date.now()}`,
      orderNumber,
      status: 'confirmed',
      createdAt: now.toISOString(),
      estimatedDeliveryDate: deliveryDate.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      supplierTotalCost,
      salesCommissionEarned,
      netMargin,
      paymentStatus: orderPayload.paymentMethod === 'cod' ? 'pending_cod' : 'collected',
      shippingStatus: 'pending_dispatch'
    };

    try {
      const stored = localStorage.getItem(this.ordersStorageKey);
      const orders = stored ? JSON.parse(stored) : [];
      orders.unshift(newOrder);
      localStorage.setItem(this.ordersStorageKey, JSON.stringify(orders));
    } catch (e) {
      console.warn('Could not persist order to local storage', e);
    }

    // Deduct stock for ordered items
    try {
      const products = this.getManagedProducts();
      for (const item of newOrder.items) {
        const prod = products.find((p) => p.id === item.product.id);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      }
      localStorage.setItem(this.productsStorageKey, JSON.stringify(products));
    } catch {}

    // Record sales rep commission if attributed
    if (newOrder.salesRepCode) {
      this.recordStaffSale(newOrder.salesRepCode, newOrder.total, salesCommissionEarned);
    }

    this.addAuditLog({
      action_ar: `إنشاء طلب جديد: ${newOrder.orderNumber}`,
      action_en: `Created new order: ${newOrder.orderNumber}`,
      user: newOrder.salesRepName || newOrder.customer.name,
      role: newOrder.orderTier === 'sales_portal' ? 'Sales Rep' : 'Customer',
      category: 'order',
      details: `قيمة الطلب: ${newOrder.total} ج.م | القناة: ${newOrder.orderTier || 'retail'} | تكلفة المورد: ${supplierTotalCost} ج.م | عمولة المندوب: ${salesCommissionEarned} ج.م`
    });

    return {
      data: newOrder,
      meta: {
        isDemoMode: this.isDemoMode,
        backendDriver: 'VAYRO Order Dispatcher'
      }
    };
  }

  async createSalesOrder(payload: {
    repCode: string;
    repName: string;
    leadId?: string;
    customer: {
      name: string;
      phone: string;
      email?: string;
      governorateId: string;
      city: string;
      addressLine: string;
    };
    items: {
      productId: string;
      color?: string;
      size?: string;
      quantity: number;
    }[];
    paymentMethod: Order['paymentMethod'];
    deliveryMethod: 'standard' | 'express';
    notes?: string;
  }): Promise<ApiResponse<Order>> {
    const products = this.getManagedProducts();
    const cartItems: CartItem[] = [];
    let subtotal = 0;

    for (const req of payload.items) {
      const prod = products.find((p) => p.id === req.productId);
      if (prod) {
        // Enforce the authorized Sales Price for Sales Rep orders
        const salesPrice = prod.salesPrice ?? prod.price;
        const color = req.color || prod.colors[0]?.name_ar || 'افتراضي';
        const size = req.size || prod.sizes[0] || 'Standard';
        const itemId = `${prod.id}-${color}-${size}`;

        cartItems.push({
          id: itemId,
          product: prod,
          selectedColor: color,
          selectedSize: size,
          quantity: req.quantity,
          unitPrice: salesPrice,
          priceType: 'sales'
        });
        subtotal += salesPrice * req.quantity;
      }
    }

    const res = await this.createOrder({
      items: cartItems,
      customer: {
        id: `cust_${Date.now()}`,
        name: payload.customer.name,
        email: payload.customer.email || 'sales.client@vayromarket.com',
        phone: payload.customer.phone,
        governorateId: payload.customer.governorateId,
        city: payload.customer.city,
        addressLine: payload.customer.addressLine
      },
      deliveryMethod: payload.deliveryMethod,
      paymentMethod: payload.paymentMethod,
      subtotal,
      discount: 0,
      shippingFee: 0,
      total: subtotal,
      orderTier: 'sales_portal',
      salesRepCode: payload.repCode,
      salesRepName: payload.repName
    });

    // If linked to a lead, update lead activity
    if (payload.leadId) {
      this.addLeadActivity(payload.leadId, {
        type: 'stage_change',
        author: payload.repName,
        description: `تم إصدار أمر بيع مباشر رقم ${res.data.orderNumber} بقيمة ${res.data.total.toLocaleString()} ج.م بأسعار المندوب المعتمدة.`
      });
      this.updateLeadStage(payload.leadId, 'won', payload.repName);
    }

    return res;
  }

  getSavedOrders(): Order[] {
    try {
      const stored = localStorage.getItem(this.ordersStorageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    const initialOrders: Order[] = [
      {
        id: 'ord_sample_1',
        orderNumber: 'VYR-72819',
        orderTier: 'retail',
        items: [
          {
            id: 'sample_item_1',
            product: PRODUCTS[0],
            selectedColor: 'بيج رملي',
            selectedSize: 'L',
            quantity: 1,
            unitPrice: 2150,
            priceType: 'retail'
          }
        ],
        customer: {
          id: 'cust_default',
          name: 'أحمد محمود العبد',
          email: 'ahmed.m@example.com',
          phone: '01012345678',
          governorateId: 'cairo',
          city: 'المعادي',
          addressLine: 'شارع 9، عمارة 14، الدور الثالث'
        },
        deliveryMethod: 'standard',
        paymentMethod: 'cod',
        subtotal: 2150,
        discount: 215,
        couponCode: 'VAYRO10',
        shippingFee: 50,
        total: 1985,
        supplierTotalCost: 820,
        salesCommissionEarned: 0,
        netMargin: 1115,
        status: 'shipped',
        paymentStatus: 'collected',
        shippingStatus: 'with_courier',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        estimatedDeliveryDate: 'غدًا بين 2 مساءً و 6 مساءً'
      },
      {
        id: 'ord_sample_2',
        orderNumber: 'VYR-91402',
        orderTier: 'sales_portal',
        salesRepCode: 'EMP-101',
        salesRepName: 'كريم زكي',
        items: [
          {
            id: 'sample_item_2',
            product: PRODUCTS[1],
            selectedColor: 'بيج وخردلي خفيف',
            selectedSize: '42',
            quantity: 2,
            unitPrice: 1620,
            priceType: 'sales'
          },
          {
            id: 'sample_item_3',
            product: PRODUCTS[2],
            selectedColor: 'أسود أوبسيديان',
            selectedSize: 'مقاس موحد',
            quantity: 1,
            unitPrice: 1690,
            priceType: 'sales'
          }
        ],
        customer: {
          id: 'cust_b2b_lead',
          name: 'سيف الدين الألفي',
          email: 'seif@nileboutique.com',
          phone: '01098765432',
          governorateId: 'cairo',
          city: 'الزمالك',
          addressLine: 'شارع 26 يوليو، عمارة 18'
        },
        deliveryMethod: 'express',
        paymentMethod: 'instapay',
        subtotal: 4930,
        discount: 0,
        shippingFee: 85,
        total: 4930,
        supplierTotalCost: 2270,
        salesCommissionEarned: 495,
        netMargin: 2080,
        status: 'delivered',
        paymentStatus: 'remitted',
        shippingStatus: 'delivered',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        estimatedDeliveryDate: 'تم الاستلام بنجاح'
      },
      {
        id: 'ord_sample_3',
        orderNumber: 'VYR-63820',
        orderTier: 'sales_portal',
        salesRepCode: 'EMP-102',
        salesRepName: 'سلمى نور',
        items: [
          {
            id: 'sample_item_4',
            product: PRODUCTS[5],
            selectedColor: 'أخضر غابي ترابي',
            selectedSize: 'الارتفاع 26 سم',
            quantity: 12,
            unitPrice: 495,
            priceType: 'sales'
          }
        ],
        customer: {
          id: 'cust_hotel_lead',
          name: 'مها عبد الرحمن',
          email: 'maha@redseahospitality.com',
          phone: '01223344556',
          governorateId: 'red_sea',
          city: 'الجونة',
          addressLine: 'مارينا الجونة، فندق أوشن بيتش'
        },
        deliveryMethod: 'standard',
        paymentMethod: 'card',
        subtotal: 5940,
        discount: 0,
        shippingFee: 95,
        total: 5940,
        supplierTotalCost: 2520,
        salesCommissionEarned: 780,
        netMargin: 2545,
        status: 'processing',
        paymentStatus: 'collected',
        shippingStatus: 'pending_dispatch',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        estimatedDeliveryDate: 'خلال 4 أيام'
      }
    ];

    try {
      localStorage.setItem(this.ordersStorageKey, JSON.stringify(initialOrders));
    } catch {}

    return initialOrders;
  }

  // ==========================================
  // VAYRO BUSINESS — OPERATIONS & ADMIN API
  // ==========================================

  getSuppliers(): Supplier[] {
    try {
      const stored = localStorage.getItem(this.suppliersStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SUPPLIERS;
  }

  updateSupplier(supplierId: string, updates: Partial<Supplier>, adminName = 'Super Admin'): Supplier | null {
    const list = this.getSuppliers();
    const idx = list.findIndex((s) => s.id === supplierId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      try {
        localStorage.setItem(this.suppliersStorageKey, JSON.stringify(list));
      } catch {}
      this.addAuditLog({
        action_ar: `تحديث بيانات المورد: ${list[idx].name_ar}`,
        action_en: `Updated supplier details: ${list[idx].name_en}`,
        user: adminName,
        role: 'Operations',
        category: 'supplier',
        details: `تم تحديث الحساب والمستحقات: ${list[idx].totalPayableAmount} ج.م`
      });
      return list[idx];
    }
    return null;
  }

  addSupplier(supplierData: Omit<Supplier, 'id'>, adminName = 'Super Admin'): Supplier {
    const list = this.getSuppliers();
    const newId = `sup_${Date.now()}`;
    const newSup: Supplier = {
      ...supplierData,
      id: newId
    };
    list.unshift(newSup);
    try {
      localStorage.setItem(this.suppliersStorageKey, JSON.stringify(list));
    } catch {}
    this.addAuditLog({
      action_ar: `إضافة مورد جديد: ${newSup.name_ar}`,
      action_en: `Added supplier: ${newSup.name_en}`,
      user: adminName,
      role: 'Super Admin',
      category: 'supplier',
      details: `كود المورد: ${newSup.code} | المحافظة: ${newSup.governorate} | الاتصال: ${newSup.contactPerson}`
    });
    return newSup;
  }

  deleteSupplier(supplierId: string, adminName = 'Super Admin'): boolean {
    const list = this.getSuppliers();
    const target = list.find((s) => s.id === supplierId);
    if (!target) return false;
    const remaining = list.filter((s) => s.id !== supplierId);
    try {
      localStorage.setItem(this.suppliersStorageKey, JSON.stringify(remaining));
    } catch {}
    this.addAuditLog({
      action_ar: `حذف مورد: ${target.name_ar}`,
      action_en: `Deleted supplier: ${target.name_en}`,
      user: adminName,
      role: 'Super Admin',
      category: 'supplier',
      details: `تم حذف المورد ${target.code} من القائمة المعتمدة`
    });
    return true;
  }

  getStaffMembers(): StaffMember[] {
    try {
      const stored = localStorage.getItem(this.staffStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return STAFF_MEMBERS;
  }

  approveStaffCommission(staffCode: string, amount: number, adminName = 'إدارة المحاسبة'): { success: boolean; message_ar: string; message_en: string } {
    const staffList = this.getStaffMembers();
    const idx = staffList.findIndex((s) => s.code === staffCode);
    if (idx !== -1) {
      const payable = Math.min(staffList[idx].pendingCommissions, amount);
      staffList[idx].pendingCommissions = Math.max(0, staffList[idx].pendingCommissions - payable);
      staffList[idx].approvedCommissions += payable;
      try {
        localStorage.setItem(this.staffStorageKey, JSON.stringify(staffList));
      } catch {}
      this.addAuditLog({
        action_ar: `اعتماد وصرف عمولة للموظف: ${staffList[idx].name}`,
        action_en: `Commission approved for rep: ${staffList[idx].name}`,
        user: adminName,
        role: 'Finance',
        category: 'commission',
        details: `المبلغ المعتمد: ${payable.toLocaleString()} ج.م | كود الموظف: ${staffCode}`
      });
      return {
        success: true,
        message_ar: `تم اعتماد وصرف مبلغ ${payable.toLocaleString()} ج.م لصالح ${staffList[idx].name} بنجاح!`,
        message_en: `Successfully approved EGP ${payable.toLocaleString()} commission for ${staffList[idx].name}!`
      };
    }
    return { success: false, message_ar: 'الموظف غير موجود', message_en: 'Staff not found' };
  }

  recordStaffSale(staffCode: string, saleAmount: number, commission: number): void {
    const staffList = this.getStaffMembers();
    const idx = staffList.findIndex((s) => s.code === staffCode);
    if (idx !== -1) {
      staffList[idx].achievedSales += saleAmount;
      staffList[idx].pendingCommissions += commission;
      staffList[idx].lastActive = 'الآن';
      try {
        localStorage.setItem(this.staffStorageKey, JSON.stringify(staffList));
      } catch {}
    }
  }

  addStaffMember(staffData: Omit<StaffMember, 'id'>, adminName = 'Super Admin'): StaffMember {
    const list = this.getStaffMembers();
    const newId = `staff_${Date.now()}`;
    const newStaff: StaffMember = {
      ...staffData,
      id: newId
    };
    list.unshift(newStaff);
    try {
      localStorage.setItem(this.staffStorageKey, JSON.stringify(list));
    } catch {}
    this.addAuditLog({
      action_ar: `إضافة عضو فريق مبيعات جديد: ${newStaff.name}`,
      action_en: `Added sales staff: ${newStaff.name}`,
      user: adminName,
      role: 'Super Admin',
      category: 'commission',
      details: `كود الموظف: ${newStaff.code} | القسم: ${newStaff.department_ar} | الهدف الشهري: ${newStaff.monthlyTarget.toLocaleString()} ج.م`
    });
    return newStaff;
  }

  deleteStaffMember(staffId: string, adminName = 'Super Admin'): boolean {
    const list = this.getStaffMembers();
    const target = list.find((s) => s.id === staffId);
    if (!target) return false;
    const remaining = list.filter((s) => s.id !== staffId);
    try {
      localStorage.setItem(this.staffStorageKey, JSON.stringify(remaining));
    } catch {}
    this.addAuditLog({
      action_ar: `إلغاء تفعيل/حذف موظف: ${target.name}`,
      action_en: `Removed staff member: ${target.name}`,
      user: adminName,
      role: 'Super Admin',
      category: 'commission',
      details: `كود الموظف: ${target.code}`
    });
    return true;
  }

  updateOrderStatus(
    orderId: string,
    status: Order['status'],
    paymentStatus?: Order['paymentStatus'],
    shippingStatus?: Order['shippingStatus'],
    adminName = 'Super Admin'
  ): Order | null {
    const orders = this.getSavedOrders();
    const idx = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (idx !== -1) {
      const oldStatus = orders[idx].status;
      orders[idx].status = status;
      if (paymentStatus) orders[idx].paymentStatus = paymentStatus;
      if (shippingStatus) orders[idx].shippingStatus = shippingStatus;

      try {
        localStorage.setItem(this.ordersStorageKey, JSON.stringify(orders));
      } catch {}

      this.addAuditLog({
        action_ar: `تحديث حالة الطلب: ${orders[idx].orderNumber}`,
        action_en: `Updated status for order: ${orders[idx].orderNumber}`,
        user: adminName,
        role: 'Operations',
        category: 'order',
        details: `من "${oldStatus}" إلى "${status}" | الدفع: ${orders[idx].paymentStatus || 'cod'} | الشحن: ${orders[idx].shippingStatus || 'pending'}`
      });

      return orders[idx];
    }
    return null;
  }

  getFinancialSummary(): FinancialSummary {
    const orders = this.getSavedOrders();
    const activeOrders = orders.filter((o) => o.status !== 'cancelled');

    const grossRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
    const totalCOGS = activeOrders.reduce((sum, o) => sum + (o.supplierTotalCost || 0), 0);
    const totalCommissions = activeOrders.reduce((sum, o) => sum + (o.salesCommissionEarned || 0), 0);
    const totalShippingCost = activeOrders.reduce((sum, o) => sum + (o.shippingFee || 50), 0);

    const netOperatingProfit = Math.max(0, grossRevenue - totalCOGS - totalCommissions - totalShippingCost);
    const profitMarginPercentage = grossRevenue > 0 ? Number(((netOperatingProfit / grossRevenue) * 100).toFixed(1)) : 0;

    const staff = this.getStaffMembers();
    const totalCommissionsPaid = staff.reduce((sum, s) => sum + s.approvedCommissions, 0);

    return {
      grossRevenue,
      totalCOGS,
      totalCommissionsPayable: totalCommissions,
      totalCommissionsPaid,
      totalShippingCost,
      netOperatingProfit,
      profitMarginPercentage,
      ordersCount: activeOrders.length
    };
  }

  getAuditLogs(): AuditLogEntry[] {
    try {
      const stored = localStorage.getItem(this.auditLogsStorageKey);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }

  addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep last 150 log entries
    const trimmed = logs.slice(0, 150);
    try {
      localStorage.setItem(this.auditLogsStorageKey, JSON.stringify(trimmed));
    } catch {}
  }

  private initDefaultAuditLogs(): void {
    try {
      const existing = localStorage.getItem(this.auditLogsStorageKey);
      if (!existing || JSON.parse(existing).length === 0) {
        const seedLogs: AuditLogEntry[] = [
          {
            id: 'log_seed_1',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            action_ar: 'تحديث قائمة أسعار المبيعات والجملة لموسم 2026',
            action_en: 'Seasonal pricing matrix calibrated for 2026',
            user: 'المدير التنفيذي',
            role: 'Super Admin',
            category: 'pricing',
            details: 'تثبيت هوامش ربح الموردين بنسبة 40-45% وعمولة المندوبين 8-10%'
          },
          {
            id: 'log_seed_2',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            action_ar: 'اعتماد تسوية توريدات مصنع المحلة الكبرى',
            action_en: 'Supplier settlement approved for El-Mahalla',
            user: 'إدارة المحاسبة',
            role: 'Finance',
            category: 'supplier',
            details: 'دفعة توريد قمصان وتيشيرتات قطن مصري 320g بإجمالي 38,500 ج.م'
          },
          {
            id: 'log_seed_3',
            timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
            action_ar: 'اعتماد عمولات المبيعات النصف شهرية لمندوبي B2B',
            action_en: 'Bi-weekly sales commissions cleared',
            user: 'مدير العمليات',
            role: 'Operations',
            category: 'commission',
            details: 'تم صرف 12,600 ج.م لكريم زكي و 11,200 ج.م لسلمى نور'
          }
        ];
        localStorage.setItem(this.auditLogsStorageKey, JSON.stringify(seedLogs));
      }
    } catch {}
  }

  // ==========================================
  // WHOLESALE SUBMISSION -> CREATES CRM LEAD
  // ==========================================

  async submitWholesaleInquiry(inquiry: Omit<WholesaleInquiry, 'id' | 'createdAt' | 'status'>): Promise<ApiResponse<WholesaleInquiry>> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const record: WholesaleInquiry = {
      ...inquiry,
      id: `whs_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'received'
    };

    try {
      const stored = localStorage.getItem(this.inquiriesStorageKey);
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(record);
      localStorage.setItem(this.inquiriesStorageKey, JSON.stringify(list));
    } catch (e) {
      console.warn(e);
    }

    // Connect to Sales CRM as a qualified new lead (Rule B in requirements)
    this.createSalesLead({
      fullName: inquiry.contactPerson,
      primaryPhone: inquiry.phone,
      email: inquiry.email,
      governorate: inquiry.governorate,
      city: 'القاهرة الكبرى',
      preferredContactMethod: 'whatsapp',
      customerType: inquiry.businessType,
      businessName: inquiry.companyName,
      businessActivity: `طلب توريد جملة - ${inquiry.businessType}`,
      businessAddress: `${inquiry.governorate}، مصر`,
      interestedCategories: inquiry.interestedCategories,
      expectedPurchaseVolume: inquiry.estimatedMonthlyBudget,
      estimatedDealValue: this.parseBudgetValue(inquiry.estimatedMonthlyBudget),
      expectedBuyingFrequency: 'monthly',
      wholesaleInterest: true,
      source: 'Wholesale Portal Request',
      assignedRep: 'كريم زكي',
      stage: 'new',
      priority: 'high',
      nextAction: 'التواصل الفوري عبر الواتساب وتقديم الكتالوج التجاري وعرض الأسعار',
      internalNotes: `طلب جملة ورد من موقع المتجر الرئيسي: ${inquiry.notes || 'لا توجد ملاحظات إضافية'}`,
      tags: ['طلب B2B من المتجر', inquiry.businessType]
    });

    return {
      data: record,
      meta: {
        isDemoMode: this.isDemoMode,
        backendDriver: 'VAYRO B2B CRM Endpoint'
      }
    };
  }

  // ==========================================
  // CUSTOMER REVIEWS & FEEDBACK SYSTEM
  // ==========================================

  private initDefaultReviews(): void {
    try {
      const stored = localStorage.getItem(this.reviewsStorageKey);
      if (!stored || JSON.parse(stored).length === 0) {
        const seedReviews: ProductReview[] = [
          {
            id: 'rev_seed_1',
            productId: 'vayro-p1',
            orderNumber: 'VYR-72819',
            authorName: 'أحمد محمود العبد',
            authorGovernorate: 'القاهرة',
            rating: 5,
            title: 'خامة الكتان والقطن مريحة جداً وتفوق التوقعات',
            comment: 'القميص خفيف ومثالي لحرارة الصيف في القاهرة. القماش ناعم ولا يسبب أي تحسس، وأزرار الصدف وخياطة الياقة تبين الاهتمام الفائق بأدق التفاصيل. المقاس مضبوط تماماً والتوصيل كان سريعاً.',
            isVerifiedPurchase: true,
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            helpfulCount: 16,
            recommended: true
          },
          {
            id: 'rev_seed_2',
            productId: 'vayro-p1',
            orderNumber: 'VYR-68420',
            authorName: 'سارة النجار',
            authorGovernorate: 'الإسكندرية',
            rating: 5,
            title: 'قطعة راقية وتغليف المتجر فخم',
            comment: 'اشتريته هدية لزوجي باللون البيج الرملي. التغليف أنيق جداً والخامة قطن مصري صافي مع كتان طبيعي، فخورين بوجود علامة مصرية تقدم هذه الجودة والتصميم الراقي.',
            isVerifiedPurchase: true,
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            helpfulCount: 9,
            recommended: true
          },
          {
            id: 'rev_seed_3',
            productId: 'vayro-p1',
            orderNumber: 'VYR-51928',
            authorName: 'كريم الدسوقي',
            authorGovernorate: 'الجيزة',
            rating: 4,
            title: 'جودة استثنائية وقصة مريحة',
            comment: 'القصة المريحة ممتازة جداً في الحركة. الخامة طبيعية وتعطي إطلالة راقية جداً في اللقاءات غير الرسمية والعمل اليومي. أنصح باقتنائه.',
            isVerifiedPurchase: true,
            createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
            helpfulCount: 4,
            recommended: true
          },
          {
            id: 'rev_seed_4',
            productId: 'vayro-p2',
            orderNumber: 'VYR-88314',
            authorName: 'طارق سليم',
            authorGovernorate: 'القاهرة',
            rating: 5,
            title: 'مريح جداً للمشي وساعات العمل الطويلة',
            comment: 'النعل الطبي ناعم وداعم لباطن القدم، تفاصيل السويد والجلد الطبيعي تعطي الحذاء فخامة ملحوظة. لم أشعر بأي إجهاد بعد يوم كامل من الاستخدام في المشاوير.',
            isVerifiedPurchase: true,
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            helpfulCount: 12,
            recommended: true
          },
          {
            id: 'rev_seed_5',
            productId: 'vayro-p2',
            orderNumber: 'VYR-42091',
            authorName: 'ياسمين فؤاد',
            authorGovernorate: 'الإسكندرية',
            rating: 5,
            title: 'تصميم مينيمالي أنيق ومقاس دقيق',
            comment: 'الألوان هادئة وتتماشى مع أغلب الملابس الكاجوال والشيك، المقاس مطابق للمقاسات الأوروبية القياسية تماماً والتوصيل وصل لباب البيت في الموعد المحدد.',
            isVerifiedPurchase: true,
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            helpfulCount: 7,
            recommended: true
          },
          {
            id: 'rev_seed_6',
            productId: 'vayro-p3',
            orderNumber: 'VYR-90412',
            authorName: 'نادية إبراهيم',
            authorGovernorate: 'القاهرة',
            rating: 5,
            title: 'جلد طبيعي فاخر يدوم طويلاً',
            comment: 'حقيبة راقية جداً بتفاصيل حياكة متقنة. الجلد سميك وناعم في نفس الوقت وتتسع لجميع الاحتياجات اليومية.',
            isVerifiedPurchase: true,
            createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
            helpfulCount: 11,
            recommended: true
          },
          {
            id: 'rev_seed_7',
            productId: 'vayro-p4',
            orderNumber: 'VYR-77210',
            authorName: 'مروان عادل',
            authorGovernorate: 'الدقهلية',
            rating: 5,
            title: 'قطن ثقيل ممتاز ولون ثابت بعد الغسيل',
            comment: 'وزن القماش 320 جرام ممتاز جداً، لا ينكمش بعد الغسيل ولا يبهت اللون. طلبت قطعتين إضافيتين بألوان ثانية.',
            isVerifiedPurchase: true,
            createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
            helpfulCount: 8,
            recommended: true
          },
          {
            id: 'rev_seed_8',
            productId: 'vayro-p5',
            orderNumber: 'VYR-63219',
            authorName: 'منى الشريف',
            authorGovernorate: 'الجيزة',
            rating: 5,
            title: 'تحفة فنية من الفخار الطبيعي',
            comment: 'فازة الفيوم الخزفية أعطت زاوية الصالون دفئاً وطابعاً تراثياً أصيلاً. التغليف كان مضاداً للصدمات ووصلت بحالة ممتازة.',
            isVerifiedPurchase: true,
            createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
            helpfulCount: 15,
            recommended: true
          }
        ];
        localStorage.setItem(this.reviewsStorageKey, JSON.stringify(seedReviews));
      }
    } catch (e) {
      console.warn('Could not initialize reviews', e);
    }
  }

  getAllReviews(): ProductReview[] {
    try {
      const stored = localStorage.getItem(this.reviewsStorageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [];
  }

  getProductReviews(productId: string): ProductReview[] {
    const all = this.getAllReviews();
    return all.filter((r) => r.productId === productId);
  }

  addReview(payload: Omit<ProductReview, 'id' | 'createdAt' | 'helpfulCount'>): ProductReview {
    const all = this.getAllReviews();
    const newReview: ProductReview = {
      ...payload,
      id: `rev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      helpfulCount: 0
    };

    all.unshift(newReview);
    try {
      localStorage.setItem(this.reviewsStorageKey, JSON.stringify(all));
    } catch (e) {
      console.warn(e);
    }

    // Update product rating and reviewsCount in the in-memory PRODUCTS list
    const product = PRODUCTS.find((p) => p.id === payload.productId);
    if (product) {
      const productReviews = all.filter((r) => r.productId === payload.productId);
      const totalScore = productReviews.reduce((sum, r) => sum + r.rating, 0);
      product.reviewsCount = productReviews.length;
      product.rating = Number((totalScore / productReviews.length).toFixed(1));
    }

    return newReview;
  }

  voteHelpful(reviewId: string): void {
    const all = this.getAllReviews();
    const target = all.find((r) => r.id === reviewId);
    if (target) {
      target.helpfulCount = (target.helpfulCount || 0) + 1;
      try {
        localStorage.setItem(this.reviewsStorageKey, JSON.stringify(all));
      } catch (e) {
        console.warn(e);
      }
    }
  }

  hasUserPurchasedProduct(productId: string, userPhone?: string): { purchased: boolean; orderNumber?: string; orderDate?: string } {
    const orders = this.getSavedOrders();
    for (const ord of orders) {
      // If user phone is provided, match phone; otherwise if order exists in session
      const matchesPhone = !userPhone || ord.customer.phone === userPhone.replace(/[\s-]/g, '');
      if (matchesPhone) {
        const foundItem = ord.items.find((item) => item.product.id === productId);
        if (foundItem) {
          return {
            purchased: true,
            orderNumber: ord.orderNumber,
            orderDate: ord.createdAt
          };
        }
      }
    }
    return { purchased: false };
  }

  private parseBudgetValue(str: string): number {
    if (str.includes('150,000')) return 120000;
    if (str.includes('300,000')) return 250000;
    if (str.includes('500,000')) return 450000;
    return 60000;
  }
}

export const api = new ApiService();
