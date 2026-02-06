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
 * Calculates standard DCG for a list of items
 */
const calculateDCG = (items: Item[], mapping: RelevanceMapping): number => {
  let dcg = 0;
  items.forEach((item, index) => {
    const position = index + 1;
    const score = getScore(item.label, mapping);
    dcg += score / Math.log2(1 + position);
  });
  return dcg;
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

/**
 * Calculates Disruption Scores (Tab 2)
 * 
 * Logic:
 * 1. Filter Organic items (remove Empty). Calculate nDCG@k_org using Ck normalization.
 * 2. Construct Combined list (Ad + Org), filter Empty. Calculate nDCG@k_cust using Ck normalization.
 * 3. Disruption = CustomerView - Organic.
 * 
 * Note: We normalize by Ck (Ideal DCG of k "Excellent" items) per Equation 2.1, 
 * rather than the IDCG of the specific set of items (sorting them).
 * This allows negative scores for Embarrassing items to be reflected correctly (e.g., -3).
 */
export const calculateDisruptionScores = (
  organicItems: Item[],
  adsItems: Item[],
  mapping: RelevanceMapping
) => {
  // 1. Organic nDCG
  const activeOrganic = organicItems.filter(item => item.label !== 'Empty');
  const organicK = activeOrganic.length;
  
  let organicNDCG = 0;
  if (organicK > 0) {
    const dcg = calculateDCG(activeOrganic, mapping);
    const ck = calculateCk(organicK);
    organicNDCG = ck > 0 ? dcg / ck : 0;
  }

  // 2. Customer View Construction & nDCG
  const combinedItems: Item[] = [];
  let organicPtr = 0;
  const K_LIMIT = 20;

  for (let i = 0; i < K_LIMIT; i++) {
    const adItem = adsItems[i];
    const hasAd = adItem && adItem.label !== 'Empty';
    
    if (hasAd) {
      combinedItems.push(adItem);
    } else {
      if (organicPtr < organicItems.length) {
        combinedItems.push(organicItems[organicPtr]);
        organicPtr++;
      }
    }
  }

  const activeCustomer = combinedItems.filter(item => item.label !== 'Empty');
  const customerK = activeCustomer.length;

  let customerViewNDCG = 0;
  if (customerK > 0) {
    const dcg = calculateDCG(activeCustomer, mapping);
    const ck = calculateCk(customerK);
    customerViewNDCG = ck > 0 ? dcg / ck : 0;
  }

  // 3. Disrupter
  const disruptionScore = customerViewNDCG - organicNDCG;

  return {
    organicNDCG,
    customerViewNDCG,
    disruptionScore,
    organicK,
    customerK
  };
};

/**
 * Calculates nDCG@k Scores (Tab 3)
 */
export const calculateNDCGKScores = (
  organicItems: Item[],
  adsItems: Item[],
  mapping: RelevanceMapping,
  ignoreEmptyAds: boolean = false
) => {
  // 1. Organic Relevance
  // Same as disruption: filter empty, nDCG@count. If empty, 0.
  const activeOrganic = organicItems.filter(item => item.label !== 'Empty');
  const organicK = activeOrganic.length;
  let organicRelevance = 0;
  if (organicK > 0) {
    const dcg = calculateDCG(activeOrganic, mapping);
    const ck = calculateCk(organicK);
    organicRelevance = ck > 0 ? dcg / ck : 0;
  }

  // 2. Ads Relevance
  let adsRelevance = 0;
  let adsK = 0;

  if (ignoreEmptyAds) {
     // Option: Ignore Empty
     // Ignore all empty slots. Compute nDCG@k with only non-empty ads.
     const activeAds = adsItems.filter(item => item.label !== 'Empty');
     adsK = activeAds.length;

     if (adsK === 0) {
        adsRelevance = 1.0; // Convention: No ads = Perfect
     } else {
        const dcg = calculateDCG(activeAds, mapping);
        const ck = calculateCk(adsK);
        adsRelevance = ck > 0 ? dcg / ck : 0;
     }

  } else {
    // Option: Pad with 1.0 (Default)
    // nDCG@k where k is position of last ad. Pad with 1 if empty slot before last ad.
    // If no ads results (all empty), score is 1.0.
    let lastAdIndex = -1;
    for (let i = adsItems.length - 1; i >= 0; i--) {
        if (adsItems[i].label !== 'Empty') {
        lastAdIndex = i;
        break;
        }
    }

    adsK = lastAdIndex + 1; // 1-based count for Ck
    
    if (adsK === 0) {
        adsRelevance = 1.0;
    } else {
        let dcg = 0;
        // Iterate from 0 to lastAdIndex
        for (let i = 0; i < adsK; i++) {
        const item = adsItems[i];
        let val = 0;
        if (item.label !== 'Empty') {
            val = getScore(item.label, mapping);
        } else {
            val = 1.0; // Pad with 1 for empty slots before last ad
        }
        const position = i + 1;
        dcg += val / Math.log2(1 + position);
        }
        const ck = calculateCk(adsK);
        adsRelevance = ck > 0 ? dcg / ck : 0;
    }
  }

  // 3. Combined Relevance
  // Customer view, no padding after last item (same as disruption combined)
  const combinedItems: Item[] = [];
  let organicPtr = 0;
  const K_LIMIT = 20;

  for (let i = 0; i < K_LIMIT; i++) {
    const adItem = adsItems[i];
    const hasAd = adItem && adItem.label !== 'Empty';
    
    if (hasAd) {
      combinedItems.push(adItem);
    } else {
      if (organicPtr < organicItems.length) {
        combinedItems.push(organicItems[organicPtr]);
        organicPtr++;
      }
    }
  }

  const activeCombined = combinedItems.filter(item => item.label !== 'Empty');
  const combinedK = activeCombined.length;

  let combinedRelevance = 0;
  if (combinedK > 0) {
    const dcg = calculateDCG(activeCombined, mapping);
    const ck = calculateCk(combinedK);
    combinedRelevance = ck > 0 ? dcg / ck : 0;
  }

  return {
    organicRelevance,
    adsRelevance,
    combinedRelevance,
    organicK,
    adsK,
    combinedK
  };
};