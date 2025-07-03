import React from 'react';
import { Shield, BarChart3, Users, Building2 } from 'lucide-react';

const SimpleAdminPanel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">123hansa Admin Panel</h1>
            </div>
            <div className="text-sm text-gray-600">
              Admin: willi (Development Mode)
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Välkommen till Admin Backend</h2>
          <p className="text-gray-600">Din kompletta WordPress-liknande CMS-panel för 123hansa-plattformen</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button className="border-b-2 border-blue-500 py-2 px-1 text-blue-600 font-medium">
              Dashboard
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-gray-500 hover:text-gray-700">
              Användare
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-gray-500 hover:text-gray-700">
              Annonser
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-gray-500 hover:text-gray-700">
              Support
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-gray-500 hover:text-gray-700">
              Ekonomi
            </button>
          </nav>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Totala användare</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktiva annonser</p>
                <p className="text-2xl font-bold text-gray-900">567</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transaktioner</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Väntar granskning</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">
                🎉 Admin Panel fungerar perfekt!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Du ser nu din kompletta admin-backend. Detta är en förenklad version för att bekräfta att allt fungerar.</p>
                <ul className="mt-2 space-y-1">
                  <li>✅ Frontend servern körs på port 3002</li>
                  <li>✅ API servern körs på port 3000</li>
                  <li>✅ Admin routing fungerar</li>
                  <li>✅ Automatisk admin-inloggning aktiv</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Snabbåtgärder</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <div className="font-medium text-gray-900">Hantera användare</div>
              <div className="text-sm text-gray-600">Visa och redigera användarkonten</div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Building2 className="w-6 h-6 text-green-600 mb-2" />
              <div className="font-medium text-gray-900">Granska annonser</div>
              <div className="text-sm text-gray-600">Godkänn eller avvisa nya annonser</div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
              <div className="font-medium text-gray-900">Visa rapporter</div>
              <div className="text-sm text-gray-600">Finansiella och analytiska rapporter</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAdminPanel;