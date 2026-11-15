import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { classifyWithWeights } from './src/lib/mlInference';
import { rankHelpingCenters } from './src/lib/matching';
import { SYNTHETIC_HELPING_CENTERS } from './src/lib/directory';
import type {
  ModelWeightsFile,
  ReferralRecord,
  ReferralStatus,
  SupportCategoryId,
} from './src/lib/types';

const PORT = Number(process.env.PORT ?? 3000);
const ROOT = process.cwd();
const WEIGHTS_PATH = path.join(ROOT, 'ml', 'model_weights.json');
const EVAL_PATH = path.join(ROOT, 'ml', 'evaluation_results.json');
const REFERRALS_PATH = path.join(ROOT, 'data', 'referrals.json');

const modelWeights: ModelWeightsFile = JSON.parse(
  fs.readFileSync(WEIGHTS_PATH, 'utf-8')
);
const evaluationResults = JSON.parse(fs.readFileSync(EVAL_PATH, 'utf-8'));

function readReferrals(): ReferralRecord[] {
  try {
    const raw = fs.readFileSync(REFERRALS_PATH, 'utf-8');
    return JSON.parse(raw) as ReferralRecord[];
  } catch {
    return [];
  }
}

function writeReferrals(rows: ReferralRecord[]): void {
  fs.mkdirSync(path.dirname(REFERRALS_PATH), { recursive: true });
  fs.writeFileSync(REFERRALS_PATH, JSON.stringify(rows, null, 2), 'utf-8');
}

const CATEGORY_TITLES: Record<SupportCategoryId, string> = {
  medical_support: 'Medical support',
  psychological_support: 'Psychological support',
  protection_safeguarding: 'Protection and safeguarding',
  legal_support: 'Legal support',
  sexual_violence_support: 'Sexual-violence support',
  social_support: 'Social support',
};

function buildTemplateSummaryAndExplanation(
  categories: SupportCategoryId[],
  urgencyFlagged: boolean,
  subCity: string | null,
  minorInvolved: boolean,
  lowConfidence: boolean
): { explanation: string; draftSummary: string } {
  const names = categories.map((c) => CATEGORY_TITLES[c]);
  const locationPhrase =
    subCity && subCity !== 'Prefer not to say' ? ` in ${subCity} sub-city` : '';

  const explanation = lowConfidence
    ? 'The trained classifier had lower confidence on parts of your message, which often happens with short or indirect phrasing. Broad support options remain open below—please keep or uncheck whatever feels accurate for you.'
    : `Based on patterns learned during training, the ML model highlighted ${names.join(', ') || 'general support'}${urgencyFlagged ? ' and noticed possible time-sensitive urgency' : ''}. You can edit or remove any category before deciding what to share.`;

  const needsText =
    names.length > 0 ? names.join(', ') : 'general confidential support';
  const minorClause = minorInvolved
    ? ' Safeguarding note: situation involves a minor (under 18).'
    : '';
  const urgentClause = urgencyFlagged
    ? ' Time-sensitive support may be helpful.'
    : '';

  const draftSummary = `Support inquiry${locationPhrase} requesting ${needsText}.${urgentClause}${minorClause} Caller prefers to review options without repeating full details.`;

  return { explanation, draftSummary };
}

