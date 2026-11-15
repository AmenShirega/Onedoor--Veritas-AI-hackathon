import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Info,
  Loader2,
  Mic,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  User,
} from 'lucide-react';
import { LocationSelector } from './LocationSelector';
import { CategoryOutlinedIcon, DoorwayLogoMark } from './OneDoorIcons';
import { VoiceAssistantPanel } from './VoiceAssistantPanel';
import { FLOW_TRANSLATIONS, TRANSLATIONS } from '../lib/i18n';
import { rankHelpingCenters } from '../lib/matching';
import { buildConsentedReferralPayload } from '../lib/referralBuilder';
import {
  SUPPORT_CATEGORY_IDS,
  type ClassificationResult,
  type LanguageCode,
  type MatchedCenter,
  type MatchingResult,
  type ReferralRecord,
  type SupportCategoryId,
  type UserLocation,
} from '../lib/types';

interface IntakeFlowViewProps {
  lang: LanguageCode;
  initialMode?: 'write' | 'talk';
}

type FlowStep = 1 | 2 | 3;

interface ConversationMessage {
  id: string;
  sender: 'user' | 'onedoor';
  text: string;
  status?: 'sending' | 'received' | 'failed';
  suggestedCategories?: SupportCategoryId[];
  urgencyFlagged?: boolean;
  lowConfidence?: boolean;
  nonEnglish?: boolean;
  isWelcome?: boolean;
}

