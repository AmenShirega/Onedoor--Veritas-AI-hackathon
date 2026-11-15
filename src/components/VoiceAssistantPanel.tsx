import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { PhoneOutlinedIcon } from './OneDoorIcons';

interface VoiceAssistantPanelProps {
  transcript: string;
  onChangeTranscript: (next: string) => void;
  onUseTranscript: () => void;
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

const SAMPLE_VOICE_PROMPTS = [
  'My partner hit me last night in Bole and locked my phone. I need somewhere safe tonight.',
  'Someone touched me without my consent after a shift in Kirkos yesterday. I do not want police yet, just a clinic.',
  'Asking for my 15 year old sister in Kolfe Keranio who is unsafe at home.',
];

const GREETING_LINE =
  'Hello, you have reached the OneDoor simulated voice line. This is a prototype demonstration, not a live emergency hotline. Whenever you are ready, share only what feels comfortable.';

export function VoiceAssistantPanel({
  transcript,
  onChangeTranscript,
  onUseTranscript,
}: VoiceAssistantPanelProps) {
  const [callActive, setCallActive] = useState(false);
  const [listening, setListening] = useState(false);
  const [ttsMuted, setTtsMuted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Press Start Demo Call to begin the simulated voice-line interface.'
  );
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    setSpeechSupported(Boolean(win.SpeechRecognition || win.webkitSpeechRecognition));
    return () => {
      recognitionRef.current?.stop();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakCalmly = (text: string) => {
    if (ttsMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.95;
      utter.pitch = 1.0;
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    } catch {
      // Speech synthesis may be blocked in headless environments
    }
  };

  const startDemoCall = () => {
    setCallActive(true);
    setStatusMessage(
      'Demo voice session open. Use the microphone button or type/edit your spoken notes below.'
    );
    speakCalmly(GREETING_LINE);
  };

  const endDemoCall = () => {
    recognitionRef.current?.stop();
    setListening(false);
    setCallActive(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setStatusMessage('Demo voice session paused. Your draft remains editable below.');
  };

  const toggleMicrophone = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setStatusMessage('Microphone stopped. Review or edit your text below.');
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!Ctor) {
      setStatusMessage(
        'Browser speech-to-text is not supported in this browser. You can type or try a sample prompt below.'
      );
      return;
    }

    try {
      const rec = new Ctor();
      rec.lang = 'en-US';
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
        setStatusMessage(
          `Microphone input unavailable (${ev.error}). You can type directly or test a sample prompt below.`
        );
      };

      rec.onend = () => {
        setListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
      setListening(true);
      setStatusMessage('Listening via Web Speech API... Speak calmly at your own pace.');
    } catch {
      setListening(false);
      setStatusMessage('Could not start microphone capture. Please type or use a sample prompt.');
    }
  };

  return (
    <div className="rounded-2xl bg-[#0F3D3E] text-[#FAF6EF] p-6 space-y-5 border border-[#0F3D3E]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#FAF6EF]/15 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FAF6EF]/12 flex items-center justify-center">
            <PhoneOutlinedIcon className="w-5 h-5 text-[#E9A23B]" />
          </div>
          <div>
            <p className="text-xs text-[#E9A23B] font-semibold">
              Demo / Simulated Phone-Style Assistant
            </p>
            <h3 className="font-display text-base font-bold">
              OneDoor Voice Intake (Web Speech API)
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !ttsMuted;
              setTtsMuted(next);
              if (next && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            aria-label={ttsMuted ? 'Unmute voice guidance' : 'Mute voice guidance'}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FAF6EF]/12 hover:bg-[#FAF6EF]/20 text-xs font-medium min-h-[40px]"
          >
            {ttsMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{ttsMuted ? 'Voice Muted' : 'Voice On'}</span>
          </button>

          {!callActive ? (
            <button
              type="button"
              onClick={startDemoCall}
              className="px-4 py-2 rounded-lg bg-[#E9A23B] text-[#14202B] font-bold text-xs sm:text-sm hover:bg-[#D89029] transition-colors min-h-[40px] whitespace-nowrap"
            >
              Start Demo Call
            </button>
          ) : (
            <button
              type="button"
              onClick={endDemoCall}
              className="px-4 py-2 rounded-lg bg-[#B91C1C] text-white font-semibold text-xs sm:text-sm hover:bg-[#991B1B] transition-colors min-h-[40px] whitespace-nowrap"
            >
              End Demo Call
            </button>
          )}
        </div>
      </div>

      {/* Simulated assistant guidance prompt */}
      <div className="pt-1 space-y-2 border-b border-[#FAF6EF]/15 pb-4">
        <p className="text-xs font-medium text-[#DCE8E3]">
          Simulated voice guidance · Not connected to a real telephone line
        </p>
        <p className="text-sm leading-relaxed text-[#FAF6EF]">{GREETING_LINE}</p>
        <p className="text-xs text-[#E9A23B]">{statusMessage}</p>
      </div>

      {/* Microphone & Read-back controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggleMicrophone}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
            listening
              ? 'bg-[#B91C1C] text-white'
              : 'bg-[#FAF6EF] text-[#0F3D3E] hover:bg-[#DCE8E3]'
          }`}
        >
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{listening ? 'Stop Speaking' : 'Speak (Web Speech STT)'}</span>
        </button>

        <button
          type="button"
          onClick={() => speakCalmly(GREETING_LINE)}
          className="px-4 py-2.5 rounded-xl border border-[#FAF6EF]/25 text-sm font-medium text-[#FAF6EF] hover:bg-[#FAF6EF]/10 min-h-[44px]"
        >
          Replay Greeting (TTS)
        </button>

        {!speechSupported && (
          <span className="text-xs text-[#DCE8E3]/80">
            Browser microphone STT unavailable here—type or load a sample voice prompt below.
          </span>
        )}
      </div>

      {/* Editable captured transcript */}
      <div className="space-y-2">
        <label htmlFor="voice-transcript" className="block text-xs font-medium text-[#DCE8E3]">
          Spoken transcript (you can edit or clear anything before analyzing)
        </label>
        <textarea
          id="voice-transcript"
          rows={3}
          value={transcript}
          onChange={(e) => onChangeTranscript(e.target.value)}
          placeholder="Spoken words will appear here, or you can type directly..."
          className="w-full rounded-xl bg-[#FAF6EF] text-[#14202B] p-3.5 text-sm leading-relaxed focus:outline-2 focus:outline-[#E9A23B]"
        />
      </div>

      {/* Helpful sample voice prompts for demonstration */}
      <div className="space-y-2 pt-1">
        <p className="text-xs text-[#DCE8E3]/85">
          Test with a synthetic voice example:
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_VOICE_PROMPTS.map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onChangeTranscript(sample);
                setStatusMessage('Loaded synthetic voice sample. Review below and organize support options.');
              }}
              className="text-left px-3 py-1.5 rounded-lg bg-[#FAF6EF]/12 hover:bg-[#FAF6EF]/20 text-xs text-[#FAF6EF] transition-colors"
            >
              Sample {i + 1}: &ldquo;{sample.slice(0, 42)}...&rdquo;
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onUseTranscript}
          disabled={transcript.trim().length < 3}
          className="px-5 py-2.5 rounded-xl bg-[#E9A23B] text-[#14202B] font-bold text-sm hover:bg-[#D89029] disabled:opacity-45 disabled:cursor-not-allowed min-h-[44px]"
        >
          Organize Support Options from Voice Notes
        </button>
      </div>
    </div>
  );
}
