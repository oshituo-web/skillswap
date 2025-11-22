import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2, CheckCircle, XCircle, AlertTriangle, Loader2, Search, Download, Shield, ShieldOff, Users as UsersIcon, BookOpen, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingUserId, setUpdatingUserId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all'); // 'all', 'admin', 'user'
    const [selectedUsers, setSelectedUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await api.get('/admin/users');
            setUsers(data);
            setFilteredUsers(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        let filtered = users;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply role filter
        if (filterRole !== 'all') {
            filtered = filtered.filter(user => {
                const isAdmin = user.user_metadata?.is_admin || false;
                return filterRole === 'admin' ? isAdmin : !isAdmin;
            });
        }

        setFilteredUsers(filtered);
    }, [searchTerm, filterRole, users]);

    const handleToggleAdmin = async (userId, currentIsAdmin) => {
        const action = currentIsAdmin ? 'demote' : 'promote';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        setUpdatingUserId(userId);
        try {
            await api.patch(`/admin/users/${userId}/role`, { is_admin: !currentIsAdmin });
            await fetchUsers();
            toast.success(`User ${action}d successfully!`);
        } catch (err) {
            toast.error(`Failed to ${action} user: ${err.message}`);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedUsers.length === 0) {
            toast.error('No users selected');
            return;
        }

        if (!window.confirm(`Are you sure you want to ${action} ${selectedUsers.length} user(s)?`)) return;

        const isAdmin = action === 'promote';
        let successCount = 0;

        for (const userId of selectedUsers) {
            try {
                await api.patch(`/admin/users/${userId}/role`, { is_admin: isAdmin });
                successCount++;
            } catch (err) {
                console.error(`Failed to ${action} user ${userId}:`, err);
            }
        }

        await fetchUsers();
        setSelectedUsers([]);
        toast.success(`${successCount} user(s) ${action}d successfully!`);
    };

    const handleSelectUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(u => u.id));
        }
    };

    const exportToCSV = () => {
        const csvContent = [
            ['Email', 'Role', 'Created At', 'Last Sign In'],
            ...filteredUsers.map(user => [
                user.email,
                user.user_metadata?.is_admin ? 'Admin' : 'User',
                new Date(user.created_at).toLocaleDateString(),
                user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Users exported successfully!');
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>;
    if (error) return (
        <div className="p-8 text-center">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <Button onClick={fetchUsers}>Retry</Button>
        </div>
    );

    return (
        <AdminLayout title="User Management">
            {/* Search and Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                    />
                </div>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                >
                    <option value="all">All Users</option>
                    <option value="admin">Admins Only</option>
                    <option value="user">Users Only</option>
                </select>
                <Button onClick={exportToCSV} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
                <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium">{selectedUsers.length} user(s) selected</span>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleBulkAction('promote')}>
                            <Shield className="w-4 h-4 mr-2" />
                            Promote All
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleBulkAction('demote')}>
                            <ShieldOff className="w-4 h-4 mr-2" />
                            Demote All
                        </Button>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4"
                                />
                            </th>
                            <th className="p-4 font-semibold">Email</th>
                            <th className="p-4 font-semibold">Role</th>
                            <th className="p-4 font-semibold">Created At</th>
                            <th className="p-4 font-semibold">Last Sign In</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => {
                            const isAdmin = user.user_metadata?.is_admin || false;
                            const isUpdating = updatingUserId === user.id;

                            return (
                                <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => handleSelectUser(user.id)}
                                            className="w-4 h-4"
                                        />
                                    </td>
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
                {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No users found matching your criteria
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export const AdminSkillManagement = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                // Use the new endpoint that includes user emails
                const data = await api.get('/admin/skills-with-users');
                setSkills(data);
            } catch (err) {
                setError(err.message);
                toast.error('Failed to load skills');
            } finally {
                setLoading(false);
            }
        };
        fetchSkills();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this skill?')) return;

        setDeletingId(id);
        try {
            await api.delete(`/admin/skills/${id}`);
            setSkills(skills.filter(skill => skill.id !== id));
            toast.success('Skill deleted successfully!');
        } catch (err) {
            toast.error('Failed to delete skill');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <AdminLayout title="Skill Management">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map(skill => (
                    <Card key={skill.id} className="relative">
                        <CardHeader>
                            <CardTitle className="text-lg">{skill.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{skill.description}</p>
                            <div className="flex flex-col gap-2">
                                <span className="text-xs text-gray-500">Category: {skill.category}</span>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                    User: {skill.user_email}
                                </span>
                                <div className="flex justify-end mt-2">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(skill.id)}
                                        disabled={deletingId === skill.id}
                                    >
                                        {deletingId === skill.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {skills.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No skills found
                </div>
            )}
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
                toast.error('Failed to load exchanges');
            } finally {
                setLoading(false);
            }
        };
        fetchExchanges();
    }, []);

    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
        }
    };

    return (
        <AdminLayout title="Exchange Moderation">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4 font-semibold">Requester</th>
                            <th className="p-4 font-semibold">Provider</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Request Date</th>
                            <th className="p-4 font-semibold">Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exchanges.map(exchange => (
                            <tr key={exchange.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="p-4 text-sm">
                                    <div className="font-medium text-gray-900 dark:text-white">{exchange.requester_email}</div>
                                </td>
                                <td className="p-4 text-sm">
                                    <div className="font-medium text-gray-900 dark:text-white">{exchange.provider_email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(exchange.status)}
                                        <span className="capitalize text-sm">{exchange.status}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                    {new Date(exchange.created_at).toLocaleDateString()}
                                    <div className="text-xs text-gray-400">{new Date(exchange.created_at).toLocaleTimeString()}</div>
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                    {new Date(exchange.updated_at || exchange.created_at).toLocaleDateString()}
                                    <div className="text-xs text-gray-400">{new Date(exchange.updated_at || exchange.created_at).toLocaleTimeString()}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {exchanges.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No exchanges found
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await api.get('/admin/analytics');
                setStats(data);
            } catch (err) {
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
        <AdminLayout title="Analytics Dashboard">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <UsersIcon className="w-8 h-8 opacity-75" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{stats.users}</div>
                        <p className="text-xs opacity-75 mt-2">Registered users</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
                        <BookOpen className="w-8 h-8 opacity-75" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{stats.skills}</div>
                        <p className="text-xs opacity-75 mt-2">Available skills</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Exchanges</CardTitle>
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
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
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
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};
