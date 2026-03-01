import React, { useState, useEffect } from 'react';

const images = [
    '/images/promo-1.png',
    '/images/promo-2.png',
    '/images/promo-3.png',
];

const Slideshow: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-xl shadow-2xl border border-zweren-lavender/20">
            {images.map((image, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <img
                        src={image}
                        alt={`Promo ${index + 1}`}
                        className="w-full h-full object-cover"
                    />
                    {/* Subtle overlay for better depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zweren-black/40 to-transparent" />
                </div>
            ))}

            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'bg-white w-6'
                                : 'bg-white/40 hover:bg-white/60'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Slideshow;
