import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Users as UsersIcon, BookOpen, TrendingUp, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { api } from '@/lib/api';

const AdminAnalyticsPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {

                const data = await api.get('/admin/analytics');

                setStats(data);
            } catch (err) {
                console.error('[ANALYTICS] Error:', err);
                setError(err.message);
                toast.error('Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    const chartData = [
        { name: 'Users', value: stats.users, color: '#8b5cf6' },
        { name: 'Skills', value: stats.skills, color: '#3b82f6' },
        { name: 'Exchanges', value: stats.exchanges, color: '#10b981' },
    ];

    const COLORS = ['#8b5cf6', '#3b82f6', '#10b981'];

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="flex items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                <Link to="/admin">
                    <Button size="icon" variant="outline" className="mr-4">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
                        <UsersIcon className="w-8 h-8 opacity-75" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{stats.users}</div>
                        <p className="text-xs opacity-75 mt-2">Registered users</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-white">Total Skills</CardTitle>
                        <BookOpen className="w-8 h-8 opacity-75" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{stats.skills}</div>
                        <p className="text-xs opacity-75 mt-2">Available skills</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-white">Total Exchanges</CardTitle>
                        <TrendingUp className="w-8 h-8 opacity-75" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{stats.exchanges}</div>
                        <p className="text-xs opacity-75 mt-2">Skill exchanges</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Platform Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8b5cf6">
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;
