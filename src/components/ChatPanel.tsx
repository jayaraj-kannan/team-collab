"use client"

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, User, Bot, Loader2 } from "lucide-react";
import { chatWithAssistant } from "@/app/chat-actions";

export default function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatWithAssistant(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong. Please check your API key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-primary"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          borderRadius: '50%',
          width: 56,
          height: 56,
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 100,
          padding: 0
        }}
      >
        <Sparkles size={24} />
      </button>

      {/* Slide-over Panel */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : -400,
          width: 400,
          height: '100vh',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.2)'
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="white" />
            </div>
            <h3 style={{ fontSize: 16, margin: 0 }}>AI Workspace Assistant</h3>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                "Ask me about your schedule or tasks!"
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              gap: 12, 
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{ 
                width: 28, 
                height: 28, 
                borderRadius: 6, 
                background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {msg.role === 'user' ? <User size={14} color="white" /> : <Bot size={14} color="var(--primary)" />}
              </div>
              <div style={{ 
                background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface-hover)',
                padding: '12px 16px',
                borderRadius: 12,
                fontSize: 14,
                lineHeight: 1.5,
                maxWidth: '80%',
                color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                borderBottomRightRadius: msg.role === 'user' ? 2 : 12,
                borderBottomLeftRadius: msg.role === 'user' ? 12 : 2,
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={14} color="var(--primary)" />
              </div>
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--surface-hover)', display: 'flex', alignItems: 'center' }}>
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} style={{ padding: 24, borderTop: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              style={{
                width: '100%',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '12px 48px 12px 16px',
                color: 'var(--text-main)',
                fontSize: 14,
                outline: 'none'
              }}
            />
            <button 
              type="submit"
              disabled={isLoading}
              style={{
                position: 'absolute',
                right: 8,
                background: 'var(--primary)',
                border: 'none',
                borderRadius: 8,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
