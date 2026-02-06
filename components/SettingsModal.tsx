import React from 'react';
import { RelevanceMapping } from '../types';
import { PAPER_MAPPING } from '../constants';
import { X, RotateCcw, AlertTriangle, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapping: RelevanceMapping;
  onUpdateMapping: (newMapping: RelevanceMapping) => void;
  ignoreEmptyAds: boolean;
  onToggleIgnoreEmptyAds: (val: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    mapping, 
    onUpdateMapping,
    ignoreEmptyAds,
    onToggleIgnoreEmptyAds
}) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof RelevanceMapping, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onUpdateMapping({ ...mapping, [key]: numValue });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
            {/* Logic Settings */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">nDCG@k Calculation Logic</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="flex items-start space-x-3 cursor-pointer">
                        <div className="relative flex items-center mt-0.5">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={ignoreEmptyAds}
                                onChange={(e) => onToggleIgnoreEmptyAds(e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                        <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">Treat Empty Ads as "Ignore"</span>
                            <p className="text-xs text-gray-500 mt-1">
                                If enabled, empty slots in Ads list are skipped (list is condensed). 
                                If disabled (default), empty slots before the last ad are treated as perfect (1.0).
                                <br/>
                                <span className="italic opacity-80">*Only applies to nDCG@k model.</span>
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Mapping Settings */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Relevance Label Mapping</h4>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start space-x-3">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                        Numeric values for each relevance label.
                    </p>
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
                <button
                    onClick={() => onUpdateMapping(PAPER_MAPPING)}
                    className="flex items-center text-xs text-gray-500 hover:text-indigo-600 mt-2"
                >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset Mapping to Default
                </button>
            </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
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