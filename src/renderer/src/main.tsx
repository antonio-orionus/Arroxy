import './browserMock';
import 'electron-log/renderer';
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initI18n, pickLanguage, isRtl } from '@shared/i18n';
import { useAppStore } from './store/useAppStore';
import './styles.css';

async function bootstrap(): Promise<void> {
  let lang = pickLanguage(navigator.language);
  const result = await window.appApi.settings.get();
  if (result.ok && result.data.language) {
    lang = pickLanguage(result.data.language);
  }
  initI18n(lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr';
  useAppStore.setState({ language: lang });

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Renderer root element was not found');
  }

  createRoot(rootElement).render(
    <React.StrictMode>
      <Suspense fallback={null}>
        <App />
      </Suspense>
    </React.StrictMode>
  );
}

void bootstrap();
