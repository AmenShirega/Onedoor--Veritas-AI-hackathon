export type SupportCategoryId =
  | 'medical_support'
  | 'psychological_support'
  | 'protection_safeguarding'
  | 'legal_support'
  | 'sexual_violence_support'
  | 'social_support';

export type LanguageCode =
  | 'en'
  | 'am'
  | 'es'
  | 'fr'
  | 'ar'
  | 'pt'
  | 'de'
  | 'it'
  | 'zh-Hans'
  | 'zh-Hant'
  | 'ja'
  | 'ko'
  | 'hi'
  | 'bn'
  | 'ur'
  | 'sw'
  | 'ru'
  | 'tr'
  | 'id'
  | 'vi';

export const SUPPORT_CATEGORY_IDS: SupportCategoryId[] = [
  'medical_support',
  'psychological_support',
  'protection_safeguarding',
  'legal_support',
  'sexual_violence_support',
  'social_support',
];

export interface UserLocation {
  label: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  postalCode: string;
  source: 'manual' | 'geolocation_confirmed';
}

export interface GeocodedPlace {
  id: string;
  label: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  postalCode: string;
}

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

export type PartnerVerificationStatus = 'verified' | 'partner_integration_pending';

export interface HelpingCenter {
  id: string;
  name: string;
  pathwayType: string;
  verificationStatus: PartnerVerificationStatus;
  countryCode: string;
  countryName: string;
  region: string;
  city: string;
  postalPrefixes: string[];
  coverageScope: 'city' | 'region' | 'national';
  categories: SupportCategoryId[];
  hours24x7: boolean;
  hoursLabel: string;
  childSafeguardingCapable: boolean;
  languages: string[];
  contactNote: string;
  description: string;
}

export interface MatchedCenter {
  center: HelpingCenter;
  score: number;
  matchReasons: string[];
  isFallbackGeneralist: boolean;
}

export interface MatchingResult {
  matches: MatchedCenter[];
  verifiedServicesAvailable: boolean;
  matchedScope: 'city' | 'region' | 'national' | 'global' | 'none';
  reasonCode:
    | 'matched_verified'
    | 'no_verified_services_for_location'
    | 'no_verified_services_configured'
    | 'location_not_shared';
}

export type ReferralStatus = 'Saved locally (not transmitted)' | 'Withdrawn';

export type ReferralDeliveryStatus =
  | 'saved_locally_pending_partner_integration'
  | 'withdrawn';

export interface ReferralRecord {
  id: string;
  referenceCode: string;
  createdAt: string;
  status: ReferralStatus;
  deliveryStatus: ReferralDeliveryStatus;
  targetCenterId: string;
  targetCenterName: string;
  approvedSummary: string;
  approvedCategories: SupportCategoryId[];
  approvedLocation: string | null;
  urgencyFlagged: boolean;
  minorSafeguardingNoted: boolean;
  matchingExplanation: string[];
  consentApprovedAt: string;
}
