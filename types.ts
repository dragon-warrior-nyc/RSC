export type RelevanceLabel = 'Excellent' | 'Good' | 'Okay' | 'Bad' | 'Embarrassing' | 'Empty';

export interface RelevanceMapping {
  Excellent: number;
  Good: number;
  Okay: number;
  Bad: number;
  Embarrassing: number;
  Empty: number;
}

export interface Item {
  id: string;
  label: RelevanceLabel;
}

export interface CalculationResult {
  combinedRelevance: number;
  searchRelevance: number;
  adsRelevance: number;
  c20: number;
}
