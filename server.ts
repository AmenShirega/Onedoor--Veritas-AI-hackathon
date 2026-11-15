import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { classifyWithWeights } from './src/lib/mlInference';
import { rankHelpingCenters } from './src/lib/matching';
import { VERIFIED_SERVICE_DIRECTORY } from './src/lib/directory';
import {
  SUPPORT_CATEGORY_IDS,
  type GeocodedPlace,
  type ModelWeightsFile,
  type ReferralRecord,
  type SupportCategoryId,
  type UserLocation,
} from './src/lib/types';

const PORT = Number(process.env.PORT ?? 3000);
const ROOT = process.cwd();
const WEIGHTS_PATH = path.join(ROOT, 'ml', 'model_weights.json');
const REFERRALS_PATH = path.join(ROOT, 'data', 'referrals.json');

const modelWeights: ModelWeightsFile = JSON.parse(
  fs.readFileSync(WEIGHTS_PATH, 'utf-8')
);

function readReferrals(): ReferralRecord[] {
  try {
    const raw = fs.readFileSync(REFERRALS_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ReferralRecord[]) : [];
  } catch {
    return [];
  }
}

function writeReferrals(rows: ReferralRecord[]): void {
  fs.mkdirSync(path.dirname(REFERRALS_PATH), { recursive: true });
  fs.writeFileSync(REFERRALS_PATH, JSON.stringify(rows, null, 2), 'utf-8');
}

