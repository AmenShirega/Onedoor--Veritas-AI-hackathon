import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  base64ToFloat3224k,
  downsampleFloat32ToInt16Pcm,
  int16ToBase64,
  mergeTranscriptChunk,
} from './audioPcm';
import { VERIFIED_SERVICE_DIRECTORY } from './directory';
import { CALL_TRANSLATIONS, FLOW_TRANSLATIONS, LANGUAGES, NEARBY_TRANSLATIONS, TRANSLATIONS } from './i18n';
import { classifyWithWeights, detectNonEnglishScript } from './mlInference';
import { rankHelpingCenters } from './matching';
import {
  buildGoogleDirectionsUrl,
  computeHaversineDistanceKm,
  determineOperatingStatus,
  determineVerificationTier,
  scoreAndRankNearbyPlaces,
  selectTopBalancedCenters,
} from './nearbyMatching';
import {
  getEmergencyAndCrisisOptions,
  UNIVERSAL_EMERGENCY_NUMBERS,
  VERIFIED_CRISIS_HOTLINES,
} from './emergencyHotlines';
import { buildConsentedReferralPayload } from './referralBuilder';
import type { HelpingCenter, ModelWeightsFile, UserLocation } from './types';

const weightsPath = path.resolve(process.cwd(), 'ml/model_weights.json');
const weights: ModelWeightsFile = JSON.parse(fs.readFileSync(weightsPath, 'utf-8'));

test('ML classifier identifies medical, sexual violence, and urgency on direct urgent input', () => {
  const res = classifyWithWeights(
    'I was sexually assaulted two hours ago. I am bleeding and need urgent PEP medication.',
    weights
  );
  assert.equal(res.urgencyFlagged, true);
  assert.ok(res.predictedCategories.includes('medical_support'));
  assert.ok(res.predictedCategories.includes('sexual_violence_support'));
  assert.equal(res.nonEnglishWarning, false);
});

test('ML classifier triggers low-confidence fallback cleanly for non-English scripts', () => {
  assert.equal(detectNonEnglishScript('እባክዎ እርዳታ እፈልጋለሁ'), true);
  assert.equal(detectNonEnglishScript('أحتاج إلى مساعدة عاجلة'), true);
  const amRes = classifyWithWeights('እባክዎ እርዳታ እፈልጋለሁ', weights);
  assert.equal(amRes.nonEnglishWarning, true);
  assert.equal(amRes.lowConfidenceFallbackUsed, true);
  assert.equal(amRes.overallConfidence, 'low');
});

test('Global language catalog contains 20 languages, sets RTL for ar/ur, excludes Oromo/Tigrinya, and translates every key', () => {
  assert.equal(LANGUAGES.length, 20);
  const codes = LANGUAGES.map((l) => l.code);
  assert.ok(!codes.includes('om' as never));
  assert.ok(!codes.includes('ti' as never));
  for (const lang of LANGUAGES) {
    assert.ok(!/oromo|tigrinya/i.test(lang.englishName));
    assert.ok(!/oromo|tigrinya/i.test(lang.nativeName));
    const pack = TRANSLATIONS[lang.code];
    assert.ok(pack, `Missing translation pack for ${lang.code}`);
    assert.ok(pack.hero.title.trim().length > 5);
    assert.ok(pack.location.useGpsButton.trim().length > 2);
    assert.ok(pack.intake.sendReferralButton.trim().length > 2);
    assert.ok(pack.visualShowcase.heroPhotoAlt.trim().length > 5);
    assert.ok(pack.visualShowcase.counselorPhotoAlt.trim().length > 5);
    assert.ok(pack.visualShowcase.counselorPhotoCaption.trim().length > 5);
    assert.ok(pack.visualShowcase.calmPortraitAlt.trim().length > 5);
    assert.ok(pack.visualShowcase.pathwayCareAlt.trim().length > 5);
    assert.ok(pack.visualShowcase.pathwayCareCaption.trim().length > 5);
    assert.ok(pack.visualShowcase.intakeDeskAlt.trim().length > 5);
    assert.ok(pack.visualShowcase.intakeDeskCaption.trim().length > 5);
    assert.equal(pack.disclaimerExact, 'This project is a prototype and is not medical advice.');

    const flow = FLOW_TRANSLATIONS[lang.code];
    assert.ok(flow, `Missing flow translation pack for ${lang.code}`);
    assert.ok(flow.step1Label.trim().length > 1);
    assert.ok(flow.step2Label.trim().length > 1);
    assert.ok(flow.step3Label.trim().length > 1);
    assert.ok(flow.welcomeMessage.trim().length > 5);
    assert.ok(flow.statusSending.trim().length > 2);
    assert.ok(flow.statusReceived.trim().length > 1);
    assert.ok(flow.statusFailed.trim().length > 2);
    assert.ok(flow.retryButton.trim().length > 1);
    assert.ok(flow.voiceCapturedBanner.trim().length > 5);
    assert.ok(flow.saveButton.trim().length > 2);
  }
  const ar = LANGUAGES.find((l) => l.code === 'ar');
  const ur = LANGUAGES.find((l) => l.code === 'ur');
  assert.equal(ar?.dir, 'rtl');
  assert.equal(ur?.dir, 'rtl');
});

