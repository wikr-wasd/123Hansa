import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { User, Settings, Bell, Shield } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Profil
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Inställningar
              </button>
            </nav>
          </div>

          {/* Profile Tab Content */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Profilinformation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Namn</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">E-post</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab Content */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Kontoinställningar</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">E-postnotiser</h3>
                    <p className="text-sm text-gray-500">Få notiser om nya meddelanden</p>
                  </div>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm">
                    Aktiverat
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Snabbåtgärder</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/create-listing"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Skapa annons</h3>
                <p className="text-sm text-gray-500">Lägg till en ny annons</p>
              </div>
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Dashboard</h3>
                <p className="text-sm text-gray-500">Hantera dina annonser och aktiviteter</p>
              </div>
            </Link>
            <Link
              to="/messages"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Meddelanden</h3>
                <p className="text-sm text-gray-500">Hantera dina konversationer</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;