/**
 * إعدادات خدمة عملاء واتساب لمتجر VAYRO Market
 * WhatsApp Customer Support Configuration
 * 
 * لتعديل رقم واتساب الحقيقي:
 * 1. استبدل قيمة 'phoneNumber' برقمك الحقيقي بالصيغة الدولية المباشرة (أرقام فقط بدون علامة + أو مسافات).
 *    مثال لمصر: '201012345678'
 * 2. يمكنك أيضًا تعديل الرسالة الافتتاحية العربية والإنجليزية أدناه.
 */

export interface WhatsAppConfig {
  phoneNumber: string;
  defaultMessage_ar: string;
  defaultMessage_en: string;
  tooltip_ar: string;
  tooltip_en: string;
  statusText_ar: string;
  statusText_en: string;
}

export const WHATSAPP_CONFIG: WhatsAppConfig = {
  // رقم واتساب خدمة عملاء VAYRO بصيغة دولية (أرقام فقط)
  // ضع رقمك الحقيقي هنا:
  phoneNumber: '201012345678',

  // الرسالة الافتتاحية التلقائية باللغة العربية
  defaultMessage_ar: 'مرحبًا، أريد الاستفسار عن أحد منتجات VAYRO',

  // الرسالة الافتتاحية التلقائية باللغة الإنجليزية
  defaultMessage_en: 'Hello, I would like to inquire about VAYRO products',

  // تلميح الزر الرئيسي (Tooltip)
  tooltip_ar: 'تواصل معنا عبر واتساب',
  tooltip_en: 'Chat with us on WhatsApp',

  // حالة الاتصال
  statusText_ar: 'فريق خدمة العملاء متصل الآن',
  statusText_en: 'Customer care is online'
};

/**
 * دالة مساعدة لتوليد رابط المحادثة المباشر مع نص الرسالة المشفر
 */
export function getWhatsAppLink(language: 'ar' | 'en' = 'ar', customMessage?: string): string {
  // تنظيف الرقم من أي مسافات أو علامات إضافية
  const cleanPhone = WHATSAPP_CONFIG.phoneNumber.replace(/[^0-9]/g, '');
  const message = customMessage || (language === 'ar' ? WHATSAPP_CONFIG.defaultMessage_ar : WHATSAPP_CONFIG.defaultMessage_en);
  const encodedText = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