test('Service directory contains zero fabricated organizations or unverified phone numbers', () => {
  assert.equal(VERIFIED_SERVICE_DIRECTORY.length, 0);
});

test('International matching filters strictly by country/city and never crosses borders or invents providers', () => {
  const cls = classifyWithWeights(
    'My 15 year old sister needs safe shelter and protection tonight.',
    weights
  );

  // With empty live directory, matching honestly reports unavailable
  const london: UserLocation = {
    label: 'London, United Kingdom',
    city: 'London',
    region: 'Greater London',
    country: 'United Kingdom',
    countryCode: 'GB',
    postalCode: 'SW1A',
    source: 'manual',
  };
  const liveEmpty = rankHelpingCenters(cls, { location: london, minorInvolved: true });
  assert.equal(liveEmpty.verifiedServicesAvailable, false);
  assert.equal(liveEmpty.matches.length, 0);
  assert.equal(liveEmpty.reasonCode, 'no_verified_services_for_location');

  // With sample verified international directory fixtures, strictly matches same country/city
  const sampleCenters: HelpingCenter[] = [
    {
      id: 'uk-london-shelter',
      name: 'London Verified Safeguarding Hub',
      pathwayType: 'Safe Shelter',
      verificationStatus: 'verified',
      countryCode: 'GB',
      countryName: 'United Kingdom',
      region: 'Greater London',
      city: 'London',
      postalPrefixes: ['SW1'],
      coverageScope: 'city',
      categories: ['protection_safeguarding', 'social_support'],
      hours24x7: true,
      hoursLabel: '24/7',
      childSafeguardingCapable: true,
      languages: ['English'],
      contactNote: 'Verified partner',
      description: 'Verified safeguarding shelter',
    },
    {
      id: 'ca-toronto-clinic',
      name: 'Toronto Verified Clinic',
      pathwayType: 'Medical',
      verificationStatus: 'verified',
      countryCode: 'CA',
      countryName: 'Canada',
      region: 'Ontario',
      city: 'Toronto',
      postalPrefixes: ['M5'],
      coverageScope: 'city',
      categories: ['medical_support', 'protection_safeguarding'],
      hours24x7: true,
      hoursLabel: '24/7',
      childSafeguardingCapable: true,
      languages: ['English', 'French'],
      contactNote: 'Verified partner',
      description: 'Verified medical clinic',
    },
  ];

  const ukMatches = rankHelpingCenters(cls, {
    location: london,
    minorInvolved: true,
    centers: sampleCenters,
  });
  assert.equal(ukMatches.verifiedServicesAvailable, true);
  assert.equal(ukMatches.matches.length, 1);
  assert.equal(ukMatches.matches[0].center.id, 'uk-london-shelter');
  assert.equal(ukMatches.matchedScope, 'city');

  const tokyo: UserLocation = {
    label: 'Tokyo, Japan',
    city: 'Tokyo',
    region: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    postalCode: '',
    source: 'manual',
  };
  const jpMatches = rankHelpingCenters(cls, {
    location: tokyo,
    minorInvolved: true,
    centers: sampleCenters,
  });
  assert.equal(jpMatches.verifiedServicesAvailable, false);
  assert.equal(jpMatches.matches.length, 0);
});

