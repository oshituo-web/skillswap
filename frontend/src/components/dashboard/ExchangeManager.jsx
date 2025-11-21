import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Loader2, Check, X, Clock } from 'lucide-react';

const ExchangeManager = () => {
    const { user } = useAuth();
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('incoming');

    useEffect(() => {
        if (user) {
            fetchExchanges();
        }
    }, [user]);

    const fetchExchanges = async () => {
        try {
            console.log('Fetching exchanges for user:', user.id);

            // Fetch all exchanges first
            const { data: allExchanges, error: allError } = await supabase
                .from('exchanges')
                .select('*');

            console.log('All exchanges in DB:', allExchanges);

            // Fetch incoming
            const { data: incData, error: incError } = await supabase
                .from('exchanges')
                .select('*')
                .eq('receiver_id', user.id)
                .order('created_at', { ascending: false });

            console.log('Incoming (raw):', incData);

            if (incError) {
                console.error('Error fetching incoming:', incError);
            }

            // Manually enrich incoming
            const enrichedIncoming = await Promise.all((incData || []).map(async (ex) => {
                const [proposer, skillOffered, skillRequested] = await Promise.all([
                    supabase.from('profiles').select('username, full_name').eq('id', ex.proposer_id).single(),
                    supabase.from('skills').select('name').eq('id', ex.skill_id_offered).single(),
                    supabase.from('skills').select('name').eq('id', ex.skill_id_requested).single()
                ]);

                return {
                    ...ex,
                    proposer: proposer.data,
                    skill_offered: skillOffered.data,
                    skill_requested: skillRequested.data
                };
            }));

            setIncoming(enrichedIncoming);
            console.log('Enriched incoming:', enrichedIncoming);

            // Fetch outgoing
            const { data: outData, error: outError } = await supabase
                .from('exchanges')
                .select('*')
                .eq('proposer_id', user.id)
                .order('created_at', { ascending: false });

            console.log('Outgoing (raw):', outData);

            if (outError) {
                console.error('Error fetching outgoing:', outError);
            }

            // Manually enrich outgoing
            const enrichedOutgoing = await Promise.all((outData || []).map(async (ex) => {
                const [receiver, skillOffered, skillRequested] = await Promise.all([
                    supabase.from('profiles').select('username, full_name').eq('id', ex.receiver_id).single(),
                    supabase.from('skills').select('name').eq('id', ex.skill_id_offered).single(),
                    supabase.from('skills').select('name').eq('id', ex.skill_id_requested).single()
                ]);

                return {
                    ...ex,
                    receiver: receiver.data,
                    skill_offered: skillOffered.data,
                    skill_requested: skillRequested.data
                };
            }));

            setOutgoing(enrichedOutgoing);
            console.log('Enriched outgoing:', enrichedOutgoing);

        } catch (err) {
            console.error('Error fetching exchanges:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('exchanges')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            setIncoming(incoming.map(ex => ex.id === id ? { ...ex, status: newStatus } : ex));
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const ExchangeList = ({ items, isIncoming }) => (
        <div className="space-y-4">
            {items.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No requests found.</p>
            ) : (
                items.map((ex) => (
                    <div key={ex.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                        <div className="mb-4 sm:mb-0">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${ex.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    ex.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {ex.status.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-500">{new Date(ex.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-900 dark:text-white font-medium">
                                {isIncoming ? (
                                    <>
                                        <span className="text-indigo-600">{ex.proposer?.full_name || 'User'}</span> wants to learn <strong>{ex.skill_requested?.name}</strong>
                                    </>
                                ) : (
                                    <>
                                        You want to learn <strong>{ex.skill_requested?.name}</strong> from <span className="text-indigo-600">{ex.receiver?.full_name || 'User'}</span>
                                    </>
                                )}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                In exchange for: <strong>{ex.skill_offered?.name}</strong>
                            </p>
                        </div>

                        {isIncoming && ex.status === 'pending' && (
                            <div className="flex space-x-2">
                                <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50" onClick={() => handleStatusChange(ex.id, 'accepted')}>
                                    <Check className="w-4 h-4 mr-1" /> Accept
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleStatusChange(ex.id, 'rejected')}>
                                    <X className="w-4 h-4 mr-1" /> Reject
                                </Button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                    Exchange Requests
                </CardTitle>
                <div className="flex space-x-2 mt-4">
                    <button
                        className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'incoming' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('incoming')}
                    >
                        Incoming ({incoming.filter(i => i.status === 'pending').length})
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'outgoing' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('outgoing')}
                    >
                        Sent ({outgoing.length})
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
                ) : (
                    activeTab === 'incoming' ? <ExchangeList items={incoming} isIncoming={true} /> : <ExchangeList items={outgoing} isIncoming={false} />
                )}
            </CardContent>
        </Card>
    );
};

export default ExchangeManager;
