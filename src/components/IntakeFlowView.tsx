import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, MapPin, ShieldAlert, Sparkles } from 'lucide-react';
import { CategoryOutlinedIcon } from './OneDoorIcons';
import { VoiceAssistantPanel } from './VoiceAssistantPanel';
import { TRANSLATIONS } from '../lib/i18n';
import { rankHelpingCenters } from '../lib/matching';
import { buildConsentedReferralPayload } from '../lib/referralBuilder';
import {
  ADDIS_SUBCITIES,
  SUPPORT_CATEGORY_IDS,
  type AddisSubCity,
  type ClassificationResult,
  type LanguageCode,
  type MatchedCenter,
  type ReferralRecord,
  type SupportCategoryId,
} from '../lib/types';
import type { AppRoute } from './Shell';

interface IntakeFlowViewProps {
  lang: LanguageCode;
  initialMode?: 'write' | 'talk';
  onNavigate: (route: AppRoute) => void;
}

const APPROX_SUBCITY_COORDS: Array<{
  subCity: Exclude<AddisSubCity, 'Prefer not to say'>;
  lat: number;
  lon: number;
}> = [
  { subCity: 'Bole', lat: 8.997, lon: 38.789 },
  { subCity: 'Kirkos', lat: 9.005, lon: 38.758 },
  { subCity: 'Yeka', lat: 9.035, lon: 38.805 },
  { subCity: 'Arada', lat: 9.035, lon: 38.752 },
  { subCity: 'Lideta', lat: 9.011, lon: 38.733 },
  { subCity: 'Kolfe Keranio', lat: 9.015, lon: 38.698 },
  { subCity: 'Nifas Silk-Lafto', lat: 8.965, lon: 38.732 },
  { subCity: 'Gullele', lat: 9.062, lon: 38.742 },
  { subCity: 'Akaky Kaliti', lat: 8.885, lon: 38.782 },
  { subCity: 'Lemi Kura', lat: 9.012, lon: 38.855 },
];

const QUICK_SYNTHETIC_EXAMPLES = [
  {
    label: 'Physical injury & unsafe home (Bole)',
    text: 'My partner hit me last night in Bole and locked my phone. My wrist is swollen and I have nowhere safe to sleep tonight.',
    subCity: 'Bole' as AddisSubCity,
  },
  {
    label: 'Indirect / euphemistic assault phrasing',
    text: 'He took what he wanted from me while I was half asleep from fever medicine. I am ashamed to say the word out loud and worry about pregnancy.',
    subCity: 'Lideta' as AddisSubCity,
  },
  {
    label: 'Short distressed message',
    text: 'need safe place now',
    subCity: 'Prefer not to say' as AddisSubCity,
  },
];

