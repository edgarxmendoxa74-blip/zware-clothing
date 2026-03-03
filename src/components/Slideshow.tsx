import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';

// No default AI images allowed. Fallback will be handled in the component.
const defaultImages: string[] = [];

const Slideshow: React.FC = () => {
    const { siteSettings } = useSiteSettings();
    const images = siteSettings?.hero_images && siteSettings.hero_images.length > 0
        ? siteSettings.hero_images
        : defaultImages;

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(timer);
    }, [images.length]);

    const hasImages = images.length > 0;

    return (
        <div className="relative w-full h-[200px] md:h-[400px] overflow-hidden rounded-sm shadow-2xl border border-shein-border bg-shein-gray">
            {!hasImages ? (
                /* Fallback View: Show Site Logo or Branded Message */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white">
                    {siteSettings?.site_logo ? (
                        <img
                            src={siteSettings.site_logo}
                            alt={siteSettings.site_name}
                            className="max-h-[120px] md:max-h-[200px] object-contain mb-4 animate-fade-in"
                        />
                    ) : (
                        <h2 className="text-4xl font-black text-black uppercase tracking-tighter font-montserrat animate-pulse">
                            {siteSettings?.site_name || 'ZWEREN'}
                        </h2>
                    )}
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-shein-red mt-2">
                        Premium Lifestyle Brand
                    </p>
                </div>
            ) : (
                images.map((image: string, index: number) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <img
                            src={image}
                            alt={`Banner ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        {/* Subtle overlay for better depth */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                ))
            )}

            {/* Navigation Dots - Only show if multiple images */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_: string, index: number) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'bg-black w-4'
                                : 'bg-black/20 hover:bg-black/40'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Slideshow;
