import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';
import ProductGallery from './ProductGallery';

interface ProductDetailModalProps {
    item: MenuItem;
    onClose: () => void;
    onAddToCart: (item: MenuItem, quantity?: number, variation?: Variation, addOns?: AddOn[]) => void;
    onBuyNow: (item: MenuItem, quantity?: number, variation?: Variation, addOns?: AddOn[]) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
    item,
    onClose,
    onAddToCart,
    onBuyNow
}) => {
    const [selectedVariation, setSelectedVariation] = useState<Variation | undefined>(
        item.variations?.[0]
    );
    const [selectedAddOns, setSelectedAddOns] = useState<(AddOn & { quantity: number })[]>([]);
    const [quantity, setQuantity] = useState(1);

    // Determine which image to show: selected variation's image, or main product image
    const activeImage = (selectedVariation?.image) || item.image;
    const displayImages = activeImage ? [activeImage] : [];

    const calculatePrice = () => {
        let price = item.effectivePrice || item.basePrice;
        if (selectedVariation) {
            price += selectedVariation.price;
        }
        selectedAddOns.forEach(addOn => {
            price += addOn.price * addOn.quantity;
        });
        return price;
    };

    const handleAddToCart = () => {
        const addOnsForCart: AddOn[] = selectedAddOns.flatMap(addOn =>
            Array(addOn.quantity).fill({ ...addOn, quantity: undefined })
        );
        onAddToCart(item, quantity, selectedVariation, addOnsForCart);
        onClose();
    };

    const handleBuyNow = () => {
        const addOnsForCart: AddOn[] = selectedAddOns.flatMap(addOn =>
            Array(addOn.quantity).fill({ ...addOn, quantity: undefined })
        );
        onBuyNow(item, quantity, selectedVariation, addOnsForCart);
        onClose();
    };

    const updateAddOnQuantity = (addOn: AddOn, q: number) => {
        setSelectedAddOns(prev => {
            const existing = prev.find(a => a.id === addOn.id);
            if (q === 0) return prev.filter(a => a.id !== addOn.id);
            if (existing) {
                return prev.map(a => a.id === addOn.id ? { ...a, quantity: q } : a);
            }
            return [...prev, { ...addOn, quantity: q }];
        });
    };

    const groupedAddOns = item.addOns?.reduce((groups, addOn) => {
        const category = addOn.category;
        if (!groups[category]) groups[category] = [];
        groups[category].push(addOn);
        return groups;
    }, {} as Record<string, AddOn[]>);



    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div
                className="bg-white rounded-sm max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 bg-white/80 hover:bg-white text-black rounded-full shadow-md z-20 transition-all duration-300"
                    title="Close"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
                    {/* Left Column: Gallery */}
                    <div className="space-y-6">
                        <ProductGallery images={displayImages} name={item.name} />
                    </div>

                    {/* Right Column: Info & Options */}
                    <div className="flex flex-col h-full">
                        <div className="flex-1">
                            {/* Product Header */}
                            <div className="mb-6">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="bg-shein-red text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">Preferred</span>
                                    <h1 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight font-montserrat leading-tight">
                                        {item.name}
                                    </h1>
                                </div>



                                {/* Price Display */}
                                <div className="bg-shein-gray p-4 md:p-6 rounded-sm mb-8">
                                    <div className="flex items-center space-x-4">
                                        {item.isOnDiscount && item.basePrice && (
                                            <span className="text-gray-400 line-through text-lg">₱{item.basePrice.toFixed(0)}</span>
                                        )}
                                        <span className="text-3xl font-black text-shein-red font-montserrat">
                                            ₱{(item.effectivePrice || item.basePrice).toFixed(0)}
                                        </span>
                                        {item.isOnDiscount && (
                                            <span className="bg-shein-red text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-widest rounded-sm">
                                                -{Math.round(((item.basePrice - item.effectivePrice!) / item.basePrice) * 100)}% OFF
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Variations */}
                            {item.variations && item.variations.length > 0 && (
                                <div className="mb-8 pl-1">
                                    <div className="flex items-start mb-4">
                                        <span className="w-24 text-sm font-medium text-gray-500 pt-1">Variations</span>
                                        <div className="flex-1 flex flex-wrap gap-2">
                                            {item.variations.map((v) => {
                                                const isSelected = selectedVariation?.id === v.id;
                                                return (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => setSelectedVariation(v)}
                                                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all duration-300 rounded-sm ${isSelected
                                                            ? 'border-shein-red text-shein-red bg-shein-red/5'
                                                            : 'border-shein-border text-black hover:border-black'
                                                            }`}
                                                    >
                                                        {v.image && (
                                                            <img
                                                                src={v.image}
                                                                alt={v.name}
                                                                className="w-5 h-5 object-cover rounded-sm border border-shein-border flex-shrink-0"
                                                            />
                                                        )}
                                                        {v.name}
                                                        {v.price > 0 && ` (+₱${v.price.toFixed(0)})`}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Add-ons */}
                            {groupedAddOns && Object.keys(groupedAddOns).length > 0 && (
                                <div className="mb-8 pl-1">
                                    {Object.entries(groupedAddOns).map(([category, addOns]) => (
                                        <div key={category} className="flex items-start mb-6 last:mb-0">
                                            <span className="w-24 text-sm font-medium text-gray-500 pt-1 capitalize">{category.replace('-', ' ')}</span>
                                            <div className="flex-1 space-y-3">
                                                {addOns.map((addOn) => {
                                                    const selected = selectedAddOns.find(a => a.id === addOn.id);
                                                    return (
                                                        <div key={addOn.id} className="flex items-center justify-between group">
                                                            <span className="text-xs font-bold text-black uppercase tracking-wider">{addOn.name} (+₱{addOn.price.toFixed(0)})</span>
                                                            <div className="flex items-center space-x-2 border border-shein-border rounded-sm bg-white overflow-hidden p-0.5">
                                                                <button
                                                                    onClick={() => updateAddOnQuantity(addOn, (selected?.quantity || 1) - 1)}
                                                                    className="p-1 hover:bg-shein-gray transition-colors"
                                                                    disabled={!selected}
                                                                    title="Decrease quantity"
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </button>
                                                                <span className="text-xs font-black min-w-[20px] text-center">{selected?.quantity || 0}</span>
                                                                <button
                                                                    onClick={() => updateAddOnQuantity(addOn, (selected?.quantity || 0) + 1)}
                                                                    className="p-1 hover:bg-shein-gray transition-colors"
                                                                    title="Increase quantity"
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="mb-10 pl-1 flex items-center">
                                <span className="w-24 text-sm font-medium text-gray-500">Quantity</span>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center border border-shein-border rounded-sm bg-white p-1">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-3 py-1 hover:bg-shein-gray transition-colors"
                                            title="Decrease quantity"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-12 text-center text-sm font-black border-none focus:ring-0"
                                            title="Quantity"
                                        />
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-3 py-1 hover:bg-shein-gray transition-colors"
                                            title="Increase quantity"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky/Bottom Action Buttons */}
                        <div className="flex gap-4 pt-6 border-t border-shein-border mt-auto">
                            <button
                                onClick={handleAddToCart}
                                title={`Add to Bag - Total: ₱${calculatePrice().toFixed(0)}`}
                                className="flex-1 flex items-center justify-center space-x-3 py-4 bg-shein-red/10 text-shein-red border border-shein-red hover:bg-shein-red/20 transition-all duration-300 font-black text-xs uppercase tracking-[0.2em] font-montserrat"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                <span>Add To Bag</span>
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 flex items-center justify-center py-4 bg-shein-red text-white hover:bg-shein-red/90 transition-all duration-300 font-black text-xs uppercase tracking-[0.2em] font-montserrat shadow-lg hover:shadow-shein-red/20 active:scale-[0.98]"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Product Description */}
                <div className="bg-shein-gray/30 p-8 md:p-10 border-t border-shein-border">
                    <h3 className="text-[11px] font-black text-black uppercase tracking-[0.3em] mb-6 font-montserrat border-b border-shein-border pb-2 w-fit">
                        Product Specifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 mb-10">
                        <div className="flex py-2 border-b border-shein-border/50">
                            <span className="w-32 text-xs font-medium text-gray-500 uppercase tracking-widest">Category</span>
                            <span className="text-xs font-bold text-black uppercase">{item.category}</span>
                        </div>
                        <div className="flex py-2 border-b border-shein-border/50">
                            <span className="w-32 text-xs font-medium text-gray-500 uppercase tracking-widest">Weight</span>
                            <span className="text-xs font-bold text-black uppercase">{item.weight || 0.5}kg</span>
                        </div>
                        <div className="flex py-2 border-b border-shein-border/50">
                            <span className="w-32 text-xs font-medium text-gray-500 uppercase tracking-widest">Stock</span>
                            <span className="text-xs font-bold text-black uppercase">Available</span>
                        </div>
                    </div>

                    <h3 className="text-[11px] font-black text-black uppercase tracking-[0.3em] mb-6 font-montserrat border-b border-shein-border pb-2 w-fit">
                        Product Description
                    </h3>
                    <p className="text-xs font-medium text-gray-600 leading-relaxed whitespace-pre-wrap max-w-3xl">
                        {item.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
