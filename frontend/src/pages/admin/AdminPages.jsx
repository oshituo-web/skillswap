import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { api } from '../../lib/api';

const AdminLayout = ({ children, title }) => (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="flex items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
            <Link to="/admin">
                <Button size="icon" variant="outline" className="mr-4">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        </div>
        <Card className="p-6">
            <CardContent className="p-0">
                {children}
            </CardContent>
        </Card>
    </div>
);

export const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingUserId, setUpdatingUserId] = useState(null);

    const fetchUsers = async () => {
        try {
            const data = await api.get('/admin/users');
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleAdmin = async (userId, currentIsAdmin) => {
        if (!window.confirm(`Are you sure you want to ${currentIsAdmin ? 'demote this user from' : 'promote this user to'} admin?`)) return;

        setUpdatingUserId(userId);
        try {
            await api.patch(`/admin/users/${userId}/role`, { is_admin: !currentIsAdmin });
            // Refresh the user list
            await fetchUsers();
        } catch (err) {
            alert('Failed to update user role: ' + err.message);
        } finally {
            setUpdatingUserId(null);
        }
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <AdminLayout title="User Management">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4 font-semibold">Email</th>
                            <th className="p-4 font-semibold">Role</th>
                            <th className="p-4 font-semibold">Created At</th>
                            <th className="p-4 font-semibold">Last Sign In</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => {
                            const isAdmin = user.user_metadata?.is_admin || false;
                            const isUpdating = updatingUserId === user.id;

                            return (
                                <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isAdmin ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {isAdmin ? 'Admin' : 'User'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 text-sm text-gray-500">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</td>
                                    <td className="p-4">
                                        <Button
                                            variant={isAdmin ? "destructive" : "default"}
                                            size="sm"
                                            onClick={() => handleToggleAdmin(user.id, isAdmin)}
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (isAdmin ? 'Demote' : 'Promote')}
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export const AdminSkillManagement = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSkills = async () => {
        try {
            const data = await api.get('/skills');
            setSkills(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this skill?')) return;
        try {
            await api.delete(`/admin/skills/${id}`);
            setSkills(skills.filter(s => s.id !== id));
        } catch (err) {
            alert('Failed to delete skill: ' + err.message);
        }
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <AdminLayout title="Skill Management">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold">Description</th>
                            <th className="p-4 font-semibold">User ID</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {skills.map(skill => (
                            <tr key={skill.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="p-4 font-medium">{skill.name}</td>
                                <td className="p-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">{skill.description}</td>
                                <td className="p-4 font-mono text-xs text-gray-500">{skill.user_id}</td>
                                <td className="p-4">
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(skill.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export const AdminExchangeModeration = () => {
    const [exchanges, setExchanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExchanges = async () => {
            try {
                const data = await api.get('/admin/exchanges');
                setExchanges(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchExchanges();
    }, []);

    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <AdminLayout title="Exchange Moderation">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4 font-semibold">ID</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Requester</th>
                            <th className="p-4 font-semibold">Provider</th>
                            <th className="p-4 font-semibold">Skill</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exchanges.map(exchange => (
                            <tr key={exchange.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="p-4 font-mono text-sm text-gray-500">{exchange.id}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                        ${exchange.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            exchange.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                        {exchange.status}
                                    </span>
                                </td>
                                <td className="p-4 font-mono text-xs text-gray-500">{exchange.requester_id}</td>
                                <td className="p-4 font-mono text-xs text-gray-500">{exchange.provider_id}</td>
                                <td className="p-4 font-mono text-xs text-gray-500">{exchange.skill_id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.get('/admin/analytics');
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <AdminLayout title="Analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-indigo-600">{stats.users}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-600">{stats.skills}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Exchanges</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-blue-600">{stats.exchanges}</div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};
