import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  centered?: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled, centered }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  // Base classes for the input container
  const containerClasses = centered
    ? "w-full max-w-2xl mx-auto transform transition-all duration-500 ease-out translate-y-0 opacity-100"
    : "w-full max-w-4xl mx-auto transform transition-all duration-500 ease-out";

  return (
    <div className={containerClasses}>
      <div className={`relative group transition-all duration-300 ${centered ? 'shadow-[0_0_50px_-12px_rgba(124,58,237,0.5)]' : 'shadow-lg'}`}>
        {/* Glow effect border */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-30 group-hover:opacity-75 blur transition duration-500"></div>
        
        <div className="relative bg-[#2e2e36] rounded-2xl flex items-end p-2 border border-white/10">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={centered ? "What do you want to learn today?" : "Ask a follow-up..."}
            className="w-full bg-transparent text-white placeholder-gray-400 px-4 py-3 min-h-[56px] max-h-[120px] focus:outline-none resize-none overflow-y-auto font-light text-lg"
            disabled={disabled}
            rows={1}
          />
          
          <div className="pb-2 pr-2 flex items-center gap-2">
            {centered && (
               <span className="text-xs text-gray-500 hidden sm:block animate-pulse pointer-events-none absolute left-4 bottom-[-24px]">
                 Tomo helps you learn, not just cheat.
               </span>
            )}
            <button
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center ${
                input.trim() && !disabled
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-100'
                  : 'bg-white/5 text-gray-500 scale-95 cursor-not-allowed'
              }`}
            >
              {disabled ? <Sparkles className="animate-spin" size={20} /> : <ArrowRight size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputArea;