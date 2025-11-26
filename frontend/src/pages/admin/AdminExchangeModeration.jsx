import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/supabaseClient';

const AdminExchangeModeration = () => {
    const [exchanges, setExchanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const [successMessage, setSuccessMessage] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Sorting state
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchExchanges = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Not authenticated");
            }
            const token = session.access_token;

            const response = await fetch('/api/admin/exchanges', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch exchanges');
            }
            const data = await response.json();
            setExchanges(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExchanges();
    }, []);

    const handleAction = async (exchangeId, action) => {
        setActionLoading(prev => ({ ...prev, [exchangeId]: action }));
        setError(null);
        setSuccessMessage(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Not authenticated");
            }
            const token = session.access_token;

            const response = await fetch(`/api/admin/exchanges/${exchangeId}/${action}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${action} exchange`);
            }

            const result = await response.json();
            setSuccessMessage(result.message || `Exchange ${action}d successfully`);

            // Refresh the exchanges list
            await fetchExchanges();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(prev => ({ ...prev, [exchangeId]: null }));

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    };

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset to first page when sorting
    };

    // Filter exchanges by search term and status
    const filteredExchanges = exchanges.filter(exchange => {
        const matchesSearch = searchTerm === '' ||
            exchange.proposer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exchange.receiver_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exchange.skill_requested_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exchange.skill_offered_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || exchange.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Sort filtered exchanges
    const sortedExchanges = [...filteredExchanges].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        // Convert to lowercase for string comparison
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentExchanges = sortedExchanges.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedExchanges.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };


    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                <Link to="/admin">
                    <Button size="icon" variant="outline" className="mr-4">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exchange Moderation</h1>
            </div>

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative dark:bg-green-900 dark:border-green-700 dark:text-green-200">
                    {successMessage}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Exchanges</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && <p>Loading exchanges...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && (
                        <>
                            {/* Search and Filter Controls */}
                            <div className="mb-4 flex gap-4 flex-wrap">
                                <div className="flex-1 min-w-[200px]">
                                    <input
                                        type="text"
                                        placeholder="Search by email or skill name..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1); // Reset to first page on search
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div className="min-w-[150px]">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setCurrentPage(1); // Reset to first page on filter change
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => handleSort('proposer_email')}
                                            >
                                                Requester {sortField === 'proposer_email' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => handleSort('receiver_email')}
                                            >
                                                Provider {sortField === 'receiver_email' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => handleSort('skill_requested_name')}
                                            >
                                                Skill Requested {sortField === 'skill_requested_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => handleSort('skill_offered_name')}
                                            >
                                                Skill Provided {sortField === 'skill_offered_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => handleSort('status')}
                                            >
                                                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => handleSort('created_at')}
                                            >
                                                Date Requested {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => handleSort('accepted_at')}
                                            >
                                                Date Accepted {sortField === 'accepted_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentExchanges.map((exchange) => (
                                            <TableRow key={exchange.id}>
                                                <TableCell>{exchange.proposer_email}</TableCell>
                                                <TableCell>{exchange.receiver_email}</TableCell>
                                                <TableCell>{exchange.skill_requested_name}</TableCell>
                                                <TableCell>{exchange.skill_offered_name}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded text-sm ${exchange.status === 'accepted'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : exchange.status === 'rejected'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            : exchange.status === 'cancelled'
                                                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                        }`}>
                                                        {exchange.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{exchange.duration || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {exchange.created_at
                                                        ? new Date(exchange.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {exchange.accepted_at
                                                        ? new Date(exchange.accepted_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        {exchange.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="default"
                                                                    onClick={() => handleAction(exchange.id, 'approve')}
                                                                    disabled={!!actionLoading[exchange.id]}
                                                                >
                                                                    {actionLoading[exchange.id] === 'approve' ? 'Approving...' : 'Approve'}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleAction(exchange.id, 'reject')}
                                                                    disabled={!!actionLoading[exchange.id]}
                                                                >
                                                                    {actionLoading[exchange.id] === 'reject' ? 'Rejecting...' : 'Reject'}
                                                                </Button>
                                                            </>
                                                        )}
                                                        {(exchange.status === 'pending' || exchange.status === 'accepted') && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleAction(exchange.id, 'cancel')}
                                                                disabled={!!actionLoading[exchange.id]}
                                                            >
                                                                {actionLoading[exchange.id] === 'cancel' ? 'Cancelling...' : 'Cancel'}
                                                            </Button>
                                                        )}
                                                        {(exchange.status === 'rejected' || exchange.status === 'cancelled') && (
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">No actions available</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination Controls */}
                            {sortedExchanges.length > 0 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedExchanges.length)} of {sortedExchanges.length} exchanges
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>

                                        {[...Array(totalPages)].map((_, index) => {
                                            const pageNumber = index + 1;
                                            // Show first page, last page, current page, and pages around current
                                            if (
                                                pageNumber === 1 ||
                                                pageNumber === totalPages ||
                                                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                            ) {
                                                return (
                                                    <Button
                                                        key={pageNumber}
                                                        variant={currentPage === pageNumber ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handlePageChange(pageNumber)}
                                                    >
                                                        {pageNumber}
                                                    </Button>
                                                );
                                            } else if (
                                                pageNumber === currentPage - 2 ||
                                                pageNumber === currentPage + 2
                                            ) {
                                                return <span key={pageNumber} className="px-2">...</span>;
                                            }
                                            return null;
                                        })}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminExchangeModeration;
