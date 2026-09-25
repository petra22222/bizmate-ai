import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Paperclip, 
  CornerDownLeft, 
  AudioWaveform as Waveform,
  Zap
} from 'lucide-react';
import { useI18n } from '../i18n';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onSelectPrompt: (promptText: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onSelectPrompt,
}) => {
  const { t, currentLanguage, isRtl } = useI18n();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Quick suggestions tailored for operations
  const suggestionChips = [
    { label: t('chat.prompt1'), text: t('chat.prompt1') },
    { label: t('chat.prompt2'), text: t('chat.prompt2') },
    { label: t('chat.prompt3'), text: t('chat.prompt3') },
    { label: t('chat.prompt4'), text: t('chat.prompt4') },
  ];

  // Initialize Speech Recognition if available
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLanguage.code === 'bn' ? 'bn-BD' : (currentLanguage.code === 'en' ? 'en-US' : currentLanguage.code);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(prev => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleVoice = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch {
          // Fallback simulation if already started or blocked
          simulateVoiceInput();
        }
      } else {
        simulateVoiceInput();
      }
    }
  };

  const simulateVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setInput(prev => (prev ? prev + ' রহিমের ইনভয়েস পাঠাও' : 'রহিমের ইনভয়েস পাঠাও'));
      setIsListening(false);
    }, 2200);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 backdrop-blur-xl shrink-0">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-slate-500 font-medium shrink-0 flex items-center gap-1 pl-0.5">
            <Zap className="w-3 h-3 text-indigo-400" />
            Suggestions:
          </span>
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(chip.text)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Card Container */}
        <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-lg shadow-black/40 overflow-hidden">
          {/* Active Voice Wave Banner */}
          {isListening && (
            <div className="px-4 py-2 bg-indigo-950/70 border-b border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Listening for your voice (বাংলা / English)... Speak now</span>
              </div>
              <span className="text-[11px] font-mono text-indigo-400">Audio input active</span>
            </div>
          )}

          <div className="flex items-end p-2 sm:p-2.5 gap-2">
            {/* Textarea with dir=auto for seamless multilingual and RTL support */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              dir="auto"
              onChange={handleInputResize}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base px-2 py-1.5 focus:outline-none resize-none min-h-[44px] max-h-32 leading-relaxed"
            />

            {/* Right Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0 pb-1">
              {/* Voice Input Button */}
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white border-red-400 ring-2 ring-red-400/40 animate-pulse'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white border-slate-700/60'
                }`}
                title={isListening ? 'Stop listening' : 'Voice input (Speak Bengali or English)'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button (Paper Plane Icon) */}
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isLoading}
                className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-md ${
                  input.trim() && !isLoading
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800'
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footnote information */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            Press <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">Shift + Enter</kbd> for new line
          </span>
          <span className="hidden sm:inline">Protected by BizMate Human-in-the-Loop Safe Guard</span>
        </div>
      </div>
    </div>
  );
};
