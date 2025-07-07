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
const ListingsPage = lazy(() => import('./pages/listings/ListingsPage'));
const ListingDetailPage = lazy(() => import('./pages/listings/ListingDetailPage'));
const CreateListingPage = lazy(() => import('./pages/listings/CreateListingPage'));
const CreateListingPreview = lazy(() => import('./pages/listings/CreateListingPreview'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const MessagesPage = lazy(() => import('./pages/messages/MessagesPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
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
const QuickTestRegister = lazy(() => import('./pages/auth/QuickTestRegister'));
const SimpleTestLogin = lazy(() => import('./pages/auth/SimpleTestLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'));

// Heart pages
const HeartPage = lazy(() => import('./pages/heart/HeartPage'));

function App() {
  const { isLoading } = useAuthStore();

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
            <Route path="/verify-email" element={<EmailVerificationPage />} />
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
            <Route path="/create-listing" element={
              <ProtectedRoute>
                <CreateListingPage />
              </ProtectedRoute>
            } />
            <Route path="/create-listing-preview" element={<CreateListingPreview />} />
            
            {/* Auth routes */}
            <Route path="/testbed" element={<TestbedLogin />} />
            <Route path="/testbed-login" element={<TestbedLogin />} />
            <Route path="/test-login" element={<SimpleTestLogin />} />
            <Route path="/simple-test-login" element={<SimpleTestLogin />} />
            <Route path="/quick-test-register" element={<QuickTestRegister />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Crowdfunding routes */}
            <Route path="/crowdfunding" element={<CrowdfundingHomePage />} />
            <Route path="/crowdfunding/discover" element={<DiscoverCampaignsPage />} />
            <Route path="/crowdfunding/campaigns/:id" element={<CampaignDetailPage />} />
            
            {/* Heart routes */}
            <Route path="/heart" element={<HeartPage />} />
            
            {/* Protected routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
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