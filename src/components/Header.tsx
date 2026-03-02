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
      <header className="sticky top-0 z-50 bg-white border-b border-shein-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onMenuClick}
              className="flex items-center space-x-3 text-black hover:text-shein-red transition-colors duration-200"
            >
              {loading ? (
                <div className="h-12 w-12 bg-white/20 rounded-lg animate-pulse" />
              ) : (
                <div className="h-10 w-10 bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src={siteSettings?.site_logo || "/zweren-logo.jpg"}
                    alt="ZWEREN"
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<span class="text-black font-bold text-xl">Z</span>';
                    }}
                  />
                </div>
              )}
              <h1 className="text-xl font-black tracking-tight text-black font-montserrat uppercase">
                {loading ? (
                  <div className="w-32 h-7 bg-white/20 rounded animate-pulse" />
                ) : (
                  (siteSettings?.site_name?.replace(/ Ph$/i, '') || "ZWEREN")
                )}
              </h1>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={onCartClick}
                className="relative px-6 py-2 bg-black text-white rounded-sm hover:bg-shein-red transition-all duration-300 flex items-center space-x-2 font-black uppercase text-[10px] tracking-widest font-montserrat"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden md:block">Bag</span>
                {cartItemsCount > 0 && (
                  <span className="bg-white text-black text-[9px] font-black rounded-sm h-5 w-5 flex items-center justify-center ring-1 ring-black shadow-sm ml-1">
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