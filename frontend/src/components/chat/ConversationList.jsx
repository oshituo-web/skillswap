import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ConversationList = ({ selectedId, onSelect }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchConversations();
        // Optional: Poll for updates or use Realtime for list updates too
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const data = await api.get('/chat/conversations');
            setConversations(data);
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredConversations = conversations.filter(conv => {
        const otherParticipant = conv.participant1_id === user.id ? conv.participant2 : conv.participant1;
        return otherParticipant?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            otherParticipant?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No conversations found</div>
                ) : (
                    filteredConversations.map(conv => {
                        const otherParticipant = conv.participant1_id === user.id ? conv.participant2 : conv.participant1;
                        const isSelected = selectedId === conv.id;

                        return (
                            <div
                                key={conv.id}
                                onClick={() => onSelect(conv.id)}
                                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                        {otherParticipant?.full_name || otherParticipant?.username || 'Unknown User'}
                                    </h3>
                                    {conv.last_message_at && (
                                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                            {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {conv.last_message || <span className="italic text-gray-400">No messages yet</span>}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ConversationList;
