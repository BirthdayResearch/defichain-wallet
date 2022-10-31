import { initReactI18next } from "react-i18next";
import i18n from "i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const resources = {
  en: {
    translation: {
      "Welcome to React": "Welcome to React and react-i18next",
    },
  },
  de: {
    translation: {
      "Welcome to React": "Bienvenue dans React et react-i18next",
    },
  },
};

const languageDetector = {
  init: Function.prototype,
  type: "languageDetector",
  async: true, // flags below detection to be async
  detect: async (callback) => {
    const selectedLanguage = await AsyncStorage.getItem("i18nextLng=LANGUAGE");
    /** ... */
    callback(selectedLanguage);
  },
  cacheUserLanguage: () => {},
};

// init i18next
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // lng: "en", // only if using language detector then remove: https://github.com/i18next/i18next-browser-languageDetector
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
    fallbackLng: "en",
  });

export default i18n;
