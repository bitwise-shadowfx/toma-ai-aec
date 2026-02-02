import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Bot, User, BrainCircuit, Sparkles, Lightbulb, BookOpen, GraduationCap } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onSuggestionClick?: (suggestion: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSuggestionClick }) => {
  const isUser = message.role === 'user';

  // Parse text to separate content from suggestions
  const { cleanText, suggestions } = useMemo(() => {
    if (isUser || !message.text) return { cleanText: message.text, suggestions: [] };

    const splitParts = message.text.split('<<SUGGESTIONS>>');
    const content = splitParts[0].trim();
    
    let parsedSuggestions: string[] = [];
    if (splitParts.length > 1) {
      try {
        // Attempt to parse the JSON array
        parsedSuggestions = JSON.parse(splitParts[1]);
      } catch (e) {
        console.warn("Failed to parse suggestions", e);
      }
    }

    return { cleanText: content, suggestions: parsedSuggestions };
  }, [message.text, isUser]);

  const getIconForSuggestion = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('quiz')) return <GraduationCap size={14} />;
    if (lower.includes('module')) return <BookOpen size={14} />;
    if (lower.includes('reasoning') || lower.includes('steps')) return <Lightbulb size={14} />;
    return <Sparkles size={14} />;
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 fade-in`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? 'bg-indigo-600' : 'bg-purple-600'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Content Container */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}>
          
          {/* Message Bubble */}
          <div className={`px-5 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-lg w-full ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-[#1a1a2e] text-gray-100 border border-white/10 rounded-tl-none'
          }`}>
             {message.isThinking ? (
                <div className="flex items-center gap-2 text-purple-300 italic animate-pulse">
                   <BrainCircuit size={16} />
                   <span>Thinking...</span>
                </div>
             ) : (
                <div className="markdown-content">
                  <ReactMarkdown 
                    components={{
                      code({node, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                          <div className="bg-black/50 rounded-md p-2 my-2 overflow-x-auto border border-white/10">
                              <code className={className} {...props}>
                                  {children}
                              </code>
                          </div>
                        ) : (
                          <code className="bg-white/10 px-1 py-0.5 rounded text-purple-200 font-mono text-sm" {...props}>
                            {children}
                          </code>
                        )
                      },
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
                      p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-bold text-purple-200 mt-4 mb-2" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-purple-100" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-500 pl-4 py-1 my-2 bg-purple-500/10 rounded-r" {...props} />,
                      a: ({node, ...props}) => <a className="text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    }}
                  >
                    {cleanText}
                  </ReactMarkdown>
                </div>
             )}
          </div>

          {/* Suggestions Chips */}
          {!isUser && !message.isThinking && suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 animate-pulse-once">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs md:text-sm bg-[#2e2e36] hover:bg-[#3e3e4a] border border-purple-500/30 hover:border-purple-400 text-purple-200 rounded-full transition-all duration-200 hover:scale-105 shadow-sm"
                >
                  {getIconForSuggestion(suggestion)}
                  {suggestion}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ChatMessage;