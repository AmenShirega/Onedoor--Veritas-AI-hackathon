import { useEffect, useState } from 'react';
import { AboutView } from './components/AboutView';
import { HomeView } from './components/HomeView';
import { IntakeFlowView } from './components/IntakeFlowView';
import { Shell, type AppRoute } from './components/Shell';
import { VoiceCallView } from './components/VoiceCallView';
import { getLanguageMeta, getStoredLanguage, saveLanguage } from './lib/i18n';
import type { LanguageCode } from './lib/types';

function routeFromLocation(): AppRoute {
  const params = new URLSearchParams(window.location.search);
  if (params.get('autostart') === '1') return 'intake';
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/intake') return 'intake';
  if (path === '/call') return 'call';
  if (path === '/about') return 'about';
  return 'home';
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => routeFromLocation());
  const [callPrefillText, setCallPrefillText] = useState<string | undefined>(undefined);
  const [lang, setLang] = useState<LanguageCode>(() => getStoredLanguage());

  useEffect(() => {
    const onPopState = () => {
      setRoute(routeFromLocation());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const meta = getLanguageMeta(lang);
    document.documentElement.lang = meta.code;
    document.documentElement.dir = meta.dir;
    saveLanguage(lang);
  }, [lang]);

  const navigate = (nextRoute: AppRoute) => {
    setRoute(nextRoute);
    const nextPath = nextRoute === 'home' ? '/' : `/${nextRoute}`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
  };

  const handleStartIntake = (mode: 'write' | 'call') => {
    if (mode === 'call') {
      navigate('call');
    } else {
      navigate('intake');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Shell route={route} onNavigate={navigate} lang={lang} onChangeLang={setLang}>
      {route === 'home' && (
        <HomeView
          lang={lang}
          onStartIntake={handleStartIntake}
          onNavigate={navigate}
        />
      )}
      {route === 'call' && (
        <VoiceCallView
          lang={lang}
          onSwitchToText={(prefill) => {
            if (prefill && prefill.trim().length >= 3) {
              setCallPrefillText(prefill.trim());
            }
            navigate('intake');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onCompleteToWorkflow={(spokenText) => {
            setCallPrefillText(spokenText);
            navigate('intake');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
      {route === 'intake' && (
        <IntakeFlowView
          lang={lang}
          initialSpokenText={callPrefillText}
          onConsumeInitialSpokenText={() => setCallPrefillText(undefined)}
          onOpenVoiceCall={() => {
            navigate('call');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
      {route === 'about' && <AboutView lang={lang} />}
    </Shell>
  );
}
