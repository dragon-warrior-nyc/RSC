import React, { useState, useMemo } from 'react';
import { Item, RelevanceLabel, RelevanceMapping } from './types';
import { PAPER_MAPPING, RELEVANCE_OPTIONS, COLORS } from './constants';
import RelevanceSelector from './components/RelevanceSelector';
import MetricsCard from './components/MetricsCard';
import DisruptionMetricsCard from './components/DisruptionMetricsCard';
import NDCGKMetricsCard from './components/NDCGKMetricsCard';
import SettingsModal from './components/SettingsModal';
import { calculateRelevanceScores, calculateDisruptionScores, calculateNDCGKScores } from './utils/calculations';
import { Settings, Calculator, RefreshCw, Trash2, CheckCheck, Megaphone, FileText, Layers, Zap, BarChart3 } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'split' | 'disruption' | 'ndcgk'>('disruption');

  const [organicItems, setOrganicItems] = useState<Item[]>(
    Array.from({ length: 20 }, (_, i) => ({ id: `org-${i}`, label: 'Excellent' }))
  );
  
  const [adsItems, setAdsItems] = useState<Item[]>(
    Array.from({ length: 20 }, (_, i) => ({ 
      id: `ad-${i}`, 
      label: 'Empty' 
    }))
  );
  
  const [mapping, setMapping] = useState<RelevanceMapping>(PAPER_MAPPING);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
  const splitResults = useMemo(() => {
    return calculateRelevanceScores(organicItems, adsItems, mapping);
  }, [organicItems, adsItems, mapping]);

  const disruptionResults = useMemo(() => {
    return calculateDisruptionScores(organicItems, adsItems, mapping);
  }, [organicItems, adsItems, mapping]);

  const ndcgkResults = useMemo(() => {
    return calculateNDCGKScores(organicItems, adsItems, mapping);
  }, [organicItems, adsItems, mapping]);

  // Combined List Calculation for Visualization
  const combinedItems = useMemo(() => {
    const items: { 
      type: 'Ad' | 'Organic'; 
      label: RelevanceLabel; 
      originalIndex: number;
    }[] = [];
    
    let organicPtr = 0;

    for (let i = 0; i < 20; i++) {
      const adItem = adsItems[i];
      // Check if this position has a valid Ad
      if (adItem && adItem.label !== 'Empty') {
        items.push({
          type: 'Ad',
          label: adItem.label,
          originalIndex: i
        });
      } else {
        // Insert next organic item
        if (organicPtr < organicItems.length) {
          items.push({
            type: 'Organic',
            label: organicItems[organicPtr].label,
            originalIndex: organicPtr
          });
          organicPtr++;
        } else {
            // Placeholder if we run out of organic items (unlikely with equal lengths)
            items.push({
                type: 'Organic',
                label: 'Empty',
                originalIndex: -1
            });
        }
      }
    }
    return items;
  }, [organicItems, adsItems]);

  // Determine the last active Ad index for nDCG@k padding visualization
  const lastAdIndex = useMemo(() => {
    for (let i = adsItems.length - 1; i >= 0; i--) {
        if (adsItems[i].label !== 'Empty') return i;
    }
    return -1;
  }, [adsItems]);

  // Count active items for display
  const activeAdsCount = adsItems.filter(i => i.label !== 'Empty').length;
  const activeOrganicCount = organicItems.filter(i => i.label !== 'Empty').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <Calculator className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Relevance Score Calculator</h1>
          </div>
          
          <div className="flex items-center gap-4">
              {/* Tab Navigation */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('split')}
                    className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'split' 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Layers className="w-4 h-4 mr-2" />
                    Split Model
                </button>
                <button
                    onClick={() => setActiveTab('disruption')}
                    className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'disruption' 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Zap className="w-4 h-4 mr-2" />
                    Disruption Model
                </button>
                <button
                    onClick={() => setActiveTab('ndcgk')}
                    className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'ndcgk' 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    nDCG@k Model
                </button>
              </div>

              <div className="h-6 w-px bg-gray-300 mx-1"></div>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Column 1: Organic Items (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between h-8">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <span className="w-2 h-6 bg-indigo-500 rounded-sm mr-2"></span>
                Organic ({activeOrganicCount})
              </h2>
              <div className="flex items-center space-x-1">
                <button 
                    onClick={() => handleSetAllOrganic('Empty')}
                    className="text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors flex items-center"
                    title="Clear All (Set to Empty)"
                >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Clear
                </button>
                <button 
                    onClick={() => handleSetAllOrganic('Excellent')}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded transition-colors flex items-center"
                    title="Reset All to Excellent"
                >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Reset
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                {organicItems.map((item, idx) => {
                  // Restriction: One cannot choose empty if there are other organic items behind it (i.e. at higher index).
                  // Check if the next item exists and is NOT Empty.
                  const nextItem = organicItems[idx + 1];
                  const isNextItemActive = nextItem && nextItem.label !== 'Empty';
                  
                  // If there is an active item following this one, filter out 'Empty' from options
                  const itemOptions = isNextItemActive 
                    ? RELEVANCE_OPTIONS.filter(opt => opt !== 'Empty') 
                    : RELEVANCE_OPTIONS;
                  
                  // Formatting for nDCG@k and Disruption: Organic Empty has no score
                  const formatLabel = (opt: RelevanceLabel, score: number) => {
                    if ((activeTab === 'ndcgk' || activeTab === 'disruption') && opt === 'Empty') return 'Empty';
                    return `${opt} (${score})`;
                  };

                  return (
                    <div key={item.id} className="grid grid-cols-12 items-center p-3 hover:bg-gray-50 transition-colors">
                      <div className="col-span-2 text-xs font-mono text-gray-400 pl-1">
                        #{idx + 1}
                      </div>
                      <div className="col-span-10">
                        <RelevanceSelector 
                          value={item.label}
                          onChange={(val) => handleOrganicChange(idx, val)}
                          mapping={mapping}
                          options={itemOptions}
                          formatLabel={formatLabel}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Ads Configuration (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between h-8">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <span className="w-2 h-6 bg-amber-500 rounded-sm mr-2"></span>
                Ads ({activeAdsCount})
              </h2>
              <div className="flex items-center space-x-1">
                <button 
                    onClick={() => handleSetAllAds('Empty')}
                    className="text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors flex items-center"
                    title="Clear All (Set to Empty)"
                >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Clear
                </button>
                <button 
                    onClick={() => handleSetAllAds('Excellent')}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded transition-colors flex items-center"
                    title="Set All to Excellent"
                >
                    <CheckCheck className="w-3.5 h-3.5 mr-1" />
                    All Exc.
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                    {adsItems.map((item, idx) => {
                      // Formatting for nDCG@k: Ads Empty before last Ad are 1.0, others are Empty
                      // Formatting for Disruption: Empty is just Empty (skipped)
                      const formatLabel = (opt: RelevanceLabel, score: number) => {
                        if (activeTab === 'ndcgk' && opt === 'Empty') {
                            if (idx < lastAdIndex) return 'Empty (1.0)';
                            return 'Empty';
                        }
                        if (activeTab === 'disruption' && opt === 'Empty') {
                            return 'Empty';
                        }
                        return `${opt} (${score})`;
                      };

                      return (
                        <div key={item.id} className="grid grid-cols-12 items-center p-3 hover:bg-gray-50 transition-colors">
                            <div className="col-span-2 text-xs font-mono text-gray-400 pl-1">
                                #{idx + 1}
                            </div>
                            <div className="col-span-10">
                                <RelevanceSelector 
                                value={item.label}
                                onChange={(val) => handleAdChange(idx, val)}
                                mapping={mapping}
                                formatLabel={formatLabel}
                                />
                            </div>
                        </div>
                      );
                    })}
                </div>
            </div>
          </div>

          {/* Column 3: Combined View (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
             <div className="flex items-center justify-between h-8">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                    <span className="w-2 h-6 bg-emerald-500 rounded-sm mr-2"></span>
                    Customer View
                </h2>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                    {combinedItems.map((item, idx) => (
                        <div 
                            key={idx} 
                            className={`grid grid-cols-12 items-center p-3 transition-colors border-l-4 ${
                                item.type === 'Ad' 
                                    ? 'bg-amber-50 border-amber-400' 
                                    : 'hover:bg-gray-50 border-transparent'
                            }`}
                        >
                            <div className="col-span-2 text-xs font-mono text-gray-400 pl-1">
                                #{idx + 1}
                            </div>
                            <div className="col-span-10 flex items-center space-x-2">
                                {/* Type Badge */}
                                <div className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md border ${
                                    item.type === 'Ad' 
                                        ? 'bg-amber-100 border-amber-200 text-amber-600' 
                                        : 'bg-indigo-100 border-indigo-200 text-indigo-600'
                                }`}>
                                    {item.type === 'Ad' ? <Megaphone size={14} /> : <FileText size={14} />}
                                </div>

                                {/* Label and Source Index */}
                                <div className={`flex-grow flex items-center justify-between px-3 py-1.5 rounded-md border text-sm font-medium ${COLORS[item.label]}`}>
                                    <span>{item.label}</span>
                                    <span className="text-[10px] opacity-60 ml-2 font-mono">
                                        {item.type === 'Ad' ? 'Ad' : 'Org'} #{item.originalIndex + 1}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>

          {/* Column 4: Results (Span 3) - SWITCH BASED ON TAB */}
          <div className="lg:col-span-3">
            {activeTab === 'split' && (
                <>
                    <MetricsCard results={splitResults} />
                    <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">Split Model Logic</h4>
                        <p className="text-xs text-blue-700 mb-2 leading-relaxed">
                            <strong>Combined</strong>: Final list nDCG.
                        </p>
                        <p className="text-xs text-blue-700 mb-2 leading-relaxed">
                            <strong>Equation</strong>: Demonstrates the approximation that Combined ≈ Search + Ads - 1.
                        </p>
                    </div>
                </>
            )}
            
            {activeTab === 'disruption' && (
                <>
                    <DisruptionMetricsCard results={disruptionResults} />
                    <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-indigo-900 mb-2">Disruption Model Logic</h4>
                        <p className="text-xs text-indigo-700 mb-2 leading-relaxed">
                            Calculates standard nDCG@k where k is the actual number of displayed items. A null result would lead to a 0 score.
                        </p>
                        <p className="text-xs text-indigo-700 leading-relaxed">
                            <strong>Ads Disruption Score</strong> = Customer View Relevance - Organic Relevance.
                        </p>
                    </div>
                </>
            )}

            {activeTab === 'ndcgk' && (
                <>
                    <NDCGKMetricsCard results={ndcgkResults} />
                    <div className="mt-6 bg-gray-50 border border-gray-100 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">nDCG@k Model Logic</h4>
                         <p className="text-xs text-gray-700 mb-2 leading-relaxed">
                            <strong>Organic</strong>: Filter empty items, nDCG@count. (0 if none)
                        </p>
                        <p className="text-xs text-gray-700 mb-2 leading-relaxed">
                            <strong>Ads</strong>: nDCG calculated up to the last ad position. Empty slots before the last ad are padded with 1.0 (Excellent). (1.0 if none)
                        </p>
                        <p className="text-xs text-gray-700 mb-2 leading-relaxed">
                            <strong>Combined</strong>: Customer view, filter empty items, nDCG@count.
                        </p>
                    </div>
                </>
            )}
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