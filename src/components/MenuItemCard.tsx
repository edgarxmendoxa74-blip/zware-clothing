import React, { useState } from 'react';
import { Plus, Minus, X } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity?: number, variation?: Variation, addOns?: AddOn[], variations?: Variation[]) => void;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = React.memo(({
  item,
  onAddToCart,
  quantity,
  onUpdateQuantity
}) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | undefined>(
    item.variations?.[0]
  );
  const [selectedVariations, setSelectedVariations] = useState<Variation[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<(AddOn & { quantity: number })[]>([]);

  const maxFlavors = 1; // Default to 1 selection for clothing (size/color)

  const calculatePrice = () => {
    // Use effective price (discounted or regular) as base
    let price = item.effectivePrice || item.basePrice;

    if (selectedVariation) {
      price = (item.effectivePrice || item.basePrice) + selectedVariation.price;
    }

    selectedAddOns.forEach(addOn => {
      price += addOn.price * addOn.quantity;
    });
    return price;
  };

  const handleAddToCart = () => {
    if (item.variations?.length || item.addOns?.length) {
      setShowCustomization(true);
    } else {
      onAddToCart(item, 1);
    }
  };

  const handleCustomizedAddToCart = () => {
    // Convert selectedAddOns back to regular AddOn array for cart
    const addOnsForCart: AddOn[] = selectedAddOns.flatMap(addOn =>
      Array(addOn.quantity).fill({ ...addOn, quantity: undefined })
    );

    onAddToCart(item, 1, selectedVariation, addOnsForCart);

    setShowCustomization(false);
    setSelectedAddOns([]);
    setSelectedVariations([]);
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onUpdateQuantity(item.id, quantity - 1);
    }
  };

  const updateAddOnQuantity = (addOn: AddOn, quantity: number) => {
    setSelectedAddOns(prev => {
      const existingIndex = prev.findIndex(a => a.id === addOn.id);

      if (quantity === 0) {
        // Remove add-on if quantity is 0
        return prev.filter(a => a.id !== addOn.id);
      }

      if (existingIndex >= 0) {
        // Update existing add-on quantity
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity };
        return updated;
      } else {
        // Add new add-on with quantity
        return [...prev, { ...addOn, quantity }];
      }
    });
  };

  const groupedAddOns = item.addOns?.reduce((groups, addOn) => {
    const category = addOn.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(addOn);
    return groups;
  }, {} as Record<string, AddOn[]>);

  return (
    <>
      <div className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group animate-scale-in border border-gray-100 ${!item.available ? 'opacity-60' : ''}`}>
        {/* Image Container with Badges */}
        <div className="relative h-40 md:h-64 bg-zweren-gray">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              fetchpriority={item.popular ? "high" : "auto"}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`absolute inset-0 flex items-center justify-center ${item.image ? 'hidden' : ''}`}>
            <div className="text-4xl md:text-6xl opacity-10 text-zweren-black italic font-black">Z</div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 md:gap-2">
            {item.isOnDiscount && item.discountPrice && (
              <div className="bg-zweren-black text-white text-[8px] md:text-[10px] font-black tracking-widest px-2 py-1 md:px-3 md:py-1.5 rounded-sm shadow-lg uppercase italic">
                SALE
              </div>
            )}
            {item.popular && (
              <div className="bg-zweren-lavender text-black text-[8px] md:text-[10px] font-black tracking-widest px-2 py-1 md:px-3 md:py-1.5 rounded-sm shadow-[0_0_15px_rgba(188,166,255,0.4)] uppercase italic">
                FEATURED
              </div>
            )}
          </div>

          {!item.available && (
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-black text-white text-[8px] md:text-[10px] font-black tracking-widest px-3 py-1 md:px-4 md:py-2 uppercase">SOLDOUT</span>
            </div>
          )}

          {/* Discount Percentage Badge */}
          {item.isOnDiscount && item.discountPrice && (
            <div className="absolute bottom-2 right-2 bg-white text-zweren-black text-[8px] md:text-[10px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-sm shadow-lg border-l-2 md:border-l-4 border-zweren-lavender uppercase italic">
              -{Math.round(((item.basePrice - item.discountPrice) / item.basePrice) * 100)}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 md:p-6">
          <div className="flex items-start justify-between mb-1 md:mb-2">
            <h4 className="text-[10px] md:text-base font-bold text-zweren-black tracking-tighter md:tracking-tight leading-tight uppercase italic">{item.name}</h4>
          </div>

          <p className={`text-[9px] md:text-xs mb-3 md:mb-6 font-medium leading-relaxed line-clamp-2 md:line-clamp-none ${!item.available ? 'text-gray-400' : 'text-gray-500'}`}>
            {!item.available ? 'Currently Out of Stock' : item.description}
          </p>

          {/* Pricing Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:mb-4">
            <div className="flex-1">
              {item.isOnDiscount && item.discountPrice ? (
                <div className="flex items-baseline space-x-1 md:space-x-2">
                  <span className="text-sm md:text-xl font-black text-zweren-black italic">
                    ₱{item.discountPrice.toFixed(0)}
                  </span>
                  <span className="text-[8px] md:text-xs text-gray-400 line-through font-bold">
                    ₱{item.basePrice.toFixed(0)}
                  </span>
                </div>
              ) : (
                <div className="text-sm md:text-xl font-black text-zweren-black italic">
                  ₱{item.basePrice.toFixed(0)}
                </div>
              )}
              <div className="text-[7px] md:text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">
                Est. Weight: {(item.weight || 0.5).toFixed(1)}kg
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0">
              {!item.available ? (
                <button
                  disabled
                  className="w-full md:w-auto border border-gray-200 text-gray-300 px-2 py-1.5 md:px-4 md:py-2 rounded-sm cursor-not-allowed font-black text-[8px] md:text-[10px] uppercase tracking-widest"
                >
                  Sold Out
                </button>
              ) : quantity === 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="w-full md:w-auto bg-zweren-black text-white px-3 py-2 md:px-6 md:py-2.5 rounded-sm hover:bg-zweren-lavender hover:text-black transition-all duration-500 font-black text-[8px] md:text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_25px_rgba(188,166,255,0.3)] active:scale-95 italic"
                >
                  {item.variations?.length || item.addOns?.length ? (window.innerWidth < 768 ? 'Select' : 'Select Options') : 'Add'}
                </button>
              ) : (
                <div className="flex items-center justify-center space-x-1 bg-zweren-gray rounded-sm p-1 border border-zweren-silver">
                  <button
                    onClick={handleDecrement}
                    className="p-1 md:p-1.5 hover:bg-white rounded-sm transition-colors duration-200"
                    title="Decrease quantity"
                  >
                    <Minus className="h-3 h-3 md:h-3.5 md:w-3.5 text-zweren-black" />
                  </button>
                  <span className="font-black text-zweren-black min-w-[20px] md:min-w-[28px] text-center text-[10px] md:text-xs">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="p-1 md:p-1.5 hover:bg-white rounded-sm transition-colors duration-200"
                    title="Increase quantity"
                  >
                    <Plus className="h-3 h-3 md:h-3.5 md:w-3.5 text-zweren-black" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Variations summary */}
          {item.variations && item.variations.length > 0 && (
            <div className="hidden md:block text-[9px] uppercase tracking-widest text-zweren-gray font-bold">
              {item.variations.length} options
            </div>
          )}
        </div>
      </div>

      {/* Customization Modal */}
      {showCustomization && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-sm max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border-t-8 border-zweren-black">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-8 flex items-center justify-between z-10">
              <div>
                <h3 className="text-xl font-black text-zweren-black uppercase italic tracking-tighter">{item.name}</h3>
                <p className="text-[10px] font-bold text-zweren-gray uppercase tracking-widest mt-1">Select your preferences</p>
              </div>
              <button
                onClick={() => setShowCustomization(false)}
                className="p-2 hover:bg-zweren-gray rounded-full transition-colors duration-200"
                title="Close customization options"
              >
                <X className="h-5 w-5 text-zweren-black" />
              </button>
            </div>

            <div className="p-8">
              {/* Variations (Size/Color) */}
              {item.variations && item.variations.length > 0 && (
                <div className="mb-10">
                  <h4 className="text-[11px] font-black text-zweren-black uppercase tracking-[0.2em] mb-4">
                    Choose Variation
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    {item.variations.map((variation) => {
                      const isSelected = selectedVariation?.id === variation.id;

                      return (
                        <label
                          key={variation.id}
                          className={`flex items-center space-x-3 p-4 border-2 rounded-sm cursor-pointer transition-all duration-500 ${isSelected
                            ? 'border-zweren-black bg-zweren-gray shadow-inner'
                            : 'border-zweren-silver hover:border-zweren-lavender bg-white'
                            }`}
                        >
                          <input
                            type="radio"
                            name="variation"
                            checked={!!isSelected}
                            onChange={() => setSelectedVariation(variation)}
                            className="hidden"
                          />
                          <div className="flex-1 flex items-center justify-between">
                            <span className={`font-black uppercase text-[10px] tracking-wider ${isSelected ? 'text-black' : 'text-gray-500'}`}>
                              {variation.name}
                            </span>
                            {variation.price > 0 && (
                              <span className="text-zweren-lavender font-black text-[10px]">
                                +₱{variation.price.toFixed(0)}
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add-ons (e.g., Gift Wrap) */}
              {groupedAddOns && Object.keys(groupedAddOns).length > 0 && (
                <div className="mb-10">
                  <h4 className="text-[11px] font-black text-zweren-black uppercase tracking-[0.2em] mb-4">Add-ons</h4>
                  {Object.entries(groupedAddOns).map(([category, addOns]) => (
                    <div key={category} className="mb-6">
                      <h5 className="text-[9px] font-black text-zweren-gray mb-3 uppercase tracking-widest border-b border-zweren-silver pb-1">
                        {category.replace('-', ' ')}
                      </h5>
                      <div className="space-y-3">
                        {addOns.map((addOn) => (
                          <div
                            key={addOn.id}
                            className="flex items-center justify-between p-4 border border-zweren-silver rounded-sm bg-zweren-gray/30"
                          >
                            <div className="flex-1">
                              <span className="text-[10px] font-black text-zweren-black uppercase tracking-wider">{addOn.name}</span>
                              <div className="text-[9px] font-bold text-zweren-gray uppercase mt-0.5">
                                {addOn.price > 0 ? `₱${addOn.price.toFixed(0)} each` : 'Complimentary'}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {selectedAddOns.find(a => a.id === addOn.id) ? (
                                <div className="flex items-center space-x-2 bg-white rounded-sm p-1 border border-zweren-black">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 1) - 1);
                                    }}
                                    className="p-1.5 hover:bg-zweren-gray rounded-sm transition-colors duration-200"
                                    title="Decrease add-on quantity"
                                  >
                                    <Minus className="h-3 w-3 text-black" />
                                  </button>
                                  <span className="font-black text-black min-w-[24px] text-center text-[10px]">
                                    {selectedAddOns.find(a => a.id === addOn.id)?.quantity || 0}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 0) + 1);
                                    }}
                                    className="p-1.5 hover:bg-zweren-gray rounded-sm transition-colors duration-200"
                                    title="Increase add-on quantity"
                                  >
                                    <Plus className="h-3 w-3 text-black" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => updateAddOnQuantity(addOn, 1)}
                                  className="px-4 py-2 bg-zweren-black text-white rounded-sm hover:bg-zweren-lavender hover:text-black transition-all duration-500 text-[9px] font-black uppercase tracking-widest shadow-sm italic"
                                >
                                  Add
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Summary */}
              <div className="border-t border-zweren-silver pt-6 mb-8 mt-10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-zweren-gray uppercase tracking-[0.2em]">Total Price</span>
                  <span className="text-2xl font-black text-zweren-black italic">₱{calculatePrice().toFixed(0)}</span>
                </div>
              </div>

              <button
                onClick={handleCustomizedAddToCart}
                className="w-full py-5 bg-zweren-black text-white hover:bg-zweren-lavender hover:text-black transition-all duration-700 font-black text-xs uppercase tracking-[0.3em] italic shadow-2xl active:scale-95 border border-transparent hover:border-zweren-lavender/30"
              >
                Add To Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {maxFlavors > 1 && selectedVariations.length !== maxFlavors && (
        <p className="text-center text-sm text-gray-600 mt-2">
          You've selected {selectedVariations.length} of {maxFlavors} required flavors
        </p>
      )}
    </>
  );
});

MenuItemCard.displayName = 'MenuItemCard';

export default MenuItemCard;