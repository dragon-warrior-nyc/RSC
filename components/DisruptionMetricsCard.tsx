import React from 'react';
import { DisruptionResult } from '../types';
import { ArrowRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface DisruptionMetricsCardProps {
  results: DisruptionResult;
}

const DisruptionMetricsCard: React.FC<DisruptionMetricsCardProps> = ({ results }) => {
  // Helper to format numbers
  const fmt = (n: number) => n.toFixed(3);
  const pct = (n: number) => (n * 100).toFixed(1) + '%';

  const isPositive = results.disruptionScore > 0;
  const isNeutral = Math.abs(results.disruptionScore) < 0.001;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Ads Disruption Analysis</h2>
      </div>

      <div className="p-6 grid gap-8">
        
        {/* Main Result: The Disrupter Score */}
        <div className={`rounded-xl p-6 border text-center relative overflow-hidden ${
             isNeutral ? 'bg-gray-50 border-gray-200' :
             isPositive ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
        }`}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Ads Disruption Score</h3>
            <div className={`text-5xl font-extrabold flex items-center justify-center gap-2 ${
                isNeutral ? 'text-gray-700' :
                isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}>
                {results.disruptionScore > 0 && '+'}
                {fmt(results.disruptionScore)}
            </div>
            <p className="mt-2 text-sm text-gray-600">
                (Customer View - Organic)
            </p>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-1 gap-2">
            
            {/* Organic Row */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase">Organic nDCG@{results.organicK}</span>
                    <span className="text-xs text-slate-400">Baseline Relevance</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                    {fmt(results.organicNDCG)}
                </div>
            </div>

            <div className="flex justify-center -my-3 z-10">
                <div className="bg-white border border-gray-200 rounded-full p-1 shadow-sm text-gray-400">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
            </div>

            {/* Customer View Row */}
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                 <div className="flex flex-col">
                    <span className="text-xs font-bold text-indigo-500 uppercase">Customer nDCG@{results.customerK}</span>
                    <span className="text-xs text-indigo-400">Realized Relevance</span>
                </div>
                <div className="text-2xl font-bold text-indigo-800">
                    {fmt(results.customerViewNDCG)}
                </div>
            </div>
        </div>

        {/* Explanation */}
        <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-2 border border-gray-200">
            <p className="font-semibold text-gray-800">Logic:</p>
            <ul className="list-disc pl-4 space-y-1">
                <li>
                    <strong>Organic nDCG</strong>: Calculated using only non-empty organic items (nDCG@k). A null result would lead to a 0 score.
                </li>
                <li>
                    <strong>Customer nDCG</strong>: Calculated using the final combined list of non-empty items (nDCG@k). A null result would lead to a 0 score.
                </li>
                <li>
                    <strong>Interpretation</strong>: A positive score means Ads improved the overall relevance compared to organic alone. A negative score means Ads disrupted the relevance.
                </li>
            </ul>
        </div>

      </div>
    </div>
  );
};

export default DisruptionMetricsCard;