import {
  SUPPORT_CATEGORY_IDS,
  type CategoryPrediction,
  type ClassificationResult,
  type ModelWeightsFile,
  type SupportCategoryId,
  type UncertaintyLevel,
} from './types';

/**
 * Mirrors Python tokenizer in /ml/train.py:
 * lowercase alphanumeric words >= 2 chars plus adjacent bigrams.
 */
export function tokenizeText(text: string): string[] {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = cleaned.split(/\s+/).filter((w) => w.length >= 2);
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]}_${words[i + 1]}`);
  }
  return [...words, ...bigrams];
}

export function vectorizeTfidf(
  text: string,
  vocab: Record<string, number>,
  idf: number[]
): Map<number, number> {
  const tokens = tokenizeText(text);
  const counts = new Map<number, number>();

  for (const tok of tokens) {
    const idx = vocab[tok];
    if (idx !== undefined) {
      counts.set(idx, (counts.get(idx) ?? 0) + 1);
    }
  }

  const vec = new Map<number, number>();
  let normSq = 0;
  for (const [idx, count] of counts.entries()) {
    const val = (1.0 + Math.log(count)) * (idf[idx] ?? 1.0);
    vec.set(idx, val);
    normSq += val * val;
  }

  const norm = normSq > 0 ? Math.sqrt(normSq) : 1.0;
  for (const [idx, val] of vec.entries()) {
    vec.set(idx, val / norm);
  }
  return vec;
}

export function sigmoid(z: number): number {
  if (z >= 0) {
    return 1.0 / (1.0 + Math.exp(-Math.min(z, 30)));
  }
  const ez = Math.exp(Math.max(z, -30));
  return ez / (1.0 + ez);
}

export function detectNonEnglishScript(text: string): boolean {
  // Check for Ethiopic script (U+1200–U+137F) or mostly non-ASCII letters
  const ethiopicMatch = /[\u1200-\u137F]/.test(text);
  if (ethiopicMatch) return true;
  const asciiLetters = (text.match(/[a-zA-Z]/g) ?? []).length;
  const nonSpaceChars = text.replace(/\s+/g, '').length;
  return nonSpaceChars > 5 && asciiLetters / nonSpaceChars < 0.3;
}

function classifyUncertainty(
  probability: number,
  low: number,
  high: number
): UncertaintyLevel {
  if (probability >= high || probability <= 1 - high) {
    return probability >= low && probability <= high ? 'uncertain' : 'clear';
  }
  if (probability >= low && probability <= high) {
    return 'uncertain';
  }
  return 'low_confidence';
}

export function classifyWithWeights(
  text: string,
  weights: ModelWeightsFile
): ClassificationResult {
  const trimmed = text.trim();
  const inputWordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const nonEnglishWarning = detectNonEnglishScript(trimmed);

  const vec = vectorizeTfidf(trimmed, weights.vocab, weights.idf);
  const reverseVocab = new Map<number, string>();
  for (const [term, idx] of Object.entries(weights.vocab)) {
    reverseVocab.set(idx, term);
  }

  const lowBand = weights.uncertainty_band?.low ?? 0.35;
  const highBand = weights.uncertainty_band?.high ?? 0.65;

  const predictions: CategoryPrediction[] = SUPPORT_CATEGORY_IDS.map((labelId) => {
    const model = weights.label_models[labelId];
    let z = model.intercept;
    const termContributions: Array<{ term: string; contrib: number }> = [];

    for (const [idx, val] of vec.entries()) {
      const coef = model.coef[idx] ?? 0;
      const contrib = coef * val;
      z += contrib;
      if (contrib > 0.03) {
        const rawTerm = reverseVocab.get(idx) ?? '';
        if (rawTerm) {
          termContributions.push({
            term: rawTerm.replace('_', ' '),
            contrib,
          });
        }
      }
    }

    termContributions.sort((a, b) => b.contrib - a.contrib);
    const probability = Number(sigmoid(z).toFixed(4));
    const predicted = probability >= model.threshold;
    const uncertainty: UncertaintyLevel =
      probability >= lowBand && probability <= highBand
        ? 'uncertain'
        : probability >= highBand
          ? 'clear'
          : 'low_confidence';

    return {
      id: labelId,
      probability,
      predicted,
      uncertainty,
      contributingTerms: termContributions.slice(0, 3).map((t) => t.term),
    };
  });

  // Urgency classifier
  const urgModel = weights.urgency_model;
  let urgZ = urgModel.intercept;
  for (const [idx, val] of vec.entries()) {
    urgZ += (urgModel.coef[idx] ?? 0) * val;
  }
  const urgencyProbability = Number(sigmoid(urgZ).toFixed(4));
  const urgencyFlagged = urgencyProbability >= urgModel.threshold;
  const urgencyUncertainty = classifyUncertainty(urgencyProbability, lowBand, highBand);

  const predictedCategories: SupportCategoryId[] = predictions
    .filter((p) => p.predicted)
    .map((p) => p.id);

  // Never deny support when model confidence is low or text is short/euphemistic/non-English
  const maxProb = Math.max(...predictions.map((p) => p.probability));
  const lowConfidenceFallbackUsed =
    predictedCategories.length === 0 ||
    maxProb < 0.55 ||
    inputWordCount < 6 ||
    nonEnglishWarning;

  let overallConfidence: ClassificationResult['overallConfidence'] = 'moderate_or_higher';
  if (nonEnglishWarning || vec.size === 0 || maxProb < 0.52) {
    overallConfidence = 'low';
  } else if (
    predictions.some((p) => p.predicted && p.uncertainty === 'uncertain') ||
    inputWordCount < 10
  ) {
    overallConfidence = 'uncertain';
  }

  let uncertaintyMessage =
    'These categories are organized by a prototype ML model as a guide—not a medical or legal diagnosis. You can adjust any category before deciding what to share.';

  if (nonEnglishWarning) {
    uncertaintyMessage =
      'Notice: The ML classifier was trained on English descriptions only. Because your message uses non-English script, model confidence is low—we have kept broad support options open for you below.';
  } else if (lowConfidenceFallbackUsed) {
    uncertaintyMessage =
      'The model is uncertain about parts of this short or indirect description. Because our evaluation shows short or euphemistic messages can be missed, all relevant general support centers remain visible below.';
  } else if (urgencyUncertainty === 'uncertain') {
    uncertaintyMessage =
      'Some signals fall near the model uncertainty boundary. Please review the suggested options directly and adjust anything that does not fit your situation.';
  }

  return {
    modelVersion: weights.model_version,
    predictions,
    predictedCategories,
    urgencyFlagged,
    urgencyProbability,
    urgencyUncertainty,
    overallConfidence,
    lowConfidenceFallbackUsed,
    uncertaintyMessage,
    inputWordCount,
    nonEnglishWarning,
  };
}
