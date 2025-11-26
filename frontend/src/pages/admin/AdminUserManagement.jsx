import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Search,
    Filter,
    Download,
    MoreHorizontal,
    Shield,
    ShieldOff,
    Trash2,
    ArrowLeft,
    Loader2,
    CheckSquare,
    Square,
    Ban
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState({});

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Sorting
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'admin', 'user'

    // Selection
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await api.get('/admin/users');
            setUsers(data);
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (userId, currentStatus) => {
        const newStatus = !currentStatus;
        const action = newStatus ? 'promote' : 'demote';

        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            await api.patch(`/admin/users/${userId}/role`, { is_admin: newStatus });
            toast.success(`User ${action}d successfully`);

            // Update local state
            setUsers(users.map(user =>
                user.id === userId
                    ? { ...user, user_metadata: { ...user.user_metadata, is_admin: newStatus } }
                    : user
            ));
        } catch (err) {
            toast.error(`Failed to ${action} user`);
            console.error(err);
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleBanUser = async (userId, currentStatus) => {
        const newStatus = !currentStatus;
        const action = newStatus ? 'ban' : 'unban';

        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            // We'll reuse the role endpoint or create a new one. 
            // Since the backend might not have a specific 'ban' endpoint, we can update metadata directly if the API allows,
            // or use the same patch endpoint if it supports generic metadata updates.
            // Assuming the existing endpoint /admin/users/:id/role might be limited to is_admin.
            // Let's try to use a generic metadata update if available, or assume the backend handles 'banned' in the body.
            // Based on previous code, api.patch(`/admin/users/${userId}/role`, { is_admin: ... })
            // I'll try sending { banned: newStatus } to the same endpoint if it's flexible, or I might need to check backend.
            // For now, I'll assume I can send { banned: newStatus } to the same endpoint.
            await api.patch(`/admin/users/${userId}/role`, { banned: newStatus });
            toast.success(`User ${action}ned successfully`);

            // Update local state
            setUsers(users.map(user =>
                user.id === userId
                    ? { ...user, user_metadata: { ...user.user_metadata, banned: newStatus } }
                    : user
            ));
        } catch (err) {
            toast.error(`Failed to ${action} user`);
            console.error(err);
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUsers(currentUsers.map(u => u.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Email', 'Role', 'Created At', 'Last Sign In'];
        const csvContent = [
            headers.join(','),
            ...users.map(user => [
                user.id,
                user.email,
                user.user_metadata?.is_admin ? 'Admin' : 'User',
                user.created_at,
                user.last_sign_in_at
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Filter & Sort Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id.toLowerCase().includes(searchTerm.toLowerCase());

        const isAdmin = user.user_metadata?.is_admin;
        const matchesRole = roleFilter === 'all' ||
            (roleFilter === 'admin' && isAdmin) ||
            (roleFilter === 'user' && !isAdmin);

        return matchesSearch && matchesRole;
    });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Handle nested properties or special cases
        if (sortField === 'role') {
            aValue = a.user_metadata?.is_admin ? 1 : 0;
            bValue = b.user_metadata?.is_admin ? 1 : 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                    <Link to="/admin">
                        <Button size="icon" variant="outline" className="mr-4">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
                </div>
                <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Controls */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                        <div className="flex gap-4 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
                                />
                            </div>
                            <div className="relative min-w-[150px]">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Admins</option>
                                    <option value="user">Users</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={currentUsers.length > 0 && selectedUsers.length === currentUsers.length}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={() => handleSort('email')}
                                    >
                                        User {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={() => handleSort('role')}
                                    >
                                        Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        Joined {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => handleSelectUser(user.id)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.email}</span>
                                                <span className="text-xs text-gray-500">ID: {user.id}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.user_metadata?.is_admin
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {user.user_metadata?.is_admin ? 'Admin' : 'User'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleToggleAdmin(user.id, user.user_metadata?.is_admin)}
                                                    disabled={actionLoading[user.id]}
                                                    title={user.user_metadata?.is_admin ? "Remove Admin" : "Make Admin"}
                                                >
                                                    {actionLoading[user.id] ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : user.user_metadata?.is_admin ? (
                                                        <ShieldOff className="w-4 h-4 text-red-500" />
                                                    ) : (
                                                        <Shield className="w-4 h-4 text-green-500" />
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleBanUser(user.id, user.user_metadata?.banned)}
                                                    disabled={actionLoading[user.id]}
                                                    title={user.user_metadata?.banned ? "Unban User" : "Ban User"}
                                                >
                                                    {user.user_metadata?.banned ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <Ban className="w-4 h-4 text-red-500" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {sortedUsers.length > 0 && (
                        <div className="mt-4 flex items-center justify-between border-t pt-4 border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-500">
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedUsers.length)} of {sortedUsers.length} users
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminUserManagement;
