import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import az from "./locales/az.json";
import en from "./locales/en.json";

i18next.use(initReactI18next).init({
  resources: {
    az: { translation: az },
    en: { translation: en },
  },
  lng: "az", // Varsayılan dil
  fallbackLng: "en", // Hata durumunda yedek dil
  interpolation: {
    escapeValue: false, // React zaten XSS koruması sağlar
  },
});

const savedLang = localStorage.getItem("language") || "az";
i18next.changeLanguage(savedLang);

export default i18next;
