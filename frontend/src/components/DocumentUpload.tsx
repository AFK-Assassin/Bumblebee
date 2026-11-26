"use client";
import { useState, useRef } from "react";
import { Upload, Loader2, FileText, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { uploadDocument, getDocuments, deleteDocument } from "@/lib/api";
import type { Document } from "@/types";
import { useEffect } from "react";

export default function DocumentUpload() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<Document[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDocs = async () => {
    try { setDocs(await getDocuments()); } catch {}
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async () => {
    if (!title.trim() || !text.trim()) {
      showToast("Title and text are required.", "err"); return;
    }
    setLoading(true);
    try {
      const res = await uploadDocument(title.trim(), text.trim());
      showToast(`✅ "${res.title}" stored with ${res.chunks} chunk(s)!`, "ok");
      setTitle(""); setText("");
      await fetchDocs();
    } catch (e: unknown) {
      showToast(`❌ ${e instanceof Error ? e.message : "Upload failed"}`, "err");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteDocument(id);
      showToast(`Deleted "${title}"`, "ok");
      await fetchDocs();
    } catch {
      showToast("Failed to delete.", "err");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-5 space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-xl animate-fade-up ${
          toast.type === "ok"
            ? "bg-green-900/80 border border-green-500 text-green-300"
            : "bg-red-900/80 border border-red-500 text-red-300"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Upload Form */}
      <div className="bg-bee-card border border-bee-border rounded-xl p-5 space-y-4">
        <h2 className="text-xs font-semibold text-bee-yellow tracking-widest">UPLOAD DOCUMENT</h2>
        <div>
          <label className="text-[10px] text-bee-muted tracking-widest block mb-1">TITLE</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Operating Systems Notes"
            className="bee-glow w-full bg-bee-dark border border-bee-border rounded-lg px-3 py-2 text-sm text-bee-text placeholder-bee-muted focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-bee-muted tracking-widest block mb-1">CONTENT</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste any text, notes, article, or document content here…"
            rows={8}
            className="bee-glow w-full resize-none bg-bee-dark border border-bee-border rounded-lg px-3 py-2 text-sm text-bee-text placeholder-bee-muted focus:outline-none leading-relaxed"
          />
          <p className="text-[10px] text-bee-muted mt-1">
            {text.trim().split(/\s+/).filter(Boolean).length} words · auto-chunked into 250-word segments
          </p>
        </div>
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-bee-yellow to-bee-amber text-bee-dark text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-bee-yellow/20"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {loading ? "Embedding…" : "Embed & Store"}
        </button>
      </div>

      {/* Document List */}
      <div className="bg-bee-card border border-bee-border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-bee-yellow tracking-widest">STORED DOCUMENTS</h2>
          <span className="text-[10px] text-bee-muted">{docs.length} total</span>
        </div>
        {docs.length === 0 ? (
          <div className="text-center py-8 text-bee-muted text-sm">
            <FileText size={32} className="mx-auto mb-2 opacity-30" />
            <p>No documents yet. Upload one above!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div key={doc.id} className="border border-bee-border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-bee-border/40 transition-colors"
                  onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText size={14} className="text-bee-yellow flex-shrink-0" />
                    <span className="text-sm text-bee-text truncate">{doc.title}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[10px] text-bee-muted">{doc.chunk_count} chunk{doc.chunk_count !== 1 ? "s" : ""}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(doc.id, doc.title); }}
                      className="text-bee-muted hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                    {expanded === doc.id ? <ChevronDown size={13} className="text-bee-muted" /> : <ChevronRight size={13} className="text-bee-muted" />}
                  </div>
                </div>
                {expanded === doc.id && (
                  <div className="px-4 py-3 bg-bee-dark border-t border-bee-border text-[11px] text-bee-muted space-y-1">
                    <p><span className="text-bee-yellow">ID:</span> {doc.id}</p>
                    <p><span className="text-bee-yellow">Added:</span> {new Date(doc.created_at).toLocaleString()}</p>
                    <p><span className="text-bee-yellow">Chunks:</span> {doc.chunk_count}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
