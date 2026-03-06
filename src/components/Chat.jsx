import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, AlertCircle, MessageSquare, Plus, PanelLeftClose, PanelLeftOpen, Settings, Info } from 'lucide-react';
import { initGemini, generateResponse } from '../lib/gemini';

export default function Chat() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [{ role: 'model', content: "Hello! How can I help you today?" }];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const success = initGemini();
    setIsInitialized(success);
    if (!success) {
      setApiError("Failed to initialize Gemini API. Please check your .env file.");
    }
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (!isInitialized) {
      setApiError("API is not properly configured. Check your .env file.");
      return;
    }

    const userContent = input.trim();
    const userMessage = { role: 'user', content: userContent };
    const currentHistory = [...messages];
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setApiError(null);

    try {
      const responseText = await generateResponse(currentHistory, userContent);
      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error) {
      console.error(error);
      setApiError("Failed to get response. Please check your network connection or API quota.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if(confirm('Start a new chat? Current history will be cleared.')) {
      setMessages([{ role: 'model', content: "Hello! How can I help you today?" }]);
      localStorage.removeItem('chatHistory');
      setApiError(null);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Adjust textarea height automatically
  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="flex h-screen bg-[#212121] text-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-[260px]' : 'w-0'} flex-none bg-[#171717] transition-all duration-300 ease-in-out overflow-hidden flex flex-col`}
      >
        <div className="p-3">
          <button 
            onClick={clearChat}
            className="flex items-center gap-2 w-full px-3 py-3 rounded-md hover:bg-[#2f2f2f] transition-colors text-sm font-medium"
          >
            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5 text-black" />
            </div>
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
          <div className="text-xs font-semibold text-gray-500 mb-3 px-2">Today</div>
          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-[#2f2f2f] transition-colors text-sm text-gray-300 truncate">
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate">Current Conversation</span>
          </button>
          {/* History placeholders could go here */}
        </div>

        <div className="p-3 border-t border-white/10 space-y-1">
           <button className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md hover:bg-[#2f2f2f] transition-colors text-sm text-gray-300">
            <Settings className="w-4 h-4 shrink-0" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Top Header Navigation */}
        <header className="flex items-center justify-between p-3 sticky top-0 z-10 bg-[#212121]">
           <div className="flex items-center gap-2">
             <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[#2f2f2f] rounded-md transition-colors text-gray-400 hover:text-gray-200"
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
             >
               {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
             </button>
             <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#2f2f2f] rounded-lg cursor-pointer transition-colors group">
               <span className="font-semibold text-gray-200 text-lg">Gemini Pro</span>
               <span className="text-gray-500 group-hover:text-gray-400">▼</span>
             </div>
           </div>
        </header>

        {/* Scrollable Message Area */}
        <main className="flex-1 overflow-y-auto w-full custom-scrollbar scroll-smooth pb-32">
          {messages.length === 1 && messages[0].role === 'model' && !isLoading ? (
             // Empty state centered
             <div className="h-full flex flex-col items-center justify-center -mt-10 px-4">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-md shadow-black/20">
                     <Bot className="w-10 h-10 text-black" />
                 </div>
                 <h2 className="text-2xl font-semibold mb-8 text-gray-200">How can I help you today?</h2>
             </div>
          ) : (
            <div className="max-w-3xl mx-auto flex flex-col space-y-6 pt-4 px-4 sm:px-6 md:px-8">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={idx} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full border border-gray-600 bg-white flex items-center justify-center shrink-0 mr-4 mt-1">
                        <Bot className="w-5 h-5 text-black" />
                      </div>
                    )}

                    <div className={`max-w-[85%] sm:max-w-[75%] px-5 py-3 text-[16px] leading-relaxed break-words
                      ${isUser 
                        ? 'bg-[#2f2f2f] text-gray-100 rounded-3xl' 
                        : 'bg-transparent text-gray-100'}`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                  </div>
                );
              })}
              
              {isLoading && (
                <div className="flex w-full justify-start mt-4">
                  <div className="w-8 h-8 rounded-full border border-gray-600 bg-white flex items-center justify-center shrink-0 mr-4 mt-1">
                    <Bot className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex items-center gap-2 mt-2 px-2">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  </div>
                </div>
              )}

              {apiError && (
                <div className="flex w-full justify-start mt-4 animate-in fade-in">
                  <div className="w-8 h-8 rounded-full border border-red-500/50 bg-red-500/10 flex items-center justify-center shrink-0 mr-4 mt-1">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="text-red-400 text-[15px] pt-1.5 flex items-center">
                    {apiError}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-6" />
            </div>
          )}
        </main>

        {/* Input Area (Fixed Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#212121] via-[#212121] to-[#212121]/0 pt-6 pb-6 px-4 md:px-8">
            <div className="max-w-3xl mx-auto relative">
              <form 
                onSubmit={handleSubmit}
                className="relative flex items-center w-full bg-[#2f2f2f] rounded-[26px] border border-gray-600/50 focus-within:bg-[#383838] transition-colors shadow-[0_0_15px_rgba(0,0,0,0.1)] px-3 py-1.5"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 cursor-pointer transition-colors ml-1 shrink-0">
                   <Plus className="w-5 h-5 text-gray-400" />
                </div>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Gemini..."
                  className="flex-1 max-h-[200px] min-h-[44px] bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-400 py-3 px-3 resize-none custom-scrollbar text-[16px] leading-relaxed m-0"
                  rows={1}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:opacity-80 disabled:opacity-30 disabled:hover:opacity-30 transition-opacity shrink-0 mr-1"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
              <div className="text-center mt-3 flex justify-center items-center text-xs text-gray-500">
                  <span>Gemini can make mistakes. Consider verifying important information.</span>
              </div>
            </div>
        </div>

      </div>
    </div>
  );
}
