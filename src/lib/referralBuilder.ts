import type { SupportCategoryId } from './types';

export interface ReferralDraftInput {
  consentApproved: boolean;
  approvedSummary: string;
  approvedCategories: SupportCategoryId[];
  includeLocation: boolean;
  locationLabel: string | null;
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
  approvedLocation: string | null;
  urgencyFlagged: boolean;
  minorSafeguardingNoted: boolean;
  matchingExplanation: string[];
}

/**
 * Validates explicit consent and builds a strictly minimized payload containing
 * ONLY the fields the user explicitly chose to include.
 */
export function buildConsentedReferralPayload(
  input: ReferralDraftInput
): { ok: true; payload: SanitizedReferralPayload } | { ok: false; error: string } {
  if (!input.consentApproved) {
    return {
      ok: false,
      error: 'Explicit approval is required before preparing and saving a referral summary.',
    };
  }

  const trimmedSummary = input.approvedSummary.trim();
  if (trimmedSummary.length < 10) {
    return {
      ok: false,
      error: 'Please keep or write at least a brief 10-character summary.',
    };
  }

  const targetId = input.targetCenterId.trim() || 'self-directed-summary';
  const targetName =
    input.targetCenterName.trim() ||
    'Personal referral summary (no external service connected yet)';

  const approvedLocation =
    input.includeLocation && input.locationLabel && input.locationLabel.trim()
      ? input.locationLabel.trim().slice(0, 120)
      : null;

  return {
    ok: true,
    payload: {
      targetCenterId: targetId,
      targetCenterName: targetName,
      approvedSummary: trimmedSummary,
      approvedCategories: [...new Set(input.approvedCategories)],
      approvedLocation,
      urgencyFlagged: input.includeUrgencyFlag ? input.urgencyFlagged : false,
      minorSafeguardingNoted: input.minorSafeguardingNoted,
      matchingExplanation: input.matchingExplanation.slice(0, 4),
    },
  };
}
