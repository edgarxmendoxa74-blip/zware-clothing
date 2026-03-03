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
        <div className="text-center py-24 bg-white border border-shein-border shadow-sm">
          <div className="text-6xl mb-6">🛍️</div>
          <h2 className="text-2xl font-black text-black mb-2 uppercase tracking-tight font-montserrat">Your bag is empty</h2>
          <p className="text-[10px] font-bold text-shein-text-gray mb-10 uppercase tracking-widest font-inter">Find your next favorite piece</p>
          <button
            onClick={onContinueShopping}
            className="bg-black text-white px-10 py-4 rounded-sm hover:bg-shein-red transition-all duration-300 font-black text-xs uppercase tracking-[0.3em] font-montserrat active:scale-95"
          >
            Shop Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-10 border-b border-shein-border pb-6">
        <button
          onClick={onContinueShopping}
          className="flex items-center space-x-3 text-black hover:text-shein-red transition-colors duration-300 font-black text-[10px] uppercase tracking-widest font-montserrat"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Continue Shopping</span>
        </button>
        <h1 className="text-2xl font-black text-black uppercase tracking-tight font-montserrat">Shopping Bag</h1>
        <button
          onClick={clearCart}
          className="text-shein-text-gray hover:text-shein-red transition-colors duration-300 font-black text-[10px] uppercase tracking-widest font-montserrat"
        >
          Clear Bag
        </button>
      </div>

      <div className="bg-white overflow-hidden mb-12 border border-shein-border">
        {cartItems.map((item, index) => {
          return (
            <div key={item.id} className={`p-6 ${index !== cartItems.length - 1 ? 'border-b border-shein-border' : ''} hover:bg-shein-gray transition-colors duration-300`}>
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
                  <h3 className="text-base font-black text-black mb-1 uppercase tracking-tight font-montserrat">{item.name}</h3>
                  {item.selectedVariations && item.selectedVariations.length > 0 ? (
                    <p className="text-[10px] text-shein-text-gray font-bold uppercase tracking-widest mb-1">Color/Size: {item.selectedVariations.map(v => v.name).join(' + ')}</p>
                  ) : item.selectedVariation ? (
                    <p className="text-[10px] text-shein-text-gray font-bold uppercase tracking-widest mb-1">Option: {item.selectedVariation.name}</p>
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
                  <p className="text-sm font-black text-zweren-black font-montserrat">₱{item.totalPrice} <span className="text-[10px] font-bold text-zweren-gray tracking-wider opacity-50 uppercase ml-1">each</span></p>

                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-1 bg-white border border-black p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-shein-gray transition-all duration-300"
                        title="Decrease quantity"
                      >
                        <Minus className="h-3 w-3 text-black" />
                      </button>
                      <span className="font-black text-black min-w-[32px] text-center text-[10px]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-shein-gray transition-all duration-300"
                        title="Increase quantity"
                      >
                        <Plus className="h-3 w-3 text-black" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-6">
                      <p className="text-lg font-black text-shein-red font-montserrat tracking-tight">₱{item.totalPrice * item.quantity}</p>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-sm transition-all duration-500 border border-transparent hover:border-red-600 active:scale-90"
                        title="Remove from bag"
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

      <div className="bg-white border border-shein-border p-8 shadow-sm">
        <div className="flex items-center justify-between text-2xl font-black mb-4 border-b border-shein-border pb-4 tracking-tight font-montserrat">
          <span className="text-black uppercase">Total</span>
          <span className="text-shein-red">₱{(getTotalPrice() || 0).toFixed(2)}</span>
        </div>

        {cartItems.reduce((acc, item) => acc + item.quantity, 0) > 9 && (
          <div className="mb-6 p-4 bg-shein-red/10 border border-shein-red rounded-sm">
            <p className="text-[10px] font-black text-shein-red uppercase tracking-widest text-center">
              ⚠️ Order Limit Reached: Max 9 items per package for shipping
            </p>
            <p className="text-[9px] text-shein-red/70 font-bold uppercase tracking-wider text-center mt-1">
              Please reduce quantity to 9 or fewer to proceed
            </p>
          </div>
        )}

        <button
          onClick={onCheckout}
          disabled={cartItems.reduce((acc, item) => acc + item.quantity, 0) > 9}
          className={`w-full py-5 rounded-sm transition-all duration-300 transform font-black text-xs uppercase tracking-[0.4em] font-montserrat shadow-md ${cartItems.reduce((acc, item) => acc + item.quantity, 0) > 9
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-black text-white hover:bg-shein-red active:scale-95'
            }`}
        >
          {cartItems.reduce((acc, item) => acc + item.quantity, 0) > 9 ? 'Limit Exceeded' : 'Checkout Now'}
        </button>
      </div>
    </div>
  );
};

export default Cart;