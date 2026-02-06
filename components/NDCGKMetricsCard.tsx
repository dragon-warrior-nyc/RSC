import React from 'react';
import { NDCGKResult } from '../types';
import { Layers } from 'lucide-react';

interface NDCGKMetricsCardProps {
  results: NDCGKResult;
  ignoreEmptyAds: boolean;
}

const NDCGKMetricsCard: React.FC<NDCGKMetricsCardProps> = ({ results, ignoreEmptyAds }) => {
  // Helper to format numbers
  const fmt = (n: number) => n.toFixed(3);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">nDCG@k Analysis</h2>
      </div>

      <div className="p-6 grid gap-6">
        
        {/* Metric Rows */}
        <div className="space-y-4">
            
            {/* Organic Row */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Organic nDCG@{results.organicK}</span>
                </div>
                <div className="text-3xl font-bold text-slate-800">
                    {fmt(results.organicRelevance)}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                   {results.organicK === 0 ? 'No active items (Score 0.0)' : 'Baseline relevance (active items only)'}
                </p>
            </div>

            {/* Ads Row */}
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Ads nDCG@{results.adsK}</span>
                </div>
                <div className="text-3xl font-bold text-amber-800">
                    {fmt(results.adsRelevance)}
                </div>
                <p className="text-[10px] text-amber-600/70 mt-1">
                   {results.adsK === 0 
                    ? 'No active ads (Score 1.0)' 
                    : ignoreEmptyAds 
                        ? 'Empty slots ignored. Calculated on active ads only.'
                        : 'Padded with 1.0 for empty slots before the last ad.'
                   }
                </p>
            </div>

            {/* Combined Row */}
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                 <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Combined nDCG@{results.combinedK}</span>
                </div>
                <div className="text-3xl font-bold text-emerald-800">
                    {fmt(results.combinedRelevance)}
                </div>
                <p className="text-[10px] text-emerald-600/70 mt-1">
                   Customer view relevance (active items only)
                </p>
            </div>
        </div>

        {/* Explanation */}
        <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-2 border border-gray-200">
            <p className="font-semibold text-gray-800">Calculation Logic:</p>
            <ul className="list-disc pl-4 space-y-1">
                <li>
                    <strong>Organic</strong>: Standard nDCG@k on non-empty items. If no items, score is 0.
                </li>
                <li>
                    <strong>Ads</strong>: 
                    {ignoreEmptyAds 
                        ? ' Empty slots are ignored. Standard nDCG@k on non-empty ads. If no ads, score is 1.0.'
                        : ' nDCG calculated up to the position of the last Ad. Empty slots before the last Ad are treated as perfect matches (1.0). If no ads, score is 1.0.'
                    }
                </li>
                <li>
                    <strong>Combined</strong>: Standard nDCG@k on the final Customer View list (non-empty items only).
                </li>
            </ul>
        </div>

      </div>
    </div>
  );
};

export default NDCGKMetricsCard;