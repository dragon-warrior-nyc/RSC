import React from 'react';
import { RelevanceLabel, RelevanceMapping } from '../types';
import { RELEVANCE_OPTIONS, COLORS } from '../constants';
import { ChevronDown } from 'lucide-react';

interface RelevanceSelectorProps {
  value: RelevanceLabel;
  onChange: (value: RelevanceLabel) => void;
  mapping: RelevanceMapping;
  options?: RelevanceLabel[];
}

const RelevanceSelector: React.FC<RelevanceSelectorProps> = ({ value, onChange, mapping, options = RELEVANCE_OPTIONS }) => {
  return (
    <div className="relative group w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as RelevanceLabel)}
        className={`w-full appearance-none px-3 py-2 pr-8 text-sm font-medium rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${COLORS[value]}`}
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-white text-gray-900">
            {option} ({mapping[option]})
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <ChevronDown className={`h-4 w-4 ${value === 'Excellent' ? 'text-green-700' : 'text-gray-500'}`} />
      </div>
    </div>
  );
};

export default RelevanceSelector;