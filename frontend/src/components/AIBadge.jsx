import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AIBadge({ confidence = 0.95, label = 'AI Extracted', source = '' }) {
  const percent = Math.round(confidence * 100);
  return (
    <span 
      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs"
      title={source ? `Extracted from: ${source}` : `AI-Assisted confidence: ${percent}%`}
    >
      <Sparkles className="w-2.5 h-2.5 text-purple-600" />
      <span>{label}</span>
      <span className="text-purple-400 font-normal">({percent}%)</span>
    </span>
  );
}
