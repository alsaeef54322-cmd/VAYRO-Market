import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { handleImageError } from '../../utils/imageFallback';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  productTitle?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  productTitle
}) => {
  const { t, dir } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoomLevel(1);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (dir === 'rtl') {
          handlePrev();
        } else {
          handleNext();
        }
      } else if (e.key === 'ArrowLeft') {
        if (dir === 'rtl') {
          handleNext();
        } else {
          handlePrev();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, dir]);

  if (!isOpen || images.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoomLevel(1);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.4, 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.4, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#111310]/90 backdrop-blur-md flex flex-col justify-between items-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Bar with Title, Counter, Zoom Controls, and Close */}
      <div
        className="w-full max-w-5xl flex items-center justify-between text-white z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-bold tracking-tight text-[#D5FF3F] font-mono px-2.5 py-1 rounded-md bg-white/10">
            {currentIndex + 1} / {images.length}
          </span>
          {productTitle && (
            <span className="text-xs sm:text-sm font-semibold text-white/90 truncate max-w-[200px] sm:max-w-md">
              {productTitle}
            </span>
          )}
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={t('تكبير الصورة', 'Zoom In')}
          >
            <ZoomIn size={18} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-40 transition-colors"
            title={t('تصغير الصورة', 'Zoom Out')}
          >
            <ZoomOut size={18} />
          </button>
          {zoomLevel > 1 && (
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={t('إعادة الضبط', 'Reset Zoom')}
            >
              <RotateCcw size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#D5FF3F] text-[#111310] hover:bg-white transition-colors font-bold ms-2"
            title={t('إغلاق', 'Close')}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 w-full max-w-4xl flex items-center justify-center my-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Image Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-all hover:scale-110"
            title={t('الصورة السابقة', 'Previous')}
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Scaled/Zoomable Image */}
        <div
          className="relative max-h-[70vh] sm:max-h-[75vh] w-auto transition-transform duration-300 ease-out cursor-zoom-in"
          style={{ transform: `scale(${zoomLevel})` }}
          onClick={() => {
            if (zoomLevel === 1) {
              setZoomLevel(1.6);
            } else {
              setZoomLevel(1);
            }
          }}
        >
          <img
            src={images[currentIndex]}
            alt={productTitle || 'Product preview'}
            onError={handleImageError}
            className="max-h-[70vh] sm:max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl select-none"
          />
        </div>

        {/* Next Image Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-all hover:scale-110"
            title={t('الصورة التالية', 'Next')}
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Bottom Thumbnails Navigation */}
      {images.length > 1 && (
        <div
          className="w-full max-w-2xl flex items-center justify-center gap-2 overflow-x-auto py-2 z-20 no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setZoomLevel(1);
              }}
              className={`w-14 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-black/40 ${
                currentIndex === idx
                  ? 'border-[#D5FF3F] scale-105 shadow-lg'
                  : 'border-white/20 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt=""
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
