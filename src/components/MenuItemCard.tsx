import React, { useState } from 'react';
import { Plus, Minus, X } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';
import ProductDetailModal from './ProductDetailModal';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity?: number, variation?: Variation, addOns?: AddOn[], variations?: Variation[]) => void;
  onBuyNow: (item: MenuItem, quantity?: number, variation?: Variation, addOns?: AddOn[]) => void;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToCart,
  quantity,
  onUpdateQuantity,
  onBuyNow
}) => {
  const [showProductDetail, setShowProductDetail] = useState(false);

  const calcDiscount = () => {
    if (!item.basePrice || !item.discountPrice) return 0;
    return Math.round(((item.basePrice - item.discountPrice) / item.basePrice) * 100);
  };

  return (
    <>
      <div
        className="group bg-white border border-shein-border flex flex-col h-full cursor-pointer relative overflow-hidden"
        onClick={() => setShowProductDetail(true)}
      >
        {item.isOnDiscount && (
          <div className="absolute top-0 left-0 z-20 bg-shein-red text-white text-[10px] font-black px-2 py-1 tracking-wider">
            -{calcDiscount()}%
          </div>
        )}

        <div className="aspect-[3/4] overflow-hidden bg-shein-gray relative">
          <img
            src={item.image || "/zweren-logo.jpg"}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Centered View Details Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowProductDetail(true);
              }}
              className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest border border-black hover:bg-black hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-xl"
            >
              View Details
            </button>
          </div>
        </div>

        <div className="p-3 md:p-4 flex flex-col flex-grow bg-white relative z-20">
          <div className="mb-1">
            <h3 className="text-[11px] md:text-xs font-bold text-black uppercase tracking-widest truncate font-montserrat">{item.name}</h3>
            <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 font-inter">{item.description}</p>
          </div>

          <div className="mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowProductDetail(true);
              }}
              className="w-full py-2.5 bg-black text-white text-[9px] font-black uppercase tracking-widest border border-black hover:bg-shein-red hover:border-shein-red transition-colors"
              title="Select product options"
            >
              Select Options
            </button>
          </div>

          <div className="mt-auto pt-3 flex items-center justify-between border-t border-shein-border/50">
            <div className="flex flex-col">
              {item.isOnDiscount && item.discountPrice ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-shein-red font-montserrat">₱{item.discountPrice}</span>
                  <span className="text-[10px] text-gray-400 line-through">₱{item.basePrice}</span>
                </div>
              ) : (
                <span className="text-sm font-black text-black font-montserrat">₱{item.basePrice}</span>
              )}
            </div>

            {quantity > 0 && (
              <div className="flex items-center space-x-2 bg-shein-gray px-1 py-1 scale-90 origin-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateQuantity(item.id, quantity - 1);
                  }}
                  className="p-1 hover:text-shein-red transition-colors"
                  title="Decrease quantity"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-[10px] font-black w-4 text-center">{quantity}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateQuantity(item.id, quantity + 1);
                  }}
                  className="p-1 hover:text-shein-red transition-colors"
                  title="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


      {showProductDetail && (
        <ProductDetailModal
          item={item}
          onClose={() => setShowProductDetail(false)}
          onAddToCart={onAddToCart}
          onBuyNow={onBuyNow}
        />
      )}
    </>
  );
};

export default MenuItemCard;