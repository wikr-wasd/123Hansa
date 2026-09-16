import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertCircle, Loader2, Send } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  subscribeToMessages,
  type Conversation,
  type Message,
} from '../../services/messageService';

// Meddelanden mellan köpare och säljare, efter att säljaren accepterat
// intresseanmälan. Plattformen är inte part i samtalet — den förmedlar det.

const MessagesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get('samtal');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((item) => item.interestId === activeId) ?? null;

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await fetchConversations();
      setConversations(list);
      if (!activeId && list.length > 0) {
        setSearchParams({ samtal: list[0].interestId }, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte hämta dina samtal');
    } finally {
      setIsLoading(false);
    }
    // activeId med flit utanför: listan ska inte laddas om när man byter samtal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSearchParams]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let active = true;
    setIsLoadingMessages(true);
    fetchMessages(activeId)
      .then((list) => {
        if (active) setMessages(list);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Kunde inte hämta meddelandena');
      })
      .finally(() => {
        if (active) setIsLoadingMessages(false);
      });

    // Nya meddelanden kommer direkt, utan omladdning.
    const unsubscribe = subscribeToMessages(activeId, (message) => {
      setMessages((current) =>
        current.some((existing) => existing.id === message.id) ? current : [...current, message]
      );
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeId || draft.trim().length === 0) return;

    setIsSending(true);
    try {
      const sent = await sendMessage(activeId, draft);
      setMessages((current) =>
        current.some((existing) => existing.id === sent.id) ? current : [...current, sent]
      );
      setDraft('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Meddelandet kunde inte skickas');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Meddelanden – 123Hansa</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Meddelanden</h1>

          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-20 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              <span>Hämtar dina samtal…</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6" role="alert">
              <p className="mb-3 flex items-center gap-2 font-semibold text-red-800">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
                {error}
              </p>
              <button
                type="button"
                onClick={loadConversations}
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
              >
                Försök igen
              </button>
            </div>
          )}

          {!isLoading && !error && conversations.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <h2 className="mb-2 text-lg font-semibold text-gray-900">Inga samtal än</h2>
              <p className="text-gray-600">
                Ett samtal öppnas när en säljare accepterat din intresseanmälan, eller när du själv
                accepterat någon annans. Du hanterar intresseanmälningar på{' '}
                <Link to="/dashboard" className="font-medium text-blue-600 hover:text-blue-800">
                  Min sida
                </Link>
                .
              </p>
            </div>
          )}

          {!isLoading && !error && conversations.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <nav className="space-y-2" aria-label="Samtal">
                {conversations.map((conversation) => {
                  const isActive = conversation.interestId === activeId;
                  return (
                    <button
                      key={conversation.interestId}
                      type="button"
                      onClick={() => setSearchParams({ samtal: conversation.interestId })}
                      className={`w-full rounded-xl border p-4 text-left transition-colors ${
                        isActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <p className="mb-1 font-semibold text-gray-900">{conversation.counterpartName}</p>
                      <p className="mb-1 text-sm text-gray-600">{conversation.listingTitle}</p>
                      <p className="text-xs text-gray-500">
                        {conversation.iAmBuyer ? 'Du visade intresse' : 'Intresse på din annons'}
                      </p>
                    </button>
                  );
                })}
              </nav>

              <section className="flex min-h-[28rem] flex-col rounded-xl border border-gray-200 bg-white">
                {active && (
                  <header className="border-b border-gray-200 p-4">
                    <h2 className="font-semibold text-gray-900">{active.counterpartName}</h2>
                    <Link
                      to={`/listings/${active.listingId}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {active.listingTitle}
                    </Link>
                  </header>
                )}

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {isLoadingMessages && (
                    <p className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Hämtar meddelanden…
                    </p>
                  )}

                  {!isLoadingMessages && messages.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Inga meddelanden än. Skriv det första.
                    </p>
                  )}

                  {messages.map((message) => {
                    const isMine = message.senderId === user?.id;
                    return (
                      <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            isMine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="whitespace-pre-line text-sm">{message.body}</p>
                          <p className={`mt-1 text-xs ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(message.createdAt).toLocaleString('sv-SE', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={handleSend} className="flex gap-3 border-t border-gray-200 p-4">
                  <label htmlFor="message-draft" className="sr-only">
                    Skriv ett meddelande
                  </label>
                  <textarea
                    id="message-draft"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        handleSend(event);
                      }
                    }}
                    rows={2}
                    maxLength={10000}
                    placeholder="Skriv ett meddelande. Enter skickar, skift + enter ger ny rad."
                    className="flex-1 resize-none rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || draft.trim().length === 0}
                    className="inline-flex items-center gap-2 self-end rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Send className="h-4 w-4" aria-hidden="true" />
                    )}
                    Skicka
                  </button>
                </form>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MessagesPage;
