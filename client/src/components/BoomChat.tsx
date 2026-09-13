import React, { FormEvent, useState, useRef, useEffect } from 'react';
import { Bot, MessageCircle, Send, X, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../api/client';

type Message = {
  from: 'boom' | 'visitor';
  text: string;
  timestamp?: string;
  mode?: 'ai' | 'knowledge-base';
};

const SUGGESTED_QUESTIONS = [
  'What services do you offer?',
  'What is the pricing?',
  'How do I book a service?',
  'How to track my video delivery?',
  'Contact Bharath Kumar'
];

export const BoomChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      from: 'boom',
      text: 'Hi! I’m Boom — a friend of Bharath at KBK Film Studios. Ask me about our wedding films, pre-wedding edits, pricing, booking, tracking, or delivery access!',
      timestamp: 'Just now'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  const handleSend = async (userText: string) => {
    const text = userText.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((current) => [
      ...current,
      { from: 'visitor', text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setLoading(true);

    try {
      const result = await api.askBoom(text);
      setMessages((current) => [
        ...current,
        {
          from: 'boom',
          text: result.reply,
          mode: result.mode,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setMessages((current) => [
        ...current,
        {
          from: 'boom',
          text: 'I can help you with KBK Films services, pricing, booking, tracking, deliveries, and contacting Bharath Kumar directly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <div className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 font-sans">
      {/* Floating Toggle Button */}
      {!open && (
        <button
          aria-label="Open Boom studio assistant"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold text-black font-bold shadow-[0_4px_25px_rgba(212,175,55,0.45)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.65)] px-4 py-2.5 sm:px-5 sm:py-3 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-black" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-emerald animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-emerald"></span>
          </div>
          <span className="text-xs sm:text-sm tracking-wide">Ask Boom</span>
        </button>
      )}

      {/* Chat Window Panel */}
      {open && (
        <section
          aria-label="Boom Studio Assistant Chat"
          className="w-[min(94vw,390px)] h-[520px] max-h-[85vh] flex flex-col overflow-hidden rounded-2xl border border-gold/30 bg-[#0d0d0c] shadow-[0_10px_40px_rgba(0,0,0,0.85)] animate-scaleIn backdrop-blur-xl"
        >
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3.5 border-b border-gold/20 bg-gradient-to-r from-black via-surface-300 to-black">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-ivory-100">Boom</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-gold/20 text-gold font-semibold uppercase tracking-wider">
                    AI Studio
                  </span>
                </div>
                <p className="text-[11px] text-ivory-400">Friend of Bharath • KBK Films</p>
              </div>
            </div>

            <button
              aria-label="Close chat window"
              onClick={() => setOpen(false)}
              className="p-1.5 text-ivory-400 hover:text-ivory-100 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-black/40 via-surface-300/20 to-black">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.from === 'visitor' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-md ${
                    m.from === 'visitor'
                      ? 'bg-gradient-to-br from-gold to-gold-dark text-black font-medium rounded-br-xs'
                      : 'bg-surface-200/95 border border-white/10 text-ivory-100 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                </div>
                {m.timestamp && (
                  <span className="text-[9.5px] text-ivory-400/70 mt-1 px-1">
                    {m.timestamp}
                  </span>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-gold/90 bg-surface-200/80 border border-gold/20 rounded-2xl px-3 py-2 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-gold" />
                <span>Boom is thinking…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Chips */}
          <div className="px-3 py-2 bg-black/60 border-t border-white/5 overflow-x-auto flex gap-1.5 scrollbar-none">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                disabled={loading}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap shrink-0 text-[10.5px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-gold/15 border border-white/10 hover:border-gold/40 text-ivory-300 hover:text-gold transition-all"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={onSubmit} className="flex items-center gap-2 p-3 bg-surface-300/90 border-t border-gold/20">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={600}
              placeholder="Ask about services, pricing, tracking..."
              className="flex-1 min-w-0 bg-black/50 border border-white/15 focus:border-gold rounded-xl px-3.5 py-2 text-xs sm:text-sm text-ivory-100 placeholder-ivory-400/60 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="p-2.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      )}
    </div>
  );
};

export default BoomChat;