test('Consent-gated referral builder blocks unapproved submissions and supports international approvedLocation', () => {
  const blocked = buildConsentedReferralPayload({
    consentApproved: false,
    approvedSummary: 'Needs confidential shelter tonight.',
    approvedCategories: ['protection_safeguarding'],
    includeLocation: true,
    locationLabel: 'London, United Kingdom',
    includeUrgencyFlag: true,
    urgencyFlagged: true,
    minorSafeguardingNoted: false,
    targetCenterId: 'self-directed-summary',
    targetCenterName: 'Personal referral summary',
    matchingExplanation: [],
  });
  assert.equal(blocked.ok, false);

  const allowed = buildConsentedReferralPayload({
    consentApproved: true,
    approvedSummary: 'Needs confidential temporary shelter and medical review tonight.',
    approvedCategories: ['protection_safeguarding', 'medical_support'],
    includeLocation: true,
    locationLabel: 'Toronto, Canada',
    includeUrgencyFlag: false,
    urgencyFlagged: true,
    minorSafeguardingNoted: false,
    targetCenterId: 'self-directed-summary',
    targetCenterName: 'Personal referral summary',
    matchingExplanation: [],
  });
  assert.equal(allowed.ok, true);
  if (allowed.ok) {
    assert.equal(allowed.payload.approvedLocation, 'Toronto, Canada');
    assert.equal(allowed.payload.urgencyFlagged, false);
  }
});

test('CALL_TRANSLATIONS covers all 20 languages and keeps English hero CTA exact', () => {
  assert.equal(CALL_TRANSLATIONS.en.accessCallingCta, 'Access Calling');
  for (const lang of LANGUAGES) {
    const callPack = CALL_TRANSLATIONS[lang.code];
    assert.ok(callPack, `Missing call translation pack for ${lang.code}`);
    assert.ok(callPack.accessCallingCta.trim().length > 2);
    assert.ok(callPack.startCallBtn.trim().length > 2);
    assert.ok(callPack.switchToTextBtn.trim().length > 2);
    assert.ok(callPack.aiNoticeTitle.trim().length > 5);
    assert.ok(callPack.errMissingKey.trim().length > 10);
    assert.ok(callPack.clearCallDataBtn.trim().length > 3);
  }
});

test('audioPcm helpers downsample 48kHz -> 16kHz PCM, round-trip base64, and merge transcript chunks cleanly', () => {
  const input48k = new Float32Array(480);
  for (let i = 0; i < input48k.length; i++) {
    input48k[i] = i % 2 === 0 ? 0.5 : -0.25;
  }
  // Test extreme clamping
  input48k[0] = 2.5;
  input48k[1] = -2.5;

  const pcm16k = downsampleFloat32ToInt16Pcm(input48k, 48000, 16000);
  assert.equal(pcm16k.length, 160);
  assert.ok(pcm16k[0] <= 32767 && pcm16k[0] >= -32768);

  const exactClamp = downsampleFloat32ToInt16Pcm(
    new Float32Array([1.5, -1.5, 0]),
    16000,
    16000
  );
  assert.deepEqual(Array.from(exactClamp), [32767, -32768, 0]);

  const roundTripped = base64ToFloat3224k(int16ToBase64(exactClamp));
  assert.equal(roundTripped.length, 3);
  assert.ok(roundTripped[0] > 0.99);
  assert.equal(roundTripped[1], -1);
  assert.equal(roundTripped[2], 0);

  let transcript = '';
  transcript = mergeTranscriptChunk(transcript, 'I need');
  transcript = mergeTranscriptChunk(transcript, 'safe shelter');
  transcript = mergeTranscriptChunk(transcript, ', please.');
  assert.equal(transcript, 'I need safe shelter, please.');
});