export function IntakeFlowView({ lang, initialMode = 'write' }: IntakeFlowViewProps) {
  const t = TRANSLATIONS[lang];
  const f = FLOW_TRANSLATIONS[lang];

  const [step, setStep] = useState<FlowStep>(1);
  const [voiceOpen, setVoiceOpen] = useState(initialMode === 'talk');
  const [composerText, setComposerText] = useState('');
  const [voiceDraft, setVoiceDraft] = useState('');

  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: 'welcome-1',
      sender: 'onedoor',
      text: f.welcomeMessage,
      isWelcome: true,
    },
  ]);

  // Keep welcome bubble updated when user switches language
  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => (m.isWelcome ? { ...m, text: f.welcomeMessage } : m))
    );
  }, [f.welcomeMessage]);

  const [location, setLocation] = useState<UserLocation | null>(null);
  const [minorInvolved, setMinorInvolved] = useState(false);

  const [isSending, setIsSending] = useState(false);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [suggestedCategories, setSuggestedCategories] = useState<SupportCategoryId[]>([]);
  const [approvedCategories, setApprovedCategories] = useState<SupportCategoryId[]>([]);
  const [userToggledCategories, setUserToggledCategories] = useState<SupportCategoryId[]>([]);

  // Step 3 referral summary & consent state
  const [selectedCenterId, setSelectedCenterId] = useState<string>('self-directed-summary');
  const [draftSummary, setDraftSummary] = useState('');
  const [summaryEditedByUser, setSummaryEditedByUser] = useState(false);
  const [includeLocation, setIncludeLocation] = useState(false);
  const [includeUrgencyFlag, setIncludeUrgencyFlag] = useState(true);
  const [consentApproved, setConsentApproved] = useState(false);

  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [submittedReferral, setSubmittedReferral] = useState<ReferralRecord | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [withdrawnNotice, setWithdrawnNotice] = useState<string | null>(null);
  const [composerError, setComposerError] = useState<string | null>(null);

  // Collapsible private reference lookup
  const [lookupOpen, setLookupOpen] = useState(false);
  const [lookupCode, setLookupCode] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupRecord, setLookupRecord] = useState<ReferralRecord | null>(null);

  const threadContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToThreadBottom = () => {
    const el = threadContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleLocationChange = (next: UserLocation | null) => {
    setLocation(next);
    setIncludeLocation(Boolean(next));
  };

  // Build plain localized summary cleanly without technical jargon
  const buildPlainSummary = (
    categories: SupportCategoryId[],
    loc: UserLocation | null,
    urgent: boolean,
    minor: boolean
  ) => {
    const needs =
      categories.length > 0
        ? categories.map((c) => t.categories[c].label).join(', ')
        : t.intake.noneSelected;
    const locClause = loc ? ` (${loc.label})` : '';
    const urgentClause = urgent ? ` ${f.urgentTitle}.` : '';
    const minorClause = minor ? ` ${t.intake.minorSafeguardingNote}` : '';
    return t.intake.defaultSummaryTemplate
      .replace('{location}', locClause)
      .replace('{needs}', needs)
      .replace('{urgent}', urgentClause)
      .replace('{minor}', minorClause);
  };

  useEffect(() => {
    if (summaryEditedByUser) return;
    const hasResults = Boolean(classification) || approvedCategories.length > 0;
    if (!hasResults) return;
    setDraftSummary(
      buildPlainSummary(
        approvedCategories,
        includeLocation ? location : null,
        includeUrgencyFlag && Boolean(classification?.urgencyFlagged),
        minorInvolved
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lang,
    classification,
    approvedCategories,
    location,
    includeLocation,
    includeUrgencyFlag,
    minorInvolved,
    summaryEditedByUser,
  ]);

  const matchingResult: MatchingResult = useMemo(() => {
    if (!classification && approvedCategories.length === 0) {
      return {
        matches: [],
        verifiedServicesAvailable: false,
        matchedScope: 'none',
        reasonCode: 'no_verified_services_configured',
      };
    }
    const syntheticClassification: ClassificationResult = classification ?? {
      predictedCategories: approvedCategories,
      predictions: [],
      urgencyFlagged: false,
      urgencyProbability: 0,
      urgencyUncertainty: 'clear',
      overallConfidence: 'moderate_or_higher',
      lowConfidenceFallbackUsed: false,
      uncertaintyMessage: '',
      inputWordCount: 0,
      nonEnglishWarning: false,
      modelVersion: 'user-selected',
    };
    return rankHelpingCenters(syntheticClassification, {
      location,
      minorInvolved,
      overrideCategories: approvedCategories,
    });
  }, [classification, approvedCategories, location, minorInvolved]);

  const selectedMatch: MatchedCenter | null = useMemo(() => {
    if (matchingResult.matches.length === 0) return null;
    return (
      matchingResult.matches.find((m) => m.center.id === selectedCenterId) ??
      matchingResult.matches[0]
    );
  }, [matchingResult.matches, selectedCenterId]);

  const sendMessageText = async (
    rawText: string,
    options?: { retryMessageId?: string; fromVoice?: boolean }
  ) => {
    const clean = rawText.trim();
    if (clean.length < 3) {
      setComposerError(t.intake.minLengthError);
      return;
    }

    setComposerError(null);
    setReferralError(null);
    setSubmittedReferral(null);
    setWithdrawnNotice(null);
    setConsentApproved(false);

    const msgId = options?.retryMessageId ?? `user-${Date.now()}`;

    // Gather full session user context so follow-ups build cleanly on earlier messages
    const priorSentTexts = messages
      .filter(
        (m) =>
          m.sender === 'user' &&
          m.id !== msgId &&
          (m.status === 'received' || m.status === 'sending')
      )
      .map((m) => m.text);
    const combinedContext = [...priorSentTexts, clean].join('\n\n');

    if (options?.retryMessageId) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, status: 'sending' } : m
        )
      );
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: msgId,
          sender: 'user',
          text: clean,
          status: 'sending',
        },
      ]);
      if (options?.fromVoice) {
        setVoiceDraft('');
        setVoiceOpen(false);
      } else {
        setComposerText('');
      }
    }

    setIsSending(true);
    setTimeout(scrollToThreadBottom, 40);

    try {
      const resp = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: combinedContext,
          location,
          minorInvolved,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, status: 'failed' } : m))
        );
        return;
      }

      const cls: ClassificationResult = data.classification;
      const incomingSuggestions: SupportCategoryId[] =
        cls.predictedCategories.length > 0
          ? cls.predictedCategories
          : ['psychological_support', 'protection_safeguarding'];

      setClassification(cls);
      setSuggestedCategories(incomingSuggestions);

      // Keep user's explicit category choices, and include new suggestions they haven't dismissed
      setApprovedCategories((prev) => {
        const next = new Set(prev);
        for (const cat of incomingSuggestions) {
          if (!userToggledCategories.includes(cat)) {
            next.add(cat);
          }
        }
        return Array.from(next);
      });

      setIncludeUrgencyFlag(cls.urgencyFlagged);
      const reranked = rankHelpingCenters(cls, {
        location,
        minorInvolved,
        overrideCategories: incomingSuggestions,
      });
      setSelectedCenterId(reranked.matches[0]?.center.id ?? 'self-directed-summary');

      const replyId = `onedoor-${Date.now()}`;
      setMessages((prev) => [
        ...prev.map((m) => (m.id === msgId ? { ...m, status: 'received' as const } : m)),
        {
          id: replyId,
          sender: 'onedoor',
          text: f.suggestedHeading,
          suggestedCategories: incomingSuggestions,
          urgencyFlagged: cls.urgencyFlagged,
          lowConfidence: cls.lowConfidenceFallbackUsed,
          nonEnglish: cls.nonEnglishWarning,
        },
      ]);
      setTimeout(scrollToThreadBottom, 60);
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, status: 'failed' } : m))
      );
    } finally {
      setIsSending(false);
    }
  };

  const toggleCategory = (catId: SupportCategoryId) => {
    setUserToggledCategories((prev) =>
      prev.includes(catId) ? prev : [...prev, catId]
    );
    setApprovedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const allUserTexts = messages
    .filter((m) => m.sender === 'user' && m.status === 'received')
    .map((m) => m.text)
    .join(' ');
  const minorMentionedInText =
    /\b(minor|child|under 18|1[0-7]\s*year|teen|daughter|son|stepdaughter|stepson|schoolgirl)\b/i.test(
      allUserTexts
    );

  const hasAnyReceivedMessage = messages.some(
    (m) => m.sender === 'user' && m.status === 'received'
  );
  const canProceedFromStep1 =
    hasAnyReceivedMessage || approvedCategories.length > 0;

  const goToStep = (next: FlowStep) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPlainTextSummary = (record: ReferralRecord): string => {
    const categories = record.approvedCategories
      .map((c) => t.categories[c]?.label ?? c)
      .join(', ');
    return [
      `${t.brandName} — ${f.step3Title}`,
      `${f.savedCodeLabel} ${record.referenceCode}`,
      `${new Date(record.createdAt).toLocaleString(lang)}`,
      `${t.intake.selectedServiceLabel} ${record.targetCenterName}`,
      `${t.intake.previewNeeds} ${categories || t.intake.noneSelected}`,
      `${t.intake.previewLocation} ${record.approvedLocation ?? t.intake.notProvided}`,
      `${t.intake.previewUrgency} ${
        record.urgencyFlagged ? f.urgentTitle : t.intake.notFlaggedLabel
      }`,
      `${t.intake.minorTitle}: ${record.minorSafeguardingNoted ? 'Yes (<18)' : 'No'}`,
      '',
      record.approvedSummary,
      '',
      t.disclaimerExact,
    ].join('\n');
  };

  const handleCopySummary = async (record: ReferralRecord) => {
    try {
      await navigator.clipboard.writeText(formatPlainTextSummary(record));
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      setReferralError(t.intake.networkError);
    }
  };

  const handleDownloadSummary = (record: ReferralRecord) => {
    const blob = new Blob([formatPlainTextSummary(record)], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${record.referenceCode.toLowerCase()}-summary.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSubmitReferral = async () => {
    setReferralError(null);
    setWithdrawnNotice(null);

    const targetCenterId = selectedMatch?.center.id ?? 'self-directed-summary';
    const targetCenterName =
      selectedMatch?.center.name ?? t.intake.selfDirectedLabel;

    const built = buildConsentedReferralPayload({
      consentApproved,
      approvedSummary: draftSummary,
      approvedCategories,
      includeLocation,
      locationLabel: location?.label ?? null,
      includeUrgencyFlag,
      urgencyFlagged: Boolean(classification?.urgencyFlagged),
      minorSafeguardingNoted: minorInvolved,
      targetCenterId,
      targetCenterName,
      matchingExplanation: selectedMatch?.matchReasons ?? [],
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
        setReferralError(data.error ?? t.intake.networkError);
        return;
      }
      setSubmittedReferral(data.referral);
    } catch {
      setReferralError(t.intake.networkError);
    } finally {
      setIsSubmittingReferral(false);
    }
  };

  const handleWithdrawReferral = async (referenceCode: string, fromLookup = false) => {
    setReferralError(null);
    setLookupError(null);
    try {
      const resp = await fetch(
        `/api/referrals/${encodeURIComponent(referenceCode)}`,
        { method: 'DELETE' }
      );
      const data = await resp.json();
      if (!resp.ok) {
        const msg = data.error ?? t.intake.networkError;
        if (fromLookup) setLookupError(msg);
        else setReferralError(msg);
        return;
      }

      if (submittedReferral?.referenceCode === referenceCode) {
        setSubmittedReferral(null);
        setConsentApproved(false);
      }
      if (lookupRecord?.referenceCode === referenceCode) {
        setLookupRecord(null);
        setLookupCode('');
      }
      setWithdrawnNotice(
        t.intake.withdrawnConfirmation.replace('{code}', referenceCode)
      );
    } catch {
      const msg = t.intake.networkError;
      if (fromLookup) setLookupError(msg);
      else setReferralError(msg);
    }
  };

  const handleLookupReferral = async () => {
    const cleanCode = lookupCode.trim().toUpperCase();
    if (!cleanCode) {
      setLookupError(t.intake.lookupEmptyError);
      return;
    }
    setLookupLoading(true);
    setLookupError(null);
    setLookupRecord(null);
    try {
      const resp = await fetch(`/api/referrals/${encodeURIComponent(cleanCode)}`);
      const data = await resp.json();
      if (!resp.ok) {
        setLookupError(data.error ?? t.intake.lookupEmptyError);
        return;
      }
      setLookupRecord(data.referral);
    } catch {
      setLookupError(t.intake.networkError);
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      {/* Clean 3-Step Guided Progress Bar */}
      <nav aria-label="Support steps" className="grid grid-cols-3 gap-2">
        {(
          [
            { id: 1 as FlowStep, label: f.step1Label, enabled: true },
            { id: 2 as FlowStep, label: f.step2Label, enabled: canProceedFromStep1 },
            { id: 3 as FlowStep, label: f.step3Label, enabled: canProceedFromStep1 },
          ] as const
        ).map((item) => {
          const active = step === item.id;
          const completed = step > item.id && canProceedFromStep1;
          return (
            <button
              key={item.id}
              type="button"
              data-testid={`stepper-step-${item.id}`}
              disabled={!item.enabled}
              onClick={() => item.enabled && goToStep(item.id)}
              aria-current={active ? 'step' : undefined}
              className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border text-center transition-colors min-h-[44px] disabled:opacity-45 disabled:cursor-not-allowed ${
                active
                  ? 'bg-[#0F3D3E] text-[#FAF6EF] border-[#0F3D3E]'
                  : completed
                    ? 'bg-[#DCE8E3]/80 text-[#0F3D3E] border-[#0F3D3E]/25 hover:bg-[#DCE8E3]'
                    : 'bg-white/75 text-[#14202B]/75 border-[#0F3D3E]/15 hover:bg-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {withdrawnNotice && (
        <div
          role="status"
          data-testid="withdrawn-notice"
          className="rounded-xl bg-[#DCE8E3]/80 border border-[#0F3D3E]/25 p-4 text-sm text-[#0F3D3E] font-medium"
        >
          {withdrawnNotice}
        </div>
      )}

      {/* =====================================================================
          STEP 1: SHARE WHAT YOU NEED (CONVERSATION + SIMPLE SUPPORT OPTIONS)
         ===================================================================== */}
      {step === 1 && (
        <section className="space-y-6" data-testid="flow-step-1">
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F3D3E] [text-wrap:balance]">
              {f.step1Title}
            </h1>
            <p className="text-sm sm:text-base text-[#14202B]/80 leading-relaxed">
              {f.step1Subtitle}
            </p>
          </div>

          {/* Conversation Thread Card */}
          <div className="rounded-2xl bg-white border border-[#0F3D3E]/15 shadow-xs overflow-hidden">
            {/* Message History */}
            <div
              ref={threadContainerRef}
              data-testid="conversation-thread"
              aria-live="polite"
              className="p-4 sm:p-5 space-y-3.5 max-h-[320px] overflow-y-auto bg-[#FAF6EF]/45"
            >
              {messages.map((msg) => {
                if (msg.sender === 'user') {
                  return (
                    <div
                      key={msg.id}
                      data-testid="conv-msg-user"
                      data-status={msg.status}
                      className="flex justify-end"
                    >
                      <div className="max-w-[88%] sm:max-w-[78%] rounded-2xl rounded-ee-sm bg-[#0F3D3E] text-[#FAF6EF] px-4 py-3 space-y-2 shadow-xs">
                        <div className="flex items-center justify-between gap-4 text-[11px] text-[#DCE8E3]">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-[#FAF6EF]">
                            <User className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{f.youLabel}</span>
                          </span>
                          <span
                            data-testid="user-message-status"
                            className="inline-flex items-center gap-1"
                          >
                            {msg.status === 'sending' && (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                                <span>{f.statusSending}</span>
                              </>
                            )}
                            {msg.status === 'received' && (
                              <>
                                <Check className="w-3 h-3 text-[#E9A23B]" aria-hidden="true" />
                                <span>{f.statusReceived}</span>
                              </>
                            )}
                            {msg.status === 'failed' && (
                              <>
                                <AlertCircle className="w-3 h-3 text-[#FDE68A]" aria-hidden="true" />
                                <span className="text-[#FDE68A] font-medium">{f.statusFailed}</span>
                              </>
                            )}
                          </span>
                        </div>

                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                        {msg.status === 'failed' && (
                          <div className="pt-1 flex justify-end">
                            <button
                              type="button"
                              data-testid="retry-message-btn"
                              onClick={() =>
                                sendMessageText(msg.text, { retryMessageId: msg.id })
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E9A23B] text-[#14202B] text-xs font-bold hover:bg-[#D89029]"
                            >
                              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{f.retryButton}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // OneDoor reply bubble
                return (
                  <div
                    key={msg.id}
                    data-testid="conv-msg-onedoor"
                    className="flex justify-start"
                  >
                    <div className="max-w-[92%] sm:max-w-[84%] rounded-2xl rounded-es-sm bg-white border border-[#0F3D3E]/15 px-4 py-3.5 space-y-2.5 shadow-xs">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#0F3D3E]">
                        <DoorwayLogoMark className="w-4 h-4 shrink-0" />
                        <span>{f.oneDoorLabel}</span>
                      </div>

                      <p className="text-sm text-[#14202B] leading-relaxed">{msg.text}</p>

                      {msg.isWelcome && (
                        <p className="text-xs text-[#14202B]/70 leading-relaxed">
                          {f.examplesHint}
                        </p>
                      )}

                      {msg.suggestedCategories && msg.suggestedCategories.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5 pt-0.5">
                          {msg.suggestedCategories.map((catId) => (
                            <li
                              key={catId}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#DCE8E3]/70 text-xs font-medium text-[#0F3D3E]"
                            >
                              <CategoryOutlinedIcon category={catId} className="w-3.5 h-3.5" />
                              <span>{t.categories[catId].label}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {msg.nonEnglish && (
                        <p className="text-xs text-[#14202B]/75 leading-relaxed">
                          {f.nonEnglishPlain}
                        </p>
                      )}
                      {!msg.nonEnglish && msg.lowConfidence && (
                        <p className="text-xs text-[#14202B]/75 leading-relaxed">
                          {f.lowConfidencePlain}
                        </p>
                      )}

                      {msg.urgencyFlagged && (
                        <div className="rounded-xl bg-[#FEF3C7]/75 border border-[#E9A23B]/50 p-3 space-y-1 text-xs text-[#14202B]">
                          <p className="font-semibold text-[#92400E]">{f.urgentTitle}</p>
                          <p className="leading-relaxed">{f.urgentBody}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Subtle live loading bubble while waiting for OneDoor response */}
              {isSending && (
                <div
                  data-testid="conv-processing-bubble"
                  className="flex justify-start"
                >
                  <div className="rounded-2xl rounded-es-sm bg-white border border-[#0F3D3E]/15 px-4 py-3 flex items-center gap-2.5 text-xs text-[#0F3D3E]">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                    <span>{f.processingText}</span>
                  </div>
                </div>
              )}

            </div>

            {/* Composer & Optional Voice Input */}
            <div className="border-t border-[#0F3D3E]/12 p-4 sm:p-5 bg-white space-y-3.5">
              {voiceOpen && (
                <VoiceAssistantPanel
                  lang={lang}
                  transcript={voiceDraft}
                  onChangeTranscript={setVoiceDraft}
                  onUseTranscript={(spokenText) =>
                    sendMessageText(spokenText, { fromVoice: true })
                  }
                  disabled={isSending}
                />
              )}

              <div className="space-y-2">
                <label
                  htmlFor="situation-description"
                  className="block text-xs font-semibold text-[#0F3D3E]"
                >
                  {f.composerLabel}
                </label>
                <textarea
                  id="situation-description"
                  data-testid="intake-description-input"
                  rows={2}
                  value={composerText}
                  onChange={(e) => {
                    setComposerText(e.target.value);
                    if (composerError) setComposerError(null);
                  }}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      sendMessageText(composerText);
                    }
                  }}
                  placeholder={
                    hasAnyReceivedMessage
                      ? f.followUpPlaceholder
                      : f.composerPlaceholder
                  }
                  className="w-full rounded-xl border border-[#0F3D3E]/25 bg-[#FAF6EF]/55 p-3.5 text-sm sm:text-base text-[#14202B] leading-relaxed focus:outline-2 focus:outline-[#0F3D3E]"
                />
              </div>

              {composerError && (
                <p role="alert" className="text-xs text-[#B91C1C]">
                  {composerError}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  data-testid="toggle-voice-button"
                  onClick={() => setVoiceOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#0F3D3E]/25 bg-[#FAF6EF] text-xs sm:text-sm font-semibold text-[#0F3D3E] hover:bg-[#DCE8E3]/60 min-h-[44px]"
                >
                  <Mic className="w-4 h-4" aria-hidden="true" />
                  <span>{voiceOpen ? f.voiceButtonClose : f.voiceButtonOpen}</span>
                </button>

                <button
                  type="button"
                  data-testid="intake-submit-button"
                  onClick={() => sendMessageText(composerText)}
                  disabled={isSending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E9A23B] text-[#14202B] font-bold text-sm hover:bg-[#D89029] disabled:opacity-60 transition-colors min-h-[44px]"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>{isSending ? f.sendingButton : f.sendButton}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simple Editable Support Options (Shown after response, or easy manual selection) */}
          {(hasAnyReceivedMessage || approvedCategories.length > 0) && (
            <div
              data-testid="support-options-panel"
              className="rounded-2xl bg-white border border-[#0F3D3E]/15 p-5 sm:p-6 space-y-4"
            >
              <div className="space-y-1">
                <h2 className="font-display text-lg font-bold text-[#0F3D3E]">
                  {f.suggestedHeading}
                </h2>
                <p className="text-xs text-[#14202B]/75">{f.toggleHint}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUPPORT_CATEGORY_IDS.map((catId) => {
                  const isSelected = approvedCategories.includes(catId);
                  const isSuggested = suggestedCategories.includes(catId);
                  const isUserConfirmed =
                    isSelected &&
                    (userToggledCategories.includes(catId) || !isSuggested);
                  const info = t.categories[catId];

                  return (
                    <button
                      key={catId}
                      type="button"
                      data-testid={`category-option-${catId}`}
                      aria-pressed={isSelected}
                      onClick={() => toggleCategory(catId)}
                      className={`text-start p-3.5 rounded-xl border transition-colors flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#DCE8E3]/40 border-[#0F3D3E]'
                          : 'bg-[#FAF6EF]/50 border-[#0F3D3E]/15 hover:bg-white'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#0F3D3E] border-[#0F3D3E] text-[#FAF6EF]'
                            : 'bg-white border-[#0F3D3E]/30'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </span>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F3D3E]">
                            <CategoryOutlinedIcon
                              category={catId}
                              className="w-4 h-4 shrink-0"
                            />
                            <span>{info.label}</span>
                          </span>
                          {isSelected && (
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                                isUserConfirmed
                                  ? 'bg-[#0F3D3E] text-[#FAF6EF]'
                                  : 'bg-[#DCE8E3] text-[#0F3D3E]'
                              }`}
                            >
                              {isUserConfirmed ? f.confirmedTag : f.suggestedTag}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#14202B]/75 leading-relaxed">
                          {info.shortDesc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Simple Minor Question */}
              <div className="pt-2 border-t border-[#0F3D3E]/10 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    id="minor-involved"
                    type="checkbox"
                    checked={minorInvolved}
                    onChange={(e) => setMinorInvolved(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#0F3D3E]"
                  />
                  <span className="text-sm text-[#14202B] leading-snug">
                    {f.minorQuestion}
                  </span>
                </label>

                {(minorInvolved || minorMentionedInText) && (
                  <div className="rounded-xl bg-[#DCE8E3]/65 border border-[#0F3D3E]/20 p-3.5 flex items-start gap-2.5 text-xs text-[#14202B]">
                    <ShieldAlert
                      className="w-4 h-4 text-[#0F3D3E] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <p className="leading-relaxed">{t.intake.minorSafeguardingNote}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  data-testid="step1-continue-button"
                  onClick={() => goToStep(2)}
                  disabled={!canProceedFromStep1}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F3D3E] text-[#FAF6EF] font-semibold text-sm hover:bg-[#0A2C2D] disabled:opacity-45 min-h-[46px]"
                >
                  <span>{f.continueToLocation}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          STEP 2: OPTIONAL LOCATION & LOCAL SERVICES CHECK
         ===================================================================== */}
      {step === 2 && (
        <section className="space-y-6" data-testid="flow-step-2">
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F3D3E] [text-wrap:balance]">
              {f.step2Title}
            </h1>
            <p className="text-sm sm:text-base text-[#14202B]/80 leading-relaxed">
              {f.step2Subtitle}
            </p>
          </div>

          <LocationSelector
            lang={lang}
            location={location}
            onChangeLocation={handleLocationChange}
          />

          {/* Plain-language Local Service Status */}
          <div className="space-y-3" data-testid="matching-status-section">
            {matchingResult.verifiedServicesAvailable &&
            matchingResult.matches.length > 0 ? (
              <div className="space-y-3">
                <h2 className="font-display text-lg font-bold text-[#0F3D3E]">
                  {f.localResultsTitle}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {matchingResult.matches.slice(0, 4).map((match) => {
                    const isSelected = selectedMatch?.center.id === match.center.id;
                    return (
                      <div
                        key={match.center.id}
                        className={`rounded-2xl p-4 border flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'bg-white border-[#0F3D3E] ring-1 ring-[#0F3D3E]'
                            : 'bg-white/80 border-[#0F3D3E]/15'
                        }`}
                      >
                        <div className="space-y-2">
                          <p className="text-xs text-[#14202B]/70">
                            {match.center.city || match.center.region || match.center.countryName}{' '}
                            · {match.center.hoursLabel}
                          </p>
                          <h3 className="font-display text-base font-bold text-[#0F3D3E]">
                            {match.center.name}
                          </h3>
                          <p className="text-xs text-[#14202B]/80 leading-relaxed">
                            {match.center.description}
                          </p>
                          {match.matchReasons.length > 0 && (
                            <div className="text-xs text-[#14202B]/75 pt-1 border-t border-[#0F3D3E]/10 space-y-1">
                              <p className="font-semibold text-[#0F3D3E]">{f.whyRelevant}</p>
                              <ul className="list-disc ps-4 space-y-0.5">
                                {match.matchReasons.slice(0, 2).map((reason) => (
                                  <li key={reason}>{reason}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedCenterId(match.center.id)}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold min-h-[40px] ${
                            isSelected
                              ? 'bg-[#0F3D3E] text-[#FAF6EF]'
                              : 'bg-[#DCE8E3] text-[#0F3D3E]'
                          }`}
                        >
                          {isSelected ? t.intake.selectedPathway : t.intake.selectPathway}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                data-testid="honest-empty-directory-notice"
                className="rounded-2xl bg-[#FAF6EF] border border-[#0F3D3E]/20 p-5 flex items-start gap-3"
              >
                <Info className="w-5 h-5 text-[#0F3D3E] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1 text-sm">
                  <h2 className="font-display font-bold text-[#0F3D3E]">
                    {location
                      ? f.noVerifiedTitle.replace('{location}', location.label)
                      : f.noLocationTitle}
                  </h2>
                  <p className="text-[#14202B]/80 leading-relaxed">
                    {location ? f.noVerifiedBody : f.noLocationBody}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              data-testid="step2-back-button"
              onClick={() => goToStep(1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#0F3D3E]/25 bg-white text-sm font-semibold text-[#0F3D3E] hover:bg-[#FAF6EF] min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
              <span>{f.backButton}</span>
            </button>

            <button
              type="button"
              data-testid="step2-continue-button"
              onClick={() => goToStep(3)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E9A23B] text-[#14202B] font-bold text-sm hover:bg-[#D89029] min-h-[46px]"
            >
              <span>{location ? f.continueToSummary : f.skipLocationButton}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {/* =====================================================================
          STEP 3: REVIEW, CONSENT & SAVE PERSONAL REFERRAL SUMMARY
         ===================================================================== */}
      {step === 3 && (
        <section className="space-y-6" data-testid="flow-step-3">
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F3D3E] [text-wrap:balance]">
              {f.step3Title}
            </h1>
            <p className="text-sm sm:text-base text-[#14202B]/80 leading-relaxed">
              {f.step3Subtitle}
            </p>
          </div>

          {!submittedReferral ? (
            <div className="rounded-2xl bg-white border border-[#0F3D3E]/15 p-5 sm:p-7 space-y-6">
              {/* Section 1: Who this summary is for */}
              <div className="space-y-2 pb-5 border-b border-[#0F3D3E]/12">
                <h2 className="font-display text-base font-bold text-[#0F3D3E]">
                  {f.sectionWhoReceives}
                </h2>
                <div className="rounded-xl bg-[#FAF6EF] border border-[#0F3D3E]/12 p-3.5 text-sm text-[#14202B]">
                  {selectedMatch ? (
                    <p className="font-semibold text-[#0F3D3E]">
                      {selectedMatch.center.name}
                    </p>
                  ) : (
                    <p className="leading-relaxed">{f.selfSummaryDesc}</p>
                  )}
                </div>
              </div>

              {/* Section 2: What will be included */}
              <div className="space-y-4 pb-5 border-b border-[#0F3D3E]/12">
                <h2 className="font-display text-base font-bold text-[#0F3D3E]">
                  {f.sectionWhatIncluded}
                </h2>

                <div className="space-y-1.5">
                  <label
                    htmlFor="referral-summary-editor"
                    className="block text-xs font-semibold text-[#0F3D3E]"
                  >
                    {f.summaryFieldLabel}
                  </label>
                  <textarea
                    id="referral-summary-editor"
                    data-testid="referral-summary-editor"
                    rows={4}
                    value={draftSummary}
                    onChange={(e) => {
                      setDraftSummary(e.target.value);
                      setSummaryEditedByUser(true);
                    }}
                    className="w-full rounded-xl border border-[#0F3D3E]/25 bg-[#FAF6EF]/50 p-3.5 text-sm text-[#14202B] leading-relaxed focus:outline-2 focus:outline-[#0F3D3E]"
                  />
                </div>

                {/* Editable support needs chips */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#0F3D3E]">
                    {f.selectedNeedsLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORT_CATEGORY_IDS.map((catId) => {
                      const active = approvedCategories.includes(catId);
                      return (
                        <button
                          key={catId}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleCategory(catId)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            active
                              ? 'bg-[#0F3D3E] text-[#FAF6EF] border-[#0F3D3E]'
                              : 'bg-[#FAF6EF] text-[#14202B]/75 border-[#0F3D3E]/20 hover:bg-[#DCE8E3]/50'
                          }`}
                        >
                          {active && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                          <span>{t.categories[catId].label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clear inclusion toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#0F3D3E]/15 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeLocation && Boolean(location)}
                      onChange={(e) => setIncludeLocation(e.target.checked)}
                      disabled={!location}
                      className="mt-0.5 h-4 w-4 accent-[#0F3D3E]"
                    />
                    <span>
                      {f.includeLocationLabel}{' '}
                      <strong>{location ? location.label : t.intake.notProvided}</strong>
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
                      {f.includeUrgencyLabel}{' '}
                      <strong>
                        {classification?.urgencyFlagged
                          ? t.intake.flaggedLabel
                          : t.intake.notFlaggedLabel}
                      </strong>
                    </span>
                  </label>
                </div>

                {/* Live exact preview of what will be saved */}
                <div
                  data-testid="exact-saved-preview"
                  className="rounded-xl bg-[#DCE8E3]/45 border border-[#0F3D3E]/15 p-4 space-y-1.5 text-xs text-[#14202B]"
                >
                  <p className="font-semibold text-[#0F3D3E]">{f.whatWillBeSavedTitle}</p>
                  <p className="text-sm text-[#14202B] leading-relaxed bg-white/75 rounded-lg p-2.5 border border-[#0F3D3E]/10">
                    {draftSummary.trim() || '—'}
                  </p>
                  <p>
                    <strong>{f.selectedNeedsLabel}:</strong>{' '}
                    {approvedCategories.length > 0
                      ? approvedCategories.map((c) => t.categories[c].label).join(', ')
                      : t.intake.noneSelected}
                  </p>
                  <p>
                    <strong>{t.intake.previewLocation}</strong>{' '}
                    {includeLocation && location ? location.label : t.intake.notIncluded}
                  </p>
                  <p>
                    <strong>{t.intake.previewUrgency}</strong>{' '}
                    {includeUrgencyFlag && classification?.urgencyFlagged
                      ? f.urgentTitle
                      : t.intake.notIncluded}
                  </p>
                  <p className="text-[#0F3D3E]/85 pt-0.5">{f.rawTextNotSaved}</p>
                </div>
              </div>

              {/* Section 3: Your permission */}
              <div className="space-y-4">
                <h2 className="font-display text-base font-bold text-[#0F3D3E]">
                  {f.sectionConsent}
                </h2>
                <p className="text-xs sm:text-sm text-[#14202B]/80 leading-relaxed">
                  {f.consentNote}
                </p>

                <label className="flex items-start gap-3 p-4 rounded-xl bg-[#FAF6EF] border border-[#0F3D3E]/25 cursor-pointer">
                  <input
                    id="explicit-consent-checkbox"
                    type="checkbox"
                    checked={consentApproved}
                    onChange={(e) => setConsentApproved(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#0F3D3E]"
                  />
                  <span className="text-sm font-medium text-[#14202B] leading-snug">
                    {f.consentCheckbox}
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

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    data-testid="step3-back-button"
                    onClick={() => goToStep(2)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#0F3D3E]/25 bg-white text-sm font-semibold text-[#0F3D3E] hover:bg-[#FAF6EF] min-h-[44px]"
                  >
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                    <span>{f.backButton}</span>
                  </button>

                  <button
                    type="button"
                    data-testid="save-referral-button"
                    onClick={handleSubmitReferral}
                    disabled={isSubmittingReferral || !consentApproved}
                    className="px-6 py-3 rounded-xl bg-[#E9A23B] text-[#14202B] font-bold text-sm sm:text-base hover:bg-[#D89029] disabled:opacity-45 disabled:cursor-not-allowed transition-colors min-h-[48px]"
                  >
                    {isSubmittingReferral ? f.savingButton : f.saveButton}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              role="status"
              data-testid="referral-saved-card"
              className="rounded-2xl bg-[#DCE8E3]/70 border border-[#0F3D3E]/25 p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="w-6 h-6 text-[#0F3D3E] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-[#0F3D3E]">{f.savedTitle}</p>
                  <h2 className="font-display text-2xl font-bold text-[#0F3D3E]">
                    {f.savedCodeLabel}{' '}
                    <span
                      className="font-mono-tabular"
                      data-testid="saved-reference-code"
                    >
                      {submittedReferral.referenceCode}
                    </span>
                  </h2>
                  <p className="text-sm text-[#14202B]/85 leading-relaxed">
                    {f.savedNote}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-white/80 border border-[#0F3D3E]/15 p-4 text-sm text-[#14202B] leading-relaxed">
                {submittedReferral.approvedSummary}
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopySummary(submittedReferral)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3D3E] text-[#FAF6EF] text-sm font-semibold hover:bg-[#0A2C2D] min-h-[44px]"
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copiedCode ? f.copiedButton : f.copyButton}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSummary(submittedReferral)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#0F3D3E]/25 bg-white text-sm font-semibold text-[#0F3D3E] hover:bg-[#FAF6EF] min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  <span>{f.downloadButton}</span>
                </button>

                <button
                  type="button"
                  data-testid="delete-saved-summary-button"
                  onClick={() =>
                    handleWithdrawReferral(submittedReferral.referenceCode, false)
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#B91C1C]/35 bg-white text-sm font-semibold text-[#B91C1C] hover:bg-[#B91C1C]/8 min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{f.deleteButton}</span>
                </button>

                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-[#0F3D3E]/20 bg-white/80 text-sm font-semibold text-[#0F3D3E] hover:bg-white min-h-[44px]"
                >
                  {f.editMoreButton}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Tucked Collapsible Private Reference Code Lookup */}
      <section className="rounded-2xl bg-white/65 border border-[#0F3D3E]/12 overflow-hidden">
        <button
          type="button"
          onClick={() => setLookupOpen((prev) => !prev)}
          aria-expanded={lookupOpen}
          className="w-full px-5 py-3.5 flex items-center justify-between gap-3 text-start hover:bg-white/80 transition-colors"
        >
          <span className="text-xs sm:text-sm font-semibold text-[#0F3D3E]">
            {t.intake.lookupTitle}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#0F3D3E] transition-transform shrink-0 ${
              lookupOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {lookupOpen && (
          <div className="px-5 pb-5 pt-2 border-t border-[#0F3D3E]/10 space-y-3">
            <p className="text-xs text-[#14202B]/75">{t.intake.lookupSubtitle}</p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value)}
                placeholder={t.intake.lookupPlaceholder}
                aria-label={t.intake.lookupTitle}
                className="flex-1 min-w-[200px] rounded-xl border border-[#0F3D3E]/25 bg-[#FAF6EF] px-3.5 py-2 text-sm font-mono-tabular text-[#14202B] min-h-[42px]"
              />
              <button
                type="button"
                onClick={handleLookupReferral}
                disabled={lookupLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F3D3E] text-[#FAF6EF] text-xs font-semibold hover:bg-[#0A2C2D] min-h-[42px]"
              >
                <Search className="w-4 h-4" />
                <span>{lookupLoading ? t.intake.lookupChecking : t.intake.lookupButton}</span>
              </button>
            </div>

            {lookupError && (
              <p role="alert" className="text-xs text-[#B91C1C]">
                {lookupError}
              </p>
            )}

            {lookupRecord && (
              <div className="rounded-xl bg-[#FAF6EF] border border-[#0F3D3E]/20 p-4 space-y-3 text-sm">
                <p className="font-mono-tabular font-bold text-[#0F3D3E]">
                  {lookupRecord.referenceCode}
                </p>
                <p className="text-sm text-[#14202B] leading-relaxed">
                  {lookupRecord.approvedSummary}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadSummary(lookupRecord)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#0F3D3E]/25 bg-white text-xs font-semibold text-[#0F3D3E]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{f.downloadButton}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleWithdrawReferral(lookupRecord.referenceCode, true)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#B91C1C]/35 bg-white text-xs font-semibold text-[#B91C1C]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{f.deleteButton}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
