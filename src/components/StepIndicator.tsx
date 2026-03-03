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
        <div className="bg-white border-b border-shein-border px-4 py-2.5 md:hidden">
            <div className="flex items-center justify-center max-w-sm mx-auto">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        <div className="flex items-center">
                            <div
                                className={`flex items-center justify-center w-4 h-4 rounded-full text-[8px] font-black transition-all duration-300 border ${currentStep >= step.number
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-shein-text-gray border-shein-border'
                                    }`}
                            >
                                {step.number}
                            </div>
                            <span
                                className={`ml-1 text-[8px] font-bold uppercase tracking-widest font-montserrat transition-colors duration-300 ${currentStep >= step.number ? 'text-black' : 'text-shein-text-gray opacity-50'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="mx-2 text-[8px] text-shein-border font-light">
                                <span className="opacity-50">/</span>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default StepIndicator;
