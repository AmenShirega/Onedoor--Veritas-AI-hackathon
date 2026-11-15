import type { AddisSubCity, SupportCategoryId } from './types';

export interface ReferralDraftInput {
  consentApproved: boolean;
  approvedSummary: string;
  approvedCategories: SupportCategoryId[];
  includeSubCity: boolean;
  subCity: AddisSubCity | string;
  includeUrgencyFlag: boolean;
  urgencyFlagged: boolean;
  minorSafeguardingNoted: boolean;
  targetCenterId: string;
  targetCenterName: string;
  matchingExplanation: string[];
}

export interface SanitizedReferralPayload {
  targetCenterId: string;
  targetCenterName: string;
  approvedSummary: string;
  approvedCategories: SupportCategoryId[];
  approvedSubCity: string | null;
  urgencyFlagged: boolean;
  minorSafeguardingNoted: boolean;
  matchingExplanation: string[];
}

/**
 * Validates explicit consent and builds a strictly minimized payload containing
 * ONLY the fields the user explicitly chose to share.
 */
export function buildConsentedReferralPayload(
  input: ReferralDraftInput
): { ok: true; payload: SanitizedReferralPayload } | { ok: false; error: string } {
  if (!input.consentApproved) {
    return {
      ok: false,
      error: 'Explicit approval is required before preparing a demo referral.',
    };
  }

  const trimmedSummary = input.approvedSummary.trim();
  if (trimmedSummary.length < 10) {
    return {
      ok: false,
      error: 'Please keep or write at least a brief 10-character summary to share.',
    };
  }

  if (!input.targetCenterId || !input.targetCenterName) {
    return {
      ok: false,
      error: 'Please select a helping center for this demo referral.',
    };
  }

  const approvedSubCity =
    input.includeSubCity &&
    input.subCity &&
    input.subCity !== 'Prefer not to say'
      ? input.subCity
      : null;

  return {
    ok: true,
    payload: {
      targetCenterId: input.targetCenterId,
      targetCenterName: input.targetCenterName,
      approvedSummary: trimmedSummary,
      approvedCategories: [...new Set(input.approvedCategories)],
      approvedSubCity,
      urgencyFlagged: input.includeUrgencyFlag ? input.urgencyFlagged : false,
      minorSafeguardingNoted: input.minorSafeguardingNoted,
      matchingExplanation: input.matchingExplanation.slice(0, 4),
    },
  };
}
