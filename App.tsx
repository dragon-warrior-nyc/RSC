import React, { useState, useEffect, useMemo } from 'react';
import { Item, RelevanceLabel, RelevanceMapping } from './types';
import { PAPER_MAPPING, RELEVANCE_OPTIONS } from './constants';
import RelevanceSelector from './components/RelevanceSelector';
import MetricsCard from './components/MetricsCard';
import SettingsModal from './components/SettingsModal';
import { calculateRelevanceScores } from './utils/calculations';
import { Settings, Calculator, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [organicItems, setOrganicItems] = useState<Item[]>(
    Array.from({ length: 20 }, (_, i) => ({ id: `org-${i}`, label: 'Excellent' }))
  );
  const [numAds, setNumAds] = useState<number>(1);
  const [adsItems, setAdsItems] = useState<Item[]>(
    Array.from({ length: 1 }, (_, i) => ({ id: `ad-${i}`, label: 'Excellent' }))
  );
  
  const [mapping, setMapping] = useState<RelevanceMapping>(PAPER_MAPPING);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Filter out 'Empty' for Ads
  const adOptions = useMemo(() => RELEVANCE_OPTIONS.filter(opt => opt !== 'Empty'), []);

  // Sync ads array size with numAds
  useEffect(() => {
    setAdsItems(prev => {
      if (prev.length === numAds) return prev;
      if (prev.length < numAds) {
        // Add new ads
        const newAds = Array.from({ length: numAds - prev.length }, (_, i) => ({
          id: `ad-${prev.length + i}`,
          label: 'Excellent' as RelevanceLabel
        }));
        return [...prev, ...newAds];
      } else {
        // Remove ads
        return prev.slice(0, numAds);
      }
    });
  }, [numAds]);

  // Handlers
  const handleOrganicChange = (index: number, label: RelevanceLabel) => {
    const newItems = [...organicItems];
    newItems[index].label = label;
    setOrganicItems(newItems);
  };

  const handleAdChange = (index: number, label: RelevanceLabel) => {
    const newItems = [...adsItems];
    newItems[index].label = label;
    setAdsItems(newItems);
  };

  const handleSetAllOrganic = (label: RelevanceLabel) => {
    setOrganicItems(organicItems.map(item => ({ ...item, label })));
  };

  const handleSetAllAds = (label: RelevanceLabel) => {
    setAdsItems(adsItems.map(item => ({ ...item, label })));
  };

  // Calculations
  const results = useMemo(() => {
    return calculateRelevanceScores(organicItems, adsItems, mapping);
  }, [organicItems, adsItems, mapping]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <Calculator className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Relevance Score Calculator</h1>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            Mapping Settings
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Organic Items (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <span className="w-2 h-6 bg-indigo-500 rounded-sm mr-2"></span>
                Organic Items (20)
              </h2>
              <button 
                onClick={() => handleSetAllOrganic('Excellent')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reset All to Excellent
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                {organicItems.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-12 items-center p-3 hover:bg-gray-50 transition-colors">
                    <div className="col-span-2 text-xs font-mono text-gray-400 pl-2">
                      #{idx + 1}
                    </div>
                    <div className="col-span-10">
                      <RelevanceSelector 
                        value={item.label}
                        onChange={(val) => handleOrganicChange(idx, val)}
                        mapping={mapping}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column: Ads Configuration (Span 3) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <span className="w-2 h-6 bg-amber-500 rounded-sm mr-2"></span>
                Ads (k)
              </h2>
            </div>

            {/* Ads Slider Control */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Number of Ads (k): <span className="font-bold text-indigo-600 text-lg ml-1">{numAds}</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={numAds}
                onChange={(e) => setNumAds(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2 font-mono">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Ads List */}
            {numAds > 0 ? (
                <div className="space-y-3">
                   <div className="flex justify-end">
                      <button 
                        onClick={() => handleSetAllAds('Excellent')}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        Set All Excellent
                      </button>
                   </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                      {adsItems.map((item, idx) => (
                        <div key={item.id} className="grid grid-cols-12 items-center p-3 hover:bg-gray-50 transition-colors">
                           <div className="col-span-2 text-xs font-mono text-gray-400 pl-2">
                              #{idx + 1}
                           </div>
                           <div className="col-span-10">
                              <RelevanceSelector 
                                value={item.label}
                                onChange={(val) => handleAdChange(idx, val)}
                                mapping={mapping}
                                options={adOptions}
                              />
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-8 text-center">
                    <span className="text-sm text-gray-500">No ads selected (k=0)</span>
                </div>
            )}
          </div>

          {/* Right Column: Results (Span 4) */}
          <div className="lg:col-span-4">
            <MetricsCard results={results} />
            
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">How it works</h4>
              <p className="text-xs text-blue-700 mb-2 leading-relaxed">
                <strong>Combined Relevance</strong> assumes ads are placed at the top, pushing organic results down.
              </p>
              <p className="text-xs text-blue-700 mb-2 leading-relaxed">
                <strong>Search Relevance</strong> calculates the score of the organic list as if no ads were present.
              </p>
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Ads Relevance</strong> measures ad quality padded with perfect scores for the remaining slots.
              </p>
            </div>
          </div>

        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        mapping={mapping}
        onUpdateMapping={setMapping}
      />
    </div>
  );
};

export default App;