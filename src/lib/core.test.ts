import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { classifyWithWeights, detectNonEnglishScript } from './mlInference';
import { rankHelpingCenters } from './matching';
import { buildConsentedReferralPayload } from './referralBuilder';
import type { ModelWeightsFile } from './types';

const weightsPath = path.resolve(process.cwd(), 'ml/model_weights.json');
const weights: ModelWeightsFile = JSON.parse(fs.readFileSync(weightsPath, 'utf-8'));

test('ML classifier identifies medical, sexual violence, and urgency on direct urgent input', () => {
  const res = classifyWithWeights(
    'I was raped two hours ago in Bole. I am bleeding and need urgent PEP medication.',
    weights
  );
  assert.equal(res.urgencyFlagged, true);
  assert.ok(res.predictedCategories.includes('medical_support'));
  assert.ok(res.predictedCategories.includes('sexual_violence_support'));
  assert.equal(res.nonEnglishWarning, false);
});

test('ML classifier triggers low-confidence fallback and Amharic warning cleanly without denying access', () => {
  assert.equal(detectNonEnglishScript('እባክዎ እርዳታ እፈልጋለሁ'), true);
  const amRes = classifyWithWeights('እባክዎ እርዳታ እፈልጋለሁ አዲስ አበባ', weights);
  assert.equal(amRes.nonEnglishWarning, true);
  assert.equal(amRes.lowConfidenceFallbackUsed, true);
  assert.equal(amRes.overallConfidence, 'low');

  const ranked = rankHelpingCenters(amRes, { subCity: 'Bole' });
  assert.ok(ranked.length >= 4, 'Centers must still be returned even on low confidence');
  assert.equal(ranked[0].center.subCity, 'Bole');
});

test('Separate matching algorithm boosts 24/7 centers on urgent cases and child safeguarding centers for minors', () => {
  const res = classifyWithWeights(
    'My 15 year old sister is locked outside tonight in Kolfe Keranio after being beaten.',
    weights
  );
  const ranked = rankHelpingCenters(res, {
    subCity: 'Kolfe Keranio',
    minorInvolved: true,
  });
  assert.ok(ranked[0].center.childSafeguardingCapable);
  assert.ok(
    ranked[0].matchReasons.some((r) => r.toLowerCase().includes('minor') || r.toLowerCase().includes('kolfe'))
  );
});

test('Consent-gated referral builder blocks unapproved submissions and minimizes unapproved fields', () => {
  const blocked = buildConsentedReferralPayload({
    consentApproved: false,
    approvedSummary: 'Needs confidential shelter tonight.',
    approvedCategories: ['protection_safeguarding'],
    includeSubCity: true,
    subCity: 'Bole',
    includeUrgencyFlag: true,
    urgencyFlagged: true,
    minorSafeguardingNoted: false,
    targetCenterId: 'demo-center-amani',
    targetCenterName: 'Demo Amani Safe Shelter & Safeguarding Hub (Synthetic)',
    matchingExplanation: ['Covers Protection & safeguarding'],
  });
  assert.equal(blocked.ok, false);

  const allowed = buildConsentedReferralPayload({
    consentApproved: true,
    approvedSummary: 'Needs confidential temporary shelter and medical review tonight.',
    approvedCategories: ['protection_safeguarding', 'medical_support'],
    includeSubCity: false,
    subCity: 'Bole',
    includeUrgencyFlag: false,
    urgencyFlagged: true,
    minorSafeguardingNoted: false,
    targetCenterId: 'demo-center-amani',
    targetCenterName: 'Demo Amani Safe Shelter & Safeguarding Hub (Synthetic)',
    matchingExplanation: ['Covers Protection & safeguarding'],
  });
  assert.equal(allowed.ok, true);
  if (allowed.ok) {
    assert.equal(allowed.payload.approvedSubCity, null);
    assert.equal(allowed.payload.urgencyFlagged, false);
  }
});
