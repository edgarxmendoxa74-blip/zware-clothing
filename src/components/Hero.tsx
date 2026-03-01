import React from 'react';
import Slideshow from './Slideshow';

const Hero: React.FC = () => {
  return (
    <div className="bg-zweren-gradient pt-12 md:pt-20 pb-6 md:pb-10 px-4 shadow-[-20px_0_50px_rgba(188,166,255,0.1)] overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Left Side: Content */}
        <div className="text-left space-y-8 animate-fade-in-left order-last md:order-first">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter uppercase italic">
              ZWARE <span className="text-white decoration-zweren-lavender underline decoration-4 underline-offset-8">CLOTHING</span>
            </h1>

            {/* Features Tags */}
            <div className="flex flex-wrap gap-3">
              <span className="bg-zweren-metallic-gradient text-zweren-black px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-wider shadow-lg">
                Premium Cotton
              </span>
              <span className="bg-white/5 border border-white/10 text-zweren-lavender px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                Unisex Styles
              </span>
              <span className="bg-white/5 border border-white/10 text-zweren-lavender px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                Nationwide Delivery
              </span>
            </div>
          </div>

          <p className="text-xl md:text-2xl text-zweren-lavender font-medium tracking-tight max-w-lg leading-relaxed">
            Elevate your daily style with our curated collection of premium essentials.
          </p>


        </div>

        {/* Right Side: Slideshow Banner */}
        <div className="relative animate-fade-in-right order-first md:order-last">
          <div className="absolute -inset-4 bg-zweren-lavender/20 blur-3xl rounded-full opacity-30 animate-pulse" />
          <Slideshow />
        </div>

      </div>
    </div>
  );
};

export default Hero;
