import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { AlertCircle, Bell, Loader2 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useViewerLocale } from '../hooks/useViewerLocale';
import { fetchNotifications, type Notification } from '../services/notificationService';

// Notiserna kommer ur det som faktiskt hänt: intresseanmälningar, svaren på
// dem, granskningen och meddelanden. Sidan visade tidigare påhittade notiser.

const KIND_KEYS: Record<Notification['kind'], string> = {
  'interest-received': 'notif.interest-received',
  'interest-accepted': 'notif.interest-accepted',
  'interest-declined': 'notif.interest-declined',
  'listing-published': 'notif.listing-published',
  'listing-rejected': 'notif.listing-rejected',
  'message-received': 'notif.message-received',
};

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const locale = useViewerLocale();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setNotifications(await fetchNotifications());
    } catch (err) {
      setError(err instanceof Error ? err.message : t('notif.error'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Helmet>
        <title>{`${t('notif.title')} – 123Hansa`}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-1 text-2xl font-bold text-gray-900">{t('notif.title')}</h1>
          <p className="mb-6 text-gray-600">{t('notif.subtitle')}</p>

          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-20 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              <span>{t('notif.loading')}</span>
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
                onClick={load}
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
              >
                {t('listings.retry')}
              </button>
            </div>
          )}

          {!isLoading && !error && notifications.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <Bell className="mx-auto mb-3 h-8 w-8 text-gray-300" aria-hidden="true" />
              <p className="text-gray-600">{t('notif.empty')}</p>
            </div>
          )}

          {!isLoading && !error && notifications.length > 0 && (
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <Link
                    to={notification.href}
                    className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-gray-50"
                  >
                    <span>
                      <span className="block font-medium text-gray-900">
                        {t(KIND_KEYS[notification.kind])}
                      </span>
                      <span className="text-sm text-gray-600">{notification.subject}</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.at).toLocaleString(locale, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
