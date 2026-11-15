import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  RotateCcw,
  Trash2,
  User,
} from 'lucide-react';
import { DoorwayLogoMark } from './OneDoorIcons';
import {
  base64ToFloat3224k,
  downsampleFloat32ToInt16Pcm,
  int16ToBase64,
  mergeTranscriptChunk,
} from '../lib/audioPcm';
import { CALL_TRANSLATIONS, getLanguageMeta } from '../lib/i18n';
import type { LanguageCode } from '../lib/types';

export type VoiceCallStatus =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'understanding'
  | 'speaking'
  | 'reconnecting'
  | 'ended'
  | 'error';

interface VoiceCallViewProps {
  lang: LanguageCode;
  onSwitchToText: (prefillText?: string) => void;
  onCompleteToWorkflow: (userSpokenText: string) => void;
}

export function VoiceCallView({
  lang,
  onSwitchToText,
  onCompleteToWorkflow,
}: VoiceCallViewProps) {
  const c = CALL_TRANSLATIONS[lang];
  const langMeta = getLanguageMeta(lang);

  const [serverConfigured, setServerConfigured] = useState<boolean | null>(null);
  const [callStatus, setCallStatus] = useState<VoiceCallStatus>('idle');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [callSeconds, setCallSeconds] = useState(0);

  const [userSpokenText, setUserSpokenText] = useState('');
  const [aiSpokenText, setAiSpokenText] = useState('');
  const [aiOrganizedNote, setAiOrganizedNote] = useState('');
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  // Refs for real-time audio callbacks (avoids stale closures)
  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const mutedRef = useRef(false);
  const manualEndRef = useRef(false);
  const callActiveRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const levelRafRef = useRef<number | null>(null);
  const userSpokenRef = useRef('');
  const speakingIdleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    userSpokenRef.current = userSpokenText;
  }, [userSpokenText]);

  useEffect(() => {
    mutedRef.current = isMuted;
  }, [isMuted]);

  // Check server configuration on mount without touching microphone
  useEffect(() => {
    let active = true;
    fetch('/api/live-call/status')
      .then((r) => r.json())
      .then((data: { configured?: boolean }) => {
        if (active) {
          setServerConfigured(Boolean(data.configured));
        }
      })
      .catch(() => {
        if (active) setServerConfigured(null);
      });
    return () => {
      active = false;
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    const isRunning =
      callStatus === 'connecting' ||
      callStatus === 'listening' ||
      callStatus === 'understanding' ||
      callStatus === 'speaking' ||
      callStatus === 'reconnecting';
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [callStatus]);

  const stopQueuedOutputAudio = () => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
      } catch {
        // Already stopped
      }
    }
    activeSourcesRef.current.clear();
    if (outputCtxRef.current) {
      nextStartTimeRef.current = outputCtxRef.current.currentTime;
    } else {
      nextStartTimeRef.current = 0;
    }
  };

  const cleanupAudioAndSocket = (sendEndSignal = false) => {
    callActiveRef.current = false;

    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (speakingIdleTimerRef.current) {
      window.clearTimeout(speakingIdleTimerRef.current);
      speakingIdleTimerRef.current = null;
    }
    if (levelRafRef.current) {
      cancelAnimationFrame(levelRafRef.current);
      levelRafRef.current = null;
    }

    stopQueuedOutputAudio();

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {
        // Ignore
      }
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {
        // Ignore
      }
      sourceNodeRef.current = null;
    }
    if (micStreamRef.current) {
      for (const track of micStreamRef.current.getTracks()) {
        track.stop();
      }
      micStreamRef.current = null;
    }
    if (inputCtxRef.current) {
      inputCtxRef.current.close().catch(() => {});
      inputCtxRef.current = null;
    }
    if (outputCtxRef.current) {
      outputCtxRef.current.close().catch(() => {});
      outputCtxRef.current = null;
    }

    if (wsRef.current) {
      const ws = wsRef.current;
      wsRef.current = null;
      try {
        if (sendEndSignal && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'end_call' }));
        }
        ws.close();
      } catch {
        // Ignore
      }
    }

    setMicLevel(0);
  };

  useEffect(() => {
    return () => {
      manualEndRef.current = true;
      cleanupAudioAndSocket(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleAudioChunk24k = (base64Pcm: string) => {
    const ctx = outputCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const float32 = base64ToFloat3224k(base64Pcm);
    if (float32.length === 0) return;

    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);

    const now = ctx.currentTime;
    const startAt = Math.max(now, nextStartTimeRef.current);
    src.start(startAt);
    nextStartTimeRef.current = startAt + buffer.duration;

    activeSourcesRef.current.add(src);
    setCallStatus('speaking');

    src.onended = () => {
      activeSourcesRef.current.delete(src);
      if (activeSourcesRef.current.size === 0 && callActiveRef.current) {
        if (speakingIdleTimerRef.current) {
          window.clearTimeout(speakingIdleTimerRef.current);
        }
        speakingIdleTimerRef.current = window.setTimeout(() => {
          if (callActiveRef.current && activeSourcesRef.current.size === 0) {
            setCallStatus('listening');
          }
        }, 180);
      }
    };
  };

  const organizePostCallNotes = async (spoken: string) => {
    const clean = spoken.trim();
    if (clean.length < 3) return;
    setIsOrganizing(true);
    try {
      const resp = await fetch('/api/live-call/organize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userTranscriptText: clean,
          languageName: langMeta.englishName,
        }),
      });
      if (resp.ok) {
        const data = (await resp.json()) as { aiOrganizedNote?: string };
        if (data.aiOrganizedNote) {
          setAiOrganizedNote(data.aiOrganizedNote);
        }
      }
    } catch {
      // Optional call-note refinement; user spoken text remains preserved
    } finally {
      setIsOrganizing(false);
    }
  };

  const openLiveWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/live-call?lang=${encodeURIComponent(lang)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as {
          type?: string;
          data?: string;
          text?: string;
          code?: string;
          message?: string;
        };

        if (msg.type === 'ready') {
          reconnectAttemptsRef.current = 0;
          setErrorBanner(null);
          setCallStatus('listening');
        } else if (msg.type === 'input_transcript' && msg.text) {
          setUserSpokenText((prev) => mergeTranscriptChunk(prev, msg.text!));
          if (activeSourcesRef.current.size === 0) {
            setCallStatus('understanding');
          }
        } else if (msg.type === 'output_transcript' && msg.text) {
          setAiSpokenText((prev) => mergeTranscriptChunk(prev, msg.text!));
        } else if (msg.type === 'audio' && msg.data) {
          scheduleAudioChunk24k(msg.data);
        } else if (msg.type === 'interrupted') {
          stopQueuedOutputAudio();
          setCallStatus('listening');
        } else if (msg.type === 'turn_complete') {
          if (activeSourcesRef.current.size === 0 && callActiveRef.current) {
            setCallStatus('listening');
          }
        } else if (msg.type === 'error') {
          if (msg.code === 'missing_api_key' || msg.code === 'invalid_api_key') {
            manualEndRef.current = true;
            setServerConfigured(false);
            setErrorBanner(c.errMissingKey);
            setCallStatus('error');
            cleanupAudioAndSocket(false);
          } else {
            setErrorBanner(msg.message || c.errConnectionLost);
          }
        } else if (msg.type === 'session_closed') {
          if (!manualEndRef.current) {
            setCallStatus('ended');
            cleanupAudioAndSocket(false);
            organizePostCallNotes(userSpokenRef.current);
          }
        }
      } catch {
        // Ignore malformed server message
      }
    };

    ws.onclose = () => {
      if (manualEndRef.current || !callActiveRef.current) {
        return;
      }

      if (reconnectAttemptsRef.current < 2) {
        reconnectAttemptsRef.current += 1;
        setCallStatus('reconnecting');
        const delay = reconnectAttemptsRef.current * 1300;
        reconnectTimerRef.current = window.setTimeout(() => {
          if (!manualEndRef.current && callActiveRef.current) {
            openLiveWebSocket();
          }
        }, delay);
      } else {
        setErrorBanner(c.errConnectionLost);
        setCallStatus('error');
        cleanupAudioAndSocket(false);
      }
    };
  };

  const startCall = async () => {
    setErrorBanner(null);
    setClearedNotice(false);

    if (serverConfigured === false) {
      setErrorBanner(c.errMissingKey);
      setCallStatus('error');
      return;
    }

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setErrorBanner(c.errMicUnavailable);
      setCallStatus('error');
      return;
    }

    manualEndRef.current = false;
    reconnectAttemptsRef.current = 0;
    setCallSeconds(0);
    setIsMuted(false);
    mutedRef.current = false;
    setCallStatus('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const source = inputCtx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(inputCtx.destination);

      const freqData = new Uint8Array(analyser.frequencyBinCount);
      const updateMicMeter = () => {
        if (!callActiveRef.current) return;
        if (mutedRef.current) {
          setMicLevel(0);
        } else {
          analyser.getByteFrequencyData(freqData);
          let sum = 0;
          for (let i = 0; i < freqData.length; i++) sum += freqData[i];
          const avg = sum / Math.max(1, freqData.length);
          setMicLevel(Math.min(100, Math.round((avg / 90) * 100)));
        }
        levelRafRef.current = requestAnimationFrame(updateMicMeter);
      };

      processor.onaudioprocess = (ev) => {
        if (!callActiveRef.current || mutedRef.current) return;
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        const raw = ev.inputBuffer.getChannelData(0);
        const pcm16 = downsampleFloat32ToInt16Pcm(raw, inputCtx.sampleRate, 16000);
        if (pcm16.length === 0) return;

        ws.send(
          JSON.stringify({
            type: 'audio',
            data: int16ToBase64(pcm16),
          })
        );
      };

      callActiveRef.current = true;
      levelRafRef.current = requestAnimationFrame(updateMicMeter);
      openLiveWebSocket();
    } catch (err) {
      cleanupAudioAndSocket(false);
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setErrorBanner(c.errMicDenied);
      } else {
        setErrorBanner(c.errMicUnavailable);
      }
      setCallStatus('error');
    }
  };

  const handleEndCall = () => {
    manualEndRef.current = true;
    cleanupAudioAndSocket(true);
    setCallStatus('ended');
    if (userSpokenRef.current.trim().length >= 3) {
      organizePostCallNotes(userSpokenRef.current);
    }
  };

  const handleSwitchToText = () => {
    manualEndRef.current = true;
    cleanupAudioAndSocket(true);
    onSwitchToText(userSpokenRef.current.trim() || undefined);
  };

  const handleClearCallData = () => {
    setUserSpokenText('');
    userSpokenRef.current = '';
    setAiSpokenText('');
    setAiOrganizedNote('');
    setClearedNotice(true);
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const statusLabel =
    callStatus === 'connecting'
      ? c.statusConnecting
      : callStatus === 'listening'
        ? c.statusListening
        : callStatus === 'understanding'
          ? c.statusUnderstanding
          : callStatus === 'speaking'
            ? c.statusSpeaking
            : callStatus === 'reconnecting'
              ? c.statusReconnecting
              : callStatus === 'ended'
                ? c.statusEnded
                : callStatus === 'error'
                  ? c.statusUnavailable
                  : c.statusIdle;

  const isCallInProgress =
    callStatus === 'connecting' ||
    callStatus === 'listening' ||
    callStatus === 'understanding' ||
    callStatus === 'speaking' ||
    callStatus === 'reconnecting';

  return (
    <div
      data-testid="voice-call-view"
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6"
    >
      {/* Clear AI Disclosure Banner */}
      <div
        data-testid="ai-assistant-disclosure"
        className="rounded-2xl bg-[#DCE8E3]/70 border border-[#0F3D3E]/20 p-4 flex items-start gap-3"
      >
        <Bot className="w-5 h-5 text-[#0F3D3E] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1 text-xs sm:text-sm text-[#14202B]">
          <p className="font-semibold text-[#0F3D3E]">{c.aiNoticeTitle}</p>
          <p className="leading-relaxed text-[#14202B]/85">{c.aiNoticeBody}</p>
        </div>
      </div>

      {/* Main Dedicated Phone Call Card */}
      <section className="rounded-3xl bg-[#0F3D3E] text-[#FAF6EF] p-6 sm:p-8 shadow-sm border border-[#0F3D3E] space-y-6">
        {/* Call Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#FAF6EF]/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF6EF]/12 flex items-center justify-center shrink-0">
              <DoorwayLogoMark className="w-5 h-5 text-[#E9A23B]" />
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-[#FAF6EF]">
                {c.callPageTitle}
              </h1>
              <p className="text-xs text-[#DCE8E3]" data-testid="call-status-label" role="status">
                {statusLabel}
                {isCallInProgress ? ` · ${formatDuration(callSeconds)}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="switch-to-text-btn"
            onClick={handleSwitchToText}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#FAF6EF]/25 bg-[#FAF6EF]/10 hover:bg-[#FAF6EF]/18 text-xs sm:text-sm font-semibold text-[#FAF6EF] min-h-[40px]"
          >
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            <span>{c.switchToTextBtn}</span>
          </button>
        </div>

        {/* Missing Key / Connection Error Notice */}
        {(errorBanner || serverConfigured === false) && (
          <div
            role="alert"
            data-testid="voice-call-error-banner"
            className="rounded-2xl bg-[#FEF3C7] text-[#14202B] border border-[#E9A23B] p-4 flex items-start gap-3 text-sm"
          >
            <AlertCircle className="w-5 h-5 text-[#92400E] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">{errorBanner || c.errMissingKey}</p>
          </div>
        )}

        {/* PRE-CALL STATE */}
        {(callStatus === 'idle' || callStatus === 'error') && (
          <div className="space-y-6 py-2">
            <p className="text-sm sm:text-base text-[#FAF6EF]/90 leading-relaxed">
              {c.callPageSubtitle}
            </p>

            <div className="rounded-2xl bg-[#0A2C2D]/70 border border-[#FAF6EF]/12 p-4 space-y-2 text-xs sm:text-sm text-[#DCE8E3]">
              <p>{c.micExplanation}</p>
              <p className="text-[#FAF6EF]/75">{c.privacyNote}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                data-testid="start-voice-call-btn"
                onClick={startCall}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#E9A23B] text-[#14202B] font-bold text-sm sm:text-base hover:bg-[#D89029] transition-colors min-h-[48px]"
              >
                <PhoneCall className="w-5 h-5" aria-hidden="true" />
                <span>{c.startCallBtn}</span>
              </button>

              {userSpokenText.trim().length >= 3 && (
                <button
                  type="button"
                  onClick={() => onCompleteToWorkflow(userSpokenText)}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#FAF6EF] text-[#0F3D3E] font-semibold text-sm hover:bg-[#DCE8E3] min-h-[48px]"
                >
                  <span>{c.useInFlowBtn}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ACTIVE CALL STATE */}
        {isCallInProgress && (
          <div className="space-y-6" data-testid="active-call-panel">
            {/* Visual Audio & Status Orb */}
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div
                className={`relative w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all ${
                  callStatus === 'speaking'
                    ? 'bg-[#E9A23B]/20 border-[#E9A23B] scale-105'
                    : callStatus === 'listening'
                      ? 'bg-[#FAF6EF]/12 border-[#DCE8E3]'
                      : 'bg-[#FAF6EF]/8 border-[#FAF6EF]/30'
                }`}
              >
                {callStatus === 'connecting' || callStatus === 'reconnecting' ? (
                  <Loader2 className="w-9 h-9 text-[#E9A23B] animate-spin" aria-hidden="true" />
                ) : isMuted ? (
                  <MicOff className="w-9 h-9 text-[#FDE68A]" aria-hidden="true" />
                ) : (
                  <Mic className="w-9 h-9 text-[#E9A23B]" aria-hidden="true" />
                )}
              </div>

              {/* Live Mic Indicator Bar */}
              <div className="w-full max-w-xs space-y-1.5 text-center">
                <div className="w-full h-2 rounded-full bg-[#FAF6EF]/15 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-75 ${
                      isMuted ? 'bg-[#FDE68A]/40' : 'bg-[#E9A23B]'
                    }`}
                    style={{
                      width: `${isMuted ? 0 : Math.max(8, micLevel)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-[#DCE8E3]" data-testid="mic-status-indicator">
                  {isMuted ? c.micMutedLabel : c.micOnLabel}
                </p>
              </div>
            </div>

            {/* Live Distinct Transcripts (What You Said vs AI Assistant) */}
            <div className="rounded-2xl bg-[#0A2C2D]/75 border border-[#FAF6EF]/12 p-4 space-y-3 max-h-52 overflow-y-auto text-xs sm:text-sm">
              {!userSpokenText && !aiSpokenText ? (
                <p className="text-[#DCE8E3]/75 text-center py-2">
                  {c.liveTranscriptEmpty}
                </p>
              ) : (
                <>
                  {userSpokenText && (
                    <div className="space-y-1">
                      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#E9A23B]">
                        <User className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{c.youSpokeLabel}</span>
                      </p>
                      <p className="text-[#FAF6EF] leading-relaxed">{userSpokenText}</p>
                    </div>
                  )}
                  {aiSpokenText && (
                    <div className="space-y-1 pt-2 border-t border-[#FAF6EF]/12">
                      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#DCE8E3]">
                        <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{c.aiAssistantLabel}</span>
                      </p>
                      <p className="text-[#FAF6EF]/90 leading-relaxed">{aiSpokenText}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Phone Call Controls */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                type="button"
                data-testid="call-mute-btn"
                aria-pressed={isMuted}
                onClick={() => setIsMuted((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border transition-colors min-h-[48px] ${
                  isMuted
                    ? 'bg-[#FAF6EF] text-[#0F3D3E] border-[#FAF6EF]'
                    : 'bg-[#FAF6EF]/12 text-[#FAF6EF] border-[#FAF6EF]/25 hover:bg-[#FAF6EF]/20'
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Mic className="w-4 h-4" aria-hidden="true" />
                )}
                <span>{isMuted ? c.unmuteBtn : c.muteBtn}</span>
              </button>

              <button
                type="button"
                data-testid="end-call-btn"
                onClick={handleEndCall}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#B91C1C] text-white text-sm font-bold hover:bg-[#991B1B] transition-colors min-h-[48px]"
              >
                <PhoneOff className="w-4 h-4" aria-hidden="true" />
                <span>{c.endCallBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* POST-CALL REVIEW & HANDOFF TO ONEDOOR WORKFLOW */}
        {callStatus === 'ended' && (
          <div className="space-y-5" data-testid="post-call-review">
            <div className="space-y-1">
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#FAF6EF]">
                {c.postCallTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#DCE8E3] leading-relaxed">
                {c.postCallSubtitle}
              </p>
            </div>

            {clearedNotice && (
              <div
                role="status"
                className="rounded-xl bg-[#FAF6EF]/12 border border-[#FAF6EF]/25 px-3.5 py-2.5 text-xs text-[#FAF6EF]"
              >
                {c.clearedNotice}
              </div>
            )}

            {/* 1. What User Actually Said (Editable) */}
            <div className="rounded-2xl bg-[#FAF6EF] text-[#14202B] p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="call-user-transcript"
                  className="text-xs sm:text-sm font-bold text-[#0F3D3E]"
                >
                  {c.whatYouSaidTitle}
                </label>
              </div>
              <p className="text-xs text-[#14202B]/70">{c.whatYouSaidHint}</p>
              <textarea
                id="call-user-transcript"
                data-testid="call-user-transcript-editor"
                rows={4}
                value={userSpokenText}
                onChange={(e) => setUserSpokenText(e.target.value)}
                className="w-full rounded-xl border border-[#0F3D3E]/25 bg-white p-3 text-sm text-[#14202B] leading-relaxed focus:outline-2 focus:outline-[#0F3D3E]"
              />
            </div>

            {/* 2. Separate AI-Organized Notes (Never replaces user words) */}
            {(isOrganizing || aiOrganizedNote) && (
              <div
                data-testid="call-ai-summary-card"
                className="rounded-2xl bg-[#0A2C2D]/80 border border-[#FAF6EF]/15 p-4 space-y-1.5 text-xs sm:text-sm"
              >
                <p className="font-semibold text-[#E9A23B]">{c.aiNotesTitle}</p>
                <p className="text-[11px] text-[#DCE8E3]/80">{c.aiNotesHint}</p>
                <p className="text-[#FAF6EF] leading-relaxed pt-1">
                  {isOrganizing ? c.organizingNotes : aiOrganizedNote}
                </p>
              </div>
            )}

            {/* Post-Call Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  data-testid="start-new-call-btn"
                  onClick={startCall}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#FAF6EF]/25 bg-[#FAF6EF]/10 hover:bg-[#FAF6EF]/18 text-xs sm:text-sm font-semibold text-[#FAF6EF] min-h-[44px]"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>{c.startNewCallBtn}</span>
                </button>

                <button
                  type="button"
                  data-testid="clear-call-data-btn"
                  onClick={handleClearCallData}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#FAF6EF]/20 text-xs sm:text-sm font-medium text-[#DCE8E3] hover:bg-[#FAF6EF]/10 min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  <span>{c.clearCallDataBtn}</span>
                </button>
              </div>

              <button
                type="button"
                data-testid="apply-call-to-flow-btn"
                disabled={userSpokenText.trim().length < 3}
                onClick={() => onCompleteToWorkflow(userSpokenText.trim())}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E9A23B] text-[#14202B] font-bold text-sm hover:bg-[#D89029] disabled:opacity-45 min-h-[46px]"
              >
                <span>{c.useInFlowBtn}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
