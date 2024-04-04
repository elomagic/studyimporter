import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { InitOptions } from 'i18next/typescript/options';
import en from './locales/translations_en.json';
import de from './locales/translations_de.json';

const i18nextOptions: InitOptions = {
  debug: true,
  fallbackLng: 'en',
  lng: 'en',
  ns: ['translations'],
  resources: {
    en: {
      translations: en,
    },
    de: {
      translations: de,
    },
  },
};

i18n.use(initReactI18next);

// initialize if not already initialized
if (!i18n.isInitialized) {
  console.log('Initializing i18n');
  i18n.init(i18nextOptions);
}

export default i18n;
