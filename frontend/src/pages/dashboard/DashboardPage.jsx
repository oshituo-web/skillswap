import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail, BookOpen, Clock, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import ProfileEditor from '../../components/dashboard/ProfileEditor';
import SkillManager from '../../components/dashboard/SkillManager';
import ExchangeManager from '../../components/dashboard/ExchangeManager';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return <div className="p-8 text-center text-red-500">Access Denied</div>;

  const userEmailName = user.email?.split('@')[0] || 'User';

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Welcome Back, {userEmailName}!</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ProfileEditor />

          {/* Prominent Action Card */}
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div>
                <h3 className="text-xl font-bold">Ready to learn something new?</h3>
                <p className="text-indigo-100">Browse the marketplace to find skills you want to learn.</p>
              </div>
              <Button variant="secondary" size="lg" onClick={() => navigate('/marketplace')} className="bg-white text-indigo-600 hover:bg-gray-100">
                <BookOpen className="w-5 h-5 mr-2" /> Find Skills
              </Button>
            </CardContent>
          </Card>

          <SkillManager />
          <ExchangeManager />
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full border-t-4 border-indigo-500">
            <CardHeader><CardTitle className="flex items-center text-xl"><ShieldCheck className="w-5 h-5 mr-2" /> Account Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm"><Mail className="w-5 h-5 mr-3 text-indigo-500" /><p className="text-gray-700 dark:text-gray-300 break-all">{user.email}</p></div>
              <div className="flex items-center text-sm"><User className="w-5 h-5 mr-3 text-indigo-500" /><p className="text-gray-700 dark:text-gray-300">Role: Standard User</p></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;