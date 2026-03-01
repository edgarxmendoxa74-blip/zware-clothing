import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick, onMenuClick }) => {
  const { siteSettings, loading } = useSiteSettings();

  return (
    <>
      <header className="sticky top-0 z-50 bg-zweren-gradient backdrop-blur-md border-b border-zweren-lavender/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onMenuClick}
              className="flex items-center space-x-3 text-white hover:text-zweren-silver transition-colors duration-200"
            >
              {loading ? (
                <div className="h-12 w-12 bg-white/20 rounded-lg animate-pulse" />
              ) : (
                <div className="h-12 w-12 bg-white rounded-sm flex items-center justify-center shadow-[0_0_20px_rgba(188,166,255,0.3)] overflow-hidden border border-zweren-silver/50">
                  <img
                    src={siteSettings?.site_logo || "/zweren-logo.jpg"}
                    alt="Zweren Ph"
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<span class="text-zweren-black font-bold text-xl">Z</span>';
                    }}
                  />
                </div>
              )}
              <h1 className="text-2xl font-black italic tracking-tighter drop-shadow-lg text-white">
                {loading ? (
                  <div className="w-32 h-7 bg-white/20 rounded animate-pulse" />
                ) : (
                  siteSettings?.site_name || "Zweren Ph"
                )}
              </h1>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={onCartClick}
                className="relative px-5 py-2.5 bg-zweren-lavender-gradient text-zweren-black rounded-sm hover:shadow-[0_0_25px_rgba(188,166,255,0.5)] transition-all duration-500 flex items-center space-x-2 font-black uppercase text-[10px] tracking-widest italic"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Cart</span>
                {cartItemsCount > 0 && (
                  <span className="bg-zweren-black text-white text-[9px] font-black rounded-sm h-5 w-5 flex items-center justify-center animate-bounce-gentle ring-1 ring-zweren-lavender shadow-lg ml-1">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;