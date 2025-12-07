import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

/**
 * Hook to automatically manage user presence (online/offline status)
 * - Sets user as online when app is active
 * - Sets user as offline when app is closed or tab is hidden
 * - Handles visibility changes and page unload
 */
export const usePresence = () => {
    const authContext = useAuth();
    const user = authContext?.user;

    const updatePresence = async (status) => {
        if (!user) return;

        try {
            await api.put('/chat/presence', { status });

        } catch (error) {
            console.error('Failed to update presence:', error);
        }
    };

    useEffect(() => {
        if (!user) return;

        // Set online when component mounts
        updatePresence('online');

        // Set offline when page is about to unload
        const handleBeforeUnload = () => {
            // Use sendBeacon for reliable offline status on page close
            const blob = new Blob([JSON.stringify({ status: 'offline' })], {
                type: 'application/json'
            });
            navigator.sendBeacon(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/chat/presence`, blob);
        };

        // Handle visibility changes (tab switching)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                updatePresence('offline');
            } else {
                updatePresence('online');
            }
        };

        // Handle window focus/blur
        const handleFocus = () => updatePresence('online');
        const handleBlur = () => updatePresence('offline');

        // Add event listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        // Cleanup: set offline when component unmounts
        return () => {
            updatePresence('offline');
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, [user]);

    return null; // This hook doesn't return anything, it just manages presence
};
