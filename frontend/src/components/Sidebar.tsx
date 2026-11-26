"use client";
import { useEffect, useState } from "react";
import { MessageSquare, Upload, Search, Activity } from "lucide-react";
import { getStatus } from "@/lib/api";
import type { StatusInfo } from "@/types";

type Tab = "chat" | "docs" | "search";

interface Props {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
}

export default function Sidebar({ activeTab, onTabChange }: Props) {
  const [status, setStatus] = useState<StatusInfo | null>(null);

  useEffect(() => {
    const fetch = () => getStatus().then(setStatus).catch(() => {});
    fetch();
    const id = setInterval(fetch, 10000);
    return () => clearInterval(id);
  }, []);

  const tabs = [
    { id: "chat" as Tab, label: "Chat", icon: MessageSquare },
    { id: "docs" as Tab, label: "Documents", icon: Upload },
    { id: "search" as Tab, label: "Search", icon: Search },
  ];

  return (
    <aside className="w-56 flex-shrink-0 bg-bee-card border-r border-bee-border flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-bee-border">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🐝</span>
          <div>
            <h1 className="text-sm font-bold text-bee-yellow tracking-widest">BUMBLEBEE</h1>
            <p className="text-[9px] text-bee-muted tracking-widest">PERSONAL AI</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 space-y-1 flex-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              activeTab === id
                ? "bg-bee-yellow/15 text-bee-yellow border border-bee-yellow/30"
                : "text-bee-muted hover:text-bee-text hover:bg-bee-border/40"
            }`}
          >
            <Icon size={15} />
            <span className="tracking-wide">{label}</span>
          </button>
        ))}
      </nav>

      {/* Status Panel */}
      <div className="px-4 py-4 border-t border-bee-border space-y-3">
        <div className="flex items-center gap-2">
          <Activity size={11} className="text-bee-muted" />
          <span className="text-[10px] text-bee-muted tracking-widest">SYSTEM STATUS</span>
        </div>
        <div className="space-y-2">
          <StatusRow label="Ollama" ok={status?.ollama_online} />
          <StatusRow label="Database" ok={status?.db_connected} />
        </div>
        {status && (
          <div className="space-y-1 pt-1">
            <InfoRow label="Docs" value={String(status.document_count)} />
            <InfoRow label="Chunks" value={String(status.chunk_count)} />
            <InfoRow label="LLM" value={status.gen_model} />
          </div>
        )}
        <p className="text-[9px] text-bee-muted/50 tracking-widest pt-1">v1.0.0</p>
      </div>
    </aside>
  );
}

function StatusRow({ label, ok }: { label: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-bee-muted">{label}</span>
      <span className={`text-[10px] font-medium flex items-center gap-1 ${ok ? "text-green-400" : "text-red-400"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
        {ok ? "online" : "offline"}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-bee-muted">{label}</span>
      <span className="text-[10px] text-bee-text truncate max-w-24 text-right">{value}</span>
    </div>
  );
}