test('NEARBY_TRANSLATIONS covers all 20 languages with required labels', () => {
  for (const lang of LANGUAGES) {
    const pack = NEARBY_TRANSLATIONS[lang.code];
    assert.ok(pack, `Missing nearby translation pack for ${lang.code}`);
    assert.ok(pack.promptCardTitle.trim().length > 3);
    assert.ok(pack.confirmLocationBtn.trim().length > 3);
    assert.ok(pack.temporaryBanner.trim().length > 10);
    assert.ok(pack.badgeVerifiedPartner.trim().length > 3);
    assert.ok(pack.badgePublicDirectory.trim().length > 3);
    assert.ok(pack.badgeIncomplete.trim().length > 3);
    assert.ok(pack.hoursUnverified.trim().length > 5);
    assert.ok(pack.directionsBtn.trim().length > 1);
    assert.ok(pack.broadenSearchBtn.trim().length > 2);
  }
});

test('nearbyMatching computes Haversine km distance, verification tiers, and Google Directions links cleanly', () => {
  // London (51.5074, -0.1278) to Heathrow (~23 km west)
  const km = computeHaversineDistanceKm(51.5074, -0.1278, 51.47, -0.4543);
  assert.ok(km > 20 && km < 26, `Expected ~23 km, got ${km}`);

  assert.equal(
    determineVerificationTier({
      id: 'partner-1',
      name: 'Verified Partner Hub',
      serviceTypeLabel: 'Support hub',
      address: '10 Main St',
      isVerifiedPartner: true,
    }),
    'verified_partner'
  );

  assert.equal(
    determineVerificationTier({
      id: 'dir-1',
      name: 'City Hospital',
      serviceTypeLabel: 'Hospital',
      address: '20 Care Rd',
      phone: '+44 20 7946 0000',
      businessStatus: 'OPERATIONAL',
    }),
    'google_maps_directory'
  );

  assert.equal(
    determineVerificationTier({
      id: 'inc-1',
      name: 'Unlisted Drop-in',
      serviceTypeLabel: 'Clinic',
      address: '30 Side St',
      phone: null,
      websiteUri: null,
    }),
    'incomplete_listing'
  );

  const dirUrl = buildGoogleDirectionsUrl({
    lat: 51.5,
    lon: -0.12,
    name: 'City Hospital',
    address: '20 Care Rd',
  });
  assert.equal(
    dirUrl,
    'https://www.google.com/maps/dir/?api=1&destination=51.5%2C-0.12'
  );
});

