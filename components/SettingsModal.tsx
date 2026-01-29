import React from 'react';
import { RelevanceMapping } from '../types';
import { STANDARD_MAPPING, PAPER_MAPPING } from '../constants';
import { X, RotateCcw, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapping: RelevanceMapping;
  onUpdateMapping: (newMapping: RelevanceMapping) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, mapping, onUpdateMapping }) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof RelevanceMapping, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onUpdateMapping({ ...mapping, [key]: numValue });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Relevance Score Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                    Adjust the numeric value for each label. The calculated nDCG metrics depend directly on these weights.
                </p>
            </div>

          <div className="grid grid-cols-2 gap-3">
             <button
                onClick={() => onUpdateMapping(STANDARD_MAPPING)}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
             >
                Use Standard (0 to 1)
             </button>
             <button
                onClick={() => onUpdateMapping(PAPER_MAPPING)}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
             >
                Use Paper (QIP)
             </button>
          </div>

          <div className="space-y-3">
            {Object.keys(mapping).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 w-1/3">{key}</label>
                <input
                  type="number"
                  step="0.1"
                  value={mapping[key as keyof RelevanceMapping]}
                  onChange={(e) => handleChange(key as keyof RelevanceMapping, e.target.value)}
                  className="w-24 px-3 py-1.5 text-sm text-right border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
             <button
                onClick={() => onUpdateMapping(PAPER_MAPPING)}
                className="flex items-center text-xs text-gray-500 hover:text-indigo-600 mr-auto"
             >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset to Default (Paper)
             </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;