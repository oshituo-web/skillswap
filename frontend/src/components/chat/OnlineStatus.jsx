import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { api } from '@/lib/api';

/**
 * OnlineStatus Component
 * Displays a user's online/offline status with a colored indicator
 * 
 * @param {string} userId - The ID of the user to show status for
 * @param {boolean} showLabel - Whether to show "Online" or "Offline" text
 * @param {string} size - Size of the indicator: 'sm', 'md', 'lg'
 */
const OnlineStatus = ({ userId, showLabel = false, size = 'md' }) => {
    const [status, setStatus] = useState('offline');
    const [lastSeen, setLastSeen] = useState(null);

    // Size classes
    const sizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4'
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    useEffect(() => {
        if (!userId) return;

        // Fetch initial presence
        const fetchPresence = async () => {
            try {
                const data = await api.get(`/chat/presence/${userId}`);
                setStatus(data.status || 'offline');
                setLastSeen(data.last_seen);
            } catch (error) {
                console.error('Failed to fetch presence:', error);
                setStatus('offline');
            }
        };

        fetchPresence();

        // Subscribe to presence changes via Realtime
        const channel = supabase
            .channel(`presence:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'user_presence',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {

                    if (payload.new) {
                        setStatus(payload.new.status || 'offline');
                        setLastSeen(payload.new.last_seen);
                    }
                }
            )
            .subscribe();

        // Cleanup subscription
        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    // Format last seen time
    const getLastSeenText = () => {
        if (!lastSeen || status === 'online') return '';

        const now = new Date();
        const lastSeenDate = new Date(lastSeen);
        const diffMs = now - lastSeenDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return 'Long ago';
    };

    return (
        <div className="flex items-center gap-2">
            {/* Status indicator dot */}
            <div className="relative">
                <div
                    className={`${sizeClasses[size]} rounded-full transition-colors ${status === 'online'
                        ? 'bg-green-500 shadow-green-500/50 shadow-sm'
                        : 'bg-gray-400 dark:bg-gray-600'
                        }`}
                />
                {/* Pulse animation for online status */}
                {status === 'online' && (
                    <div
                        className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-green-500 animate-ping opacity-75`}
                    />
                )}
            </div>

            {/* Status label */}
            {showLabel && (
                <span className={`${textSizeClasses[size]} ${status === 'online'
                    ? 'text-green-600 dark:text-green-400 font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                    }`}>
                    {status === 'online' ? 'Online' : getLastSeenText() || 'Offline'}
                </span>
            )}
        </div>
    );
};

export default OnlineStatus;
