import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Mail, BookOpen, Clock, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import ProfileEditor from '@/components/dashboard/ProfileEditor';
import SkillManager from '@/components/dashboard/SkillManager';
import ExchangeManager from '@/components/dashboard/ExchangeManager';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return <div className="p-8 text-center text-red-500">Access Denied</div>;

  const userEmailName = user.email?.split('@')[0] || 'User';
  const userInitial = userEmailName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Welcome Back, {userEmailName}!</h1>
          <p className="text-indigo-100 text-lg">Track your skills, manage exchanges, and grow your network.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ProfileEditor />

            {/* Prominent Action Card */}
            <Card className="bg-white dark:bg-gray-800 border-l-4 border-indigo-500 shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ready to learn something new?</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">Browse the marketplace to find skills you want to learn.</p>
                </div>
                <Button size="lg" onClick={() => navigate('/marketplace')} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                  <BookOpen className="w-5 h-5 mr-2" /> Find Skills
                </Button>
              </CardContent>
            </Card>

            <SkillManager />
            <ExchangeManager />
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
              <CardContent className="relative pt-0 pb-6 px-6 text-center">
                <div className="relative -top-12 inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 text-3xl font-bold text-indigo-600 shadow-md">
                  {userInitial}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-[-2rem]">{userEmailName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>

                <div className="flex justify-center space-x-2">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full dark:bg-indigo-900 dark:text-indigo-200">
                    Standard User
                  </span>
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
    </div>
  );
};

export default DashboardPage;