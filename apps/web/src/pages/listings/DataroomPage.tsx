import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertCircle, ArrowLeft, Download, FileText, Loader2, Lock, Trash2, Upload } from 'lucide-react';
import {
  acceptNda,
  fetchAccessLog,
  fetchCurrentNda,
  fetchDocuments,
  hasAcceptedNda,
  publishNda,
  removeDocument,
  requestDownloadUrl,
  uploadDocument,
  type AccessLogEntry,
  type DataroomDocument,
  type ListingNda,
} from '../../services/dataroomService';
import { fetchListing, type Listing } from '../../services/listingService';
import { fetchMyListings } from '../../services/listingService';

// Datarummet. Köparen kommer in först efter accepterat intresse OCH accepterad
// aktuell version av sekretessavtalet — kontrollerat av databasen, inte av den
// här sidan. Varje öppnat dokument loggas, och loggen går inte att ändra.

const formatSize = (bytes: number | null): string => {
  if (bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DataroomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [listing, setListing] = useState<Listing | null>(null);
  const [isSeller, setIsSeller] = useState(false);
  const [documents, setDocuments] = useState<DataroomDocument[]>([]);
  const [nda, setNda] = useState<ListingNda | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [log, setLog] = useState<AccessLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [ndaDraft, setNdaDraft] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [listingData, mine, currentNda, docs] = await Promise.all([
        fetchListing(id),
        fetchMyListings(),
        fetchCurrentNda(id),
        fetchDocuments(id),
      ]);

      setListing(listingData);
      const seller = mine.some((item) => item.id === id);
      setIsSeller(seller);
      setNda(currentNda);
      setDocuments(docs);
      setAccepted(currentNda ? await hasAcceptedNda(currentNda.id) : false);
      setLog(seller ? await fetchAccessLog(id) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Datarummet kunde inte hämtas');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (key: string, action: () => Promise<void>, success: string) => {
    setBusy(key);
    try {
      await action();
      toast.success(success);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Åtgärden misslyckades');
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = async (document: DataroomDocument) => {
    setBusy(document.id);
    try {
      const url = await requestDownloadUrl(document.id);
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Dokumentet kunde inte hämtas');
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-gray-600">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        <span>Hämtar datarummet…</span>
      </div>
    );
  }

  const canRead = isSeller || (nda !== null && accepted);

  return (
    <>
      <Helmet>
        <title>Datarum – 123Hansa</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to={`/listings/${id}`}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Tillbaka till annonsen
          </Link>

          <h1 className="mb-1 text-2xl font-bold text-gray-900">Datarum</h1>
          <p className="mb-8 text-gray-600">{listing?.title ?? 'Annonsen'}</p>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-6" role="alert">
              <p className="mb-3 flex items-center gap-2 font-semibold text-red-800">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
                {error}
              </p>
              <button
                type="button"
                onClick={load}
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
              >
                Försök igen
              </button>
            </div>
          )}

          {/* Sekretessavtalet */}
          <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Sekretessavtal</h2>

            {isSeller ? (
              nda ? (
                <div>
                  <p className="mb-2 text-sm text-gray-600">
                    Version {nda.version}, publicerad{' '}
                    {new Date(nda.createdAt).toLocaleDateString('sv-SE')}. En ny version kräver att
                    köparna accepterar på nytt.
                  </p>
                  <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-sans text-sm text-gray-700">
                    {nda.body}
                  </pre>
                </div>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!id || ndaDraft.trim().length === 0) return;
                    act('nda', () => publishNda(id, ndaDraft), 'Sekretessavtalet är publicerat');
                    setNdaDraft('');
                  }}
                >
                  <p className="mb-3 text-sm text-gray-600">
                    Lägg in ditt eget sekretessavtal. Avtalet är mellan dig och köparen — 123Hansa är
                    inte part i det. Utan avtal kan ingen köpare se dokumenten.
                  </p>
                  <textarea
                    value={ndaDraft}
                    onChange={(event) => setNdaDraft(event.target.value)}
                    rows={8}
                    maxLength={50000}
                    placeholder="Klistra in avtalstexten här."
                    className="mb-3 w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={busy === 'nda' || ndaDraft.trim().length === 0}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    Publicera avtalet
                  </button>
                </form>
              )
            ) : nda ? (
              accepted ? (
                <p className="text-sm text-green-700">
                  Du har accepterat version {nda.version} av avtalet. Din åtkomst till dokumenten
                  loggas.
                </p>
              ) : (
                <div>
                  <pre className="mb-4 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-sans text-sm text-gray-700">
                    {nda.body}
                  </pre>
                  <button
                    type="button"
                    disabled={busy === 'accept'}
                    onClick={() => act('accept', () => acceptNda(nda.id), 'Avtalet är accepterat')}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    {busy === 'accept' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    Jag accepterar sekretessavtalet
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    Att du accepterat, vilken version och när sparas oföränderligt.
                  </p>
                </div>
              )
            ) : (
              <p className="text-sm text-gray-600">
                Säljaren har inte lagt in något sekretessavtal än. Dokumenten öppnas först då.
              </p>
            )}
          </section>

          {/* Dokumenten */}
          <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Dokument</h2>
              {isSeller && (
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Ladda upp
                  <input
                    type="file"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file && id) {
                        act('upload', () => uploadDocument(id, file), 'Dokumentet är uppladdat');
                      }
                      event.target.value = '';
                    }}
                  />
                </label>
              )}
            </div>

            {!canRead && (
              <p className="flex items-start gap-2 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                <Lock className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                Dokumenten öppnas när säljaren gått vidare med din intresseanmälan och du accepterat
                sekretessavtalet.
              </p>
            )}

            {canRead && documents.length === 0 && (
              <p className="text-sm text-gray-600">Inga dokument i datarummet än.</p>
            )}

            {canRead && documents.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {documents.map((document) => (
                  <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <span className="flex items-center gap-3">
                      <FileText className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                      <span>
                        <span className="block font-medium text-gray-900">{document.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatSize(document.sizeBytes)} · {new Date(document.createdAt).toLocaleDateString('sv-SE')}
                        </span>
                      </span>
                    </span>

                    <span className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy === document.id}
                        onClick={() => handleDownload(document)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                      >
                        {busy === document.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Download className="h-4 w-4" aria-hidden="true" />
                        )}
                        Öppna
                      </button>
                      {isSeller && (
                        <button
                          type="button"
                          disabled={busy === document.id}
                          onClick={() => {
                            if (window.confirm(`Ta bort ${document.name} ur datarummet?`)) {
                              act(document.id, () => removeDocument(document.id), 'Dokumentet är borttaget');
                            }
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          aria-label={`Ta bort ${document.name}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Åtkomstloggen — bara för säljaren */}
          {isSeller && (
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-1 text-lg font-semibold text-gray-900">Vem har öppnat vad</h2>
              <p className="mb-4 text-sm text-gray-600">
                Loggen är oföränderlig. Varken du, köparen eller 123Hansa kan ändra eller ta bort en
                post.
              </p>

              {log.length === 0 ? (
                <p className="text-sm text-gray-600">Ingen har öppnat något dokument än.</p>
              ) : (
                <ul className="divide-y divide-gray-100 text-sm">
                  {log.map((entry) => (
                    <li key={entry.id} className="flex flex-wrap justify-between gap-2 py-2">
                      <span className="text-gray-900">
                        {entry.userName} öppnade <strong>{entry.documentName}</strong>
                      </span>
                      <span className="text-gray-500">
                        {new Date(entry.accessedAt).toLocaleString('sv-SE', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default DataroomPage;