test('scoreAndRankNearbyPlaces ranks strictly by relevance first then distance, keeps unverified hours null, and filters closed/commercial noise', () => {
  const origin = { lat: 51.5074, lon: -0.1278 };
  const ranked = scoreAndRankNearbyPlaces(
    [
      // Very close (0.5 km) but only matches 1 generic type (low relevance)
      {
        id: 'close-office',
        name: 'Borough Civic Office',
        serviceTypeLabel: 'Local office',
        primaryType: 'local_government_office',
        types: ['local_government_office'],
        address: '1 Close St',
        lat: 51.508,
        lon: -0.128,
        phone: '+44 20 0000 0001',
        openNowVerified: null,
      },
      // Further away (~4 km) but strongly matches BOTH medical_support & sexual_violence_support
      {
        id: 'relevant-hospital-far',
        name: 'St Thomas Sexual Assault & Emergency Hospital',
        serviceTypeLabel: 'Hospital',
        primaryType: 'hospital',
        types: ['hospital', 'medical_clinic'],
        address: '10 Lambeth Rd',
        lat: 51.498,
        lon: -0.18,
        phone: '+44 20 0000 0002',
        websiteUri: 'https://example.org/hospital',
        openNowVerified: true,
      },
      // Equal relevance to hospital-far if same match, closer (~1.5 km) -> should beat hospital-far on distance tiebreaker
      {
        id: 'relevant-hospital-near',
        name: 'Central Sexual Assault & Emergency Hospital',
        serviceTypeLabel: 'Hospital',
        primaryType: 'hospital',
        types: ['hospital', 'medical_clinic'],
        address: '5 Central Rd',
        lat: 51.515,
        lon: -0.14,
        phone: '+44 20 0000 0003',
        openNowVerified: false,
      },
      // Permanently closed -> excluded
      {
        id: 'closed-clinic',
        name: 'Closed Clinic',
        serviceTypeLabel: 'Clinic',
        primaryType: 'medical_clinic',
        types: ['medical_clinic'],
        address: '9 Old Rd',
        lat: 51.507,
        lon: -0.127,
        phone: '+44 20 0000 0004',
        businessStatus: 'CLOSED_PERMANENTLY',
      },
      // Commercial restaurant -> excluded
      {
        id: 'noise-cafe',
        name: 'Corner Cafe',
        serviceTypeLabel: 'Cafe',
        primaryType: 'cafe',
        types: ['cafe', 'restaurant'],
        address: '2 Cafe Ln',
        lat: 51.5075,
        lon: -0.1275,
        phone: '+44 20 0000 0005',
      },
      // Non-crisis wellness/acupuncture listing -> excluded
      {
        id: 'noise-acupuncture',
        name: 'City Acupuncture and Chakra Therapy',
        serviceTypeLabel: 'Medical clinic',
        primaryType: 'medical_clinic',
        types: ['medical_clinic'],
        address: '3 Wellness Ln',
        lat: 51.5074,
        lon: -0.1278,
        phone: '+44 20 0000 0006',
      },
    ],
    ['medical_support', 'sexual_violence_support'],
    origin
  );

  assert.equal(ranked.length, 3);
  assert.equal(ranked[0].id, 'relevant-hospital-near');
  assert.equal(ranked[1].id, 'relevant-hospital-far');
  assert.equal(ranked[2].id, 'close-office');
  assert.ok(ranked[0].distanceKm! < ranked[1].distanceKm!);
  assert.equal(ranked[0].openNowVerified, false);
  assert.equal(ranked[1].openNowVerified, true);
  assert.equal(ranked[2].openNowVerified, null);

  const manyMedicalAndLegal = [
    ...Array.from({ length: 10 }, (_, idx) => ({
      ...ranked[0],
      id: `med-${idx}`,
      name: `Hospital ${idx}`,
      matchedCategories: ['medical_support'] as const,
      relevanceScore: 46,
      distanceKm: idx + 1,
    })),
    {
      ...ranked[2],
      id: 'legal-1',
      name: 'RCJ Legal Aid',
      matchedCategories: ['legal_support'] as const,
      relevanceScore: 40,
      distanceKm: 1.3,
    },
  ];
  const balanced = selectTopBalancedCenters(
    manyMedicalAndLegal.map((item) => ({
      ...item,
      matchedCategories: [...item.matchedCategories],
    })),
    ['medical_support', 'legal_support'],
    6
  );
  assert.equal(balanced.length, 6);
  assert.ok(balanced.some((c) => c.id === 'legal-1'));
  assert.equal(balanced[0].id, 'med-0');
  assert.equal(balanced[balanced.length - 1].id, 'legal-1');
});

test('Temporary directory operating status distinguishes verified open, published hours, closed, and unknown', () => {
  // 1. Verified partner with openNowVerified: true -> confirmed_open
  const partnerOpen = determineOperatingStatus({
    openNowVerified: true,
    isVerifiedPartner: true,
    businessStatus: 'OPERATIONAL',
  });
  assert.equal(partnerOpen.operatingStatus, 'confirmed_open');
  assert.ok(partnerOpen.operatingStatusLabel.includes('Confirmed open'));

  // 2. Google Maps / public directory with openNowVerified: true -> published_hours_open (not confirmed real-time)
  const directoryOpen = determineOperatingStatus({
    openNowVerified: true,
    isVerifiedPartner: false,
    businessStatus: 'OPERATIONAL',
  });
  assert.equal(directoryOpen.operatingStatus, 'published_hours_open');
  assert.ok(directoryOpen.operatingStatusLabel.includes('Call ahead to confirm'));

  // 3. openNowVerified: false -> published_hours_closed
  const directoryClosed = determineOperatingStatus({
    openNowVerified: false,
    isVerifiedPartner: false,
    businessStatus: 'OPERATIONAL',
  });
  assert.equal(directoryClosed.operatingStatus, 'published_hours_closed');

  // 4. Temporarily or permanently closed -> published_hours_closed
  const tempClosed = determineOperatingStatus({
    openNowVerified: true,
    businessStatus: 'CLOSED_TEMPORARILY',
  });
  assert.equal(tempClosed.operatingStatus, 'published_hours_closed');
  assert.equal(tempClosed.operatingStatusLabel, 'Temporarily closed');

  // 5. No hours data -> availability_unknown (unverified, never guessed)
  const unknown = determineOperatingStatus({
    openNowVerified: null,
    businessStatus: 'OPERATIONAL',
  });
  assert.equal(unknown.operatingStatus, 'availability_unknown');
  assert.ok(unknown.operatingStatusLabel.includes('unverified'));
});

