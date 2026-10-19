import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { getWhatsAppLink, WHATSAPP_CONFIG } from '../../config/whatsapp';

export const WhatsAppButton: React.FC = () => {
  const { language, dir, t } = useLanguage();
  const { currentPage, isCartDrawerOpen } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth entrance delay on page mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Subtle interactive scroll reaction: tracks active scrolling to provide a gentle response
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const href = getWhatsAppLink(language);
  const tooltipText = language === 'ar' ? WHATSAPP_CONFIG.tooltip_ar : WHATSAPP_CONFIG.tooltip_en;
  const statusText = language === 'ar' ? WHATSAPP_CONFIG.statusText_ar : WHATSAPP_CONFIG.statusText_en;

  // Hide in internal Admin Dashboard to keep management tables clear
  if (currentPage === 'admin') {
    return null;
  }

  // Position: Bottom-left for RTL (Arabic) as required, Bottom-right for LTR (English)
  // Elevate slightly on mobile checkout so bottom action buttons remain fully accessible
  const bottomOffset = currentPage === 'checkout' ? 'bottom-24 sm:bottom-6' : 'bottom-5 sm:bottom-6';
  const positionClasses = dir === 'rtl' 
    ? `left-5 sm:left-6 ${bottomOffset}` 
    : `right-5 sm:right-6 ${bottomOffset}`;

  return (
    <aside
      aria-label={t('الدعم الفني عبر واتساب', 'WhatsApp Customer Support')}
      className={`fixed z-30 flex items-center gap-3 transition-all duration-500 ease-out select-none ${positionClasses} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip for desktop hover */}
      <div
        className={`hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#20241F] text-white shadow-xl border border-white/10 transition-all duration-300 pointer-events-none whitespace-nowrap ${
          dir === 'rtl' ? 'order-2' : 'order-1'
        } ${
          isHovered
            ? 'opacity-100 translate-x-0 scale-100'
            : dir === 'rtl'
            ? 'opacity-0 -translate-x-2 scale-95'
            : 'opacity-0 translate-x-2 scale-95'
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
        </span>
        <div className="text-right">
          <p className="text-xs font-bold text-white leading-tight">
            {tooltipText}
          </p>
          <p className="text-[10px] text-white/60 leading-tight mt-0.5 font-mono">
            {statusText}
          </p>
        </div>
      </div>

      {/* Floating Circular WhatsApp Button Container with gentle CSS animation */}
      <div className={`transition-transform duration-300 ${!isHovered ? 'animate-vayro-float' : ''}`}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('تواصل معنا عبر واتساب - خدمة عملاء VAYRO', 'Contact VAYRO Customer Support on WhatsApp')}
          className={`relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-black/15 transition-all duration-300 group focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 ${
            dir === 'rtl' ? 'order-1' : 'order-2'
          } ${
            isHovered
              ? 'scale-110 shadow-2xl shadow-[#25D366]/40'
              : isScrolling
              ? 'scale-95 shadow-md shadow-black/20'
              : 'hover:scale-105 active:scale-95'
          }`}
        >
          {/* Subtle white radial sheen */}
          <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-15 transition-opacity duration-300" />

          {/* Online status indicator dot */}
          <span
            className={`absolute top-0.5 ${
              dir === 'rtl' ? 'left-0.5' : 'right-0.5'
            } w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-xs`}
          >
            <span className="w-2.5 h-2.5 bg-[#18794E] rounded-full" />
          </span>

          {/* Official WhatsApp Vector Icon */}
          <svg
            className="w-7 h-7 sm:w-7.5 sm:h-7.5 fill-current text-white transform group-hover:scale-105 transition-transform"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>
    </aside>
  );
};
