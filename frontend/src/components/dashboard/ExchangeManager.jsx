import { useState, useEffect } from 'react';
import { getDisplayName } from '@/utils/userUtils';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Loader2, Check, X, Clock, Star } from 'lucide-react';
import ReviewModal from '../reviews/ReviewModal';

const ExchangeManager = () => {
    const { user } = useAuth();
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('incoming');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedExchange, setSelectedExchange] = useState(null);

    useEffect(() => {
        if (user) {
            fetchExchanges();
        }
    }, [user]);

    const fetchExchanges = async () => {
        try {
            const data = await api.get('/exchanges');

            // Filter into incoming and outgoing
            const incomingExchanges = data.filter(ex => ex.receiver_id === user.id).map(ex => ({
                ...ex,
                reviewee_id: ex.proposer_id
            }));

            const outgoingExchanges = data.filter(ex => ex.proposer_id === user.id).map(ex => ({
                ...ex,
                reviewee_id: ex.receiver_id
            }));

            setIncoming(incomingExchanges);
            setOutgoing(outgoingExchanges);
        } catch (err) {
            console.error('Error fetching exchanges:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.put(`/exchanges/${id}`, { status: newStatus });

            // Optimistic update
            setIncoming(incoming.map(ex => ex.id === id ? { ...ex, status: newStatus } : ex));
            setOutgoing(outgoing.map(ex => ex.id === id ? { ...ex, status: newStatus } : ex));
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const openReviewModal = (exchange) => {
        setSelectedExchange(exchange);
        setReviewModalOpen(true);
    };

    const ExchangeList = ({ items, isIncoming }) => (
        <div className="space-y-4">
            {items.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex justify-center mb-3">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                            <Clock className="w-6 h-6 text-indigo-400" />
                        </div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No requests found.</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                        {isIncoming ? "You haven't received any exchange requests yet." : "You haven't sent any exchange requests yet."}
                    </p>
                </div>
            ) : (
                items.map((ex) => (
                    <div key={ex.id} className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="mb-4 sm:mb-0 flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <span className={`px-2.5 py-0.5 text-xs rounded-full font-bold tracking-wide uppercase ${ex.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    ex.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {ex.status}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(ex.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-900 dark:text-white text-sm">
                                    {isIncoming ? (
                                        <>
                                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{getDisplayName(ex.proposer)}</span> wants to learn <span className="font-medium border-b border-gray-300 dark:border-gray-600">{ex.skill_requested?.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            You want to learn <span className="font-medium border-b border-gray-300 dark:border-gray-600">{ex.skill_requested?.name}</span> from <span className="font-semibold text-indigo-600 dark:text-indigo-400">{getDisplayName(ex.receiver)}</span>
                                        </>
                                    )}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                    <span className="mr-2">In exchange for:</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                                        {ex.skill_offered?.name}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
                            {isIncoming && ex.status === 'pending' && (
                                <>
                                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none text-green-600 hover:bg-green-50 border-green-200 hover:border-green-300 dark:border-green-900 dark:hover:bg-green-900/20 transition-colors" onClick={() => handleStatusChange(ex.id, 'accepted')}>
                                        <Check className="w-4 h-4 mr-1" /> Accept
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300 dark:border-red-900 dark:hover:bg-red-900/20 transition-colors" onClick={() => handleStatusChange(ex.id, 'rejected')}>
                                        <X className="w-4 h-4 mr-1" /> Reject
                                    </Button>
                                </>
                            )}
                            {ex.status === 'accepted' && (
                                <Button size="sm" variant="outline" className="flex-1 sm:flex-none text-yellow-600 hover:bg-yellow-50 border-yellow-200 hover:border-yellow-300 dark:border-yellow-900 dark:hover:bg-yellow-900/20 transition-colors" onClick={() => openReviewModal(ex)}>
                                    <Star className="w-4 h-4 mr-1" /> Review
                                </Button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <>
            <Card className="h-full border-t-4 border-indigo-500 shadow-md">
                <CardHeader className="pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle className="flex items-center text-xl">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
                                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            Exchange Requests
                        </CardTitle>

                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            <button
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'incoming'
                                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                onClick={() => setActiveTab('incoming')}
                            >
                                Incoming
                                {incoming.filter(i => i.status === 'pending').length > 0 && (
                                    <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded-full">
                                        {incoming.filter(i => i.status === 'pending').length}
                                    </span>
                                )}
                            </button>
                            <button
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'outgoing'
                                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                onClick={() => setActiveTab('outgoing')}
                            >
                                Sent
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 pb-4">
                        Track and manage your skill exchange proposals.
                    </p>
                </CardHeader>
                <CardContent className="pt-2">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
                    ) : (
                        activeTab === 'incoming' ? <ExchangeList items={incoming} isIncoming={true} /> : <ExchangeList items={outgoing} isIncoming={false} />
                    )}
                </CardContent>
            </Card>

            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                exchange={selectedExchange}
                onReviewSubmitted={() => {
                    // Optional: Refresh exchanges or show success message
                }}
            />
        </>
    );
};

export default ExchangeManager;
