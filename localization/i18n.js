import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import translations
import en from "./en.json";
import hi from "./hi.json";
import zh from "./zh.json";

// Languages list
const resources = {
  en: { translation: en },
  hi: { translation: hi },
  zh: { translation: zh }
};

// KEY used in AsyncStorage
const STORAGE_KEY = "selectedLanguage";

let initialized = false;

export const initI18n = async () => {
  if (initialized) return; // prevent running multiple times

  let savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);

  if (!savedLanguage) savedLanguage = "en"; // default

  await i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: "v3",
      resources,
      lng: savedLanguage,
      fallbackLng: "en",
      interpolation: { escapeValue: false },
    });

  initialized = true;
};

// Change language after a button click
export const changeAppLanguage = async (langCode) => {
  try {
    await i18n.changeLanguage(langCode);
    await AsyncStorage.setItem(STORAGE_KEY, langCode);
  } catch (err) {
    console.log(err.message);
  }
};

export default i18n;
