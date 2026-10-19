import React from 'react';
import myBanner from '../../assets/my-banner.png';

export const HeroVisual2D: React.FC = () => {
  return (
    <div className="w-full h-full rounded-3xl overflow-hidden border border-[#20241F]/10 shadow-sm bg-white">
      <img
        src={myBanner}
        alt="VAYRO Collection"
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
};