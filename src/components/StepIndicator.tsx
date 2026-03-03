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
        <div className="bg-white border-b border-shein-border px-4 py-2 flex justify-center">
            <div className="flex items-center space-x-3">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        <div className="flex items-center">
                            <span
                                className={`text-[8px] font-black uppercase tracking-[0.2em] font-montserrat transition-colors duration-300 ${currentStep >= step.number ? 'text-black' : 'text-gray-300'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <span className="text-[10px] text-gray-200">/</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default StepIndicator;
