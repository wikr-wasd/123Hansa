import React from 'react';
import { Helmet } from 'react-helmet-async';
import { NotificationCenter } from '../components/notifications/NotificationCenter';

const NotificationsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Notifikationer - 123hansa.se</title>
        <meta name="description" content="Hantera dina notifikationer och meddelanden på 123hansa.se" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Notifikationer</h1>
            <p className="mt-2 text-gray-600">
              Hantera dina notifikationer och håll dig uppdaterad om aktiviteter på plattformen.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <NotificationCenter />
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;