'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  Headphones,
  RotateCcw,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { CLINIC_INFO } from '@/lib/constants';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  isEmergency?: boolean;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init-1',
  role: 'assistant',
  text: `Hello! Welcome to VSHMA 🌿\n\nI'm your virtual clinic assistant.\n\nI can help you understand our clinic services, consultation procedures and appointment booking.\n\nHow can I assist you today?`,
};

const SUGGESTED_QUESTIONS = [
  'How do I book an appointment?',
  'What are the clinic timings?',
  'Where is the clinic located?',
  'Tell me about the doctor.',
  'I want to request a consultation.',
];

export default function VshmaCareAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const msgCounterRef = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    msgCounterRef.current += 1;
    const userMessage: ChatMessage = {
      id: `u-${msgCounterRef.current}`,
      role: 'user',
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });

      const data = await response.json();

      msgCounterRef.current += 1;
      const assistantMessage: ChatMessage = {
        id: `a-${msgCounterRef.current}`,
        role: 'assistant',
        text: data.reply || 'I am happy to assist you with any questions regarding VSHMA Clinic.',
        isEmergency: data.emergency,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      msgCounterRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${msgCounterRef.current}`,
          role: 'assistant',
          text: 'I am temporarily unable to respond. You can always message our clinic team directly on WhatsApp (+91 7416001477).',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-24 right-5 sm:right-8 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open VSHMA Care Assistant"
          className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-forest hover:bg-forest-light text-white shadow-2xl border border-gold/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-bronze shrink-0" />
          <span className="text-xs font-semibold tracking-wide font-sans">
            Care Assistant
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        </button>
      </div>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-4 sm:right-8 z-50 w-[92vw] sm:w-[410px] h-[580px] max-h-[85vh] rounded-[2rem] bg-white border border-sage/30 shadow-[0_25px_60px_-15px_rgba(24,61,50,0.35)] flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-forest text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gold/50 shadow-inner bg-forest-dark">
                  <Image
                    src="/logo-transparent.png"
                    alt="VSHMA Emblem"
                    fill
                    sizes="36px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm sm:text-base text-ivory leading-tight">
                    VSHMA Care Assistant
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-sage-light font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Clinic Virtual Guide &bull; Bengaluru</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset conversation"
                  className="p-1.5 rounded-xl hover:bg-white/10 text-sage-light hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close assistant"
                  className="p-1.5 rounded-xl hover:bg-white/10 text-sage-light hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-ivory/60">
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                        isAssistant
                          ? 'bg-forest text-gold border border-gold/30'
                          : 'bg-gold text-forest-deep font-bold'
                      }`}
                    >
                      {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[82%] ${
                        isAssistant
                          ? msg.isEmergency
                            ? 'bg-red-50 border border-red-200 text-red-900 font-medium'
                            : 'bg-white border border-sage/25 text-charcoal shadow-xs'
                          : 'bg-forest text-white shadow-xs'
                      }`}
                    >
                      {msg.isEmergency && (
                        <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs mb-1">
                          <ShieldAlert className="w-4 h-4" />
                          <span>Emergency Notice</span>
                        </div>
                      )}
                      <div className="whitespace-pre-line">{msg.text}</div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-charcoal/60 pl-9">
                  <div className="w-2 h-2 rounded-full bg-forest animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-forest animate-bounce delay-150" />
                  <div className="w-2 h-2 rounded-full bg-forest animate-bounce delay-300" />
                  <span className="text-[11px] font-medium text-sage-dark">Consulting clinic knowledge base...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Question Chips (visible when history is short) */}
            {messages.length <= 3 && !isLoading && (
              <div className="px-4 py-2 bg-white/90 border-t border-sage/15 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold shrink-0">
                  Ask:
                </span>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="px-3 py-1 rounded-full bg-ivory hover:bg-forest hover:text-white border border-sage/25 text-[11px] text-charcoal/80 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar & Human Handoff */}
            <div className="p-3 bg-white border-t border-sage/20 space-y-2 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask a question or request appointment..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-full bg-ivory border border-sage/30 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-forest hover:bg-forest-light text-white flex items-center justify-center shrink-0 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-gold" />
                </button>
              </form>

              <div className="flex items-center justify-between text-[11px] text-charcoal/60 px-2">
                <span>Not a medical doctor &bull; No prescriptions</span>
                <a
                  href={CLINIC_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-semibold"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Talk to Clinic Team</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
