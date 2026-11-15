import type {
  NearbySupportCenter,
  NearbyVerificationTier,
  SupportCategoryId,
} from './types';

export interface NearbyPlaceCandidate {
  id: string;
  name: string;
  serviceTypeLabel: string;
  primaryType?: string;
  types?: string[];
  address: string;
  lat?: number;
  lon?: number;
  phone?: string | null;
  websiteUri?: string | null;
  directionsUri?: string;
  googleMapsUri?: string;
  openNowVerified?: boolean | null;
  businessStatus?: string;
  isVerifiedPartner?: boolean;
  partnerCategories?: SupportCategoryId[];
}

export interface CategorySearchPlan {
  query: string;
  includedTypes: string[];
  targetCategories: SupportCategoryId[];
}

const CATEGORY_CONFIG: Record<
  SupportCategoryId,
  {
    query: string;
    includedTypes: string[];
    placeTypes: string[];
    nameKeywords: RegExp;
  }
> = {
  medical_support: {
    query: 'hospital medical clinic urgent care',
    includedTypes: ['hospital', 'medical_clinic', 'doctor'],
    placeTypes: ['hospital', 'medical_clinic', 'doctor', 'health', 'emergency_room'],
    nameKeywords: /\b(hospital|clinic|medical|health\s*center|infirmary|emergency|care\s*center)\b/i,
  },
  sexual_violence_support: {
    query: 'sexual assault support clinic hospital crisis center',
    includedTypes: ['hospital', 'medical_clinic'],
    placeTypes: ['hospital', 'medical_clinic', 'doctor', 'health'],
    nameKeywords: /\b(sexual|assault|rape|survivor|one[- ]stop|women'?s\s*clinic|hospital|clinic|crisis)\b/i,
  },
  psychological_support: {
    query: 'mental health counseling psychological support center',
    includedTypes: ['medical_clinic', 'hospital'],
    placeTypes: ['psychologist', 'mental_health', 'medical_clinic', 'doctor', 'hospital', 'health'],
    nameKeywords: /\b(counsel|mental|psych|therapy|therapist|trauma|behavioral|crisis|wellness)\b/i,
  },
  protection_safeguarding: {
    query: 'women shelter domestic violence safe house crisis protection',
    includedTypes: ['police'],
    placeTypes: ['police', 'local_government_office', 'social_services', 'community_center'],
    nameKeywords: /\b(shelter|safe\s*house|domestic\s*violence|protection|safeguarding|women'?s\s*center|refuge|crisis|police)\b/i,
  },
  legal_support: {
    query: 'legal aid clinic free legal advice law center',
    includedTypes: ['courthouse'],
    placeTypes: ['lawyer', 'legal_services', 'courthouse', 'local_government_office'],
    nameKeywords: /\b(legal\s*aid|law\s*cent(?:re|er)|citizens\s*advice|free\s*legal|pro\s*bono|advocacy|justice|rights|legal\s*clinic|legal)\b/i,
  },
  social_support: {
    query: 'social services family support community resource center',
    includedTypes: ['local_government_office'],
    placeTypes: ['social_services', 'community_center', 'local_government_office'],
    nameKeywords: /\b(social|family|community|human\s*services|welfare|housing|charit|aid|support\s*center|citizens\s*advice)\b/i,
  },
};

const EXCLUDED_NON_CRISIS_FACILITY_PATTERN =
  /\b(acupuncture|chakra|reiki|chiropract|cosmetic|botox|aesthetic|plastic\s*surgery|dentist|dental|orthodont|podiatr|chiropod|osteopath|veterinar|pet\s*clinic|spa|massage|beauty|salon|hair\s*transplant|laser\s*eye|optician|fertility|weight\s*loss)\b/i;

const INSTITUTIONAL_SUPPORT_PATTERN =
  /\b(hospital|urgent\s*care|walk[- ]in|emergency|nhs|public\s*health|crisis|shelter|safe\s*house|refuge|domestic\s*violence|sexual\s*assault|survivor|legal\s*aid|law\s*cent(?:re|er)|citizens\s*advice|pro\s*bono|counseling|counselling|mental\s*health|social\s*services|women'?s\s*(?:aid|center|centre|shelter))\b/i;

export function computeHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function buildCategorySearchPlans(
  categories: SupportCategoryId[]
): CategorySearchPlan[] {
  const active: SupportCategoryId[] =
    categories.length > 0
      ? categories
      : ['medical_support', 'protection_safeguarding', 'psychological_support'];

  const plans: CategorySearchPlan[] = [];
  const seenQueries = new Set<string>();

  for (const cat of active.slice(0, 4)) {
    const cfg = CATEGORY_CONFIG[cat];
    if (!cfg || seenQueries.has(cfg.query)) continue;
    seenQueries.add(cfg.query);
    plans.push({
      query: cfg.query,
      includedTypes: cfg.includedTypes,
      targetCategories: [cat],
    });
  }

  return plans;
}

export function buildGoogleDirectionsUrl(candidate: {
  lat?: number;
  lon?: number;
  name: string;
  address: string;
  directionsUri?: string;
}): string {
  if (candidate.directionsUri && candidate.directionsUri.startsWith('https://')) {
    return candidate.directionsUri;
  }
  const dest =
    Number.isFinite(candidate.lat) && Number.isFinite(candidate.lon)
      ? `${candidate.lat},${candidate.lon}`
      : `${candidate.name} ${candidate.address}`.trim();
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
}

export function determineVerificationTier(
  candidate: NearbyPlaceCandidate
): NearbyVerificationTier {
  if (candidate.isVerifiedPartner) {
    return 'verified_partner';
  }
  const hasAddress = candidate.address.trim().length > 0;
  const hasContact = Boolean(
    (candidate.phone && candidate.phone.trim().length > 0) ||
      (candidate.websiteUri && candidate.websiteUri.trim().length > 0)
  );
  const isOperational =
    !candidate.businessStatus || candidate.businessStatus === 'OPERATIONAL';

  if (hasAddress && hasContact && isOperational) {
    return 'google_maps_directory';
  }
  return 'incomplete_listing';
}

/**
 * Ranks real-world support center candidates strictly by:
 *   1. Relevance to user's identified support needs (and verified tier),
 *   2. Distance from confirmed user location (ascending).
 */
export function scoreAndRankNearbyPlaces(
  candidates: NearbyPlaceCandidate[],
  categories: SupportCategoryId[],
  origin?: { lat: number; lon: number } | null
): NearbySupportCenter[] {
  const activeCategories: SupportCategoryId[] =
    categories.length > 0
      ? categories
      : ['medical_support', 'protection_safeguarding', 'psychological_support'];

  const deduped = new Map<string, NearbyPlaceCandidate>();
  for (const c of candidates) {
    if (!c.id || !c.name.trim()) continue;
    if (c.businessStatus === 'CLOSED_PERMANENTLY') continue;
    if (!deduped.has(c.id)) {
      deduped.set(c.id, c);
    }
  }

  const scored: NearbySupportCenter[] = [];

  for (const item of deduped.values()) {
    const verificationTier = determineVerificationTier(item);
    const allTypes = new Set<string>(
      [item.primaryType ?? '', ...(item.types ?? [])]
        .map((t) => t.toLowerCase())
        .filter(Boolean)
    );

    const matchedCategories: SupportCategoryId[] = [];
    let relevanceScore = 0;

    if (item.isVerifiedPartner && item.partnerCategories?.length) {
      for (const cat of activeCategories) {
        if (item.partnerCategories.includes(cat)) {
          matchedCategories.push(cat);
          relevanceScore += 35;
        }
      }
      relevanceScore += 20;
    } else {
      for (const cat of activeCategories) {
        const cfg = CATEGORY_CONFIG[cat];
        if (!cfg) continue;
        const typeHit = cfg.placeTypes.some((pt) => allTypes.has(pt));
        const nameHit = cfg.nameKeywords.test(
          `${item.name} ${item.serviceTypeLabel}`
        );
        if (typeHit || nameHit) {
          matchedCategories.push(cat);
          relevanceScore += typeHit && nameHit ? 32 : nameHit ? 26 : 20;
        }
      }
    }

    // Exclude non-crisis specialty/cosmetic/wellness false positives
    if (
      !item.isVerifiedPartner &&
      EXCLUDED_NON_CRISIS_FACILITY_PATTERN.test(
        `${item.name} ${item.serviceTypeLabel}`
      )
    ) {
      continue;
    }

    // Penalize unrelated commercial false positives that somehow slipped through
    if (
      matchedCategories.length === 0 &&
      (allTypes.has('restaurant') ||
        allTypes.has('cafe') ||
        allTypes.has('store') ||
        allTypes.has('lodging'))
    ) {
      continue;
    }

    if (
      !item.isVerifiedPartner &&
      INSTITUTIONAL_SUPPORT_PATTERN.test(`${item.name} ${item.serviceTypeLabel}`)
    ) {
      relevanceScore += 8;
    }

    if (verificationTier === 'verified_partner') {
      relevanceScore += 15;
    } else if (verificationTier === 'google_maps_directory') {
      relevanceScore += 6;
    }

    const hasValidOrigin =
      origin &&
      Number.isFinite(origin.lat) &&
      Number.isFinite(origin.lon) &&
      Number.isFinite(item.lat) &&
      Number.isFinite(item.lon);

    const distanceKm = hasValidOrigin
      ? computeHaversineDistanceKm(
          origin!.lat,
          origin!.lon,
          item.lat!,
          item.lon!
        )
      : null;

    scored.push({
      id: item.id,
      name: item.name.trim(),
      serviceTypeLabel: item.serviceTypeLabel.trim() || 'Support facility',
      matchedCategories:
        matchedCategories.length > 0
          ? matchedCategories
          : [activeCategories[0]],
      relevanceScore,
      address: item.address.trim(),
      distanceKm,
      lat: item.lat,
      lon: item.lon,
      phone: item.phone?.trim() || null,
      websiteUri: item.websiteUri?.trim() || null,
      directionsUri: buildGoogleDirectionsUrl({
        lat: item.lat,
        lon: item.lon,
        name: item.name,
        address: item.address,
        directionsUri: item.directionsUri,
      }),
      googleMapsUri: item.googleMapsUri,
      verificationTier,
      openNowVerified:
        typeof item.openNowVerified === 'boolean'
          ? item.openNowVerified
          : null,
      businessStatus: item.businessStatus,
      sourceName: item.isVerifiedPartner
        ? 'OneDoor Verified Partner'
        : 'Google Maps Directory',
    });
  }

  // Sort strictly by relevance first, then verification completeness, then distance ascending
  const tierOrder: Record<NearbyVerificationTier, number> = {
    verified_partner: 0,
    google_maps_directory: 1,
    incomplete_listing: 2,
  };

  scored.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    if (tierOrder[a.verificationTier] !== tierOrder[b.verificationTier]) {
      return tierOrder[a.verificationTier] - tierOrder[b.verificationTier];
    }
    const distA = a.distanceKm ?? Number.MAX_SAFE_INTEGER;
    const distB = b.distanceKm ?? Number.MAX_SAFE_INTEGER;
    if (distA !== distB) {
      return distA - distB;
    }
    return a.name.localeCompare(b.name);
  });

  return scored;
}

/**
 * Selects up to `limit` centers ensuring each requested category receives representation
 * when available, then preserves strict relevance-first, distance-second ordering.
 */
export function selectTopBalancedCenters(
  ranked: NearbySupportCenter[],
  categories: SupportCategoryId[],
  limit = 12
): NearbySupportCenter[] {
  if (ranked.length <= limit) return ranked;
  if (categories.length <= 1) return ranked.slice(0, limit);

  const chosenIds = new Set<string>();
  const indexOrder = new Map<string, number>();
  ranked.forEach((c, idx) => indexOrder.set(c.id, idx));

  const perCategoryQuota = Math.max(2, Math.floor(limit / categories.length));
  for (const cat of categories) {
    let taken = 0;
    for (const c of ranked) {
      if (taken >= perCategoryQuota) break;
      if (c.matchedCategories.includes(cat)) {
        if (!chosenIds.has(c.id)) {
          chosenIds.add(c.id);
          taken++;
        }
      }
    }
  }

  for (const c of ranked) {
    if (chosenIds.size >= limit) break;
    chosenIds.add(c.id);
  }

  return ranked.filter((c) => chosenIds.has(c.id)).slice(0, limit);
}
