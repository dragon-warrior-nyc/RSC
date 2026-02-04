import React from 'react';
import { CalculationResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface MetricsCardProps {
  results: CalculationResult;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ results }) => {
  const data = [
    { name: 'Search', value: results.searchRelevance, color: '#4F46E5' }, // Indigo 600
    { name: 'Combined', value: results.combinedRelevance, color: '#10B981' }, // Emerald 500
    { name: 'Ads', value: results.adsRelevance, color: '#F59E0B' }, // Amber 500
  ];

  // Helper to format numbers nicely
  const fmt = (n: number) => n.toFixed(3);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900">Results</h2>
      </div>

      <div className="p-6 grid gap-6">
        
        {/* Big Numbers */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
             <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Combined Relevance (from Customer View)</span>
             <div className="mt-1 text-3xl font-extrabold text-emerald-900">{fmt(results.combinedRelevance)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Search Relevance (from Organic)</span>
                <div className="mt-1 text-2xl font-bold text-indigo-900">{fmt(results.searchRelevance)}</div>
             </div>
             <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Ads Relevance (from Ads)</span>
                <div className="mt-1 text-2xl font-bold text-amber-900">{fmt(results.adsRelevance)}</div>
             </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" domain={[0, 1]} hide />
                <YAxis dataKey="name" type="category" width={70} tick={{fontSize: 12, fontWeight: 500}} />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <ReferenceLine x={0} stroke="#e5e7eb" />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;