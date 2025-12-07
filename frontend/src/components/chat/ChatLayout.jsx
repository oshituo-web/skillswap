import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

const ChatLayout = () => {
    const { user } = useAuth();
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // If we navigated here with a specific conversation in mind (e.g. from a profile)
        if (location.state?.conversationId) {
            setSelectedConversationId(location.state.conversationId);
        }
    }, [location.state]);

    return (
        <div className="container mx-auto p-4 h-[calc(100vh-80px)]">
            {/* Header with Back Button */}
            <div className="mb-4 flex items-center gap-3">
                <Button
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
            </div>

            <Card className="flex h-full overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800">
                {/* Sidebar - Conversation List */}
                <div className={`w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
                    <ConversationList
                        selectedId={selectedConversationId}
                        onSelect={(id) => setSelectedConversationId(id)}
                    />
                </div>

                {/* Main Content - Chat Window */}
                <div className={`w-full md:w-2/3 flex flex-col ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
                    {selectedConversationId ? (
                        <ChatWindow
                            conversationId={selectedConversationId}
                            onBack={() => setSelectedConversationId(null)}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                            <div className="text-center">
                                <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
                                <p>Choose a chat from the left to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ChatLayout;
