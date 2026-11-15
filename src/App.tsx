import { useEffect, useState } from 'react';
import { AboutView } from './components/AboutView';
import { CaseworkerView } from './components/CaseworkerView';
import { HomeView } from './components/HomeView';
import { IntakeFlowView } from './components/IntakeFlowView';
import { ResearchView } from './components/ResearchView';
import { Shell, type AppRoute } from './components/Shell';
import type { LanguageCode } from './lib/types';

function routeFromLocation(): AppRoute {
  const params = new URLSearchParams(window.location.search);
  if (params.get('autostart') === '1') return 'intake';
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/intake') return 'intake';
  if (path === '/caseworker') return 'caseworker';
  if (path === '/research') return 'research';
  if (path === '/about') return 'about';
  return 'home';
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => routeFromLocation());
  const [intakeMode, setIntakeMode] = useState<'write' | 'talk'>('write');
  const [lang, setLang] = useState<LanguageCode>('en');

  useEffect(() => {
    const onPopState = () => {
      setRoute(routeFromLocation());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (nextRoute: AppRoute) => {
    setRoute(nextRoute);
    const nextPath = nextRoute === 'home' ? '/' : `/${nextRoute}`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
  };

  const handleStartIntake = (mode: 'write' | 'talk') => {
    setIntakeMode(mode);
    navigate('intake');
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
      {route === 'intake' && (
        <IntakeFlowView
          lang={lang}
          initialMode={intakeMode}
          onNavigate={navigate}
        />
      )}
      {route === 'caseworker' && <CaseworkerView lang={lang} />}
      {route === 'research' && <ResearchView lang={lang} />}
      {route === 'about' && <AboutView lang={lang} />}
    </Shell>
  );
}