function generateReferenceCode(existing: ReferralRecord[]): string {
  const existingCodes = new Set(existing.map((r) => r.referenceCode.toUpperCase()));
  for (let i = 0; i < 10; i++) {
    const digits = crypto.randomInt(100000, 999999);
    const code = `OD-REF-${digits}`;
    if (!existingCodes.has(code)) return code;
  }
  return `OD-REF-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

const CATEGORY_TITLES: Record<SupportCategoryId, string> = {
  medical_support: 'Medical support',
  psychological_support: 'Psychological support',
  protection_safeguarding: 'Protection and safeguarding',
  legal_support: 'Legal support',
  sexual_violence_support: 'Sexual-violence support',
  social_support: 'Social support',
};

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state_district?: string;
  state?: string;
  region?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
}

interface NominatimResultItem {
  place_id?: number | string;
  address?: NominatimAddress;
  name?: string;
  display_name?: string;
}

function sanitizeNominatimPlace(item: NominatimResultItem, fallbackIndex = 0): GeocodedPlace | null {
  const addr = item.address ?? {};
  const city = (
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.county ||
    ''
  ).trim();
  const region = (addr.state || addr.region || addr.state_district || '').trim();
  const country = (addr.country || '').trim();
  const countryCode = (addr.country_code || '').trim().toUpperCase();
  const postalCode = (addr.postcode || '').trim();

  if (!city && !country && !region) {
    return null;
  }

  const labelParts = Array.from(
    new Set([city, region, country].filter((p) => p.length > 0))
  );
  const label = labelParts.join(', ') || item.name || 'Selected area';

  return {
    id: String(item.place_id ?? `${countryCode}-${city}-${fallbackIndex}`),
    label,
    city,
    region,
    country,
    countryCode,
    postalCode,
  };
}

function sanitizeUserLocation(raw: unknown): UserLocation | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const country = typeof obj.country === 'string' ? obj.country.trim().slice(0, 80) : '';
  const city = typeof obj.city === 'string' ? obj.city.trim().slice(0, 80) : '';
  const region = typeof obj.region === 'string' ? obj.region.trim().slice(0, 80) : '';
  const countryCode =
    typeof obj.countryCode === 'string' ? obj.countryCode.trim().toUpperCase().slice(0, 8) : '';
  const postalCode =
    typeof obj.postalCode === 'string' ? obj.postalCode.trim().slice(0, 24) : '';
  const labelRaw = typeof obj.label === 'string' ? obj.label.trim().slice(0, 140) : '';

  if (!country && !city && !labelRaw) return null;
  const label =
    labelRaw ||
    Array.from(new Set([city, region, country].filter((p) => p.length > 0))).join(', ');

  return {
    label,
    city,
    region,
    country,
    countryCode,
    postalCode,
    source: obj.source === 'geolocation_confirmed' ? 'geolocation_confirmed' : 'manual',
  };
}

function buildTemplateSummaryAndExplanation(
  categories: SupportCategoryId[],
  urgencyFlagged: boolean,
  locationLabel: string | null,
  minorInvolved: boolean,
  lowConfidence: boolean
): { explanation: string; draftSummary: string } {
  const names = categories.map((c) => CATEGORY_TITLES[c]);
  const locationPhrase = locationLabel ? ` in ${locationLabel}` : '';

  const explanation = lowConfidence
    ? 'We kept broad support options open so nothing helpful is missed. You can add or remove any option below.'
    : `Based on what you shared, these options may help: ${names.join(', ') || 'general support'}${urgencyFlagged ? '. Time-sensitive care may also matter right now' : ''}. You can edit or remove any option.`;

  const needsText =
    names.length > 0 ? names.join(', ') : 'general confidential support';
  const minorClause = minorInvolved
    ? ' Someone under 18 may be involved.'
    : '';
  const urgentClause = urgencyFlagged
    ? ' Timely care or safety support may be helpful.'
    : '';

  const draftSummary = `Looking for support${locationPhrase}: ${needsText}.${urgentClause}${minorClause} Preferring to review support options calmly without repeating every detail.`;

  return { explanation, draftSummary };
}

async function generateOptionalGeminiAssist(params: {
  categories: SupportCategoryId[];
  urgencyFlagged: boolean;
  locationLabel: string | null;
  languageName: string;
  minorInvolved: boolean;
  lowConfidence: boolean;
  description: string;
}): Promise<{ explanation: string; draftSummary: string; usedGemini: boolean }> {
  const fallback = buildTemplateSummaryAndExplanation(
    params.categories,
    params.urgencyFlagged,
    params.locationLabel,
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
      'General confidential support';

    const prompt = [
      'You are writing two short, warm, plain-language blocks for OneDoor, a confidential support platform.',
      `Write both JSON values in ${params.languageName || 'English'}.`,
      'Rules:',
      '- Use simple, everyday human language with zero technical or AI jargon.',
      '- Never diagnose medical or psychological conditions.',
      '- Never tell the person whether to leave, stay, confront someone, or go to police.',
      '- Do not repeat graphic details or invent personal names, organizations, or phone numbers.',
      '- Keep both outputs calm, respectful, and concise.',
      `Suggested support areas: ${predictedNames}`,
      `Timely support note: ${params.urgencyFlagged ? 'Yes' : 'No'}`,
      `Optional location: ${params.locationLabel ?? 'Not shared'}`,
      `Someone under 18 involved: ${params.minorInvolved ? 'Yes' : 'No'}`,
      `What the person shared (summarize gently, do not quote graphic details): """${params.description.slice(0, 800)}"""`,
      '',
      'Return strict JSON with keys "explanation" (2 calm sentences noting these options are suggestions they can change) and "draftSummary" (2 brief, neutral, non-identifying sentences suitable for a personal referral summary).',
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
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  // Privacy & hardening headers on all responses
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  });

  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  // Note: Never log request bodies containing survivor descriptions, location queries, or coordinates.
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', modelVersion: modelWeights.model_version });
  });

  app.get('/api/centers', (_req, res) => {
    res.json({ centers: VERIFIED_SERVICE_DIRECTORY });
  });

  // International forward geocoding autocomplete proxy (sanitized city/region/country/postal only)
  app.get('/api/location/search', async (req, res) => {
    const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 120) : '';
    if (query.length < 2) {
      res.json({ places: [] });
      return;
    }

    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', query);
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('limit', '6');

      const upstream = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'OneDoorSupportPlatform/1.0 (https://onedoor.support)',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!upstream.ok) {
        res.status(502).json({ error: 'Location lookup service returned an error.', places: [] });
        return;
      }

      const raw = (await upstream.json()) as NominatimResultItem[];
      const seen = new Set<string>();
      const places: GeocodedPlace[] = [];

      for (let i = 0; i < raw.length; i++) {
        const sanitized = sanitizeNominatimPlace(raw[i], i);
        if (!sanitized) continue;
        const dedupeKey = `${sanitized.label.toLowerCase()}|${sanitized.postalCode.toLowerCase()}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        places.push(sanitized);
      }

      res.json({ places });
    } catch {
      res.status(502).json({
        error: 'Location autocomplete is temporarily unavailable.',
        places: [],
      });
    }
  });

  // Privacy-preserving reverse geocoding (POST body only; coordinates never logged or placed in URLs)
  app.post('/api/location/reverse', async (req, res) => {
    const body = req.body as { lat?: unknown; lon?: unknown };
    const lat = typeof body?.lat === 'number' ? body.lat : Number(body?.lat);
    const lon = typeof body?.lon === 'number' ? body.lon : Number(body?.lon);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      res.status(400).json({ error: 'Invalid geographic coordinates.', code: 'invalid_coords' });
      return;
    }

    try {
      const url = new URL('https://nominatim.openstreetmap.org/reverse');
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lon', String(lon));
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('zoom', '12');
      url.searchParams.set('addressdetails', '1');

      const upstream = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'OneDoorSupportPlatform/1.0 (https://onedoor.support)',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!upstream.ok) {
        res.status(502).json({
          error: 'Could not resolve coordinates into a place name.',
          code: 'reverse_failed',
        });
        return;
      }

      const raw = (await upstream.json()) as NominatimResultItem;
      const place = sanitizeNominatimPlace(raw, 0);

      if (!place || (!place.city && !place.country)) {
        res.status(422).json({
          error: 'Detected coordinates did not yield a clear city or country.',
          code: 'incomplete',
        });
        return;
      }

      res.json({ place });
    } catch {
      res.status(502).json({
        error: 'Could not resolve coordinates into a place name.',
        code: 'reverse_failed',
      });
    }
  });

  app.post('/api/classify', (req, res) => {
    const body = req.body as {
      text?: unknown;
      location?: unknown;
      minorInvolved?: unknown;
    };

    if (typeof body?.text !== 'string' || body.text.trim().length < 3) {
      res.status(400).json({
        error: 'Please enter a brief description (at least 3 characters) before continuing.',
      });
      return;
    }

    const cleanText = body.text.trim().slice(0, 4000);
    const location = sanitizeUserLocation(body.location);
    const minorInvolved = Boolean(body.minorInvolved);

    // Core classification strictly performed by trained ML weights
    const classification = classifyWithWeights(cleanText, modelWeights);
    // Separate international service-matching algorithm
    const matchingResult = rankHelpingCenters(classification, {
      location,
      minorInvolved,
    });
    const templates = buildTemplateSummaryAndExplanation(
      classification.predictedCategories,
      classification.urgencyFlagged,
      location?.label ?? null,
      minorInvolved,
      classification.lowConfidenceFallbackUsed
    );

    res.json({
      classification,
      matchingResult,
      defaultExplanation: templates.explanation,
      defaultDraftSummary: templates.draftSummary,
    });
  });

  app.post('/api/explain', async (req, res) => {
    const body = req.body as {
      text?: unknown;
      categories?: unknown;
      urgencyFlagged?: unknown;
      locationLabel?: unknown;
      languageName?: unknown;
      minorInvolved?: unknown;
      lowConfidence?: unknown;
    };

    const description =
      typeof body?.text === 'string' ? body.text.trim().slice(0, 1200) : '';
    const categories = Array.isArray(body?.categories)
      ? body.categories.filter(
          (c): c is SupportCategoryId =>
            typeof c === 'string' && SUPPORT_CATEGORY_IDS.includes(c as SupportCategoryId)
        )
      : [];

    const result = await generateOptionalGeminiAssist({
      description,
      categories,
      urgencyFlagged: Boolean(body?.urgencyFlagged),
      locationLabel:
        typeof body?.locationLabel === 'string' && body.locationLabel.trim()
          ? body.locationLabel.trim().slice(0, 120)
          : null,
      languageName:
        typeof body?.languageName === 'string' && body.languageName.trim()
          ? body.languageName.trim().slice(0, 48)
          : 'English',
      minorInvolved: Boolean(body?.minorInvolved),
      lowConfidence: Boolean(body?.lowConfidence),
    });

    res.json(result);
  });

  // Save a consent-approved referral summary (no public list endpoint for survivor privacy)
  app.post('/api/referrals', (req, res) => {
    const body = req.body as {
      targetCenterId?: unknown;
      targetCenterName?: unknown;
      approvedSummary?: unknown;
      approvedCategories?: unknown;
      approvedLocation?: unknown;
      urgencyFlagged?: unknown;
      minorSafeguardingNoted?: unknown;
      matchingExplanation?: unknown;
      consentApproved?: unknown;
    };

    if (body?.consentApproved !== true) {
      res.status(400).json({
        error: 'Explicit user consent approval is required before saving a referral summary.',
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

    const rawTargetId =
      typeof body.targetCenterId === 'string' && body.targetCenterId.trim()
        ? body.targetCenterId.trim()
        : 'self-directed-summary';

    const matchedCenter = VERIFIED_SERVICE_DIRECTORY.find((c) => c.id === rawTargetId);
    if (rawTargetId !== 'self-directed-summary' && !matchedCenter) {
      res.status(400).json({ error: 'Selected service could not be verified.' });
      return;
    }

    const targetCenterName = matchedCenter
      ? matchedCenter.name
      : typeof body.targetCenterName === 'string' && body.targetCenterName.trim()
        ? body.targetCenterName.trim().slice(0, 140)
        : 'Personal referral summary (no external service connected yet)';

    const validCategories = Array.isArray(body.approvedCategories)
      ? Array.from(
          new Set(
            body.approvedCategories.filter(
              (c): c is SupportCategoryId =>
                typeof c === 'string' &&
                SUPPORT_CATEGORY_IDS.includes(c as SupportCategoryId)
            )
          )
        )
      : [];

    const existing = readReferrals();
    const now = new Date().toISOString();
    const record: ReferralRecord = {
      id: `ref-${crypto.randomUUID()}`,
      referenceCode: generateReferenceCode(existing),
      createdAt: now,
      status: 'Saved locally (not transmitted)',
      deliveryStatus: 'saved_locally_pending_partner_integration',
      targetCenterId: matchedCenter ? matchedCenter.id : 'self-directed-summary',
      targetCenterName,
      approvedSummary: body.approvedSummary.trim().slice(0, 1500),
      approvedCategories: validCategories,
      approvedLocation:
        typeof body.approvedLocation === 'string' && body.approvedLocation.trim()
          ? body.approvedLocation.trim().slice(0, 120)
          : null,
      urgencyFlagged: Boolean(body.urgencyFlagged),
      minorSafeguardingNoted: Boolean(body.minorSafeguardingNoted),
      matchingExplanation: Array.isArray(body.matchingExplanation)
        ? body.matchingExplanation.map(String).slice(0, 4)
        : [],
      consentApprovedAt: now,
    };

    writeReferrals([record, ...existing]);
    res.status(201).json({ referral: record });
  });

  // Retrieve a specific saved referral strictly by its private reference code
  app.get('/api/referrals/:referenceCode', (req, res) => {
    const code = req.params.referenceCode.trim().toUpperCase();
    if (!/^OD-REF-[A-Z0-9]{4,10}$/.test(code)) {
      res.status(400).json({
        error: 'Reference codes follow the format OD-REF-XXXXXX.',
      });
      return;
    }

    const existing = readReferrals();
    const match = existing.find((r) => r.referenceCode.toUpperCase() === code);
    if (!match) {
      res.status(404).json({
        error: 'No saved referral summary matched that reference code.',
      });
      return;
    }

    res.json({ referral: match });
  });

  // Permanently withdraw & delete a saved referral by its reference code
  app.delete('/api/referrals/:referenceCode', (req, res) => {
    const code = req.params.referenceCode.trim().toUpperCase();
    if (!/^OD-REF-[A-Z0-9]{4,10}$/.test(code)) {
      res.status(400).json({
        error: 'Reference codes follow the format OD-REF-XXXXXX.',
      });
      return;
    }

    const existing = readReferrals();
    const filtered = existing.filter((r) => r.referenceCode.toUpperCase() !== code);
    if (filtered.length === existing.length) {
      res.status(404).json({
        error: 'No saved referral summary matched that reference code.',
      });
      return;
    }

    writeReferrals(filtered);
    res.json({ deleted: true, referenceCode: code });
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
