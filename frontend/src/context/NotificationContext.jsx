import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const subscriptionRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const data = await api.get('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const setupSubscription = useCallback(() => {
        if (!user) return;

        // Cleanup existing subscription
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
        }

        try {
            const channel = supabase
                .channel(`notifications:${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        const newNotification = payload.new;
                        setNotifications(prev => [newNotification, ...prev]);
                        setUnreadCount(prev => prev + 1);
                        toast(newNotification.title, {
                            icon: '🔔',
                            duration: 4000
                        });
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        // console.log('Subscribed to notifications');
                    } else if (status === 'CHANNEL_ERROR') {
                        console.warn('Failed to subscribe to notifications channel (retrying...)');
                        setTimeout(() => setupSubscription(), 5000); // Retry after 5s
                    } else if (status === 'TIMED_OUT') {
                        console.warn('Notification subscription timed out - retrying in 5s');
                        setTimeout(() => setupSubscription(), 5000); // Retry after 5s
                    }
                });

            subscriptionRef.current = channel;

        } catch (error) {
            console.error('Error setting up notification subscription:', error);
            setTimeout(() => setupSubscription(), 10000); // Retry after 10s on error
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            setupSubscription();
        }

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
        };
    }, [user, setupSubscription]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
