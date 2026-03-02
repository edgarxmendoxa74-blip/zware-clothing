import React from 'react';

interface StepIndicatorProps {
    currentStep: 1 | 2 | 3 | 4;
}

const steps = [
    { number: 1, label: 'SHOP' },
    { number: 2, label: 'BAG' },
    { number: 3, label: 'CHECKOUT' },
    { number: 4, label: 'SHIP' },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-shein-border px-4 py-3 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between max-w-sm mx-auto">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.number}>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black transition-all duration-300 border-2 ${currentStep >= step.number
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-shein-text-gray border-shein-border'
                                        }`}
                                >
                                    {step.number}
                                </div>
                                <span
                                    className={`mt-1 text-[8px] font-black uppercase tracking-widest font-montserrat transition-colors duration-300 ${currentStep >= step.number ? 'text-black' : 'text-shein-text-gray opacity-50'
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`flex-1 h-[2px] mb-3.5 mx-2 transition-colors duration-300 ${currentStep > step.number ? 'bg-black' : 'bg-shein-border opacity-50'
                                        }`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StepIndicator;
