import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { VERIFIED_SERVICE_DIRECTORY } from './directory';
import { FLOW_TRANSLATIONS, LANGUAGES, TRANSLATIONS } from './i18n';
import { classifyWithWeights, detectNonEnglishScript } from './mlInference';
import { rankHelpingCenters } from './matching';
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
