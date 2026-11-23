import React from 'react';
import { Check, Circle } from 'lucide-react';

const STEPS = [
  'Draft',
  'Information Extraction',
  'Under Investigation',
  'Root Cause Review',
  'CAPA Review',
  'Pending Approval',
  'Closed'
];

export default function StatusStepper({ currentStatus, onStepClick }) {
  const currentIndex = STEPS.indexOf(currentStatus);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;

          return (
            <div 
              key={step} 
              className="flex flex-col items-center relative z-10 group cursor-pointer"
              onClick={() => onStepClick && onStepClick(step)}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110'
                    : 'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : idx + 1}
              </div>
              <span
                className={`mt-2 text-[11px] font-medium text-center whitespace-nowrap px-1 rounded transition ${
                  isCurrent
                    ? 'text-blue-700 font-bold'
                    : isCompleted
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
