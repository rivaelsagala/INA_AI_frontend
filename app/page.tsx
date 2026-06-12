'use client';

import { useState, useEffect, useRef } from 'react';

// Konfigurasi URL Backend Anda (Default Flask berjalan di port 5000)
const API_BASE_URL = 'http://localhost:5000/api';
// Hardcode user_id untuk simulasi (sesuaikan dengan sistem auth Anda nanti)
const CURRENT_USER_ID = 1;

// --- Types ---
interface Session {
  id: number;
  session_name: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatFrontend() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke pesan terbaru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Ambil semua sesi saat komponen dimuat
  useEffect(() => {
    fetchSessions();
  }, []);

  // 2. Ambil riwayat chat ketika sesi berubah
  useEffect(() => {
    if (currentSessionId) {
      fetchHistory(currentSessionId);
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat-sessions?user_id=${CURRENT_USER_ID}`);
      const data = await res.json();
      if (data.status === 'success') {
        setSessions(data.data);
      }
    } catch (error) {
      console.error('Gagal mengambil sesi:', error);
    }
  };

  const createSession = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: CURRENT_USER_ID,
          session_name: `Sesi Medis Baru ${new Date().toLocaleTimeString()}`,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        await fetchSessions();
        setCurrentSessionId(data.data.id);
      }
    } catch (error) {
      console.error('Gagal membuat sesi baru:', error);
    }
  };

  const fetchHistory = async (sessionId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat-history/${sessionId}`);
      const data = await res.json();
      if (data.status === 'success') {
        // Mapping data backend (user_query & llm_response) ke format UI (role & content)
        const formattedMessages: Message[] = [];
        data.data.forEach((item: any) => {
          formattedMessages.push({ role: 'user', content: item.user_query });
          formattedMessages.push({ role: 'assistant', content: item.llm_response });
        });
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Gagal mengambil riwayat chat:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentSessionId || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          session_id: currentSessionId,
          user_id: CURRENT_USER_ID,
          model_id: 1, // Default model meta-llama/Llama-3.1-8B-Instruct
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.status === 'success') {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
        
        // Opsional: Segarkan daftar sesi jika nama sesi mungkin diupdate otomatis
        fetchSessions();
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${data.error || data.message || 'Terjadi kesalahan.'}` },
        ]);
      }
    } catch (error) {
      console.error('Gagal mengirim pesan:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Gagal terhubung ke server. Pastikan backend Flask sudah berjalan.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus sesi ini?')) return;
    try {
      await fetch(`${API_BASE_URL}/chat-sessions/${sessionId}`, { method: 'DELETE' });
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
      fetchSessions();
    } catch (error) {
      console.error('Gagal menghapus sesi:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
      {/* SIDEBAR */}
      <div className="w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-xl font-bold text-teal-600 dark:text-teal-400 mb-4">INA AI Medical</h1>
          <button
            onClick={createSession}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
          >
            + Sesi Percakapan Baru
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sessions.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center mt-4">Belum ada sesi percakapan.</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setCurrentSessionId(session.id)}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  currentSessionId === session.id
                    ? 'bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <span className="truncate text-sm font-medium pr-2">
                  {session.session_name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hapus sesi"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col relative">
        {currentSessionId ? (
          <>
            {/* Header Area */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
              <h2 className="font-semibold text-lg">
                {sessions.find(s => s.id === currentSessionId)?.session_name || 'Percakapan Aktif'}
              </h2>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                  <div className="text-4xl mb-4">🏥</div>
                  <p>Ceritakan keluhan medis Anda di sini.</p>
                  <p className="text-sm text-zinc-400 mt-2">Asisten AI akan membantu memberikan informasi medis.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-teal-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-bl-none'
                      }`}
                    >
                      {/* Render text with basic newlines */}
                      {msg.content.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl rounded-bl-none px-5 py-4 flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
              <form
                onSubmit={sendMessage}
                className="max-w-4xl mx-auto relative flex items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tulis keluhan atau pertanyaan kesehatan Anda..."
                  disabled={isLoading}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-full py-3.5 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 transition-all shadow-sm"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 bg-zinc-50 dark:bg-zinc-950">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 text-zinc-300 dark:text-zinc-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <p className="text-lg">Silakan buat atau pilih sesi percakapan dari menu samping.</p>
          </div>
        )}
      </div>
    </div>
  );
}