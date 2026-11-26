export interface Document {
  id: string;
  title: string;
  chunk_count: number;
  created_at: string;
}

export interface ContextChip {
  chunk_id: number;
  document_id: string;
  title: string;
  text: string;
  distance: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  contexts?: ContextChip[];
  model?: string;
  timestamp: Date;
}

export interface ChatResponse {
  answer: string;
  model: string;
  contexts: ContextChip[];
  question: string;
}

export interface SearchResult {
  chunk_id: number;
  document_id: string;
  title: string;
  text: string;
  distance: number;
}

export interface StatusInfo {
  ollama_online: boolean;
  embed_model: string;
  gen_model: string;
  document_count: number;
  chunk_count: number;
  db_connected: boolean;
  name: string;
  version: string;
}
