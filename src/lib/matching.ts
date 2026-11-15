import { SYNTHETIC_HELPING_CENTERS } from './directory';
import type {
  AddisSubCity,
  ClassificationResult,
  HelpingCenter,
  MatchedCenter,
  SupportCategoryId,
} from './types';

const CATEGORY_LABELS: Record<SupportCategoryId, string> = {
  medical_support: 'Medical support',
  psychological_support: 'Psychological support',
  protection_safeguarding: 'Protection & safeguarding',
  legal_support: 'Legal support',
  sexual_violence_support: 'Sexual-violence support',
  social_support: 'Social support',
};

export interface MatchingOptions {
  subCity?: AddisSubCity | string;
  minorInvolved?: boolean;
  centers?: HelpingCenter[];
  overrideCategories?: SupportCategoryId[];
}

/**
 * Separate matching algorithm that ranks synthetic Addis Ababa helping centers
 * from predicted support needs, optional manual sub-city, urgency, and minor safeguarding.
 * Guarantees relevant support options remain accessible even when ML confidence is low.
 */
export function rankHelpingCenters(
  classification: ClassificationResult,
  options: MatchingOptions = {}
): MatchedCenter[] {
  const centers = options.centers ?? SYNTHETIC_HELPING_CENTERS;
  const subCity =
    options.subCity && options.subCity !== 'Prefer not to say'
      ? options.subCity
      : null;

  const activeCategories =
    options.overrideCategories && options.overrideCategories.length > 0
      ? options.overrideCategories
      : classification.predictedCategories;

  const probMap = new Map<SupportCategoryId, number>(
    classification.predictions.map((p) => [p.id, p.probability])
  );

  const isLowConfidence =
    activeCategories.length === 0 || classification.lowConfidenceFallbackUsed;

  const ranked = centers.map((center) => {
    let score = 0;
    const matchReasons: string[] = [];

    // 1. Category alignment score
    const matchedCats = center.categories.filter((c) =>
      activeCategories.includes(c)
    );

    if (matchedCats.length > 0) {
      const catWeight = matchedCats.reduce(
        (sum, c) => sum + (probMap.get(c) ?? 0.55) * 32,
        0
      );
      score += catWeight;
      matchReasons.push(
        `Covers ${matchedCats.map((c) => CATEGORY_LABELS[c]).join(', ')}`
      );
    } else if (isLowConfidence) {
      // Breadth bonus when model confidence is low so support is never withheld
      score += center.categories.length * 8;
      matchReasons.push(
        'Included as a multi-service center while automated confidence is low'
      );
    }

    // 2. Manual Addis Ababa sub-city proximity (only if user entered one)
    if (subCity) {
      if (center.subCity === subCity) {
        score += 24;
        matchReasons.push(`Located in ${subCity} sub-city`);
      } else if (center.serviceAreas.includes(subCity)) {
        score += 14;
        matchReasons.push(`Serves ${subCity} sub-city`);
      } else if (center.serviceAreas.includes('City-wide')) {
        score += 7;
        matchReasons.push('Accepts referrals across Addis Ababa');
      }
    } else if (center.serviceAreas.includes('City-wide')) {
      score += 5;
      matchReasons.push('Serves Addis Ababa city-wide');
    }

    // 3. Urgent / 24-7 availability alignment
    if (classification.urgencyFlagged && center.hours24x7) {
      score += 18;
      matchReasons.push('24/7 intake hours align with possible urgency');
    }

    // 4. Minor safeguarding capability
    if (options.minorInvolved && center.childSafeguardingCapable) {
      score += 16;
      matchReasons.push('Includes youth / minor safeguarding coordination');
    }

    return {
      center,
      score: Math.round(score * 10) / 10,
      matchReasons:
        matchReasons.length > 0
          ? matchReasons
          : [`Offers ${center.categories.map((c) => CATEGORY_LABELS[c]).join(', ')}`],
      isFallbackGeneralist: matchedCats.length === 0 && isLowConfidence,
    };
  });

  ranked.sort((a, b) => b.score - a.score || a.center.name.localeCompare(b.center.name));
  return ranked;
}
