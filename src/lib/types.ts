export type SupportCategoryId =
  | 'medical_support'
  | 'psychological_support'
  | 'protection_safeguarding'
  | 'legal_support'
  | 'sexual_violence_support'
  | 'social_support';

export type LanguageCode = 'en' | 'am';

export const SUPPORT_CATEGORY_IDS: SupportCategoryId[] = [
  'medical_support',
  'psychological_support',
  'protection_safeguarding',
  'legal_support',
  'sexual_violence_support',
  'social_support',
];

export const ADDIS_SUBCITIES = [
  'Prefer not to say',
  'Bole',
  'Kirkos',
  'Yeka',
  'Arada',
  'Lideta',
  'Kolfe Keranio',
  'Nifas Silk-Lafto',
  'Gullele',
  'Akaky Kaliti',
  'Lemi Kura',
] as const;

export type AddisSubCity = (typeof ADDIS_SUBCITIES)[number];

export interface ModelWeightsFile {
  model_version: string;
  trainer: string;
  labels: SupportCategoryId[];
  vocab: Record<string, number>;
  idf: number[];
  label_models: Record<
    SupportCategoryId,
    {
      coef: number[];
      intercept: number;
      threshold: number;
    }
  >;
  urgency_model: {
    coef: number[];
    intercept: number;
    threshold: number;
  };
  uncertainty_band: {
    low: number;
    high: number;
  };
}

export type UncertaintyLevel = 'clear' | 'uncertain' | 'low_confidence';

export interface CategoryPrediction {
  id: SupportCategoryId;
  probability: number;
  predicted: boolean;
  uncertainty: UncertaintyLevel;
  contributingTerms: string[];
}

export interface ClassificationResult {
  modelVersion: string;
  predictions: CategoryPrediction[];
  predictedCategories: SupportCategoryId[];
  urgencyFlagged: boolean;
  urgencyProbability: number;
  urgencyUncertainty: UncertaintyLevel;
  overallConfidence: 'moderate_or_higher' | 'uncertain' | 'low';
  lowConfidenceFallbackUsed: boolean;
  uncertaintyMessage: string;
  inputWordCount: number;
  nonEnglishWarning: boolean;
}

export interface HelpingCenter {
  id: string;
  name: string;
  synthetic: true;
  subCity: Exclude<AddisSubCity, 'Prefer not to say'>;
  serviceAreas: string[];
  categories: SupportCategoryId[];
  hours24x7: boolean;
  hoursLabel: string;
  childSafeguardingCapable: boolean;
  languages: string[];
  syntheticPhone: string;
  syntheticAddress: string;
  description: string;
}

export interface MatchedCenter {
  center: HelpingCenter;
  score: number;
  matchReasons: string[];
  isFallbackGeneralist: boolean;
}

export type ReferralStatus = 'Received' | 'In Review' | 'Acknowledged (Demo)';

export interface ReferralRecord {
  id: string;
  referenceCode: string;
  createdAt: string;
  syntheticDemo: true;
  status: ReferralStatus;
  targetCenterId: string;
  targetCenterName: string;
  approvedSummary: string;
  approvedCategories: SupportCategoryId[];
  approvedSubCity: string | null;
  urgencyFlagged: boolean;
  minorSafeguardingNoted: boolean;
  matchingExplanation: string[];
  consentApprovedAt: string;
}
