import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Send, Loader2, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import OnlineStatus from './OnlineStatus';
import { format } from 'date-fns';
import { getDisplayName, getAvatarUrl } from '@/utils/userUtils';

const ChatWindow = ({ conversationId, onBack }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [otherParticipantId, setOtherParticipantId] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (conversationId) {
            // Reset state when conversation changes
            setMessages([]);
            setOtherParticipantId(null);
            setOtherUser(null);
            setLoading(true);

            fetchMessages();
            const cleanup = subscribeToMessages();
            return cleanup;
        }
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        setLoading(true);
        try {
            // Fetch conversation to get other participant details
            const convData = await api.get(`/chat/conversations`);
            const conversation = convData.find(c => c.id === conversationId);

            if (conversation) {
                const otherId = conversation.participant1_id === user.id
                    ? conversation.participant2_id
                    : conversation.participant1_id;

                setOtherParticipantId(otherId);

                // Get other user's details (name, avatar)
                const otherParticipant = conversation.participant1_id === user.id
                    ? conversation.participant2
                    : conversation.participant1;

                if (otherParticipant) {
                    setOtherUser(otherParticipant);
                } else {
                    // Fallback if not expanded: fetch profile
                    try {
                        const profile = await api.get(`/user/profile/${otherId}`);
                        setOtherUser(profile);
                    } catch (err) {
                        console.error("Failed to fetch other user profile", err);
                    }
                }
            }

            const data = await api.get(`/chat/conversations/${conversationId}/messages`);
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToMessages = () => {
        const channel = supabase
            .channel(`conversation:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    // Auto-mark as delivered if it's not my message
                    if (payload.new.sender_id !== user.id) {
                        markAsDelivered(payload.new.id);
                    }

                    // Only add if not already in the list (avoid duplicates from optimistic update)
                    setMessages((prev) => {
                        const exists = prev.some(msg => msg.id === payload.new.id);
                        if (exists) {
                            return prev;
                        }
                        return [...prev, payload.new];
                    });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    setMessages((prev) =>
                        prev.map(msg => msg.id === payload.new.id ? payload.new : msg)
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const markAsDelivered = async (messageId) => {
        try {
            await api.patch(`/chat/messages/${messageId}/delivered`);
        } catch (error) {
            console.error('Failed to mark message as delivered', error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        const tempMessage = {
            id: `temp-${Date.now()}`,
            content: newMessage,
            sender_id: user.id,
            created_at: new Date().toISOString(),
            status: 'sending'
        };

        // Optimistic update - add message immediately
        setMessages((prev) => [...prev, tempMessage]);
        const messageToSend = newMessage;
        setNewMessage('');

        setSending(true);
        try {
            const response = await api.post('/chat/messages', {
                conversation_id: conversationId,
                content: messageToSend
            });

            // Replace temp message with real one
            setMessages((prev) =>
                prev.map(msg => msg.id === tempMessage.id ? response : msg)
            );
        } catch (error) {
            console.error("Failed to send message", error);
            // Remove temp message on error
            setMessages((prev) => prev.filter(msg => msg.id !== tempMessage.id));
            setNewMessage(messageToSend); // Restore the message
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 relative">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 shadow-sm bg-white dark:bg-gray-800 z-20">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                    {otherUser ? (
                        <>
                            <div className="relative">
                                <img
                                    src={getAvatarUrl(otherUser)}
                                    alt={getDisplayName(otherUser)}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                />
                                {otherParticipantId && (
                                    <div className="absolute bottom-0 right-0 ring-2 ring-white dark:ring-gray-800 rounded-full">
                                        <OnlineStatus userId={otherParticipantId} size="sm" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {getDisplayName(otherUser)}
                                </h3>
                                {otherParticipantId && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        <OnlineStatus userId={otherParticipantId} showLabel size="xs" />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <h3 className="font-semibold text-gray-900 dark:text-white">Chat</h3>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        <p>No messages yet. Say hello!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMyMessage = msg.sender_id === user.id;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${isMyMessage
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-100 dark:border-gray-600'
                                        }`}
                                >
                                    <p className="text-sm">{msg.content}</p>
                                    <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMyMessage ? 'text-indigo-200' : 'text-gray-400'
                                        }`}>
                                        {format(new Date(msg.created_at), 'HH:mm')}
                                        {isMyMessage && (
                                            <span>
                                                {msg.read_at ? (
                                                    <CheckCheck className="w-3 h-3 text-blue-300" />
                                                ) : msg.delivered_at ? (
                                                    <CheckCheck className="w-3 h-3" />
                                                ) : (
                                                    <Check className="w-3 h-3" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
