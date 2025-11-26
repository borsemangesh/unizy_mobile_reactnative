// localization/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
 
import { MAIN_URL } from "../screens/utils/APIConstant";
// Import only default/fallback translations
import en from "./en.json";
 
// Initial resources with only English fallback
const resources = {
  en: { translation: en }
};
 
// KEY used in AsyncStorage
const STORAGE_KEY = "selectedLanguage";
const TRANSLATION_CACHE_KEY = "cachedTranslations";
 
let initialized = false;
 
export const initI18n = async () => {
  if (initialized) return;
 
  let savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
  
  if (!savedLanguage) savedLanguage = "en";
 
  // Try to load cached translations
  try {
    const cachedTranslations = await AsyncStorage.getItem(TRANSLATION_CACHE_KEY);
    if (cachedTranslations) {
      const parsed = JSON.parse(cachedTranslations);
      Object.keys(parsed).forEach(lang => {
        if (!resources[lang]) {
          resources[lang] = { translation: parsed[lang] };
        }
      });
    }
  } catch (err) {
    console.log('Error loading cached translations', err);
  }
 
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
 
// Load translations from server
export const loadLanguageFromServer = async (langCode) => {
  try {
    // Replace with your actual API endpoint
    const response = await fetch(`${MAIN_URL.baseUrl}user/language-text?lancode=${langCode}`);
    console.log(response);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${langCode}`);
    }
    
    const json = await response.json();
    const translations = json.data;   // only the actual translations

    console.log(translations);
    
    // Add the translations to i18next
    if (!i18n.hasResourceBundle(langCode, 'translation')) {
      i18n.addResourceBundle(langCode, 'translation', translations, true, true);
    } else {
      // Update existing bundle
      i18n.addResourceBundle(langCode, 'translation', translations, true, true);
    }
    
    // Cache translations locally
    const cachedTranslations = await AsyncStorage.getItem(TRANSLATION_CACHE_KEY);
    const cache = cachedTranslations ? JSON.parse(cachedTranslations) : {};
    cache[langCode] = translations;
    await AsyncStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
    
    return translations;
  } catch (error) {
    console.error(`Error loading language ${langCode}:`, error);
    throw error;
  }
};
 
// Change language and load from server if needed
export const changeAppLanguage = async (langCode) => {
  try {
    await loadLanguageFromServer(langCode);
    await i18n.changeLanguage(langCode);
    await AsyncStorage.setItem(STORAGE_KEY, langCode);
  } catch (err) {
    console.log('Error changing language:', err.message);
    throw err;
  }
};
 
export default i18n;