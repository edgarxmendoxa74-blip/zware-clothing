import React from 'react';
import Slideshow from './Slideshow';

const Hero: React.FC = () => {
  return (
    <div className="bg-white pt-16 md:pt-24 pb-8 md:pb-12 px-4 border-b border-shein-border overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Left Side: Content */}
        <div className="text-left space-y-8 animate-fade-in-left order-last md:order-first">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-9xl font-black text-black leading-tight tracking-tight uppercase font-montserrat">
              ZWEREN
            </h1>

            {/* Features Tags */}
            <div className="flex flex-wrap gap-2 text-black">
              <span className="bg-shein-red text-white px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-sm">
                New Arrival
              </span>
              <span className="bg-white border border-black text-black px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest">
                Premium Essential
              </span>
              <span className="bg-white border border-black text-black px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest">
                Fast Shipping
              </span>
            </div>
          </div>

          <p className="text-xl md:text-2xl text-black font-medium tracking-tight max-w-lg leading-relaxed uppercase">
            Elevate your lifestyle with our curated collection of premium essentials.
          </p>


        </div>

        {/* Right Side: Slideshow Banner */}
        <div className="relative animate-fade-in-right order-first md:order-last">
          <div className="absolute -inset-4 bg-black/5 blur-3xl rounded-full opacity-30" />
          <Slideshow />
        </div>

      </div>
    </div>
  );
};

export default Hero;
