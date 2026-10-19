import React, { useState } from 'react';
import {
  X,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ShieldCheck,
  Phone,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Box
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Order } from '../../types';

interface OrderTrackingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

interface TrackingStep {
  id: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  time_ar: string;
  time_en: string;
  status: 'completed' | 'current' | 'upcoming';
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  const { t, dir, language } = useLanguage();
  const [copiedTracking, setCopiedTracking] = useState(false);

  if (!isOpen || !order) return null;

  // Mock Egyptian Courier Waybill
  const carrierName = 'بوسطة إكسبريس (Bosta Egypt Logistics)';
  const trackingNumber = `BST-${order.orderNumber.replace(/[^0-9]/g, '') || '84920'}-EG`;

  // Determine lifecycle steps based on order status
  const getLifecycleSteps = (orderStatus: Order['status']): TrackingStep[] => {
    const isConfirmed = true;
    const isProcessing = ['processing', 'shipped', 'out_for_delivery', 'delivered'].includes(orderStatus);
    const isShipped = ['shipped', 'out_for_delivery', 'delivered'].includes(orderStatus);
    const isOutForDelivery = ['out_for_delivery', 'delivered'].includes(orderStatus);
    const isDelivered = orderStatus === 'delivered';

    return [
      {
        id: 'step_placed',
        title_ar: 'تم استلام وتأكيد الطلب',
        title_en: 'Order Placed & Verified',
        desc_ar: 'تم تأكيد طلبك ومراجعة تفاصيل العنوان والمنتجات في نظام VAYRO المركزي.',
        desc_en: 'Order received and verified in VAYRO fulfillment network.',
        time_ar: new Date(order.createdAt).toLocaleDateString('ar-EG', {
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit'
        }),
        time_en: new Date(order.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: isProcessing ? 'completed' : 'current',
        icon: CheckCircle2
      },
      {
        id: 'step_packing',
        title_ar: 'تجهيز وتغليف الشحنة الفاخر',
        title_en: 'Quality Inspection & Luxury Packing',
        desc_ar: 'فحص جودة الخامات والتغليف بعلبة VAYRO المقاومة للصدمات وشريط الحماية.',
        desc_en: 'Passed hand-inspection and boxed in custom protective packaging.',
        time_ar: 'مستودع التجمع الخامس - القاهرة',
        time_en: 'Cairo Fulfillment Hub',
        status: isShipped ? 'completed' : isProcessing ? 'current' : 'upcoming',
        icon: Box
      },
      {
        id: 'step_carrier',
        title_ar: 'تسليم الشحنة لمندوب التوصيل',
        title_en: 'Handed to Local Courier',
        desc_ar: `استلم مندوب شركة ${carrierName} الطرد وجارٍ التوجه إلى المحافظة المستهدفة.`,
        desc_en: `Picked up by delivery fleet heading towards destination.`,
        time_ar: isShipped ? 'تم إصدار البوليصة وجارٍ التحرك' : 'بانتظار وصول المندوب',
        time_en: isShipped ? 'In transit with courier' : 'Awaiting carrier handoff',
        status: isOutForDelivery ? 'completed' : isShipped ? 'current' : 'upcoming',
        icon: Truck
      },
      {
        id: 'step_delivery',
        title_ar: 'التوصيل لباب المنزل واستلام العميل',
        title_en: 'Delivered to Doorstep',
        desc_ar: `التسليم النهائي لعنوان: ${order.customer.city}، ${order.customer.addressLine}.`,
        desc_en: `Final delivery at ${order.customer.city}, Egypt.`,
        time_ar: `الموعد المتوقع: ${order.estimatedDeliveryDate}`,
        time_en: `ETA: ${order.estimatedDeliveryDate}`,
        status: isDelivered ? 'completed' : 'upcoming',
        icon: MapPin
      }
    ];
  };

  const steps = getLifecycleSteps(order.status);
  const currentStepIndex = steps.findIndex((s) => s.status === 'current');
  const progressPercent =
    order.status === 'delivered'
      ? 100
      : currentStepIndex !== -1
      ? Math.round(((currentStepIndex + 0.5) / steps.length) * 100)
      : 25;

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#20241F]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#20241F]/10 overflow-hidden my-auto text-right animate-in fade-in-50 zoom-in-95 duration-200"
        dir={dir}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#20241F] text-white flex items-center justify-between border-b border-[#20241F]/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D5FF3F] text-[#20241F] flex items-center justify-center font-black">
              <Truck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#D5FF3F] uppercase font-bold">
                  {t('تتبع دورة الشحنة الحية', 'LIVE ORDER TRACKING')}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D5FF3F] animate-ping" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white font-display">
                #{order.orderNumber}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Info Hero Banner */}
          <div className="p-4 rounded-2xl bg-[#F7F7F3] border border-[#20241F]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#20241F]">
                  {t('الناقل الرسمي:', 'Courier Partner:')}
                </span>
                <span className="text-xs font-semibold text-[#18794E]">
                  {carrierName}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-[#20241F]/60">
                  {t('رقم التتبع المصري (Waybill):', 'Tracking Waybill:')}
                </span>
                <span className="text-xs font-mono font-bold text-[#20241F] bg-white px-2 py-0.5 rounded border border-[#20241F]/10">
                  {trackingNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTracking}
                  className="p-1 text-[#20241F]/50 hover:text-[#18794E] transition-colors"
                  title={t('نسخ رقم التتبع', 'Copy tracking number')}
                >
                  {copiedTracking ? <Check size={14} className="text-[#18794E]" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="text-right sm:text-left self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#20241F]/10">
              <span className="text-[11px] text-[#20241F]/60 block leading-tight">
                {t('موعد الوصول المقدر لباب البيت:', 'Estimated Delivery Date:')}
              </span>
              <span className="text-xs sm:text-sm font-black text-[#18794E] block mt-0.5">
                {order.estimatedDeliveryDate}
              </span>
            </div>
          </div>

          {/* Progress Bar Visualization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#20241F]">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#18794E]" />
                <span>{t('تقدم تجهيز وشحن الطلب', 'Fulfillment Progress')}</span>
              </span>
              <span className="font-mono text-xs text-[#18794E] font-bold">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#ECEAE1] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-linear-to-r from-[#18794E] to-[#D5FF3F] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="relative pt-2">
            <div className="space-y-6 relative before:absolute before:inset-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#20241F]/10 before:right-4 sm:before:right-5">
              {steps.map((step, idx) => {
                const IconComponent = step.icon;
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'current';

                return (
                  <div key={step.id} className="relative flex items-start gap-4">
                    {/* Step Icon Badge */}
                    <div
                      className={`relative z-10 w-8 sm:w-10 h-8 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${
                        isCompleted
                          ? 'bg-[#18794E] border-[#18794E] text-[#D5FF3F] shadow-sm'
                          : isCurrent
                          ? 'bg-[#20241F] border-[#D5FF3F] text-[#D5FF3F] ring-4 ring-[#D5FF3F]/30 shadow-md scale-105'
                          : 'bg-white border-[#20241F]/20 text-[#20241F]/30'
                      }`}
                    >
                      <IconComponent size={16} />
                    </div>

                    {/* Step Content Card */}
                    <div
                      className={`flex-1 p-3.5 sm:p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-[#FAF9F5] border-[#18794E]/30 shadow-xs'
                          : 'bg-white border-[#20241F]/5'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h4
                          className={`text-xs sm:text-sm font-bold ${
                            isCurrent
                              ? 'text-[#18794E]'
                              : isCompleted
                              ? 'text-[#20241F]'
                              : 'text-[#20241F]/50'
                          }`}
                        >
                          {t(step.title_ar, step.title_en)}
                        </h4>
                        <span className="text-[10px] font-mono text-[#20241F]/50">
                          {t(step.time_ar, step.time_en)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#20241F]/70 leading-relaxed">
                        {t(step.desc_ar, step.desc_en)}
                      </p>

                      {isCurrent && (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18794E]/10 text-[#18794E] text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#18794E] animate-pulse" />
                          <span>{t('المرحلة الحالية قيد الإنجاز', 'Currently in progress')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Address & Customer Dispatch Details */}
          <div className="p-4 rounded-2xl bg-[#F7F7F3] border border-[#20241F]/10 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#20241F]/10 font-bold text-[#20241F]">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[#18794E]" />
                <span>{t('تفاصيل وجهة الشحن في مصر', 'Egyptian Delivery Destination')}</span>
              </span>
              <span className="text-[11px] font-mono text-[#20241F]/60">
                {order.customer.phone}
              </span>
            </div>
            <p className="text-[11px] text-[#20241F]/80">
              <strong className="text-[#20241F]">{order.customer.name}</strong> • {order.customer.city}، {order.customer.addressLine}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-[#20241F]/60 pt-1">
              <ShieldCheck size={12} className="text-[#18794E]" />
              <span>{t('مندوب التوصيل يتصل هاتفيًا قبل الحضور بـ 45-60 دقيقة لتأكيد التواجد.', 'Driver calls 45-60 minutes ahead of arrival.')}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#20241F]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#20241F]/60">
              {t('إجمالي قيمة الشحنة:', 'Total Amount:')}
            </span>
            <span className="text-sm font-black text-[#20241F]">
              {order.total.toLocaleString()} {t('ج.م', 'EGP')}
            </span>
          </div>

          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-[#20241F] text-[#D5FF3F] hover:bg-black text-xs font-bold transition-all shadow-sm"
          >
            {t('إغلاق نافذة التتبع', 'Close Tracker')}
          </button>
        </div>
      </div>
    </div>
  );
};
