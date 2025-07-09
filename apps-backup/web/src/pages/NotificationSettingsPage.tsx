import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { NotificationSettings, notificationService } from '../services/messageService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const userSettings = await notificationService.getNotificationSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      toast.error('Kunde inte ladda notifikationsinställningar');
    } finally {
      setIsLoading(false);
    }
  };

  // Save settings
  const saveSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!settings) return;

    try {
      setIsSaving(true);
      const updatedSettings = await notificationService.updateNotificationSettings(newSettings);
      setSettings(updatedSettings);
      toast.success('Inställningar sparade');
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      toast.error('Kunde inte spara inställningar');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle setting change
  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    if (!settings) return;
    
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings({ [key]: value });
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-nordic-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-nordic-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-nordic-gray-900 mb-2">
            Kunde inte ladda inställningar
          </h2>
          <button
            onClick={loadSettings}
            className="btn-primary"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Notifikationsinställningar - Tubba</title>
        <meta name="description" content="Hantera dina notifikationsinställningar på Tubba" />
      </Helmet>

      <div className="min-h-screen bg-nordic-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-nordic-gray-900">
              Notifikationsinställningar
            </h1>
            <p className="mt-2 text-nordic-gray-600">
              Välj hur och när du vill få notifikationer från Tubba
            </p>
          </div>

          <div className="space-y-8">
            {/* Email Notifications */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-nordic-gray-900">
                  📧 E-postnotifikationer
                </h2>
                <p className="text-sm text-nordic-gray-600">
                  Få viktiga uppdateringar via e-post
                </p>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-nordic-gray-900">Meddelanden</h3>
                    <p className="text-sm text-nordic-gray-600">
                      Få e-post när du får nya meddelanden
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailMessages}
                      onChange={(e) => handleSettingChange('emailMessages', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-nordic-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nordic-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-nordic-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordic-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-nordic-gray-900">Förfrågningar</h3>
                    <p className="text-sm text-nordic-gray-600">
                      Få e-post när någon visar intresse för dina annonser
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailInquiries}
                      onChange={(e) => handleSettingChange('emailInquiries', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-nordic-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nordic-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-nordic-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordic-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-nordic-gray-900">Annonsuppdateringar</h3>
                    <p className="text-sm text-nordic-gray-600">
                      Få e-post när dina annonser ändrar status
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailListingUpdates}
                      onChange={(e) => handleSettingChange('emailListingUpdates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-nordic-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nordic-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-nordic-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordic-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-nordic-gray-900">Transaktioner</h3>
                    <p className="text-sm text-nordic-gray-600">
                      Få e-post om betalningar och transaktioner
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailTransactions}
                      onChange={(e) => handleSettingChange('emailTransactions', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-nordic-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nordic-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-nordic-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordic-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-nordic-gray-900">Marknadsföring</h3>
                    <p className="text-sm text-nordic-gray-600">
                      Få e-post om nya funktioner och erbjudanden
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailMarketing}
                      onChange={(e) => handleSettingChange('emailMarketing', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-nordic-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nordic-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-nordic-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordic-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* In-App Notifications */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-nordic-gray-900">
                  🔔 Notifikationer i appen
                </h2>
                <p className="text-sm text-nordic-gray-600">
                  Få notifikationer när du använder Tubba
                </p>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-nordic-gray-900">Meddelanden</h3>
                    <p className="text-sm text-nordic-gray-600">
                      Visa notifikationer för nya meddelanden
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.inAppMessages}
                      onChange={(e) => handleSettingChange('inAppMessages', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-nordic-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nordic-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-nordic-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordic-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-nordic-gray-900">Förfrågningar</h3>
                    <p className="text-sm text-nordic-gray-600">
                      Visa notifikationer för nya förfrågningar
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.inAppInquiries}
                      onChange={(e) => handleSettingChange('inAppInquiries', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-nordic-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nordic-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-nordic-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordic-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-nordic-gray-900">Annonsuppdateringar</h3>
                    <p className="text-sm text-nordic-gray-600">
                      Visa notifikationer för annonsändringar
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.inAppListingUpdates}
                      onChange={(e) => handleSettingChange('inAppListingUpdates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-nordic-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nordic-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-nordic-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordic-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-nordic-gray-900">Transaktioner</h3>
                    <p className="text-sm text-nordic-gray-600">
                      Visa notifikationer för transaktioner
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.inAppTransactions}
                      onChange={(e) => handleSettingChange('inAppTransactions', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-nordic-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nordic-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-nordic-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordic-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-nordic-gray-900">
                  🌙 Tystnadstider
                </h2>
                <p className="text-sm text-nordic-gray-600">
                  Ställ in när du inte vill få notifikationer
                </p>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-nordic-gray-700 mb-2">
                      Börjar
                    </label>
                    <input
                      type="time"
                      value={settings.quietHoursStart || ''}
                      onChange={(e) => handleSettingChange('quietHoursStart', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nordic-gray-700 mb-2">
                      Slutar
                    </label>
                    <input
                      type="time"
                      value={settings.quietHoursEnd || ''}
                      onChange={(e) => handleSettingChange('quietHoursEnd', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
                <p className="text-sm text-nordic-gray-600">
                  Under tystnadstiderna kommer du inte att få e-post eller push-notifikationer. 
                  Viktiga meddelanden kommer fortfarande att visas i appen.
                </p>
              </div>
            </div>

            {/* Language and Timezone */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-nordic-gray-900">
                  🌍 Språk och tidszon
                </h2>
                <p className="text-sm text-nordic-gray-600">
                  Anpassa notifikationer för ditt språk och plats
                </p>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-nordic-gray-700 mb-2">
                      Språk
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className="input-field"
                    >
                      <option value="sv">Svenska</option>
                      <option value="no">Norska</option>
                      <option value="da">Danska</option>
                      <option value="en">Engelska</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nordic-gray-700 mb-2">
                      Tidszon
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      className="input-field"
                    >
                      <option value="Europe/Stockholm">Stockholm (CET)</option>
                      <option value="Europe/Oslo">Oslo (CET)</option>
                      <option value="Europe/Copenhagen">Köpenhamn (CET)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="America/New_York">New York (EST)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading indicator */}
          {isSaving && (
            <div className="fixed bottom-4 right-4 bg-nordic-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
              <LoadingSpinner size="sm" />
              <span>Sparar...</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationSettingsPage;