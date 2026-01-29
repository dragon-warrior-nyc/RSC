import { RelevanceMapping, RelevanceLabel } from './types';

export const RELEVANCE_OPTIONS: RelevanceLabel[] = [
  'Excellent',
  'Good',
  'Okay',
  'Bad',
  'Embarrassing',
  'Empty',
];

export const COLORS = {
  Excellent: 'bg-green-100 text-green-800 border-green-200',
  Good: 'bg-blue-100 text-blue-800 border-blue-200',
  Okay: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Bad: 'bg-orange-100 text-orange-800 border-orange-200',
  Embarrassing: 'bg-red-100 text-red-800 border-red-200',
  Empty: 'bg-gray-100 text-gray-800 border-gray-200',
};

// Paper Mapping (QIP)
// Excellent=1, Good=-1, Okay=-2, Bad=-2, Embarrassing=-3, Empty=0
export const PAPER_MAPPING: RelevanceMapping = {
  Excellent: 1.0,
  Good: -1.0,
  Okay: -2.0,
  Bad: -2.0,
  Embarrassing: -3.0,
  Empty: 0.0,
};

// Standard nDCG-like mapping (0 to 1 scale)
export const STANDARD_MAPPING: RelevanceMapping = {
  Excellent: 1.0,
  Good: 0.5,
  Okay: 0.1,
  Bad: 0.0,
  Embarrassing: -1.0,
  Empty: 0.0,
};