test('Prioritizes open and urgent emergency facilities when prioritizeOpen and isUrgent options are enabled', () => {
  const origin = { lat: 51.5074, lon: -0.1278 };
  const candidates = [
    {
      id: 'closed-general-clinic',
      name: 'Central General Clinic',
      serviceTypeLabel: 'Clinic',
      primaryType: 'medical_clinic',
      types: ['medical_clinic'],
      address: '1 Close St',
      lat: 51.508,
      lon: -0.128, // closer (0.5 km)
      phone: '+44 20 0000 0001',
      openNowVerified: false,
    },
    {
      id: 'open-er-hospital',
      name: 'St Thomas Emergency & Trauma Hospital',
      serviceTypeLabel: 'Hospital',
      primaryType: 'hospital',
      types: ['hospital', 'emergency_room'],
      address: '10 Lambeth Rd',
      lat: 51.498,
      lon: -0.18, // further (4 km)
      phone: '+44 20 0000 0002',
      openNowVerified: true,
      isEmergencyProvider: true,
    },
  ];

  // With prioritizeOpen and isUrgent enabled, the open emergency hospital is ranked first despite distance
  const prioritized = scoreAndRankNearbyPlaces(
    candidates,
    ['medical_support'],
    origin,
    { isUrgent: true, prioritizeOpen: true }
  );

  assert.equal(prioritized[0].id, 'open-er-hospital');
  assert.equal(prioritized[0].operatingStatus, 'published_hours_open');
  assert.equal(prioritized[0].isEmergencyProvider, true);
  assert.equal(prioritized[1].id, 'closed-general-clinic');
  assert.equal(prioritized[1].operatingStatus, 'published_hours_closed');
});

test('International emergency and crisis helplines registry returns verified numbers and never invents synthetic data', () => {
  // 1. Known countries return their universal emergency numbers
  assert.equal(UNIVERSAL_EMERGENCY_NUMBERS['US'].phone, '911');
  assert.equal(UNIVERSAL_EMERGENCY_NUMBERS['GB'].phone, '999');
  assert.equal(UNIVERSAL_EMERGENCY_NUMBERS['ZA'].phone, '112');
  assert.equal(UNIVERSAL_EMERGENCY_NUMBERS['KE'].phone, '999');
  assert.equal(UNIVERSAL_EMERGENCY_NUMBERS['ET'].phone, '991');
  assert.equal(UNIVERSAL_EMERGENCY_NUMBERS['IN'].phone, '112');
  assert.equal(UNIVERSAL_EMERGENCY_NUMBERS['DE'].phone, '112');

  // 2. Query for US sexual violence support returns 911 emergency and RAINN / Domestic Violence hotline
  const usOptions = getEmergencyAndCrisisOptions({
    countryCode: 'US',
    categories: ['sexual_violence_support'],
    isUrgent: true,
  });
  assert.ok(usOptions.length >= 2);
  assert.equal(usOptions[0].phone, '911');
  assert.ok(usOptions.some((h) => h.phone === '1-800-656-4673' || h.phone === '1-800-799-7233'));

  // 3. Every single crisis hotline has a valid source note and last verified date
  for (const h of VERIFIED_CRISIS_HOTLINES) {
    assert.ok(h.name.trim().length > 3, `Missing name for hotline ${h.id}`);
    assert.ok(h.sourceNote.trim().length > 3, `Missing sourceNote for hotline ${h.id}`);
    assert.ok(h.lastVerifiedDate, `Missing lastVerifiedDate for hotline ${h.id}`);
  }

  // 4. Country without local registry entries safely falls back to international resources without inventing numbers
  const intlFallback = getEmergencyAndCrisisOptions({
    countryCode: 'ZZ',
    categories: ['psychological_support'],
    isUrgent: false,
  });
  assert.ok(intlFallback.length > 0);
  assert.ok(intlFallback.every((h) => h.countryCode === 'INTL' || h.countryCode === 'ZZ'));
});


