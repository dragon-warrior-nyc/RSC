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
 * - Ads (Eq 4.2): Uses k ads + (20-k) perfect fillers.
 * - Combined (Eq 2.2): Uses k ads (pos 1..k) + (20-k) organic items (pos k+1..20).
 *   Note: We implement the physical list interpretation of Combined nDCG where
 *   organic items are pushed down by k positions.
 */
export const calculateRelevanceScores = (
  organicItems: Item[],
  adsItems: Item[],
  mapping: RelevanceMapping
) => {
  const K_TOTAL = 20;
  const numAds = adsItems.length; // k
  const c20 = calculateCk(K_TOTAL);

  // 1. Search Relevance (Eq 3.1)
  // Sum_{i=1}^{20} r(o_i) / log2(1+i)
  let searchDCG = 0;
  for (let i = 0; i < K_TOTAL; i++) {
    // Indices in formula are 1-based, array is 0-based. Formula uses log2(1 + (i_1based))
    const item = organicItems[i];
    const val = item ? getScore(item.label, mapping) : 0;
    const position = i + 1;
    searchDCG += val / Math.log2(1 + position);
  }
  const searchRelevance = searchDCG / c20;

  // 2. Ads Relevance (Eq 4.2)
  // Sum_{i=1}^k r(a_i)/log2(1+i) + Sum_{i=k+1}^{20} 1/log2(1+i)
  let adsDCG = 0;
  
  // Part A: Actual Ads
  for (let i = 0; i < numAds; i++) {
    const item = adsItems[i];
    const val = item ? getScore(item.label, mapping) : 0;
    const position = i + 1;
    adsDCG += val / Math.log2(1 + position);
  }

  // Part B: Perfect Tail (1.0)
  for (let i = numAds; i < K_TOTAL; i++) {
    const position = i + 1;
    // Perfect match assumed to be 1.0 regardless of mapping? 
    // Paper Eq 4.2 explicitly uses '1' in the numerator for the tail, 
    // implying 'Excellent' or Max Potential is 1.
    adsDCG += 1.0 / Math.log2(1 + position);
  }
  const adsRelevance = adsDCG / c20;


  // 3. Combined Relevance (Eq 2.2)
  // Physically: Ads at 1..k, Organic at k+1..20.
  // Organic items o_1 to o_{20-k} are used. o_{20-k+1}..o_20 are dropped from view.
  let combinedDCG = 0;

  // Part A: Ads at top
  for (let i = 0; i < numAds; i++) {
    const item = adsItems[i];
    const val = item ? getScore(item.label, mapping) : 0;
    const position = i + 1;
    combinedDCG += val / Math.log2(1 + position);
  }

  // Part B: Organic pushed down
  const numOrganicUsed = K_TOTAL - numAds;
  for (let i = 0; i < numOrganicUsed; i++) {
    const item = organicItems[i];
    const val = item ? getScore(item.label, mapping) : 0;
    // Position in combined list is k + 1 + i
    const position = numAds + 1 + i; 
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
