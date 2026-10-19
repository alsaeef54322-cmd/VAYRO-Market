export type Language = 'ar' | 'en';

export interface ProductVariant {
  id: string;
  name_ar: string;
  name_en: string;
  colorName_ar: string;
  colorName_en: string;
  colorHex: string;
  size: string;
  sku: string;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  description_ar: string;
  description_en: string;
  price: number; // Retail Price (سعر العميل العادي)
  compareAtPrice?: number;
  salesPrice?: number; // Sales Price (سعر المبيعات المعتمد للمندوب)
  wholesalePrice?: number; // Wholesale Price (سعر التاجر المعتمد)
  supplierCost?: number; // Supplier Cost (تكلفة المورد/المصنع - محمية للإدارة فقط)
  salesCommission?: number; // Sales Commission (عمولة المندوب المقررة)
  supplierId?: string;
  supplierName_ar?: string;
  supplierName_en?: string;
  category: 'women' | 'men' | 'accessories' | 'home' | 'beauty' | 'shoes';
  subCategory_ar: string;
  subCategory_en: string;
  brand: string;
  images: string[];
  isNew?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  rating: number;
  reviewsCount: number;
  stock: number;
  colors: {
    name_ar: string;
    name_en: string;
    hex: string;
    image?: string;
  }[];
  sizes: string[];
  specs: {
    label_ar: string;
    label_en: string;
    value_ar: string;
    value_en: string;
  }[];
  madeIn_ar: string;
  madeIn_en: string;
  sku: string;
  wholesaleAvailable?: boolean;
  wholesaleMinQty?: number;
}

export interface Category {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  tagline_ar: string;
  tagline_en: string;
  image: string;
  itemCount: number;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
  unitPrice?: number; // Frozen price at addition time (never corrupts when admin updates catalog)
  priceType?: 'retail' | 'sales' | 'wholesale';
}

export interface EgyptianGovernorate {
  id: string;
  name_ar: string;
  name_en: string;
  shippingFee: number;
  deliveryDays: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  governorateId: string;
  city: string;
  addressLine: string;
  building?: string;
  floor?: string;
  apartment?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  email?: string;
  governorateId?: string;
  city?: string;
  addressLine?: string;
  createdAt: string;
  communicationPreferences: {
    smsUpdates: boolean;
    whatsappAlerts: boolean;
    newsletter: boolean;
  };
}

export interface AddressItem {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  governorateId: string;
  city: string;
  addressLine: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  customer: Customer;
  deliveryMethod: 'standard' | 'express';
  paymentMethod: 'cod' | 'card' | 'fawry' | 'instapay';
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  total: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDeliveryDate: string;
  orderTier?: 'retail' | 'sales_portal' | 'wholesale';
  salesRepCode?: string;
  salesRepName?: string;
  salesCommissionEarned?: number;
  supplierTotalCost?: number;
  netMargin?: number;
  paymentStatus?: 'pending_cod' | 'collected' | 'remitted';
  shippingStatus?: 'pending_dispatch' | 'with_courier' | 'delivered' | 'returned';
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  itemName: string;
  reason: 'size_mismatch' | 'color_different' | 'defective' | 'changed_mind';
  status: 'pending' | 'inspecting' | 'approved' | 'completed';
  createdAt: string;
  notes?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: 'shipping' | 'sizing' | 'return' | 'wholesale' | 'general';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  lastUpdated: string;
  messages: {
    id: string;
    sender: 'customer' | 'staff';
    text: string;
    timestamp: string;
  }[];
}

export interface WholesaleInquiry {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessType: 'retailer' | 'boutique' | 'distributor' | 'hotel' | 'corporate';
  governorate: string;
  interestedCategories: string[];
  estimatedMonthlyBudget: string;
  notes: string;
  createdAt: string;
  status: 'received' | 'reviewing' | 'contacted';
}

// Dedicated Sales CRM Models for Staff Workflow
export type LeadStage =
  | 'new'
  | 'contact_attempted'
  | 'contacted'
  | 'qualified'
  | 'quote_sent'
  | 'negotiation'
  | 'won'
  | 'lost'
  | 'followup_later';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface LeadActivity {
  id: string;
  type: 'call' | 'meeting' | 'whatsapp' | 'note' | 'stage_change';
  description: string;
  author: string;
  date: string;
}

export interface SalesLead {
  id: string;
  leadNumber: string;
  // Contact info
  fullName: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  governorate: string;
  city: string;
  preferredContactMethod: 'whatsapp' | 'phone' | 'email';
  
  // Business details
  customerType: 'individual' | 'retail_shop' | 'wholesaler' | 'retailer' | 'factory' | 'boutique' | 'hotel' | 'corporate' | 'distributor' | 'other';
  businessName: string;
  businessActivity: string;
  businessAddress: string;
  websiteOrSocial?: string;
  interestedCategories: string[];
  expectedPurchaseVolume: string;
  estimatedDealValue: number;
  expectedBuyingFrequency: 'one_time' | 'weekly' | 'monthly' | 'quarterly';
  wholesaleInterest: boolean;
  taxOrCommercialId?: string;

  // Sales & Pipeline info
  source: 'Wholesale Portal Request' | 'Website Inquiry' | 'Instagram' | 'Referral' | 'Exhibition' | 'Direct Call';
  assignedRep: string;
  stage: LeadStage;
  priority: LeadPriority;
  expectedClosingDate?: string;
  nextFollowUpDate?: string;
  nextAction: string;
  internalNotes: string;
  tags: string[];
  activities: LeadActivity[];
  linkedCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  orderId?: string;
  orderNumber?: string;
  authorName: string;
  authorGovernorate?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  helpfulCount: number;
  recommended: boolean;
}

// Supplier & Factory Management for VAYRO Business
export interface Supplier {
  id: string;
  code: string;
  name_ar: string;
  name_en: string;
  category: 'textiles' | 'leather' | 'ceramics' | 'silver' | 'fragrance';
  governorate: string;
  city: string;
  contactPerson: string;
  phone: string;
  email?: string;
  taxRegistrationNumber?: string;
  status: 'active' | 'under_review' | 'inactive';
  suppliedProductsCount: number;
  totalOrdersFulfilled: number;
  totalPayableAmount: number; // Outstanding balance owed to supplier
  paymentTerms: string;
}

// Admin Staff & Sales Rep Management
export interface StaffMember {
  id: string;
  code: string; // e.g. EMP-101
  name: string;
  phone: string;
  email: string;
  role: 'super_admin' | 'sales_rep' | 'operations' | 'accountant';
  department_ar: string;
  department_en: string;
  monthlyTarget: number;
  achievedSales: number;
  pendingCommissions: number;
  approvedCommissions: number;
  status: 'active' | 'suspended';
  lastActive: string;
}

// Audit Log for Business Operations
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action_ar: string;
  action_en: string;
  user: string;
  role: string;
  category: 'pricing' | 'order' | 'commission' | 'supplier' | 'auth';
  details: string;
}

// Financial Statement & P&L Summary
export interface FinancialSummary {
  grossRevenue: number;
  totalCOGS: number; // Supplier Costs
  totalCommissionsPayable: number;
  totalCommissionsPaid: number;
  totalShippingCost: number;
  netOperatingProfit: number;
  profitMarginPercentage: number;
  ordersCount: number;
}

