import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Mail, BookOpen, Clock, User, Edit, Plus, RefreshCw, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import ProfileEditor from '@/components/dashboard/ProfileEditor';
import SkillManager from '@/components/dashboard/SkillManager';
import ExchangeManager from '@/components/dashboard/ExchangeManager';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isExchangesModalOpen, setIsExchangesModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll for unread count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const data = await api.get('/chat/unread');
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  if (!user) return <div className="p-8 text-center text-red-500">Access Denied</div>;

  const userEmailName = user.email?.split('@')[0] || 'User';
  const userInitial = userEmailName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Welcome Back, {userEmailName}!</h1>
            <p className="text-indigo-100 text-lg">Manage your skills, track exchanges, and grow your network.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setIsProfileModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
            >
              <Edit className="w-4 h-4 mr-2" /> Update Profile
            </Button>
            <Button
              onClick={() => setIsSkillsModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Manage Skills
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">

            {/* Quick Actions / Marketplace Teaser */}
            <Card className="bg-white dark:bg-gray-800 border-l-4 border-indigo-500 shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Explore the Marketplace</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">Discover new skills to learn or find people who need your expertise.</p>
                </div>
                <Button size="lg" onClick={() => navigate('/marketplace')} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap">
                  <BookOpen className="w-5 h-5 mr-2" /> Browse Skills
                </Button>
              </CardContent>
            </Card>

            {/* Recent Exchanges (Preview) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <RefreshCw className="w-5 h-5 mr-2 text-indigo-500" />
                  Recent Exchanges
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setIsExchangesModalOpen(true)}>View All</Button>
              </div>
              <div className="p-6">
                <ExchangeManager limit={3} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Summary Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden sticky top-24">
              <div className="h-24 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
              <CardContent className="relative pt-0 pb-6 px-6 text-center">
                <div className="relative -top-12 inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 text-3xl font-bold text-indigo-600 shadow-md overflow-hidden">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    userInitial
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-[-2rem]">{userEmailName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>

                <div className="flex justify-center space-x-2 mb-6">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full dark:bg-indigo-900 dark:text-indigo-200">
                    Standard User
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button onClick={() => setIsProfileModalOpen(true)} variant="outline" className="w-full justify-start">
                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                  <Button onClick={() => setIsSkillsModalOpen(true)} variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" /> Manage Skills
                  </Button>
                  <Button onClick={() => setIsExchangesModalOpen(true)} variant="outline" className="w-full justify-start">
                    <RefreshCw className="w-4 h-4 mr-2" /> My Exchanges
                  </Button>
                  <Button onClick={() => navigate('/chat')} variant="outline" className="w-full justify-start relative">
                    <MessageCircle className="w-4 h-4 mr-2" /> Messages
                    {unreadCount > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-left space-y-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <ShieldCheck className="w-4 h-4 mr-3 text-green-500" />
                    <span>Account Verified</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4 mr-3 text-blue-500" />
                    <span>Joined recently</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Update Profile"
      >
        <ProfileEditor />
      </Modal>

      <Modal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        title="Manage Skills"
      >
        <SkillManager />
      </Modal>

      <Modal
        isOpen={isExchangesModalOpen}
        onClose={() => setIsExchangesModalOpen(false)}
        title="My Exchanges"
      >
        <ExchangeManager />
      </Modal>
    </div>
  );
};

export default DashboardPage;