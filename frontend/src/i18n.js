import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-chained-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // load translation using xhr -> see /public/locales
  .use(Backend)
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  .init({
    // for all available options read the backend's repository readme file
    backend: {
      loadPath: '../public/locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: 'en-US',
    debug: true,
    interpolation: {
      // this will disable automatic escaping of translations
      escapeValue: false,
    },
  });

export default i18n;
