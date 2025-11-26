import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Users, BookOpen, Clock, BarChart4 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const adminSections = [
    { name: 'User Management', path: 'users', icon: Users, description: 'View, edit, and deactivate user accounts.' },
    { name: 'Skill Management', path: 'skills', icon: BookOpen, description: 'Approve or edit the official skills catalog.' },
    { name: 'Exchange Moderation', path: 'exchanges', icon: Clock, description: 'Review and resolve disputes on skill exchanges.' },
    { name: 'Analytics', path: 'analytics', icon: BarChart4, description: 'Monitor platform growth and user activity metrics.' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-700 dark:text-indigo-400">Admin Control Panel</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300">Welcome, {user?.email}. Select a module to manage the platform.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminSections.map(section => (
          <div key={section.path} onClick={() => navigate(section.path)} style={{ cursor: 'pointer' }}>
            <Card className="hover:shadow-2xl transition-shadow duration-300 border-t-4 border-indigo-400 h-full">
              <CardHeader>
                <section.icon className="w-8 h-8 text-indigo-500 mb-2" />
                <CardTitle className="text-xl">{section.name}</CardTitle>
              </CardHeader>
              <CardContent><CardDescription>{section.description}</CardDescription></CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardPage;