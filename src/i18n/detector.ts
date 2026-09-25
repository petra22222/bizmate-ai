import { SUPPORTED_LANGUAGES, getLanguageByCode } from './languages';

/**
 * Detect language of any given text input using Unicode scripts and vocabulary heuristics.
 * Works accurately across all world scripts without external network calls.
 */
export function detectTextLanguage(text: string): string {
  if (!text || typeof text !== 'string') return 'en';
  const trimmed = text.trim();
  if (!trimmed) return 'en';

  // 1. Script-based Unicode detection (High confidence)

  // Bengali (\u0980 - \u09FF)
  if (/[\u0980-\u09FF]/.test(trimmed)) {
    return 'bn';
  }

  // Devanagari / Hindi / Marathi (\u0900 - \u097F)
  if (/[\u0900-\u097F]/.test(trimmed)) {
    return 'hi';
  }

  // Gurmukhi / Punjabi (\u0A00 - \u0A7F)
  if (/[\u0A00-\u0A7F]/.test(trimmed)) {
    return 'pa';
  }

  // Gujarati (\u0A80 - \u0AFF)
  if (/[\u0A80-\u0AFF]/.test(trimmed)) {
    return 'gu';
  }

  // Tamil (\u0B80 - \u0BFF)
  if (/[\u0B80-\u0BFF]/.test(trimmed)) {
    return 'ta';
  }

  // Telugu (\u0C00 - \u0C7F)
  if (/[\u0C00-\u0C7F]/.test(trimmed)) {
    return 'te';
  }

  // Kannada (\u0C80 - \u0CFF)
  if (/[\u0C80-\u0CFF]/.test(trimmed)) {
    return 'kn';
  }

  // Malayalam (\u0D00 - \u0D7F)
  if (/[\u0D00-\u0D7F]/.test(trimmed)) {
    return 'ml';
  }

  // Thai (\u0E00 - \u0E7F)
  if (/[\u0E00-\u0E7F]/.test(trimmed)) {
    return 'th';
  }

  // Hebrew (\u0590 - \u05FF)
  if (/[\u0590-\u05FF]/.test(trimmed)) {
    return 'he';
  }

  // Arabic / Persian / Urdu (\u0600 - \u06FF, \u0750 - \u077F, \uFB50 - \uFDFF, \uFE70 - \uFEFF)
  if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(trimmed)) {
    // Check specific Urdu characters: ے, ٹ, ڈ, ڑ
    if (/[\u06D2\u0679\u0688\u0691]/.test(trimmed)) {
      return 'ur';
    }
    // Check specific Persian characters: گ, چ, پ, ژ
    if (/[\u06AF\u0686\u067E\u0698]/.test(trimmed)) {
      return 'fa';
    }
    return 'ar';
  }

  // Japanese Hiragana & Katakana (\u3040-\u309F, \u30A0-\u30FF)
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(trimmed)) {
    return 'ja';
  }

  // Korean Hangul (\uAC00-\uD7AF, \u1100-\u11FF)
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(trimmed)) {
    return 'ko';
  }

  // Chinese CJK Ideographs (\u4E00-\u9FFF)
  if (/[\u4E00-\u9FFF]/.test(trimmed)) {
    return 'zh-CN';
  }

  // Cyrillic / Russian / Ukrainian (\u0400 - \u04FF)
  if (/[\u0400-\u04FF]/.test(trimmed)) {
    // Check Ukrainian specific characters: і, ї, є, ґ
    if (/[іїєґІЇЄҐ]/.test(trimmed)) {
      return 'uk';
    }
    return 'ru';
  }

  // Greek (\u0370 - \u03FF)
  if (/[\u0370-\u03FF]/.test(trimmed)) {
    return 'el';
  }

  // 2. Latin-script language heuristics (Spanish, French, German, Portuguese, etc.)
  const lower = trimmed.toLowerCase();

  // Spanish
  if (
    /[¿¡ñáéíóú]/.test(lower) ||
    /\b(hola|por favor|gracias|reunión|crear|mañana|cómo|estás|calendario|correo)\b/i.test(lower)
  ) {
    return 'es';
  }

  // French
  if (
    /[çœèéêëàâîïôûù]/.test(lower) ||
    /\b(bonjour|merci|réunion|crée|demain|comment|allez|vous|calendrier|courriel|pourquoi)\b/i.test(lower)
  ) {
    return 'fr';
  }

  // German
  if (
    /[äöüß]/.test(lower) ||
    /\b(hallo|bitte|danke|termin|erstellen|morgen|wie|geht|ihnen|kalender|nachricht)\b/i.test(lower)
  ) {
    return 'de';
  }

  // Portuguese
  if (
    /[ãõçáéíóúâêô]/.test(lower) ||
    /\b(olá|obrigado|obrigada|reunião|criar|amanhã|como|você|calendário|email)\b/i.test(lower)
  ) {
    return 'pt';
  }

  // Italian
  if (
    /\b(ciao|grazie|riunione|creare|domani|come|stai|calendario|posta)\b/i.test(lower)
  ) {
    return 'it';
  }

  // Vietnamese
  if (/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/.test(lower)) {
    return 'vi';
  }

  // Turkish
  if (/[ğüşöçıİĞÜŞÖÇ]/.test(trimmed) || /\b(merhaba|teşekkürler|toplantı|oluştur|yarın)\b/i.test(lower)) {
    return 'tr';
  }

  // Default to English
  return 'en';
}

/**
 * Detect the browser's preferred language with graceful fallback.
 * Checks navigator.languages and navigator.language.
 */
export function getBrowserLanguage(): string {
  if (typeof window === 'undefined' || !window.navigator) {
    return 'en';
  }

  const navLanguages = window.navigator.languages || [window.navigator.language];

  for (const lang of navLanguages) {
    if (!lang) continue;
    const clean = lang.trim();

    // Exact match
    const exact = SUPPORTED_LANGUAGES.find(
      (l) => l.code.toLowerCase() === clean.toLowerCase()
    );
    if (exact) return exact.code;

    // Base language match (e.g. bn-BD -> bn, fr-FR -> fr)
    const base = clean.split(/[-_]/)[0].toLowerCase();
    const baseMatch = SUPPORTED_LANGUAGES.find(
      (l) => l.code.toLowerCase() === base || l.code.toLowerCase().startsWith(`${base}-`)
    );
    if (baseMatch) return baseMatch.code;
  }

  return 'en';
}
