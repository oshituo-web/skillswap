import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import ReviewForm from '@/components/reviews/ReviewForm';
import { Check, X, MessageSquare, CheckCircle } from 'lucide-react';

const ExchangeHistoryPage = () => {
    const { user } = useAuth();
    const [exchanges, setExchanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewingExchangeId, setReviewingExchangeId] = useState(null);

    const fetchExchanges = async () => {
        try {
            const data = await api.get('/exchanges');
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

    const handleStatusUpdate = async (exchangeId, newStatus) => {
        try {
            await api.put(`/exchanges/${exchangeId}`, { status: newStatus });
            // Optimistic update or refetch
            setExchanges(exchanges.map(ex =>
                ex.id === exchangeId ? { ...ex, status: newStatus } : ex
            ));
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status');
        }
    };

    const handleReviewSubmitted = () => {
        setReviewingExchangeId(null);
        fetchExchanges(); // Refresh to potentially show "Reviewed" status if we tracked it, or just close form
        alert('Review submitted successfully!');
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Skill Exchange History</h1>
                <Link to="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Exchanges</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && <p className="text-center py-4">Loading exchanges...</p>}
                    {error && <p className="text-red-500 text-center py-4">{error}</p>}

                    {!loading && !error && exchanges.length === 0 && (
                        <p className="text-center py-8 text-gray-500">No exchanges found. Start a trade in the marketplace!</p>
                    )}

                    {!loading && !error && exchanges.length > 0 && (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Partner</TableHead>
                                        <TableHead>Skill Offered</TableHead>
                                        <TableHead>Skill Requested</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {exchanges.map((exchange) => {
                                        const isProposer = user?.id === exchange.proposer_id;
                                        const partner = isProposer ? exchange.receiver : exchange.proposer;

                                        return (
                                            <TableRow key={exchange.id}>
                                                <TableCell>
                                                    <span className="text-xs font-mono text-gray-500">
                                                        {isProposer ? 'Proposer' : 'Receiver'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {partner?.full_name || partner?.username || 'Unknown'}
                                                </TableCell>
                                                <TableCell>{exchange.skill_offered?.name || 'Unknown Skill'}</TableCell>
                                                <TableCell>{exchange.skill_requested?.name || 'Unknown Skill'}</TableCell>
                                                <TableCell>{getStatusBadge(exchange.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        {/* Actions for Receiver when Pending */}
                                                        {!isProposer && exchange.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                                    onClick={() => handleStatusUpdate(exchange.id, 'accepted')}
                                                                >
                                                                    <Check className="w-4 h-4 mr-1" /> Accept
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleStatusUpdate(exchange.id, 'rejected')}
                                                                >
                                                                    <X className="w-4 h-4 mr-1" /> Reject
                                                                </Button>
                                                            </>
                                                        )}

                                                        {/* Actions for Accepted Exchanges (Both can complete?) - Usually receiver confirms completion or both */}
                                                        {exchange.status === 'accepted' && (
                                                            <Button
                                                                size="sm"
                                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                                onClick={() => handleStatusUpdate(exchange.id, 'completed')}
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-1" /> Complete
                                                            </Button>
                                                        )}

                                                        {/* Actions for Completed Exchanges */}
                                                        {exchange.status === 'completed' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setReviewingExchangeId(exchange.id === reviewingExchangeId ? null : exchange.id)}
                                                            >
                                                                <MessageSquare className="w-4 h-4 mr-1" />
                                                                {reviewingExchangeId === exchange.id ? 'Close Review' : 'Review'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Review Form Section */}
            {reviewingExchangeId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Write a Review</h3>
                            <button onClick={() => setReviewingExchangeId(null)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            {(() => {
                                const exchange = exchanges.find(e => e.id === reviewingExchangeId);
                                if (!exchange) return null;
                                const isProposer = user?.id === exchange.proposer_id;
                                // If I am proposer, I review the receiver. If I am receiver, I review the proposer.
                                const revieweeId = isProposer ? exchange.receiver_id : exchange.proposer_id;

                                return (
                                    <ReviewForm
                                        exchangeId={exchange.id}
                                        revieweeId={revieweeId}
                                        onReviewSubmitted={handleReviewSubmitted}
                                        onCancel={() => setReviewingExchangeId(null)}
                                    />
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExchangeHistoryPage;
