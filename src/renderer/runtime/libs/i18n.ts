import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from 'i18next-resources-to-backend';
import LanguageDetector from "i18next-browser-languagedetector";

i18n
.use(initReactI18next)
.use(LanguageDetector)
.use(resourcesToBackend((lng: string, ns: string) => import(`../../locales/${lng}/${ns}.json`)))
.init({
    defaultNS: 'common',
    fallbackLng: 'ru-RU', // Как сделаем перевод на английский нужно сделать его по умолчанию
    detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
        lookupLocalStorage: "i18nextLng",
    },
    
    interpolation: {
        escapeValue: false
    }
});

export default i18n;