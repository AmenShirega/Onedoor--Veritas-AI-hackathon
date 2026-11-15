import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';
import { PhoneOutlinedIcon } from './OneDoorIcons';
import { FLOW_TRANSLATIONS, getLanguageMeta, TRANSLATIONS } from '../lib/i18n';
import type { LanguageCode } from '../lib/types';

interface VoiceAssistantPanelProps {
  lang: LanguageCode;
  transcript: string;
  onChangeTranscript: (next: string) => void;
  onUseTranscript: (text: string) => void;
  disabled?: boolean;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function VoiceAssistantPanel({
  lang,
  transcript,
  onChangeTranscript,
  onUseTranscript,
  disabled = false,
}: VoiceAssistantPanelProps) {
  const t = TRANSLATIONS[lang];
  const f = FLOW_TRANSLATIONS[lang];
  const speechLang = getLanguageMeta(lang).speechLang;

  const [listening, setListening] = useState(false);
  const [ttsMuted, setTtsMuted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [statusKind, setStatusKind] = useState<
    'ready' | 'unsupported' | 'stopped' | 'listening' | 'error'
  >('ready');
  const [micErrorCode, setMicErrorCode] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const supported = Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
    setSpeechSupported(supported);
    if (!supported) {
      setStatusKind('unsupported');
    }
    return () => {
      recognitionRef.current?.stop();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const hasCapturedWords = transcript.trim().length > 0;

  const statusText =
    statusKind === 'unsupported'
      ? t.voice.unsupportedStatus
      : statusKind === 'stopped'
        ? t.voice.stoppedStatus
        : statusKind === 'listening'
          ? t.voice.listeningStatus
          : statusKind === 'error'
            ? t.voice.micErrorPrefix.replace('{error}', micErrorCode || 'unavailable')
            : t.voice.readyStatus;

  const speakCalmly = (text: string) => {
    if (ttsMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.95;
      utter.pitch = 1.0;
      utter.lang = speechLang;
      window.speechSynthesis.speak(utter);
    } catch {
      // Speech synthesis may be unavailable or blocked
    }
  };

  const toggleMicrophone = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setStatusKind('stopped');
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!Ctor) {
      setStatusKind('unsupported');
      return;
    }

    try {
      const rec = new Ctor();
      rec.lang = speechLang;
      rec.continuous = true;
      rec.interimResults = true;
      const baseText = transcript.trim();

      rec.onresult = (event) => {
        let collected = '';
        for (let i = 0; i < event.results.length; i++) {
          collected += event.results[i][0].transcript + ' ';
        }
        const combined = baseText ? `${baseText} ${collected.trim()}` : collected.trim();
        onChangeTranscript(combined);
      };

      rec.onerror = (ev) => {
        setListening(false);
        setMicErrorCode(ev.error || 'error');
        setStatusKind('error');
      };

      rec.onend = () => {
        setListening(false);
        setStatusKind((prev) => (prev === 'listening' ? 'stopped' : prev));
      };

      recognitionRef.current = rec;
      rec.start();
      setListening(true);
      setStatusKind('listening');
    } catch {
      setListening(false);
      setMicErrorCode('unavailable');
      setStatusKind('error');
    }
  };

  const handleSend = () => {
    const clean = transcript.trim();
    if (clean.length < 3 || disabled) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setStatusKind('stopped');
    }
    onUseTranscript(clean);
  };

  return (
    <div
      data-testid="voice-assistant-panel"
      className="rounded-2xl bg-[#0F3D3E] text-[#FAF6EF] p-5 sm:p-6 space-y-4 border border-[#0F3D3E]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#FAF6EF]/15 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#FAF6EF]/12 flex items-center justify-center shrink-0">
            <PhoneOutlinedIcon className="w-4 h-4 text-[#E9A23B]" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#FAF6EF]">
              {t.voice.title}
            </h3>
            <p className="text-xs text-[#DCE8E3]" role="status">
              {statusText}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const next = !ttsMuted;
            setTtsMuted(next);
            if (next && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
          }}
          aria-label={ttsMuted ? t.voice.audioMuted : t.voice.audioOn}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FAF6EF]/12 hover:bg-[#FAF6EF]/20 text-xs font-medium min-h-[40px]"
        >
          {ttsMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{ttsMuted ? t.voice.audioMuted : t.voice.audioOn}</span>
        </button>
      </div>

      <p className="text-sm leading-relaxed text-[#FAF6EF]/90">{t.voice.guidancePrompt}</p>

      {/* Web Speech API controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggleMicrophone}
          disabled={!speechSupported}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${
            listening
              ? 'bg-[#B91C1C] text-white'
              : 'bg-[#FAF6EF] text-[#0F3D3E] hover:bg-[#DCE8E3]'
          }`}
        >
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{listening ? t.voice.stopMic : t.voice.startMic}</span>
        </button>

        <button
          type="button"
          onClick={() => speakCalmly(t.voice.guidancePrompt)}
          disabled={ttsMuted}
          className="px-4 py-2.5 rounded-xl border border-[#FAF6EF]/25 text-sm font-medium text-[#FAF6EF] hover:bg-[#FAF6EF]/10 disabled:opacity-45 min-h-[44px]"
        >
          {t.voice.readAloud}
        </button>
      </div>

      {/* Explicit feedback once speech or words are captured */}
      {hasCapturedWords && (
        <div
          role="status"
          data-testid="voice-captured-banner"
          className="rounded-xl bg-[#FAF6EF]/12 border border-[#E9A23B]/45 px-3.5 py-2.5 flex items-center gap-2 text-xs text-[#FAF6EF]"
        >
          <CheckCircle2 className="w-4 h-4 text-[#E9A23B] shrink-0" aria-hidden="true" />
          <span>{f.voiceCapturedBanner}</span>
        </div>
      )}

      {/* Editable captured transcript */}
      <div className="space-y-2">
        <label htmlFor="voice-transcript" className="block text-xs font-medium text-[#DCE8E3]">
          {t.voice.transcriptLabel}
        </label>
        <textarea
          id="voice-transcript"
          data-testid="voice-transcript-input"
          rows={3}
          value={transcript}
          onChange={(e) => onChangeTranscript(e.target.value)}
          placeholder={t.voice.transcriptPlaceholder}
          className="w-full rounded-xl bg-[#FAF6EF] text-[#14202B] p-3.5 text-sm leading-relaxed focus:outline-2 focus:outline-[#E9A23B]"
        />
      </div>

      <div className="pt-1 flex justify-end">
        <button
          type="button"
          data-testid="voice-send-button"
          onClick={handleSend}
          disabled={transcript.trim().length < 3 || disabled}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E9A23B] text-[#14202B] font-bold text-sm hover:bg-[#D89029] disabled:opacity-45 disabled:cursor-not-allowed min-h-[44px]"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          <span>{f.voiceSendButton}</span>
        </button>
      </div>
    </div>
  );
}
