import React, { useState } from 'react';
import { Plus, Minus, X } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';
import ProductDetailModal from './ProductDetailModal';

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
  const [showProductDetail, setShowProductDetail] = useState(false);

  const maxFlavors = 1; // Default to 1 selection for clothing (size/color)

  const calcDiscount = () => {
    if (!item.basePrice || !item.discountPrice) return 0;
    return Math.round(((item.basePrice - item.discountPrice) / item.basePrice) * 100);
  };

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProductDetail(true);
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
      <div className={`group bg-white border border-shein-border overflow-hidden transition-all duration-300 hover:shadow-md h-full flex flex-col ${!item.available ? 'opacity-60' : ''}`}>
        {/* Image Container with Badges */}
        <div className="relative aspect-[3/4] overflow-hidden bg-white">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              fetchpriority={item.popular ? "high" : "auto"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-shein-gray">
              <span className="text-black font-black text-4xl opacity-10">Z</span>
            </div>
          )}

          {/* Badges - Top Left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {item.isOnDiscount && item.discountPrice && (
              <div className="bg-shein-red text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-widest shadow-sm">
                -{calcDiscount()}%
              </div>
            )}
            {item.popular && (
              <div className="bg-black text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-widest">
                HOT
              </div>
            )}
          </div>

          {!item.available && (
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-black text-white text-[9px] font-black px-3 py-1 uppercase tracking-widest">SOLD OUT</span>
            </div>
          )}

          {/* Hover Eye Overlay (Shopee Style) */}
          <div
            className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center cursor-pointer"
            onClick={() => setShowProductDetail(true)}
          >
            <div className="bg-white/90 text-black text-[9px] font-black px-4 py-2 uppercase tracking-widest opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-xl border border-black/5">
              View Details
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-3 md:p-4 flex flex-col flex-1">
          <div className="flex-1">
            <h3 className="text-xs md:text-sm font-bold text-black uppercase tracking-widest mb-2 line-clamp-2 leading-tight font-inter">
              {item.name}
            </h3>

            <div className="flex items-center space-x-3 mt-2">
              <span className="text-base md:text-lg font-bold text-black font-montserrat tracking-tight">
                ₱{item.isOnDiscount ? item.discountPrice : item.basePrice}
              </span>
              {item.isOnDiscount && (
                <span className="text-[11px] text-shein-text-gray line-through decoration-shein-text-gray font-medium">
                  ₱{item.basePrice.toFixed(0)}
                </span>
              )}
            </div>
          </div>

          {/* Action Area */}
          <div className="mt-3">
            {!item.available ? (
              <button
                disabled
                className="w-full bg-shein-gray text-gray-400 py-2 text-[10px] font-black uppercase tracking-widest cursor-not-allowed"
              >
                Sold Out
              </button>
            ) : quantity === 0 ? (
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-2 text-[10px] font-black uppercase tracking-widest hover:bg-shein-red transition-all duration-300 active:scale-95"
              >
                {item.variations?.length || item.addOns?.length ? 'Select Options' : 'Add to Bag'}
              </button>
            ) : (
              <div className="flex items-center justify-center space-x-1 bg-white rounded-sm p-1 border border-black">
                <button
                  onClick={handleDecrement}
                  className="p-1 hover:bg-shein-gray rounded-sm transition-colors duration-200"
                  title="Decrease quantity"
                >
                  <Minus className="h-3 w-3 text-black" />
                </button>
                <span className="font-black text-black min-w-[24px] text-center text-[10px]">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="p-1 hover:bg-shein-gray rounded-sm transition-colors duration-200"
                  title="Increase quantity"
                >
                  <Plus className="h-3 w-3 text-black" />
                </button>
              </div>
            )}

            <div className="text-[7px] md:text-[9px] font-bold text-shein-text-gray uppercase tracking-tighter mt-1 text-center">
              Est. Weight: {(item.weight || 0.5).toFixed(1)}kg
            </div>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {
        showCustomization && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-sm max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border-t-8 border-zweren-black">
              <div className="sticky top-0 bg-white border-b border-shein-border p-6 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-lg font-black text-black uppercase font-montserrat tracking-tight">{item.name}</h3>
                  <p className="text-[9px] font-bold text-shein-text-gray uppercase tracking-widest mt-1">Personalize your selection</p>
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
                                    className="px-4 py-2 bg-zweren-black text-white rounded-sm hover:bg-zweren-lavender hover:text-black transition-all duration-500 text-[9px] font-black uppercase tracking-widest shadow-sm font-montserrat"
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
                    <span className="text-2xl font-black text-zweren-black font-montserrat">₱{calculatePrice().toFixed(0)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCustomizedAddToCart}
                  className="w-full py-5 bg-black text-white hover:bg-shein-red transition-all duration-500 font-black text-xs uppercase tracking-[0.3em] font-montserrat active:scale-95 shadow-lg"
                >
                  Add To Bag
                </button>
              </div>
            </div>
          </div>
        )
      }

      {showProductDetail && (
        <ProductDetailModal
          item={item}
          onClose={() => setShowProductDetail(false)}
          onAddToCart={(item, q, v, a) => {
            onAddToCart(item, q, v, a);
            setShowProductDetail(false);
          }}
        />
      )}

      {
        maxFlavors > 1 && selectedVariations.length !== maxFlavors && (
          <p className="text-center text-sm text-gray-600 mt-2">
            You've selected {selectedVariations.length} of {maxFlavors} required flavors
          </p>
        )
      }
    </>
  );
});

MenuItemCard.displayName = 'MenuItemCard';

export default MenuItemCard;