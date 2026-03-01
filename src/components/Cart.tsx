import React from 'react';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getTotalPrice,
  onContinueShopping,
  onCheckout
}) => {
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-20 bg-white rounded-sm shadow-2xl border border-zweren-silver/30 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-zweren-lavender/5 rounded-full blur-3xl"></div>
          <div className="text-6xl mb-6">🛍️</div>
          <h2 className="text-2xl font-black text-zweren-black mb-3 uppercase tracking-tighter italic">Your collection is empty</h2>
          <p className="text-[10px] font-bold text-zweren-gray mb-10 uppercase tracking-widest">Select your premium apparel to get started.</p>
          <button
            onClick={onContinueShopping}
            className="bg-zweren-black text-white px-10 py-4 rounded-sm hover:bg-zweren-lavender hover:text-black transition-all duration-700 font-black text-xs uppercase tracking-[0.3em] italic shadow-2xl active:scale-95 border border-transparent hover:border-zweren-lavender/30"
          >
            👕 Browse Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-10 border-b border-zweren-silver pb-6">
        <button
          onClick={onContinueShopping}
          className="flex items-center space-x-3 text-zweren-black hover:text-zweren-lavender transition-all duration-500 font-black text-[10px] uppercase tracking-widest italic translate-y-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Store</span>
        </button>
        <h1 className="text-2xl font-black text-zweren-black uppercase tracking-tighter italic drop-shadow-sm">🛍️ Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-500 hover:text-zweren-lavender transition-all duration-500 font-black text-[10px] uppercase tracking-widest italic translate-y-1"
        >
          Clear All
        </button>
      </div>

      <div className="bg-white rounded-sm shadow-2xl overflow-hidden mb-12 border border-zweren-silver/30">
        {cartItems.map((item, index) => {
          return (
            <div key={item.id} className={`p-8 ${index !== cartItems.length - 1 ? 'border-b border-zweren-silver/30' : ''} hover:bg-zweren-gray/20 transition-colors duration-500`}>
              <div className="flex items-start space-x-4">
                {/* Variation Image */}
                {item.selectedVariation?.image && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.selectedVariation.image}
                      alt={item.selectedVariation.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-zweren-black mb-2 uppercase tracking-tighter italic">{item.name}</h3>
                  {item.selectedVariations && item.selectedVariations.length > 0 ? (
                    <p className="text-[10px] text-zweren-gray font-bold uppercase tracking-widest mb-2 italic">Options: {item.selectedVariations.map(v => v.name).join(' + ')}</p>
                  ) : item.selectedVariation ? (
                    <p className="text-[10px] text-zweren-gray font-bold uppercase tracking-widest mb-2 italic">Option: {item.selectedVariation.name}</p>
                  ) : null}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <p className="text-[10px] text-zweren-gray font-bold uppercase tracking-widest mb-3">
                      Add-ons: {item.selectedAddOns.map(addOn =>
                        addOn.quantity && addOn.quantity > 1
                          ? `${addOn.name} x${addOn.quantity}`
                          : addOn.name
                      ).join(', ')}
                    </p>
                  )}
                  <p className="text-sm font-black text-zweren-black italic">₱{item.totalPrice} <span className="text-[10px] font-bold text-zweren-gray not-italic tracking-wider opacity-50 uppercase ml-1">each</span></p>

                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-1 bg-zweren-gray rounded-sm p-1 border border-zweren-silver/50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-zweren-silver rounded-sm transition-all duration-300 group"
                      >
                        <Minus className="h-3 w-3 text-zweren-black group-hover:scale-110" />
                      </button>
                      <span className="font-black text-zweren-black min-w-[40px] text-center text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-zweren-silver rounded-sm transition-all duration-300 group"
                      >
                        <Plus className="h-3 w-3 text-zweren-black group-hover:scale-110" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-6">
                      <p className="text-xl font-black text-zweren-lavender italic drop-shadow-[0_0_10px_rgba(188,166,255,0.2)]">₱{item.totalPrice * item.quantity}</p>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-sm transition-all duration-500 border border-transparent hover:border-red-600 active:scale-90"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-zweren-black rounded-sm shadow-2xl p-10 border border-zweren-lavender/30 relative overflow-hidden group">
        <div className="absolute inset-0 bg-zweren-lavender/5 animate-pulse group-hover:bg-zweren-lavender/10 transition-all duration-1000"></div>
        <div className="flex items-center justify-between text-4xl font-black mb-10 relative z-10 italic tracking-tighter">
          <span className="text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">Total</span>
          <span className="text-zweren-lavender drop-shadow-[0_0_20px_rgba(188,166,255,0.4)] tracking-tighter">₱{(getTotalPrice() || 0).toFixed(2)}</span>
        </div>

        <button
          onClick={onCheckout}
          className="w-full bg-zweren-lavender-gradient text-zweren-black py-6 rounded-sm hover:shadow-[0_0_50px_rgba(188,166,255,0.4)] transition-all duration-700 transform active:scale-95 font-black text-xs uppercase tracking-[0.4em] italic shadow-2xl relative z-10 border border-white/20"
        >
          Initialize Purchase 🛍️
        </button>
      </div>
    </div>
  );
};

export default Cart;