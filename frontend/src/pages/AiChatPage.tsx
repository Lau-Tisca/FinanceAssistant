import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Bot,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import { aiApi } from '../api/aiApi';
import { getErrorMessage } from '../api/client';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import type { AnalyzeTransactionsResponseDTO, ChatDTO, MessageDTO } from '../types';

export function AiChatPage() {
  const { user } = useAuth();

  const [chats, setChats] = useState<ChatDTO[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);

  const [newChatTitle, setNewChatTitle] = useState('');
  const [promptInput, setPromptInput] = useState('');

  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [analysis, setAnalysis] = useState<AnalyzeTransactionsResponseDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadChats = useCallback(async () => {
    setIsLoadingChats(true);
    setError(null);
    try {
      const list = await aiApi.listChats();
      setChats(list);
      setActiveChatId((prev) => {
        if (prev && list.some((c) => c.id === prev)) return prev;
        return list.length > 0 ? list[0].id : null;
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load chat sessions.'));
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  const loadMessages = useCallback(async (chatId: number) => {
    setIsLoadingMessages(true);
    setError(null);
    try {
      const list = await aiApi.getMessages(chatId);
      setMessages(list);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load messages.'));
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (activeChatId !== null) {
      void loadMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId, loadMessages]);

  const handleCreateChat = async (e: FormEvent) => {
    e.preventDefault();
    const title = newChatTitle.trim() || `Session ${chats.length + 1}`;
    setError(null);
    try {
      const created = await aiApi.createChat({ title });
      setNewChatTitle('');
      setChats((prev) => [created, ...prev]);
      setActiveChatId(created.id);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create chat session.'));
    }
  };

  const handleDeleteChat = async (id: number) => {
    setError(null);
    try {
      await aiApi.deleteChat(id);
      const remaining = chats.filter((c) => c.id !== id);
      setChats(remaining);
      if (activeChatId === id) {
        setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete chat session.'));
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (activeChatId === null || !promptInput.trim()) return;

    setIsSending(true);
    setError(null);
    try {
      await aiApi.addMessage(activeChatId, {
        role: 'USER',
        content: promptInput.trim(),
      });
      setPromptInput('');
      await loadMessages(activeChatId);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send message.'));
    } finally {
      setIsSending(false);
    }
  };

  const handleAnalyzeSpending = async () => {
    if (!user) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await aiApi.analyzeTransactions({
        email: user.email,
      });
      setAnalysis(result);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to analyze spending.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AI Financial Advisor
            </h1>
            <p className="text-sm text-slate-500">
              Chat with your assistant and run AI-powered spending analysis.
            </p>
          </div>
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleAnalyzeSpending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>Analyze My Spending</span>
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {analysis && (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Spending Analysis ({analysis.transactionCount} transactions)
              </h2>
              <button
                type="button"
                onClick={() => setAnalysis(null)}
                className="text-xs font-medium text-emerald-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-emerald-950">
              {analysis.aiAnalysis}
            </p>
          </section>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs lg:col-span-4">
            <form onSubmit={handleCreateChat} className="mb-4 flex gap-2">
              <input
                type="text"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                placeholder="New chat title..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                aria-label="Create new chat"
              >
                <Plus className="h-4 w-4" />
                <span>New</span>
              </button>
            </form>

            {isLoadingChats ? (
              <div className="flex items-center justify-center py-10 text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-indigo-600" />
                Loading sessions...
              </div>
            ) : chats.length === 0 ? (
              <p className="py-10 text-center text-xs text-slate-500">
                No chat sessions yet. Create one above to begin.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {chats.map((chat) => {
                  const active = chat.id === activeChatId;
                  return (
                    <li
                      key={chat.id}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? 'bg-indigo-50 font-semibold text-indigo-700'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveChatId(chat.id)}
                        className="flex flex-1 items-center gap-2 truncate text-left"
                      >
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        <span className="truncate">{chat.title}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteChat(chat.id)}
                        className="ml-2 rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Delete chat ${chat.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          {/* Message Window */}
          <section className="flex h-[540px] flex-col rounded-2xl border border-slate-200 bg-white shadow-xs lg:col-span-8">
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {activeChatId === null ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                  <Bot className="mb-2 h-10 w-10" />
                  <p className="text-sm font-medium text-slate-600">
                    Select or create a chat session to start
                  </p>
                </div>
              ) : isLoadingMessages ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-indigo-600" />
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                  <MessageSquare className="mb-2 h-8 w-8" />
                  <p className="text-sm text-slate-500">
                    No messages yet. Ask a financial question below.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role.toUpperCase() === 'USER';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                          <Bot className="h-4 w-4" />
                        </span>
                      )}
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isUser
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-200 bg-slate-50 text-slate-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {isUser && (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                          <User className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 border-t border-slate-200 p-4"
            >
              <input
                type="text"
                disabled={activeChatId === null || isSending}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Ask about budgeting, savings, or expenses..."
                className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:bg-slate-50"
              />
              <button
                type="submit"
                disabled={activeChatId === null || isSending || !promptInput.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Send</span>
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
