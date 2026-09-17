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
const HelpPage = lazy(() => import('./pages/footer/HelpPage'));
const ContactPage = lazy(() => import('./pages/footer/ContactPage'));
const LegalPage = lazy(() => import('./pages/footer/LegalPage'));
const ValuationPage = lazy(() => import('./pages/listings/ValuationPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Granskningsvyn. Vem som kommer in avgörs av am_i_platform_admin() i
// databasen, och varje åtgärd kontrolleras dessutom av databasen själv.
const ReviewPage = lazy(() => import('./pages/admin/ReviewPage'));
const DataroomPage = lazy(() => import('./pages/listings/DataroomPage'));

// Auth pages
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'));

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
        <title>123hansa.se - Marknadsplats för företagsaffärer</title>
        <meta name="description" content="123hansa.se - Marknadsplatsen för att köpa och sälja företag och affärstillgångar." />
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
            <Route path="/help" element={<HelpPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/terms" element={<LegalPage />} />
            <Route path="/privacy" element={<LegalPage />} />
            <Route path="/cookies" element={<LegalPage />} />
            <Route path="/gdpr" element={<LegalPage />} />
            <Route path="/valuation" element={<ValuationPage />} />
            <Route path="/create-listing" element={
              <ProtectedRoute>
                <CreateListingPage />
              </ProtectedRoute>
            } />
            <Route path="/create-listing-preview" element={<CreateListingPreview />} />
            
            {/* Granskning — behörigheten kontrolleras i sidan och i databasen */}
            <Route path="/admin/review" element={
              <ProtectedRoute>
                <ReviewPage />
              </ProtectedRoute>
            } />
            
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
            <Route path="/listings/:id/datarum" element={
              <ProtectedRoute>
                <DataroomPage />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
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