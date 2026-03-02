import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
    images: string[];
    name: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, name }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-shein-gray flex items-center justify-center rounded-sm">
                <span className="text-black font-black text-6xl opacity-10">Z</span>
            </div>
        );
    }

    const nextImage = () => {
        setActiveIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image View */}
            <div className="relative aspect-square overflow-hidden bg-white border border-shein-border group">
                <img
                    src={images[activeIndex]}
                    alt={`${name} - ${activeIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-black rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            title="Previous image"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-black rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            title="Next image"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}

                {/* Floating Indicator for Mobile */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-[10px] font-black px-3 py-1 rounded-full md:hidden">
                    {activeIndex + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails Grid (Shopee style) */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {images.map((img, index) => (
                        <button
                            key={`${img}-${index}`}
                            onClick={() => setActiveIndex(index)}
                            onMouseEnter={() => setActiveIndex(index)} // Shopee-like hover effect
                            className={`relative flex-shrink-0 w-20 aspect-square border-2 transition-all duration-300 cursor-pointer overflow-hidden ${activeIndex === index
                                    ? 'border-shein-red'
                                    : 'border-transparent hover:border-shein-red/50'
                                }`}
                        >
                            <img
                                src={img}
                                alt={`${name} thumb ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {activeIndex === index && (
                                <div className="absolute inset-0 bg-shein-red/10 animate-pulse"></div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductGallery;
