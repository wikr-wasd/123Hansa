import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';

import { Layout } from './components/layout/Layout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { useAuthStore } from './stores/authStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Lazy load pages for better performance
import { lazy } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const ListingsPage = lazy(() => import('./pages/listings/ListingsPage'));
const ListingDetailPage = lazy(() => import('./pages/listings/ListingDetailPage'));
const CreateListingPage = lazy(() => import('./pages/listings/CreateListingPage'));
const CreateListingPreview = lazy(() => import('./pages/listings/CreateListingPreview'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const MessagesPage = lazy(() => import('./pages/messages/MessagesPage'));
const ProfessionalServicesDemo = lazy(() => import('./pages/ProfessionalServicesDemo'));
const SalesDemo = lazy(() => import('./pages/demos/SalesDemo'));
const AdminPanel = lazy(() => import('./pages/admin/AuthenticatedAdminWrapper'));
const HelpPage = lazy(() => import('./pages/footer/HelpPage'));
const ContactPage = lazy(() => import('./pages/footer/ContactPage'));
const LegalPage = lazy(() => import('./pages/footer/LegalPage'));
const ValuationPage = lazy(() => import('./pages/listings/ValuationPage'));
const TestListingSubmission = lazy(() => import('./pages/test/TestListingSubmission'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Crowdfunding pages
const CrowdfundingHomePage = lazy(() => import('./pages/crowdfunding/CrowdfundingHomePage'));
const CampaignDetailPage = lazy(() => import('./pages/crowdfunding/CampaignDetailPage'));
const DiscoverCampaignsPage = lazy(() => import('./pages/crowdfunding/DiscoverCampaignsPage'));
const CreateCampaignPage = lazy(() => import('./pages/crowdfunding/CreateCampaignPage'));

// Auth pages
const TestbedLogin = lazy(() => import('./pages/auth/TestbedLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <html lang="sv" />
        <title>123hansa.se - Nordic Business Marketplace</title>
        <meta name="description" content="123hansa.se - The premier platform for buying and selling businesses in Sweden, Norway, and Denmark." />
      </Helmet>
      
      <Layout>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="/professional-services" element={<ProfessionalServicesDemo />} />
            <Route path="/sales-demo" element={<SalesDemo />} />
            <Route path="/kraken" element={<AdminPanel />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/terms" element={<LegalPage />} />
            <Route path="/privacy" element={<LegalPage />} />
            <Route path="/cookies" element={<LegalPage />} />
            <Route path="/gdpr" element={<LegalPage />} />
            <Route path="/valuation" element={<ValuationPage />} />
            <Route path="/test-submission" element={<TestListingSubmission />} />
            <Route path="/create-listing" element={<CreateListingPreview />} />
            
            {/* Auth routes */}
            <Route path="/testbed" element={<TestbedLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Crowdfunding routes */}
            <Route path="/crowdfunding" element={<CrowdfundingHomePage />} />
            <Route path="/crowdfunding/discover" element={<DiscoverCampaignsPage />} />
            <Route path="/crowdfunding/campaigns/:id" element={<CampaignDetailPage />} />
            
            {/* Protected routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/create-listing-form" element={
              <ProtectedRoute>
                <CreateListingPage />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/crowdfunding/create" element={
              <ProtectedRoute>
                <CreateCampaignPage />
              </ProtectedRoute>
            } />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  );
}

export default App;