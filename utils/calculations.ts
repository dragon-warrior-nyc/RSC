import { Item, RelevanceMapping } from '../types';

/**
 * Calculates the normalization constant C_k
 * C_k = Sum_{i=1}^k 1 / log2(1 + i)
 */
export const calculateCk = (k: number): number => {
  let sum = 0;
  for (let i = 1; i <= k; i++) {
    sum += 1 / Math.log2(1 + i);
  }
  return sum;
};

const getScore = (label: string, mapping: RelevanceMapping): number => {
  return mapping[label as keyof RelevanceMapping] ?? 0;
};

/**
 * Calculates nDCG based metrics.
 * 
 * Assumptions:
 * - Organic Search (Eq 3.1): Uses all 20 organic items.
 * - Ads (Eq 5.5): Uses 20 positions. If position i has Ad, use Ad score. Else use 1.0 (perfect padding).
 * - Combined (Eq 5.1 generalized): Physical list construction. 
 *   Iterate positions 1..20. If Ad exists at i, use Ad. Else use next available Organic item.
 */
export const calculateRelevanceScores = (
  organicItems: Item[],
  adsItems: Item[],
  mapping: RelevanceMapping
) => {
  const K_TOTAL = 20;
  const c20 = calculateCk(K_TOTAL);

  // 1. Search Relevance (Eq 3.1)
  // Uses pure organic list 1..20
  let searchDCG = 0;
  for (let i = 0; i < K_TOTAL; i++) {
    const item = organicItems[i];
    const val = item ? getScore(item.label, mapping) : 0;
    const position = i + 1;
    searchDCG += val / Math.log2(1 + position);
  }
  const searchRelevance = searchDCG / c20;

  // 2. Ads Relevance (Eq 5.5)
  // Sum_{i=1}^20 r_i / log2(1+i)
  // where r_i = r(ad) if ad at i, else 1.0
  let adsDCG = 0;
  for (let i = 0; i < K_TOTAL; i++) {
    // adsItems is now length 20, mapping 1:1 to positions
    const adItem = adsItems[i];
    const hasAd = adItem && adItem.label !== 'Empty';
    
    let val = 0;
    if (hasAd) {
      val = getScore(adItem.label, mapping);
    } else {
      val = 1.0; // Perfect padding for non-ad slots (Eq 5.5 condition)
    }
    
    const position = i + 1;
    adsDCG += val / Math.log2(1 + position);
  }
  const adsRelevance = adsDCG / c20;


  // 3. Combined Relevance
  // Physical list construction: Ads displace organic items? 
  // Standard interpretation: If position i is an ad, it's an ad.
  // If position i is NOT an ad, we pull the next organic item from the organic list.
  let combinedDCG = 0;
  let organicPtr = 0;

  for (let i = 0; i < K_TOTAL; i++) {
    const adItem = adsItems[i];
    const hasAd = adItem && adItem.label !== 'Empty';
    
    let val = 0;
    if (hasAd) {
      val = getScore(adItem.label, mapping);
    } else {
      // Use next organic item
      if (organicPtr < organicItems.length) {
        val = getScore(organicItems[organicPtr].label, mapping);
        organicPtr++;
      } else {
        // Run out of organic items? (Shouldn't happen with 20 input items and max 20 positions)
        val = 0; 
      }
    }
    
    const position = i + 1;
    combinedDCG += val / Math.log2(1 + position);
  }
  
  const combinedRelevance = combinedDCG / c20;

  return {
    combinedRelevance,
    searchRelevance,
    adsRelevance,
    c20
  };
};
