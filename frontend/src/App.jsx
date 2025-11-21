import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Button from './components/ui/Button';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import SkillMarketplace from './pages/dashboard/SkillMarketplace';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import { AdminUserManagement, AdminSkillManagement, AdminExchangeModeration, AdminAnalytics } from './pages/admin/AdminPages';

const NotFoundPage = () => {
  return (
    <div className="text-center p-12 min-h-[calc(100vh-128px)] flex flex-col justify-center items-center">
      <h1 className="text-6xl font-extrabold text-indigo-600">404</h1>
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Page Not Found</h2>
      <Link to="/"><Button className="mt-6">Go to Homepage</Button></Link>
    </div>
  );
};

const Toaster = () => <div className="fixed bottom-0 right-0 p-4 z-[999]"></div>; // Mock Toaster or import real one

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
              />
              <Route path="/marketplace" element={
                <ProtectedRoute>
                  <SkillMarketplace />
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
                    <Route path="analytics" element={<AdminAnalytics />} />
                  </Routes>
                </ProtectedRoute>
              }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
          <Toaster />
        </div>
      </Router>
    </AuthProvider >
  );
}

export default App;