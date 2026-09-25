import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { removeUndefinedFields } from '../utils/firestoreUtils';
import { SUPPORTED_LANGUAGES, LanguageOption, isRtlLanguage, getLanguageByCode } from './languages';
import { detectTextLanguage, getBrowserLanguage } from './detector';

// Load static locales
import en from './locales/en.json';
import bn from './locales/bn.json';
import ar from './locales/ar.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import hi from './locales/hi.json';
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ru from './locales/ru.json';
import pt from './locales/pt.json';
import tr from './locales/tr.json';
import ur from './locales/ur.json';
import it from './locales/it.json';
import he from './locales/he.json';
import fa from './locales/fa.json';
import vi from './locales/vi.json';
import id from './locales/id.json';

const LOCALES: Record<string, any> = {
  en,
  bn,
  ar,
  es,
  fr,
  de,
  hi,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  ja,
  ko,
  ru,
  pt,
  tr,
  ur,
  it,
  he,
  fa,
  vi,
  id,
};

interface I18nContextType {
  locale: string;
  dir: 'ltr' | 'rtl';
  isRtl: boolean;
  currentLanguage: LanguageOption;
  supportedLanguages: LanguageOption[];
  setLocale: (code: string) => void;
  t: (keyPath: string, params?: Record<string, string | number>) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  userTimeZone: string;
  detectInputLanguage: (text: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'bizmate_preferred_language';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Determine initial language: localStorage > browser language > 'en'
  const [locale, setLocaleState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return getLanguageByCode(saved).code;
      }
      return getBrowserLanguage();
    }
    return 'en';
  });

  const currentLanguage = useMemo(() => getLanguageByCode(locale), [locale]);
  const isRtl = useMemo(() => isRtlLanguage(locale), [locale]);
  const dir: 'ltr' | 'rtl' = isRtl ? 'rtl' : 'ltr';

  const userTimeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }, []);

  // Update DOM html element attributes whenever locale or direction changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLanguage.code;
      document.documentElement.dir = dir;
    }
  }, [currentLanguage.code, dir]);

  // Synchronize language preference with Firebase Firestore users/{uid}
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data?.preferredLanguage) {
              const lang = getLanguageByCode(data.preferredLanguage);
              setLocaleState(lang.code);
              if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, lang.code);
              }
            } else {
              // User has no preferredLanguage saved yet in Firestore; sync current locale
              const currentPref = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) || locale) : locale;
              await updateDoc(userRef, removeUndefinedFields({ preferredLanguage: currentPref }));
            }
          }
        } catch (err) {
          console.warn('Could not sync user language preference with Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, [locale]);

  const setLocale = useCallback((newCode: string) => {
    const lang = getLanguageByCode(newCode);
    setLocaleState(lang.code);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang.code);
    }
    // Sync to Firestore if user is currently authenticated
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      updateDoc(userRef, removeUndefinedFields({ preferredLanguage: lang.code })).catch((err) => {
        console.warn('Failed to update preferredLanguage in Firestore:', err);
      });
    }
  }, []);

  // Safe nested translation lookup with English fallback
  const t = useCallback(
    (keyPath: string, params?: Record<string, string | number>): string => {
      const keys = keyPath.split('.');
      
      const getFromDict = (dict: any): any => {
        if (!dict) return undefined;
        let curr = dict;
        for (const k of keys) {
          if (curr && typeof curr === 'object' && k in curr) {
            curr = curr[k];
          } else {
            return undefined;
          }
        }
        return curr;
      };

      // 1. Try current locale
      let val = getFromDict(LOCALES[locale]);

      // 2. Fallback to base code if regional (e.g. zh-TW -> zh-CN)
      if (val === undefined && locale.includes('-')) {
        const base = locale.split('-')[0];
        val = getFromDict(LOCALES[base]);
      }

      // 3. Fallback to English
      if (val === undefined) {
        val = getFromDict(LOCALES['en']);
      }

      // 4. Fallback to readable key
      if (val === undefined || typeof val !== 'string') {
        val = keys[keys.length - 1] || keyPath;
      }

      // Interpolate {param}
      if (params) {
        for (const [pKey, pVal] of Object.entries(params)) {
          val = val.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
        }
      }

      return val;
    },
    [locale]
  );

  // Locale-aware Date formatting
  const formatDate = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
      try {
        const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
        if (isNaN(d.getTime())) return '';
        const defaultOpts: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          timeZone: userTimeZone,
          ...options,
        };
        return new Intl.DateTimeFormat(locale, defaultOpts).format(d);
      } catch (e) {
        return String(date);
      }
    },
    [locale, userTimeZone]
  );

  // Locale-aware Number formatting
  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      try {
        return new Intl.NumberFormat(locale, options).format(value);
      } catch {
        return String(value);
      }
    },
    [locale]
  );

  // Locale-aware Currency formatting
  const formatCurrency = useCallback(
    (amount: number, currency: string = 'USD'): string => {
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          maximumFractionDigits: 2,
        }).format(amount);
      } catch {
        return `${currency} ${amount.toFixed(2)}`;
      }
    },
    [locale]
  );

  const detectInputLanguage = useCallback((text: string): string => {
    return detectTextLanguage(text);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      dir,
      isRtl,
      currentLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES,
      setLocale,
      t,
      formatDate,
      formatNumber,
      formatCurrency,
      userTimeZone,
      detectInputLanguage,
    }),
    [
      locale,
      dir,
      isRtl,
      currentLanguage,
      setLocale,
      t,
      formatDate,
      formatNumber,
      formatCurrency,
      userTimeZone,
      detectInputLanguage,
    ]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
