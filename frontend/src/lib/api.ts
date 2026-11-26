const BASE = "/api";

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

// Status
export const getStatus = () => req<import("@/types").StatusInfo>("/status");

// Documents
export const getDocuments = () => req<import("@/types").Document[]>("/documents");

export const uploadDocument = (title: string, text: string) =>
  req<{ id: string; title: string; chunks: number; message: string }>("/documents", {
    method: "POST",
    body: JSON.stringify({ title, text }),
  });

export const deleteDocument = (id: string) =>
  req<{ message: string }>(`/documents/${id}`, { method: "DELETE" });

// Chat
export const askBumblebee = (question: string, top_k = 3) =>
  req<import("@/types").ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify({ question, top_k }),
  });

export const getChatHistory = (limit = 50) =>
  req<{ id: number; question: string; answer: string; model: string; created_at: string }[]>(
    `/chat/history?limit=${limit}`
  );

export const clearChatHistory = () =>
  req<{ message: string }>("/chat/history", { method: "DELETE" });

// Search
export const semanticSearch = (query: string, top_k = 5) =>
  req<{ results: import("@/types").SearchResult[]; query: string; total: number }>("/search", {
    method: "POST",
    body: JSON.stringify({ query, top_k }),
  });
