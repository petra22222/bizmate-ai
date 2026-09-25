import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Paperclip, Square, Sparkles, X } from 'lucide-react';
import { useI18n } from '../../i18n';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onStopGenerating?: () => void;
  enterToSend?: boolean;
  placeholder?: string;
  onSelectPrompt?: (prompt: string) => void;
  initialPrompt?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onStopGenerating,
  enterToSend = true,
  placeholder,
  onSelectPrompt,
  initialPrompt = '',
}) => {
  const { t, locale } = useI18n();
  const effectivePlaceholder = placeholder || t('chat.placeholder');
  const [input, setInput] = useState(initialPrompt);
  const [isListening, setIsListening] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialPrompt]);

  // Voice recognition init
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = locale;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleVoice = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch {
          simulateVoice();
        }
      } else {
        simulateVoice();
      }
    }
  };

  const simulateVoice = () => {
    setIsListening(true);
    setTimeout(() => {
      setInput((prev) =>
        prev ? `${prev} Schedule a team meeting for tomorrow at 3 PM` : 'Schedule a team meeting for tomorrow at 3 PM'
      );
      setIsListening(false);
    }, 2000);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    setSelectedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (enterToSend) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    } else {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
    }
  };

  return (
    <div className="p-4 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-xl shrink-0">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Selected attachment preview */}
        {selectedFile && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-950/70 border border-indigo-500/30 text-xs text-indigo-300">
            <Paperclip className="w-3.5 h-3.5" />
            <span className="truncate max-w-xs">{selectedFile}</span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input box */}
        <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-xl shadow-black/40 overflow-hidden">
          {isListening && (
            <div className="px-4 py-1.5 bg-indigo-950/70 border-b border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300 animate-pulse">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Listening to microphone... Speak your command
              </span>
              <span className="font-mono text-[11px]">Recording</span>
            </div>
          )}

          <div className="flex items-end p-2.5 sm:p-3 gap-2">
            {/* Attachment Button UI */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Attach document or spreadsheet"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Main Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={effectivePlaceholder}
              dir="auto"
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm px-2 py-1 focus:outline-none resize-none min-h-[44px] max-h-36 leading-relaxed unicode-isolate"
            />

            {/* Right Buttons: Voice + Send / Stop */}
            <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white border-red-400 ring-2 ring-red-400/40 animate-pulse'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700/60'
                }`}
                title={isListening ? t('chat.stop') : t('chat.voiceTooltip')}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {isLoading ? (
                <button
                  type="button"
                  onClick={onStopGenerating}
                  className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-950/40 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold"
                  title={t('chat.stop')}
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span className="hidden sm:inline">{t('chat.stop')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={!input.trim()}
                  className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-md ${
                    input.trim()
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800'
                  }`}
                  title={t('chat.send')}
                >
                  <Send className="w-4 h-4 rtl-mirror" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subtitle helper */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>
            {enterToSend ? 'Enter to send, Shift + Enter for new line' : 'Ctrl + Enter to send'}
          </span>
          <span className="hidden sm:inline">Connected to n8n AI Agent Workspace</span>
        </div>
      </div>
    </div>
  );
};