export function IntakeFlowView({
  lang,
  initialMode = 'write',
  onNavigate,
}: IntakeFlowViewProps) {
  const t = TRANSLATIONS[lang];
  const [inputMode, setInputMode] = useState<'write' | 'talk'>(initialMode);
  const [description, setDescription] = useState('');
  const [subCity, setSubCity] = useState<AddisSubCity>('Prefer not to say');
  const [minorInvolved, setMinorInvolved] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  const [isClassifying, setIsClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState<string | null>(null);
  const [classification, setClassification] = useState<ClassificationResult | null>(
    null
  );
  const [explanationText, setExplanationText] = useState('');
  const [usedGeminiAssist, setUsedGeminiAssist] = useState(false);
  const [isRefiningAssist, setIsRefiningAssist] = useState(false);

  // Editable referral state (explicit consent required)
  const [approvedCategories, setApprovedCategories] = useState<SupportCategoryId[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');
  const [draftSummary, setDraftSummary] = useState('');
  const [includeSubCity, setIncludeSubCity] = useState(true);
  const [includeUrgencyFlag, setIncludeUrgencyFlag] = useState(true);
  const [consentApproved, setConsentApproved] = useState(false);

  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [submittedReferral, setSubmittedReferral] = useState<ReferralRecord | null>(
    null
  );

  // Re-rank centers dynamically whenever approvedCategories, subCity, or minorInvolved change
  const matchedCenters: MatchedCenter[] = useMemo(() => {
    if (!classification) return [];
    return rankHelpingCenters(classification, {
      subCity,
      minorInvolved,
      overrideCategories: approvedCategories,
    });
  }, [classification, subCity, minorInvolved, approvedCategories]);

  const selectedMatch = useMemo(() => {
    if (matchedCenters.length === 0) return null;
    return (
      matchedCenters.find((m) => m.center.id === selectedCenterId) ??
      matchedCenters[0]
    );
  }, [matchedCenters, selectedCenterId]);

  const handleRequestGps = () => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('Browser location is not available here. Please select a sub-city manually.');
      return;
    }
    setGpsStatus('Requesting permission for approximate sub-city...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let nearest = APPROX_SUBCITY_COORDS[0];
        let bestDist = Infinity;
        for (const item of APPROX_SUBCITY_COORDS) {
          const d = Math.hypot(latitude - item.lat, longitude - item.lon);
          if (d < bestDist) {
            bestDist = d;
            nearest = item;
          }
        }
        setSubCity(nearest.subCity);
        setGpsStatus(
          `Approximate nearest Addis sub-city set to ${nearest.subCity} (raw coordinates were not stored).`
        );
      },
      () => {
        setGpsStatus('Location permission declined. You can choose a sub-city manually or keep "Prefer not to say".');
      },
      { timeout: 8000 }
    );
  };

  const runClassification = async (textOverride?: string) => {
    const textToAnalyze = (textOverride ?? description).trim();
    if (textToAnalyze.length < 3) {
      setClassifyError('Please write or speak a few words (at least 3 characters) so OneDoor can organize options.');
      return;
    }

    setClassifyError(null);
    setReferralError(null);
    setSubmittedReferral(null);
    setConsentApproved(false);
    setIsClassifying(true);

    try {
      const resp = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze,
          subCity,
          minorInvolved,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setClassifyError(data.error ?? 'Could not process this description.');
        return;
      }

      const cls: ClassificationResult = data.classification;
      const initialCategories: SupportCategoryId[] =
        cls.predictedCategories.length > 0
          ? cls.predictedCategories
          : ['psychological_support', 'protection_safeguarding'];
      const reranked = rankHelpingCenters(cls, {
        subCity,
        minorInvolved,
        overrideCategories: initialCategories,
      });
      setClassification(cls);
      setApprovedCategories(initialCategories);
      setSelectedCenterId(reranked[0]?.center.id ?? '');
      setExplanationText(data.defaultExplanation ?? '');
      setDraftSummary(data.defaultDraftSummary ?? '');
      setUsedGeminiAssist(false);
      setIncludeSubCity(subCity !== 'Prefer not to say');
      setIncludeUrgencyFlag(cls.urgencyFlagged);
    } catch {
      setClassifyError('Connection error while running the classifier. Please try again.');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleRefineWithAssistant = async () => {
    if (!classification) return;
    setIsRefiningAssist(true);
    try {
      const resp = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: description,
          categories: approvedCategories,
          urgencyFlagged: classification.urgencyFlagged,
          subCity,
          minorInvolved,
          lowConfidence: classification.lowConfidenceFallbackUsed,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.explanation) setExplanationText(data.explanation);
        if (data.draftSummary) setDraftSummary(data.draftSummary);
        setUsedGeminiAssist(Boolean(data.usedGemini));
      }
    } catch {
      // Keep deterministic template if optional helper fails
    } finally {
      setIsRefiningAssist(false);
    }
  };

  const toggleCategory = (catId: SupportCategoryId) => {
    setApprovedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleSubmitReferral = async () => {
    if (!classification || !selectedMatch) return;
    setReferralError(null);

    const built = buildConsentedReferralPayload({
      consentApproved,
      approvedSummary: draftSummary,
      approvedCategories,
      includeSubCity,
      subCity,
      includeUrgencyFlag,
      urgencyFlagged: classification.urgencyFlagged,
      minorSafeguardingNoted: minorInvolved,
      targetCenterId: selectedMatch.center.id,
      targetCenterName: selectedMatch.center.name,
      matchingExplanation: selectedMatch.matchReasons,
    });

    if (!built.ok) {
      setReferralError(built.error);
      return;
    }

    setIsSubmittingReferral(true);
    try {
      const resp = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...built.payload,
          consentApproved: true,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setReferralError(data.error ?? 'Could not save demo referral.');
        return;
      }
      setSubmittedReferral(data.referral);
    } catch {
      setReferralError('Network error while sending the demo referral.');
    } finally {
      setIsSubmittingReferral(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header & Privacy Reassurance */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-[#0F3D3E]/80">
          Confidential Intake · No Account Required · No Photo Uploads
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0F3D3E] [text-wrap:balance]">
          {t.intake.title}
        </h1>
        <p className="text-base text-[#14202B]/85 max-w-3xl leading-relaxed">
          {t.intake.subtitle}
        </p>
        <div className="rounded-xl bg-[#DCE8E3]/65 border border-[#0F3D3E]/12 p-4 text-sm text-[#14202B] space-y-1.5">
          <p>{t.intake.privacyReassurance}</p>
          <p className="text-xs text-[#14202B]/75">{t.intake.englishClassifierNote}</p>
        </div>
      </div>

      {/* Mode Switcher: Write vs Talk (Simulated Voice) */}
      <div className="space-y-5">
        <div
          role="tablist"
          aria-label="Choose how to describe your situation"
          className="inline-flex p-1 rounded-xl bg-[#DCE8E3]/80 border border-[#0F3D3E]/15"
        >
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'write'}
            onClick={() => setInputMode('write')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap min-h-[40px] ${
              inputMode === 'write'
                ? 'bg-[#0F3D3E] text-[#FAF6EF]'
                : 'text-[#14202B]/80 hover:text-[#0F3D3E]'
            }`}
          >
            {t.intake.modeWrite}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'talk'}
            onClick={() => setInputMode('talk')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap min-h-[40px] ${
              inputMode === 'talk'
                ? 'bg-[#0F3D3E] text-[#FAF6EF]'
                : 'text-[#14202B]/80 hover:text-[#0F3D3E]'
            }`}
          >
            {t.intake.modeTalk}
          </button>
        </div>

        {inputMode === 'talk' ? (
          <VoiceAssistantPanel
            transcript={description}
            onChangeTranscript={setDescription}
            onUseTranscript={() => runClassification(description)}
          />
        ) : (
          <div className="rounded-2xl bg-white/85 border border-[#0F3D3E]/15 p-6 space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="situation-description"
                className="block text-sm font-semibold text-[#0F3D3E]"
              >
                {t.intake.descriptionLabel}
              </label>
              <textarea
                id="situation-description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.intake.descriptionPlaceholder}
                className="w-full rounded-xl border border-[#0F3D3E]/25 bg-[#FAF6EF]/50 p-4 text-sm sm:text-base text-[#14202B] leading-relaxed focus:outline-2 focus:outline-[#0F3D3E]"
              />
            </div>

            {/* Synthetic Quick Examples for Demonstration */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#14202B]/70">
                Try a synthetic demonstration message:
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_SYNTHETIC_EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => {
                      setDescription(ex.text);
                      setSubCity(ex.subCity);
                      setClassifyError(null);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#0F3D3E]/20 bg-[#FAF6EF] hover:bg-[#DCE8E3]/70 text-xs font-medium text-[#0F3D3E] transition-colors"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Sub-City + Optional GPS + Minor Safeguarding */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-[#0F3D3E]/10">
              <div className="space-y-2">
                <label
                  htmlFor="subcity-select"
                  className="block text-sm font-semibold text-[#0F3D3E]"
                >
                  {t.intake.subCityLabel}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    id="subcity-select"
                    value={subCity}
                    onChange={(e) => setSubCity(e.target.value as AddisSubCity)}
                    className="flex-1 min-w-[200px] rounded-xl border border-[#0F3D3E]/25 bg-[#FAF6EF] px-3.5 py-2.5 text-sm text-[#14202B] min-h-[44px]"
                  >
                    {ADDIS_SUBCITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleRequestGps}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#0F3D3E]/25 text-xs font-medium text-[#0F3D3E] hover:bg-[#DCE8E3]/60 min-h-[44px] whitespace-nowrap"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{t.intake.gpsButton}</span>
                  </button>
                </div>
                {gpsStatus && (
                  <p className="text-xs text-[#0F3D3E]/80">{gpsStatus}</p>
                )}
              </div>

              <div className="flex items-start gap-3 pt-1 md:pt-7">
                <input
                  id="minor-involved"
                  type="checkbox"
                  checked={minorInvolved}
                  onChange={(e) => setMinorInvolved(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#0F3D3E]"
                />
                <label
                  htmlFor="minor-involved"
                  className="text-sm text-[#14202B] leading-snug cursor-pointer"
                >
                  {t.intake.minorCheckbox}
                </label>
              </div>
            </div>

            {classifyError && (
              <div
                role="alert"
                className="rounded-xl bg-[#B91C1C]/10 border border-[#B91C1C]/30 p-3.5 text-sm text-[#B91C1C]"
              >
                {classifyError}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <p className="text-xs text-[#14202B]/70">
                Nothing is sent to any helping center in this step.
              </p>
              <button
                type="button"
                onClick={() => runClassification()}
                disabled={isClassifying}
                className="px-6 py-3 rounded-xl bg-[#E9A23B] text-[#14202B] font-bold text-sm sm:text-base hover:bg-[#D89029] disabled:opacity-60 transition-colors min-h-[48px] whitespace-nowrap"
              >
                {isClassifying ? t.intake.analyzingButton : t.intake.submitButton}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results: ML Predictions + Uncertainty + Center Matching + Consent-Gated Referral */}
      {classification && (
        <section aria-live="polite" className="space-y-10 pt-4 border-t border-[#0F3D3E]/15">
          {/* Urgency Notice (Non-diagnostic) */}
          {classification.urgencyFlagged && (
            <div
              role="status"
              className="rounded-2xl bg-[#B91C1C]/8 border border-[#B91C1C]/35 p-5 flex items-start gap-3.5"
            >
              <AlertTriangle className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-bold text-[#B91C1C]">
                  Possible time-sensitive urgency flagged (Prototype ML score:{' '}
                  <span className="font-mono-tabular">
                    {Math.round(classification.urgencyProbability * 100)}%
                  </span>
                  )
                </p>
                <p className="text-[#14202B] leading-relaxed">
                  {t.intake.urgencyNotice}
                </p>
              </div>
            </div>
          )}

          {/* Minor Safeguarding Note (shown when minor checkbox selected or age/minor terms mentioned) */}
          {(minorInvolved ||
            /\b(minor|child|under 18|1[0-7]\s*year|teen|daughter|son|stepdaughter|stepson|schoolgirl)\b/i.test(
              description
            )) && (
            <div className="rounded-2xl bg-[#DCE8E3]/70 border border-[#0F3D3E]/20 p-5 flex items-start gap-3.5">
              <ShieldAlert className="w-5 h-5 text-[#0F3D3E] shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-[#0F3D3E]">
                  Minors &amp; Safeguarding Reminder
                </p>
                <p className="text-[#14202B]/85 leading-relaxed">
                  {t.intake.minorSafeguardingNote}
                </p>
              </div>
            </div>
          )}

          {/* 1. ML Support Needs & Uncertainty */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <p className="text-xs text-[#14202B]/70 font-medium">
                  Trained TF-IDF + Logistic Regression Classifier · Model{' '}
                  <span className="font-mono-tabular">{classification.modelVersion}</span>
                </p>
                <h2 className="font-display text-2xl font-bold text-[#0F3D3E]">
                  {t.intake.resultsTitle}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleRefineWithAssistant}
                disabled={isRefiningAssist}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#0F3D3E]/25 bg-white text-xs font-semibold text-[#0F3D3E] hover:bg-[#DCE8E3]/60 min-h-[40px] self-start"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E9A23B]" />
                <span>
                  {isRefiningAssist
                    ? 'Drafting gentle explanation...'
                    : 'Generate Gentle Explanation & Summary'}
                </span>
              </button>
            </div>

            {/* Uncertainty & Explanation Card */}
            <div className="rounded-2xl bg-[#FAF6EF] border border-[#0F3D3E]/18 p-5 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#0F3D3E]">
                <span>{t.intake.uncertaintyTitle}</span>
                <span aria-hidden="true">·</span>
                <span>
                  Confidence level:{' '}
                  {classification.overallConfidence === 'low'
                    ? 'Low (Broad options kept open)'
                    : classification.overallConfidence === 'uncertain'
                      ? 'Uncertain / Mixed signals'
                      : 'Clearer lexical signal'}
                </span>
                {usedGeminiAssist && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Summary worded with Gemini (classifier remains local ML)</span>
                  </>
                )}
              </div>
              <p className="text-sm text-[#14202B] leading-relaxed">
                {explanationText}
              </p>
              <p className="text-xs text-[#14202B]/75 leading-relaxed">
                {classification.uncertaintyMessage}
              </p>
            </div>

            {/* Editable 6 Support Categories Grid */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#14202B]">
                Check or uncheck support needs to adjust your referral and center ranking:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {classification.predictions.map((pred) => {
                  const checked = approvedCategories.includes(pred.id);
                  const catInfo = t.categories[pred.id];
                  const pct = Math.round(pred.probability * 100);
                  return (
                    <label
                      key={pred.id}
                      className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-colors ${
                        checked
                          ? 'bg-white border-[#0F3D3E] shadow-xs'
                          : 'bg-[#FAF6EF]/60 border-[#0F3D3E]/15 hover:bg-white/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(pred.id)}
                        className="mt-1 h-4 w-4 accent-[#0F3D3E]"
                      />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-2 font-semibold text-sm text-[#0F3D3E]">
                            <CategoryOutlinedIcon category={pred.id} className="w-4 h-4 shrink-0" />
                            <span>{catInfo.label}</span>
                          </span>
                          <span className="font-mono-tabular text-xs font-medium text-[#14202B]/75 shrink-0">
                            {pct}% ·{' '}
                            {pred.uncertainty === 'uncertain'
                              ? 'Uncertain'
                              : pred.predicted
                                ? 'Suggested'
                                : 'Below threshold'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#DCE8E3] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pred.predicted ? 'bg-[#0F3D3E]' : 'bg-[#0F3D3E]/35'
                            }`}
                            style={{ width: `${Math.max(4, pct)}%` }}
                          />
                        </div>
                        <p className="text-xs text-[#14202B]/75 leading-relaxed">
                          {catInfo.shortDesc}
                        </p>
                        {pred.contributingTerms.length > 0 && (
                          <p className="text-xs text-[#14202B]/60">
                            Key words noticed: {pred.contributingTerms.join(', ')}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Separate Matching Algorithm: Synthetic Helping Centers */}
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-[#14202B]/70">
                Demo / Simulated Service Directory · Never lists real phone numbers or active clinics
              </p>
              <h2 className="font-display text-2xl font-bold text-[#0F3D3E]">
                {t.intake.centersTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchedCenters.slice(0, 4).map((match, idx) => {
                const isSelected = selectedMatch?.center.id === match.center.id;
                return (
                  <div
                    key={match.center.id}
                    className={`rounded-2xl p-5 border flex flex-col justify-between gap-4 transition-colors ${
                      isSelected
                        ? 'bg-white border-[#0F3D3E] ring-1 ring-[#0F3D3E]'
                        : 'bg-white/70 border-[#0F3D3E]/15'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-[#14202B]/70">
                            Rank #{idx + 1} · Demo / Simulated · {match.center.subCity}
                          </p>
                          <h3 className="font-display text-base font-bold text-[#0F3D3E]">
                            {match.center.name}
                          </h3>
                        </div>
                        <span className="font-mono-tabular text-xs font-semibold text-[#0F3D3E] shrink-0">
                          Match {match.score}
                        </span>
                      </div>

                      <p className="text-xs text-[#14202B]/80 leading-relaxed">
                        {match.center.description}
                      </p>

                      <div className="text-xs text-[#14202B]/75 space-y-1 pt-1 border-t border-[#0F3D3E]/10">
                        <p className="font-semibold text-[#0F3D3E]">Why matched:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {match.matchReasons.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      </div>

                      <p className="text-xs text-[#14202B]/70 pt-1">
                        {match.center.hoursLabel} · {match.center.syntheticPhone}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCenterId(match.center.id)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors min-h-[42px] ${
                        isSelected
                          ? 'bg-[#0F3D3E] text-[#FAF6EF]'
                          : 'bg-[#DCE8E3] text-[#0F3D3E] hover:bg-[#DCE8E3]/80'
                      }`}
                    >
                      {isSelected
                        ? 'Selected for Referral Review'
                        : 'Choose This Demo Center'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Explicit Consent-Gated Referral Summary */}
          {!submittedReferral ? (
            <div className="rounded-2xl bg-white border border-[#0F3D3E]/20 p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#0F3D3E]/80">
                  Demo / Simulated Referral · Explicit Informed Approval Required
                </p>
                <h2 className="font-display text-2xl font-bold text-[#0F3D3E]">
                  {t.intake.referralTitle}
                </h2>
                <p className="text-sm text-[#14202B]/80">
                  {t.intake.referralSubtitle}
                </p>
              </div>

              {selectedMatch && (
                <div className="rounded-xl bg-[#FAF6EF] border border-[#0F3D3E]/15 p-4 text-sm space-y-1">
                  <p className="text-xs text-[#14202B]/70">Selected receiving demo center:</p>
                  <p className="font-semibold text-[#0F3D3E]">
                    {selectedMatch.center.name}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="referral-summary-editor"
                  className="block text-sm font-semibold text-[#0F3D3E]"
                >
                  Exact summary to share (edit or remove anything you want)
                </label>
                <textarea
                  id="referral-summary-editor"
                  rows={4}
                  value={draftSummary}
                  onChange={(e) => setDraftSummary(e.target.value)}
                  className="w-full rounded-xl border border-[#0F3D3E]/25 bg-[#FAF6EF]/50 p-3.5 text-sm text-[#14202B] leading-relaxed focus:outline-2 focus:outline-[#0F3D3E]"
                />
              </div>

              {/* Granular sharing controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#0F3D3E]/15 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSubCity}
                    onChange={(e) => setIncludeSubCity(e.target.checked)}
                    disabled={subCity === 'Prefer not to say'}
                    className="mt-0.5 h-4 w-4 accent-[#0F3D3E]"
                  />
                  <span>
                    Include sub-city:{' '}
                    <strong>
                      {subCity === 'Prefer not to say' ? 'Not provided' : subCity}
                    </strong>
                  </span>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#0F3D3E]/15 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeUrgencyFlag}
                    onChange={(e) => setIncludeUrgencyFlag(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#0F3D3E]"
                  />
                  <span>
                    Include time-sensitivity flag:{' '}
                    <strong>
                      {classification.urgencyFlagged ? 'Flagged' : 'Not flagged'}
                    </strong>
                  </span>
                </label>
              </div>

              {/* Exact preview of shared payload */}
              <div className="rounded-xl bg-[#DCE8E3]/45 border border-[#0F3D3E]/12 p-4 space-y-1.5 text-xs text-[#14202B]">
                <p className="font-semibold text-[#0F3D3E]">
                  Preview of exact details visible to the demo caseworker:
                </p>
                <p>
                  Support needs:{' '}
                  {approvedCategories.length > 0
                    ? approvedCategories.map((c) => t.categories[c].label).join(', ')
                    : 'None selected'}
                </p>
                <p>
                  Sub-city:{' '}
                  {includeSubCity && subCity !== 'Prefer not to say'
                    ? subCity
                    : 'Not shared'}
                </p>
                <p>
                  Urgency note:{' '}
                  {includeUrgencyFlag && classification.urgencyFlagged
                    ? 'Possible time-sensitive urgency'
                    : 'Not shared'}
                </p>
                <p>Original raw text shared? No (only your edited summary above).</p>
              </div>

              {/* Explicit Consent Checkbox (never pre-checked) */}
              <label className="flex items-start gap-3 p-4 rounded-xl bg-[#FAF6EF] border border-[#0F3D3E]/25 cursor-pointer">
                <input
                  id="explicit-consent-checkbox"
                  type="checkbox"
                  checked={consentApproved}
                  onChange={(e) => setConsentApproved(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#0F3D3E]"
                />
                <span className="text-sm font-medium text-[#14202B] leading-snug">
                  {t.intake.consentCheckbox}
                </span>
              </label>

              {referralError && (
                <div
                  role="alert"
                  className="rounded-xl bg-[#B91C1C]/10 border border-[#B91C1C]/30 p-3.5 text-sm text-[#B91C1C]"
                >
                  {referralError}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleSubmitReferral}
                  disabled={isSubmittingReferral || !consentApproved}
                  className="px-6 py-3 rounded-xl bg-[#E9A23B] text-[#14202B] font-bold text-sm sm:text-base hover:bg-[#D89029] disabled:opacity-45 disabled:cursor-not-allowed transition-colors min-h-[48px]"
                >
                  {isSubmittingReferral
                    ? 'Saving Demo Referral...'
                    : t.intake.sendReferralButton}
                </button>
              </div>
            </div>
          ) : (
            <div
              role="status"
              className="rounded-2xl bg-[#DCE8E3]/70 border border-[#0F3D3E]/25 p-6 sm:p-8 space-y-4"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#0F3D3E] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#0F3D3E]">
                    Demo / Simulated Referral Recorded
                  </p>
                  <h3 className="font-display text-2xl font-bold text-[#0F3D3E]">
                    Reference:{' '}
                    <span className="font-mono-tabular">
                      {submittedReferral.referenceCode}
                    </span>
                  </h3>
                  <p className="text-sm text-[#14202B]/85 leading-relaxed">
                    This simulated referral has been sent to{' '}
                    <strong>{submittedReferral.targetCenterName}</strong> containing only
                    the fields you approved. In a live deployment, a caseworker would review
                    this summary—no real organization has received this demonstration entry.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('caseworker')}
                  className="px-5 py-2.5 rounded-xl bg-[#0F3D3E] text-[#FAF6EF] text-sm font-semibold hover:bg-[#0A2C2D] min-h-[44px]"
                >
                  Inspect in Caseworker View (Demo)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedReferral(null);
                    setClassification(null);
                    setDescription('');
                    setConsentApproved(false);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-[#0F3D3E]/25 bg-white text-sm font-semibold text-[#0F3D3E] hover:bg-[#FAF6EF] min-h-[44px]"
                >
                  Start Another Demo Entry
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
