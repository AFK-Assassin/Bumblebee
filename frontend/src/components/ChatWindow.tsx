"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { askBumblebee, clearChatHistory } from "@/lib/api";
import type { ChatMessage, ContextChip } from "@/types";

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hey! I'm Bumblebee 🐝 — your personal AI assistant. Upload documents and ask me anything about them, or just chat!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [topK, setTopK] = useState(3);
  const [openCtx, setOpenCtx] = useState<Record<string, boolean>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const toggleCtx = (key: string) =>
    setOpenCtx((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: q,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await askBumblebee(q, topK);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        contexts: data.contexts,
        model: data.model,
        timestamp: new Date(),
      };
      setMessages((m) => [...m, aiMsg]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setMessages((m) => [
        ...m,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `❌ Error: ${msg}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleClear = async () => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "Chat cleared! What would you like to know? 🐝",
      timestamp: new Date(),
    }]);
    await clearChatHistory().catch(() => {});
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-bee-border bg-bee-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐝</span>
          <div>
            <h2 className="text-sm font-semibold text-bee-yellow tracking-widest">BUMBLEBEE</h2>
            <p className="text-[10px] text-bee-muted tracking-wider">AI ASSISTANT</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[10px] text-bee-muted">Context chunks</label>
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="bg-bee-dark border border-bee-border text-bee-text text-xs rounded-md px-2 py-1 focus:outline-none focus:border-bee-yellow"
          >
            {[1,2,3,5,8].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button
            onClick={handleClear}
            className="text-bee-muted hover:text-red-400 transition-colors p-1"
            title="Clear chat"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}>
            {msg.role === "assistant" ? (
              <div className="max-w-[85%] space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🐝</span>
                  <span className="text-[10px] text-bee-muted tracking-widest">
                    {msg.model || "BUMBLEBEE"}
                  </span>
                </div>
                <div className="bg-bee-card border border-bee-border rounded-xl rounded-tl-none px-4 py-3 text-sm leading-relaxed text-bee-text whitespace-pre-wrap">
                  {msg.content}
                </div>
                {/* Context chips */}
                {msg.contexts && msg.contexts.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <p className="text-[10px] text-bee-muted tracking-widest mb-1">
                      RETRIEVED CONTEXT ({msg.contexts.length})
                    </p>
                    {msg.contexts.map((ctx: ContextChip, i: number) => {
                      const key = `${msg.id}-${i}`;
                      return (
                        <div key={key} className="border border-bee-border rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleCtx(key)}
                            className="w-full flex items-center justify-between px-3 py-2 text-[11px] text-bee-muted hover:bg-bee-border transition-colors"
                          >
                            <span className="text-left truncate">
                              #{i+1} {ctx.title}
                            </span>
                            <span className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-bee-yellow">{ctx.distance.toFixed(3)}</span>
                              {openCtx[key] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </span>
                          </button>
                          {openCtx[key] && (
                            <div className="px-3 py-2 text-[11px] text-bee-muted bg-bee-dark border-t border-bee-border leading-relaxed">
                              {ctx.text}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-[75%] bg-gradient-to-br from-bee-yellow to-bee-amber text-bee-dark px-4 py-3 rounded-xl rounded-tr-none text-sm font-medium leading-relaxed">
                {msg.content}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-up">
            <div className="bg-bee-card border border-bee-border rounded-xl rounded-tl-none px-4 py-3">
              <span className="typing text-bee-muted text-sm">Thinking</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-bee-border bg-bee-card">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Bumblebee anything… (Enter to send, Shift+Enter for newline)"
            rows={2}
            className="bee-glow flex-1 resize-none bg-bee-dark border border-bee-border rounded-xl px-4 py-3 text-sm text-bee-text placeholder-bee-muted focus:outline-none transition-all leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-bee-yellow to-bee-amber text-bee-dark flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-bee-yellow/20"
          >
            <Send size={18} strokeWidth={2.5} />
          </button>
        </div>
        <p className="text-[10px] text-bee-muted mt-2 text-right tracking-wide">
          Powered by Ollama · PostgreSQL · Next.js
        </p>
      </div>
    </div>
  );
}
