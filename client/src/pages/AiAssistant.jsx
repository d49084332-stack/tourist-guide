import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  User,
  Send,
  Plus,
  Trash2,
  Sparkles,
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Coffee,
  HelpCircle,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { chatAPI } from '../services/api';
import { Button } from '../components/Common';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function AiAssistant() {
  const { user } = useAuthStore();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Namaste${user?.name ? ' ' + user.name : ''}! 🌍 I am your AI Smart Tourist Guide powered by Groq LLaMA 3.1. I can help you plan personalized Indian travel itineraries, calculate highway routes, find hotels and temples, or estimate trip budgets. What journey can we plan today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load chat history for authenticated users
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const res = await chatAPI.getHistory({ limit: 15 });
        if (res.data.success && res.data.chats) {
          setChats(res.data.chats);
        }
      } catch (err) {
        console.error('History fetch error:', err);
      }
    };

    fetchHistory();
  }, [user]);

  const handleSelectChat = async (id) => {
    setActiveChatId(id);
    setLoading(true);
    try {
      const res = await chatAPI.getChat(id);
      if (res.data.success && res.data.chat) {
        setMessages(res.data.chat.messages);
      }
    } catch (err) {
      toast.error('Could not load chat conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([
      {
        role: 'assistant',
        content: `Ready for a new adventure! Where would you like to explore? (e.g. "Plan a 3-day trip from Delhi to Agra" or "Hidden gems in Goa")`
      }
    ]);
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all your chat conversations?')) return;
    try {
      await chatAPI.clearAll();
      setChats([]);
      handleNewChat();
      toast.success('Conversation history cleared');
    } catch (err) {
      toast.error('Failed to clear history');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    // Optimistically append user message
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage({
        message: userText,
        chatId: activeChatId
      });

      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.data.message }
        ]);

        if (!activeChatId && res.data.chatId) {
          setActiveChatId(res.data.chatId);
          // Refresh sidebar
          const hist = await chatAPI.getHistory({ limit: 15 });
          if (hist.data.success) setChats(hist.data.chats);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Apologies, could not generate a response. Please try again.' }
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection timeout with Groq AI API. Please verify network connection.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestionPrompts = [
    { label: '3-Day Goa Coastal Itinerary', prompt: 'Create a 3-day relaxed itinerary in Goa with top beaches, local Konkan dining, and heritage forts on a mid-range budget.' },
    { label: 'Delhi to Agra Road Trip & Temples', prompt: 'What are the best temples and highway dhabas to visit while driving from Delhi to Agra on the Yamuna Expressway?' },
    { label: 'Family Trip to Ooty on ₹25,000', prompt: 'Plan a 2-night family trip to Ooty from Bengaluru with hotel ideas, toy train info, and budget breakdown within ₹25,000.' },
    { label: 'Spiritual Weekend in Varanasi', prompt: 'Explain the morning boat ride timings, major ghats, and evening Ganga Aarti ceremony in Varanasi.' }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen py-6 sm:py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row h-[760px]">

          {/* Chat History Sidebar (Desktop) */}
          <div className="w-full md:w-72 bg-gray-50 dark:bg-gray-800/40 border-r border-gray-100 dark:border-gray-800 flex flex-col justify-between p-4 flex-shrink-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-bold text-gray-400">
                  Conversations
                </span>
                <button
                  onClick={handleNewChat}
                  className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 hover:bg-primary-100 text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Start New Chat"
                >
                  <Plus size={14} /> New Chat
                </button>
              </div>

              {/* Chat List */}
              <div className="space-y-1.5 overflow-y-auto max-h-[500px]">
                {chats.length > 0 ? (
                  chats.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => handleSelectChat(c._id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-medium truncate transition-colors flex items-center gap-2 ${
                        activeChatId === c._id
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <MessageSquare size={13} className="flex-shrink-0" />
                      <span className="truncate">{c.title || 'Travel Query'}</span>
                    </button>
                  ))
                ) : (
                  <div className="text-[11px] text-gray-400 py-6 text-center">
                    {user ? 'No past conversations saved.' : 'Sign in to save chat history.'}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Bottom Controls */}
            {chats.length > 0 && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleClearHistory}
                  className="w-full py-2 px-3 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl flex items-center justify-center gap-1.5 transition-colors font-medium"
                >
                  <Trash2 size={13} /> Clear All Chats
                </button>
              </div>
            )}
          </div>

          {/* Main Chat Interface */}
          <div className="flex-1 flex flex-col justify-between h-full bg-white dark:bg-gray-900">

            {/* Chat Top Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 text-white flex items-center justify-center shadow-md">
                  <Bot size={22} />
                </div>
                <div>
                  <h2 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-1.5">
                    Smart Tourist Guide <Sparkles size={16} className="text-amber-400" />
                  </h2>
                  <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    LLaMA 3.1 8B Instant • Tourism Trained
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNewChat}
                className="text-xs hidden sm:flex items-center gap-1"
              >
                <Plus size={14} /> New Conversation
              </Button>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, index) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAssistant && (
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/70 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot size={16} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isAssistant
                          ? 'bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-800 shadow-sm rounded-tl-none'
                          : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md rounded-tr-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>

                    {!isAssistant && (
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {loading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Generating travel advice...</span>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Inspiration Chips */}
            {messages.length <= 2 && (
              <div className="px-6 py-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestionPrompts.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(sug.prompt)}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-primary-50 dark:hover:bg-primary-950/40 border border-gray-100 dark:border-gray-800 text-left text-xs transition-colors group"
                  >
                    <span className="font-bold text-gray-900 dark:text-white block group-hover:text-primary-600">
                      💡 {sug.label}
                    </span>
                    <span className="text-[11px] text-gray-500 line-clamp-1">
                      {sug.prompt}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about travel destinations, road routes, budget stays, or activities..."
                className="flex-1 text-xs sm:text-sm p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 font-medium"
              />
              <Button
                type="submit"
                disabled={!input.trim() || loading}
                size="lg"
                className="px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md"
              >
                <Send size={16} />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
