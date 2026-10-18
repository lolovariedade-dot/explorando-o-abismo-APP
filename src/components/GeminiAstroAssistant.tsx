import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, User, X, HelpCircle, Loader2, Minimize2, RefreshCcw } from 'lucide-react';
import { ChatMessage } from '../types';

interface GeminiAstroAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  contextTitle?: string;
}

export const GeminiAstroAssistant: React.FC<GeminiAstroAssistantProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  contextTitle
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-01',
      sender: 'gemini',
      text: `Olá! Sou o **Dr. Hélio Cósmico**, seu IA Astrofísico especializado em Buracos Negros, Relatividade Geral e observações da NASA (EHT, Chandra, JWST).\n\nComo posso ajudar você a desvendar os maiores enigmas do Universo hoje?`,
      timestamp: 'Agorinha'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle initial prompt injections from buttons in gallery / catalog / simulator
  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = textToSend || input;
    if (!promptText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          blackHoleContext: contextTitle || 'Astrofísica Geral de Buracos Negros'
        })
      });

      const data = await res.json();
      if (data.success) {
        const geminiMsg: ChatMessage = {
          id: 'gemini-' + Date.now(),
          sender: 'gemini',
          text: data.text,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, geminiMsg]);
      } else {
        throw new Error(data.error || 'Erro ao conectar ao modelo Gemini');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'error-' + Date.now(),
        sender: 'gemini',
        text: `**Erro Cósmico:** Não foi possível obter a resposta de astrofísica (${err.message}). Verifique sua conexão ou configuração de chave API.`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'O que aconteceria se o Sol virasse um buraco negro?',
    'Como a luz é curvada no Disco de Acreção?',
    'Qual a diferença entre buraco negro de Kerr e Schwarzschild?',
    'Como o Telescópio James Webb detecta buracos negros primordiais?'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex h-[600px] max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-cyan-500/40 bg-slate-950 shadow-2xl shadow-cyan-500/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-slate-900 to-[#022c36] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-slate-950 shadow-md shadow-cyan-500/30">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Dr. Hélio Cósmico • IA Astrofísico
            </h3>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              IA Gemini (NASA Science Grounding)
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Context Badge if active */}
      {contextTitle && (
        <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-1.5 text-xs text-cyan-300 flex items-center justify-between">
          <span>Contexto da Consulta: <strong>{contextTitle}</strong></span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                m.sender === 'user'
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-gradient-to-br from-cyan-400 to-emerald-500 text-slate-950 shadow-sm'
              }`}
            >
              {m.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'rounded-tr-none bg-cyan-500/20 border border-cyan-500/40 text-cyan-100'
                  : 'rounded-tl-none bg-slate-900 border border-slate-800 text-slate-200'
              }`}
            >
              <div className="space-y-2 whitespace-pre-wrap">
                {m.text}
              </div>
              <span className="mt-1 block text-[10px] text-slate-500">
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 p-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Dr. Hélio Cósmico está calculando física relativística...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length < 4 && !loading && (
        <div className="border-t border-slate-800/80 bg-slate-900/60 px-4 py-2">
          <span className="text-[10px] font-semibold text-slate-400 block mb-1">
            Dúvidas mais fascinantes:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 transition hover:border-cyan-500/50 hover:bg-slate-700 hover:text-white text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="border-t border-slate-800 bg-slate-950 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Pergunte sobre horizontes de eventos, tempo..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-600 text-white shadow-md shadow-cyan-500/20 transition hover:from-cyan-600 hover:to-teal-600 disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
