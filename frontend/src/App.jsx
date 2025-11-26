import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Button from './components/ui/Button';
import { Loader2 } from 'lucide-react';

// Eager load critical pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Lazy load other pages
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const UpdatePasswordPage = lazy(() => import('./pages/auth/UpdatePasswordPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ChatPage = lazy(() => import('./pages/dashboard/ChatPage'));
const SkillMarketplace = lazy(() => import('./pages/dashboard/SkillMarketplace'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminUserManagement = lazy(() => import('./pages/admin/AdminUserManagement'));
const AdminSkillManagement = lazy(() => import('./pages/admin/AdminSkillManagement'));
const AdminExchangeModeration = lazy(() => import('./pages/admin/AdminExchangeModeration'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));

// Static Pages - lazy loaded
const HowItWorksPage = lazy(() => import('./pages/static/HowItWorksPage'));
const PricingPage = lazy(() => import('./pages/static/PricingPage'));
const HelpPage = lazy(() => import('./pages/static/HelpPage'));
const TermsPage = lazy(() => import('./pages/static/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/static/PrivacyPage'));
const ContactPage = lazy(() => import('./pages/static/ContactPage'));

// Loading component
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
  </div>
);

const NotFoundPage = () => {
  return (
    <div className="text-center p-12 min-h-[calc(100vh-128px)] flex flex-col justify-center items-center">
      <h1 className="text-6xl font-extrabold text-indigo-600">404</h1>
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Page Not Found</h2>
      <Link to="/"><Button className="mt-6">Go to Homepage</Button></Link>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            <Header />
            <main className="flex-grow">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/update-password" element={<UpdatePasswordPage />} />

                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/marketplace" element={
                    <ProtectedRoute>
                      <SkillMarketplace />
                    </ProtectedRoute>
                  }
                  />
                  <Route path="/profile/:userId" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                  />

                  <Route path="/admin/login" element={<AdminLoginPage />} />

                  <Route path="/admin/*" element={
                    <ProtectedRoute isAdminOnly={true}>
                      <Routes>
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="users" element={<AdminUserManagement />} />
                        <Route path="skills" element={<AdminSkillManagement />} />
                        <Route path="exchanges" element={<AdminExchangeModeration />} />
                        <Route path="analytics" element={<AdminAnalyticsPage />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                  />

                  {/* Static Footer Pages */}
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/contact" element={<ContactPage />} />

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <Toaster />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider >
  );
}

export default App;