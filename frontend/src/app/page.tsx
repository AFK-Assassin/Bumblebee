"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import DocumentUpload from "@/components/DocumentUpload";
import SearchPanel from "@/components/SearchPanel";

type Tab = "chat" | "docs" | "search";

export default function Home() {
  const [tab, setTab] = useState<Tab>("chat");

  return (
    <div className="flex h-screen bg-bee-dark text-bee-text font-mono overflow-hidden">
      <Sidebar activeTab={tab} onTabChange={setTab} />
      <main className="flex-1 overflow-hidden">
        {tab === "chat"   && <ChatWindow />}
        {tab === "docs"   && <DocumentUpload />}
        {tab === "search" && <SearchPanel />}
      </main>
    </div>
  );
}
