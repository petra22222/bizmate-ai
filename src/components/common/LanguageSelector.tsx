import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, Search, X } from 'lucide-react';
import { useI18n } from '../../i18n';

interface LanguageSelectorProps {
  variant?: 'compact' | 'header' | 'settings';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { locale, currentLanguage, supportedLanguages, setLocale, t, isRtl } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredLanguages = supportedLanguages.filter((lang) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    );
  });

  const handleSelect = (code: string) => {
    setLocale(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      {variant === 'settings' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm font-medium transition-all cursor-pointer shadow-sm group"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300">
              <Globe className="w-4 h-4" />
            </div>
            <div className="text-left rtl:text-right">
              <span className="block font-semibold text-white">
                {currentLanguage.nativeName}
              </span>
              <span className="block text-xs text-slate-400">
                {currentLanguage.name} ({currentLanguage.code})
                {currentLanguage.dir === 'rtl' ? ' • RTL' : ''}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800/80 border border-slate-800 transition-all cursor-pointer group"
          title={t('language.selectLanguage')}
          aria-label={t('language.label')}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300" />
          <span className="font-semibold tracking-tight">{currentLanguage.nativeName}</span>
          <ChevronDown
            className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isRtl ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
          }`}
          role="listbox"
        >
          {/* Header & Search */}
          <div className="p-3 border-b border-slate-800/80 bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                {t('language.selectLanguage')}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {supportedLanguages.length} Languages
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language / ভাষা / اللغة..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-8 rtl:pr-8 rtl:pl-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rtl:right-auto rtl:left-2.5 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Languages List */}
          <div className="max-h-64 sm:max-h-80 overflow-y-auto p-1.5 divide-y divide-slate-800/40">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => {
                const isSelected = lang.code.toLowerCase() === locale.toLowerCase();
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left rtl:text-right ${
                      isSelected
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm font-medium text-slate-100 truncate">
                        {lang.nativeName}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">
                        • {lang.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {lang.dir === 'rtl' && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                          RTL
                        </span>
                      )}
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-sm">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
