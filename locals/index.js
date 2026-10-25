import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

// Import all language files
import en from './en.json';
import ar from './ar.json';

// Default fallback language
i18n.fallbacks = true;
i18n.defaultLocale = 'en';

// All translations
i18n.translations = {
    ar,
    en
};

// Initialize language
export const initializeLanguage = async () => {
    try {
        const locale = await Localization.locale;
        i18n.locale = locale.substr(0, 2);
        return locale;
    } catch (error) {
        console.warn('Failed to get locale', error);
        i18n.locale = 'en';
    }
};

// Initialize on import
initializeLanguage();

// Export the translation function
export const t = (key) => i18n.t(key);

// Export current locale helper
export const getCurrentLocale = () => i18n.locale;