async function generateOptionalGeminiAssist(params: {
  categories: SupportCategoryId[];
  urgencyFlagged: boolean;
  subCity: string | null;
  minorInvolved: boolean;
  lowConfidence: boolean;
  description: string;
}): Promise<{ explanation: string; draftSummary: string; usedGemini: boolean }> {
  const fallback = buildTemplateSummaryAndExplanation(
    params.categories,
    params.urgencyFlagged,
    params.subCity,
    params.minorInvolved,
    params.lowConfidence
  );

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return { ...fallback, usedGemini: false };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const predictedNames =
      params.categories.map((c) => CATEGORY_TITLES[c]).join(', ') ||
      'None clearly above threshold';

    const prompt = [
      'You are writing two short, trauma-informed blocks for OneDoor, a survivor-centered support platform in Addis Ababa.',
      'Rules:',
      '- Never diagnose medical or psychological conditions.',
      '- Never tell the person whether to leave, stay, confront someone, or go to police.',
      '- Do not repeat graphic details or invent personal names/identities.',
      '- Keep both outputs calm, concise, and respectful.',
      `ML-predicted categories: ${predictedNames}`,
      `ML urgency flag: ${params.urgencyFlagged ? 'Yes (non-diagnostic)' : 'No'}`,
      `Low model confidence: ${params.lowConfidence ? 'Yes' : 'No'}`,
      `Optional sub-city: ${params.subCity ?? 'Not shared'}`,
      `Minor involved: ${params.minorInvolved ? 'Yes' : 'No'}`,
      `User description (do not copy verbatim if sensitive, summarize gently): """${params.description.slice(0, 800)}"""`,
      '',
      'Return strict JSON with keys "explanation" (2-3 gentle sentences explaining what the ML model noticed and reminding them they can edit) and "draftSummary" (2 neutral, non-identifying sentences suitable for a referral summary).',
    ].join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const rawText = (response.text ?? '').trim();
    const parsed = JSON.parse(rawText) as {
      explanation?: string;
      draftSummary?: string;
    };
    if (parsed.explanation && parsed.draftSummary) {
      return {
        explanation: parsed.explanation.trim(),
        draftSummary: parsed.draftSummary.trim(),
        usedGemini: true,
      };
    }
    return { ...fallback, usedGemini: false };
  } catch {
    return { ...fallback, usedGemini: false };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '100kb' }));

  // Note: Never log request bodies containing survivor descriptions.
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', modelVersion: modelWeights.model_version });
  });

  app.get('/api/evaluation', (_req, res) => {
    res.json(evaluationResults);
  });

  app.get('/api/centers', (_req, res) => {
    res.json({ centers: SYNTHETIC_HELPING_CENTERS });
  });

  app.post('/api/classify', (req, res) => {
    const body = req.body as {
      text?: unknown;
      subCity?: unknown;
      minorInvolved?: unknown;
    };

    if (typeof body?.text !== 'string' || body.text.trim().length < 3) {
      res.status(400).json({
        error: 'Please enter a brief description (at least 3 characters) before continuing.',
      });
      return;
    }

    const cleanText = body.text.trim().slice(0, 4000);
    const subCity =
      typeof body.subCity === 'string' ? body.subCity : 'Prefer not to say';
    const minorInvolved = Boolean(body.minorInvolved);

    // Core classification strictly performed by trained ML weights
    const classification = classifyWithWeights(cleanText, modelWeights);
    // Separate center matching algorithm
    const matchedCenters = rankHelpingCenters(classification, {
      subCity,
      minorInvolved,
    });
    const templates = buildTemplateSummaryAndExplanation(
      classification.predictedCategories,
      classification.urgencyFlagged,
      subCity,
      minorInvolved,
      classification.lowConfidenceFallbackUsed
    );

    res.json({
      classification,
      matchedCenters,
      defaultExplanation: templates.explanation,
      defaultDraftSummary: templates.draftSummary,
    });
  });

  app.post('/api/explain', async (req, res) => {
    const body = req.body as {
      text?: unknown;
      categories?: unknown;
      urgencyFlagged?: unknown;
      subCity?: unknown;
      minorInvolved?: unknown;
      lowConfidence?: unknown;
    };

    const description =
      typeof body?.text === 'string' ? body.text.trim().slice(0, 1200) : '';
    const categories = Array.isArray(body?.categories)
      ? (body.categories as SupportCategoryId[])
      : [];

    const result = await generateOptionalGeminiAssist({
      description,
      categories,
      urgencyFlagged: Boolean(body?.urgencyFlagged),
      subCity: typeof body?.subCity === 'string' ? body.subCity : null,
      minorInvolved: Boolean(body?.minorInvolved),
      lowConfidence: Boolean(body?.lowConfidence),
    });

    res.json(result);
  });

  app.get('/api/referrals', (_req, res) => {
    const referrals = readReferrals();
    res.json({ referrals });
  });

  app.post('/api/referrals', (req, res) => {
    const body = req.body as {
      targetCenterId?: unknown;
      targetCenterName?: unknown;
      approvedSummary?: unknown;
      approvedCategories?: unknown;
      approvedSubCity?: unknown;
      urgencyFlagged?: unknown;
      minorSafeguardingNoted?: unknown;
      matchingExplanation?: unknown;
      consentApproved?: unknown;
    };

    if (body?.consentApproved !== true) {
      res.status(400).json({
        error: 'Explicit user consent approval is required before storing a demo referral.',
      });
      return;
    }

    if (
      typeof body.approvedSummary !== 'string' ||
      body.approvedSummary.trim().length < 10
    ) {
      res.status(400).json({
        error: 'Approved referral summary must be at least 10 characters.',
      });
      return;
    }

    if (
      typeof body.targetCenterId !== 'string' ||
      typeof body.targetCenterName !== 'string'
    ) {
      res.status(400).json({ error: 'A target demo center must be selected.' });
      return;
    }

    const now = new Date().toISOString();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const record: ReferralRecord = {
      id: `ref-demo-${Date.now()}`,
      referenceCode: `OD-DEMO-${randomDigits}`,
      createdAt: now,
      syntheticDemo: true,
      status: 'Received',
      targetCenterId: body.targetCenterId,
      targetCenterName: body.targetCenterName,
      approvedSummary: body.approvedSummary.trim().slice(0, 1500),
      approvedCategories: Array.isArray(body.approvedCategories)
        ? (body.approvedCategories as SupportCategoryId[])
        : [],
      approvedSubCity:
        typeof body.approvedSubCity === 'string' && body.approvedSubCity.trim()
          ? body.approvedSubCity.trim()
          : null,
      urgencyFlagged: Boolean(body.urgencyFlagged),
      minorSafeguardingNoted: Boolean(body.minorSafeguardingNoted),
      matchingExplanation: Array.isArray(body.matchingExplanation)
        ? body.matchingExplanation.map(String).slice(0, 4)
        : [],
      consentApprovedAt: now,
    };

    const existing = readReferrals();
    writeReferrals([record, ...existing]);
    res.status(201).json({ referral: record });
  });

  app.patch('/api/referrals/:id', (req, res) => {
    const { id } = req.params;
    const body = req.body as { status?: unknown };
    const allowed: ReferralStatus[] = [
      'Received',
      'In Review',
      'Acknowledged (Demo)',
    ];
    if (
      typeof body?.status !== 'string' ||
      !allowed.includes(body.status as ReferralStatus)
    ) {
      res.status(400).json({ error: 'Invalid status update.' });
      return;
    }

    const existing = readReferrals();
    const idx = existing.findIndex((r) => r.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Demo referral not found.' });
      return;
    }

    existing[idx] = {
      ...existing[idx],
      status: body.status as ReferralStatus,
    };
    writeReferrals(existing);
    res.json({ referral: existing[idx] });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(ROOT, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OneDoor server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
