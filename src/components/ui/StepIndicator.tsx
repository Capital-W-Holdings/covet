'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('mb-8', className)}>
      {/* Progress bar */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
        
        {/* Progress line */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-brand-gold transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = currentStep > stepNumber;
            const isCurrent = currentStep === stepNumber;
            const isUpcoming = currentStep < stepNumber;

            return (
              <div key={step.label} className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-300 bg-white',
                    isCompleted && 'bg-brand-gold border-brand-gold text-white',
                    isCurrent && 'border-brand-gold text-brand-gold',
                    isUpcoming && 'border-gray-300 text-gray-400'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors',
                      isCurrent && 'text-brand-charcoal',
                      isCompleted && 'text-gray-600',
                      isUpcoming && 'text-gray-400'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estimated time */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <span className="font-medium">Step {currentStep} of {steps.length}</span>
        <span className="mx-2">•</span>
        <span>~{Math.max(1, steps.length - currentStep + 1)} min remaining</span>
      </div>
    </div>
  );
}

// Compact horizontal variant for mobile
export function StepIndicatorCompact({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('mb-6', className)}>
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900">
          Step {currentStep}/{steps.length}
        </span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-gold transition-all duration-500 rounded-full"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Current step label */}
      <p className="mt-2 text-sm text-gray-600">
        {steps[currentStep - 1]?.label}
      </p>
    </div>
  );
}
