import { VERIFIED_SERVICE_DIRECTORY } from './directory';
import type {
  ClassificationResult,
  HelpingCenter,
  MatchedCenter,
  MatchingResult,
  SupportCategoryId,
  UserLocation,
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
  location?: UserLocation | null;
  minorInvolved?: boolean;
  centers?: HelpingCenter[];
  overrideCategories?: SupportCategoryId[];
}

function normalizeStr(val: string | undefined | null): string {
  return (val ?? '').trim().toLowerCase();
}

/**
 * International service-matching algorithm.
 * Filters strictly by the user's confirmed country/region/city when a location is provided,
 * and never falls back to a different country or fabricated local centers.
 */
export function rankHelpingCenters(
  classification: ClassificationResult,
  options: MatchingOptions = {}
): MatchingResult {
  const directory = (options.centers ?? VERIFIED_SERVICE_DIRECTORY).filter(
    (c) => c.verificationStatus === 'verified'
  );

  const loc = options.location ?? null;

  if (directory.length === 0) {
    return {
      matches: [],
      verifiedServicesAvailable: false,
      matchedScope: 'none',
      reasonCode: loc
        ? 'no_verified_services_for_location'
        : 'no_verified_services_configured',
    };
  }

  // Filter strictly to the selected country when location is supplied
  let eligible: HelpingCenter[] = directory;
  if (loc) {
    const locCode = normalizeStr(loc.countryCode);
    const locCountry = normalizeStr(loc.country);
    eligible = directory.filter((center) => {
      const cCode = normalizeStr(center.countryCode);
      const cCountry = normalizeStr(center.countryName);
      if (locCode && cCode) {
        return locCode === cCode;
      }
      if (locCountry && cCountry) {
        return cCountry === locCountry || cCountry.includes(locCountry) || locCountry.includes(cCountry);
      }
      return false;
    });

    if (eligible.length === 0) {
      return {
        matches: [],
        verifiedServicesAvailable: false,
        matchedScope: 'none',
        reasonCode: 'no_verified_services_for_location',
      };
    }

    // Refine within country: keep city matches, region matches, or national coverage
    const locCity = normalizeStr(loc.city);
    const locRegion = normalizeStr(loc.region);
    const locPostal = normalizeStr(loc.postalCode);

    const areaScoped = eligible.filter((center) => {
      if (center.coverageScope === 'national') return true;
      const cCity = normalizeStr(center.city);
      const cRegion = normalizeStr(center.region);
      const cityMatch = Boolean(locCity && cCity && (cCity === locCity || cCity.includes(locCity) || locCity.includes(cCity)));
      const regionMatch = Boolean(locRegion && cRegion && (cRegion === locRegion || cRegion.includes(locRegion) || locRegion.includes(cRegion)));
      const postalMatch = Boolean(
        locPostal &&
          center.postalPrefixes.some((prefix) =>
            locPostal.startsWith(normalizeStr(prefix))
          )
      );
      if (center.coverageScope === 'city') {
        return cityMatch || postalMatch;
      }
      if (center.coverageScope === 'region') {
        return regionMatch || cityMatch || postalMatch;
      }
      return false;
    });

    if (areaScoped.length === 0) {
      return {
        matches: [],
        verifiedServicesAvailable: false,
        matchedScope: 'none',
        reasonCode: 'no_verified_services_for_location',
      };
    }
    eligible = areaScoped;
  }

  const activeCategories =
    options.overrideCategories && options.overrideCategories.length > 0
      ? options.overrideCategories
      : classification.predictedCategories;

  const probMap = new Map<SupportCategoryId, number>(
    classification.predictions.map((p) => [p.id, p.probability])
  );

  const isLowConfidence =
    activeCategories.length === 0 || classification.lowConfidenceFallbackUsed;

  let highestScope: MatchingResult['matchedScope'] = loc ? 'national' : 'global';

  const ranked: MatchedCenter[] = eligible.map((center) => {
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
      score += center.categories.length * 8;
      matchReasons.push(
        'Included as a multi-service provider while automated confidence is low'
      );
    }

    // 2. International geographic precision
    if (loc) {
      const locCity = normalizeStr(loc.city);
      const locRegion = normalizeStr(loc.region);
      const locPostal = normalizeStr(loc.postalCode);
      const cCity = normalizeStr(center.city);
      const cRegion = normalizeStr(center.region);

      if (locCity && cCity && cCity === locCity) {
        score += 28;
        highestScope = 'city';
        matchReasons.push(`Located in ${center.city}`);
      } else if (
        locPostal &&
        center.postalPrefixes.some((p) => locPostal.startsWith(normalizeStr(p)))
      ) {
        score += 24;
        highestScope = 'city';
        matchReasons.push(`Covers postal area ${loc.postalCode}`);
      } else if (locRegion && cRegion && cRegion === locRegion) {
        score += 16;
        if (highestScope !== 'city') highestScope = 'region';
        matchReasons.push(`Serves ${center.region}`);
      } else if (center.coverageScope === 'national') {
        score += 8;
        matchReasons.push(`National service in ${center.countryName}`);
      }
    }

    // 3. Urgent / 24-7 alignment
    if (classification.urgencyFlagged && center.hours24x7) {
      score += 18;
      matchReasons.push('24/7 availability aligns with possible urgency');
    }

    // 4. Minor safeguarding capability
    if (options.minorInvolved && center.childSafeguardingCapable) {
      score += 16;
      matchReasons.push('Includes youth / minor safeguarding capability');
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

  return {
    matches: ranked,
    verifiedServicesAvailable: ranked.length > 0,
    matchedScope: highestScope,
    reasonCode: loc ? 'matched_verified' : 'location_not_shared',
  };
}
