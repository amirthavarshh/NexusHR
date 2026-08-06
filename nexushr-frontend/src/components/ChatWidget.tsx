import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, BrainCircuit, ChevronDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  sources?: string[];
  timestamp: string;
  error?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

// ── Sub-components ────────────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => (
  <div className="flex items-end gap-2 animate-fadeIn">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 shadow-md">
      <BrainCircuit size={13} className="text-white" />
    </div>
    <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-1 py-0.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
);

interface BubbleProps {
  msg: ChatMessage;
}

const Bubble: React.FC<BubbleProps> = ({ msg }) => {
  const [showSources, setShowSources] = useState(false);
  const isUser = msg.role === 'user';

  return (
    <div className={`flex items-end gap-2 animate-fadeIn ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 shadow-md">
          <BrainCircuit size={13} className="text-white" />
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-br-sm'
              : msg.error
              ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-bl-sm'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-bl-sm'
          }`}
        >
          {msg.error && <AlertCircle size={12} className="inline mr-1.5 shrink-0" />}
          {msg.text}
        </div>

        {/* Sources + timestamp row */}
        <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-slate-400">{formatTime(msg.timestamp)}</span>
          {!isUser && msg.sources && msg.sources.length > 0 && (
            <button
              onClick={() => setShowSources(!showSources)}
              className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              {showSources ? 'Hide' : msg.sources.length} source{msg.sources.length > 1 ? 's' : ''}
              <ChevronDown size={10} className={`transition-transform ${showSources ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Sources list */}
        {showSources && msg.sources && msg.sources.length > 0 && (
          <div className="flex flex-wrap gap-1 animate-fadeIn">
            {msg.sources.map((s) => (
              <span
                key={s}
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
              >
                📎 {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main ChatWidget ───────────────────────────────────────────────────────────

const INITIAL_BOT_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: "Hi! I'm NexusHR Assistant 👋\n\nI can help you with:\n• Leave & attendance policies\n• Payroll information\n• Your personal HR data\n• Goals and review queries\n\nWhat can I help you with today?",
  sources: [],
  timestamp: new Date().toISOString(),
};

const QUICK_PROMPTS = [
  'How do I apply for leave?',
  'What is the payroll formula?',
  'How many annual leave days do I have?',
  'What are the clock-in rules?',
];

export const ChatWidget: React.FC = () => {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_BOT_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Only show widget when logged in
  if (!session) return null;

  // Auto-scroll to bottom on new messages
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Focus input on open
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (open) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    const userText = text.trim();
    if (!userText || loading) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      text: userText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.chat(userText);
      const botMsg: ChatMessage = {
        id: uid(),
        role: 'bot',
        text: res.answer,
        sources: res.sources || [],
        timestamp: res.timestamp || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
      if (!open) setHasUnread(true);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: uid(),
        role: 'bot',
        text: 'Sorry, I couldn\'t reach the server. Please check your connection and try again.',
        sources: [],
        timestamp: new Date().toISOString(),
        error: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [loading, open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => setMessages([INITIAL_BOT_MESSAGE]);

  return (
    <>
      {/* ── Floating Trigger Button ───────────────────────────────────────── */}
      <button
        id="nexushr-chat-trigger"
        onClick={() => setOpen(!open)}
        aria-label="Open NexusHR Assistant"
        className={`fixed bottom-5 right-5 z-50 w-13 h-13 rounded-full shadow-xl flex items-center justify-center cursor-pointer transition-all duration-300
          bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700
          ${open ? 'scale-95 rotate-90' : 'scale-100 hover:scale-110'}
        `}
        style={{ width: 52, height: 52 }}
      >
        {open ? (
          <X size={20} className="text-white" />
        ) : (
          <MessageCircle size={20} className="text-white" />
        )}
        {/* Unread dot */}
        {hasUnread && !open && (
          <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
        )}
        {/* Ping ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
        )}
      </button>

      {/* ── Chat Panel ───────────────────────────────────────────────────── */}
      {open && (
        <div
          id="nexushr-chat-panel"
          className="fixed bottom-20 right-5 z-50 w-[380px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-fadeIn"
          style={{ height: 520 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <BrainCircuit size={15} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">NexusHR Assistant</p>
              <p className="text-[10px] text-slate-400">AI-Powered HR Helper</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RefreshCw size={13} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900 scroll-smooth">
            {messages.map((msg) => (
              <Bubble key={msg.id} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts (only when no user messages yet) */}
          {messages.length === 1 && !loading && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2 bg-slate-50 dark:bg-slate-900 shrink-0">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-[10px] font-semibold px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Row */}
          <div className="flex items-center gap-2 p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
            <input
              ref={inputRef}
              id="nexushr-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              onKeyDown={handleKeyDown}
              placeholder="Ask about leave, payroll, policies…"
              disabled={loading}
              className="flex-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none focus:border-amber-400 dark:focus:border-amber-500 transition-colors disabled:opacity-50"
            />
            <button
              id="nexushr-chat-send"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center py-1.5 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 shrink-0">
            <span className="text-[9px] text-slate-400">NexusHR Assistant · Policy answers only · Not a human</span>
          </div>
        </div>
      )}
    </>
  );
};
