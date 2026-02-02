import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from "@google/genai";
import { Message, ModelType } from './types';
import { createChatSession, sendMessageStream } from './services/gemini';
import Logo from './components/Logo';
import InputArea from './components/InputArea';
import ChatMessage from './components/ChatMessage';
import { History, Trash2, Zap, BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [modelType, setModelType] = useState<ModelType>(ModelType.TUTOR);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat session on mount or when model changes
  useEffect(() => {
    setChatSession(createChatSession(modelType));
  }, [modelType]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleModelChange = (newModel: ModelType) => {
    if (modelType === newModel) return;
    setModelType(newModel);
    // Reset chat when switching models to ensure clean context
    setMessages([]);
    setHasStarted(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!chatSession) return;

    if (!hasStarted) setHasStarted(true);
    setIsLoading(true);

    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      text: text,
    };

    setMessages((prev) => [...prev, userMsg]);

    // Create a placeholder for the model response
    const modelMsgId = uuidv4();
    const initialModelMsg: Message = {
      id: modelMsgId,
      role: 'model',
      text: '',
      isThinking: modelType === ModelType.TUTOR, // Only show thinking state for Tutor model
    };
    setMessages((prev) => [...prev, initialModelMsg]);

    try {
      const resultStream = await sendMessageStream(chatSession, text);
      
      let fullText = '';
      
      for await (const chunk of resultStream) {
        // Once we receive the first chunk of actual text, we turn off thinking
        if (chunk.text) {
             fullText += chunk.text;
             setMessages((prev) => 
               prev.map((msg) => 
                 msg.id === modelMsgId 
                   ? { ...msg, text: fullText, isThinking: false } 
                   : msg
               )
             );
        }
      }
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === modelMsgId 
            ? { ...msg, text: "I'm having trouble connecting to my knowledge base right now. Please try again.", isThinking: false } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setHasStarted(false);
    setChatSession(createChatSession(modelType));
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background Gradient Blob */}
      <div className="fixed bottom-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-700/30 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* Header */}
      <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-20 bg-gradient-to-b from-[#030014] to-transparent">
        <Logo />
        <div className="flex items-center gap-3">
          {/* Model Toggle */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            <button 
               onClick={() => handleModelChange(ModelType.TUTOR)}
               className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${modelType === ModelType.TUTOR ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
               <BrainCircuit size={16} />
               <span className="hidden sm:inline">Deep</span>
            </button>
            <button 
               onClick={() => handleModelChange(ModelType.FAST)}
               className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${modelType === ModelType.FAST ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
               <Zap size={16} />
               <span className="hidden sm:inline">Fast</span>
            </button>
          </div>

          {hasStarted && (
            <button 
              onClick={handleReset}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 backdrop-blur-md h-[36px]"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col z-10 w-full max-w-5xl mx-auto pt-24 pb-4 px-4">
        
        {/* Welcome Screen (Centered State) */}
        {!hasStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center -mt-20 px-4 text-center space-y-8 fade-in">
             <div className="space-y-4 max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400 leading-tight pb-2">
                   Master concepts,<br /> don't just solve them.
                </h2>
                <p className="text-lg text-gray-400 max-w-lg mx-auto leading-relaxed">
                   Tomo is your thinking partner. I'll help you break down problems and learn the 'why' behind the 'what'.
                </p>
             </div>
             
             <div className="w-full pt-8">
               <InputArea onSend={handleSendMessage} centered={true} />
             </div>

             {/* Suggestion Chips */}
             <div className="flex flex-wrap justify-center gap-3 pt-4 text-sm text-gray-400">
                <button onClick={() => handleSendMessage("Explain Quantum Entanglement like I'm 12")} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors">
                   ⚛️ Explain Quantum Physics
                </button>
                <button onClick={() => handleSendMessage("Help me write a story about a time traveler")} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors">
                   ✍️ Story Brainstorming
                </button>
                <button onClick={() => handleSendMessage("Review my understanding of derivatives in calculus")} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors">
                   📐 Calculus Check
                </button>
             </div>
          </div>
        ) : (
          /* Chat Interface (Active State) */
          <>
            <div className="flex-1 overflow-y-auto px-2 md:px-4 py-4 space-y-4 scroll-smooth">
              {messages.map((msg) => (
                <ChatMessage 
                  key={msg.id} 
                  message={msg} 
                  onSuggestionClick={handleSendMessage}
                />
              ))}
              <div ref={chatEndRef} className="h-4" />
            </div>
            
            <div className="sticky bottom-0 w-full py-6 bg-gradient-to-t from-[#030014] via-[#030014] to-transparent px-2">
              <InputArea onSend={handleSendMessage} disabled={isLoading} centered={false} />
              <p className="text-center text-xs text-gray-600 mt-3">
                 Tomo can make mistakes. Always verify important information.
              </p>
            </div>
          </>
        )}

      </main>
    </div>
  );
};

export default App;