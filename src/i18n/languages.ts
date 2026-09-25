export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  script?: string;
  region?: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr', script: 'Bengali' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', script: 'Arabic' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', script: 'Devanagari' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', dir: 'ltr', script: 'Han' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', dir: 'ltr', script: 'Han' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr', script: 'Japanese' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr', script: 'Hangul' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr', script: 'Cyrillic' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', script: 'Arabic' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', dir: 'rtl', script: 'Hebrew' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', dir: 'rtl', script: 'Arabic' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', dir: 'ltr' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', dir: 'ltr' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', dir: 'ltr', script: 'Thai' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', dir: 'ltr' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', dir: 'ltr', script: 'Cyrillic' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', dir: 'ltr', script: 'Greek' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', dir: 'ltr' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', dir: 'ltr' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', dir: 'ltr' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', dir: 'ltr' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino', dir: 'ltr' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', dir: 'ltr' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', dir: 'ltr' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', dir: 'ltr' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', dir: 'ltr', script: 'Cyrillic' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', dir: 'ltr', script: 'Cyrillic' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', dir: 'ltr' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', dir: 'ltr' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr', script: 'Devanagari' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr', script: 'Tamil' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr', script: 'Telugu' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr', script: 'Gujarati' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr', script: 'Gurmukhi' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr', script: 'Kannada' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr', script: 'Malayalam' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', dir: 'ltr' },
];

export const RTL_LANGUAGES = ['ar', 'he', 'ur', 'fa'];

export function isRtlLanguage(code: string): boolean {
  const baseCode = code.split('-')[0].toLowerCase();
  return RTL_LANGUAGES.includes(baseCode);
}

export function getLanguageByCode(code: string): LanguageOption {
  const clean = code.trim();
  const directMatch = SUPPORTED_LANGUAGES.find(
    (l) => l.code.toLowerCase() === clean.toLowerCase()
  );
  if (directMatch) return directMatch;

  const baseCode = clean.split(/[-_]/)[0].toLowerCase();
  const baseMatch = SUPPORTED_LANGUAGES.find(
    (l) => l.code.toLowerCase() === baseCode || l.code.toLowerCase().startsWith(`${baseCode}-`)
  );
  if (baseMatch) return baseMatch;

  return SUPPORTED_LANGUAGES[0]; // English fallback
}
