import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const NotificationContext = createContext();
const BASE_URL = "http://127.0.0.1:8000";

// ============================================================
// NOTIFICATION PROVIDER
// ============================================================

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [urgentCount, setUrgentCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [error, setError] = useState(null);

    // Refs for managing intervals and abort controllers
    const intervalRef = useRef(null);
    const abortControllerRef = useRef(null);
    const isMountedRef = useRef(true);

    // ============================================================
    // FETCH NOTIFICATIONS
    // ============================================================

    const fetchNotifications = useCallback(async (silent = false) => {
        console.log('🔔 [NotificationProvider] fetchNotifications called', { silent });

        if (!silent) {
            setLoading(true);
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const token = localStorage.getItem('access_token');
            console.log('🔔 [NotificationProvider] Token exists?', !!token);

            if (!token) {
                console.log('🔔 [NotificationProvider] No token, clearing notifications');
                setNotifications([]);
                setUnreadCount(0);
                setUrgentCount(0);
                return;
            }

            console.log('🔔 [NotificationProvider] Triggering notification generation...');
            // First, trigger notification generation for this user
            await axios.post(
                `${BASE_URL}/notifications/trigger/`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                }
            );
            console.log('🔔 [NotificationProvider] Notification generation triggered successfully');

            // Then fetch all notifications
            console.log('🔔 [NotificationProvider] Fetching notifications from API...');
            const response = await axios.get(
                `${BASE_URL}/notifications/`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                }
            );

            console.log('🔔 [NotificationProvider] API Response:', response.data);
            console.log('🔔 [NotificationProvider] Response type:', typeof response.data);
            console.log('🔔 [NotificationProvider] Is array?', Array.isArray(response.data));

            if (!isMountedRef.current) {
                console.log('🔔 [NotificationProvider] Component unmounted, ignoring response');
                return;
            }

            // Check if response is an array (direct notification list)
            if (Array.isArray(response.data)) {
                console.log(`🔔 [NotificationProvider] Received ${response.data.length} notifications (array format)`);
                console.log('🔔 [NotificationProvider] Notifications data:', JSON.stringify(response.data, null, 2));

                const notifs = response.data;
                setNotifications(notifs);

                // Calculate unread count from the data
                const unread = notifs.filter(n => !n.is_read).length;
                setUnreadCount(unread);

                const urgent = notifs.filter(n =>
                    !n.is_read && (n.priority === 'urgent' || n.priority === 'high')
                ).length;
                setUrgentCount(urgent);

                console.log(`🔔 [NotificationProvider] State updated - Total: ${notifs.length}, Unread: ${unread}, Urgent: ${urgent}`);
                setError(null);
            }
            // Check if response has a success field
            else if (response.data && response.data.success === true) {
                const notifs = response.data.notifications || [];
                console.log(`🔔 [NotificationProvider] Received ${notifs.length} notifications (success format)`);
                console.log('🔔 [NotificationProvider] Notifications data:', JSON.stringify(notifs, null, 2));

                setNotifications(notifs);
                setUnreadCount(response.data.unread_count || 0);

                const urgent = notifs.filter(n =>
                    !n.is_read && (n.priority === 'urgent' || n.priority === 'high')
                ).length;
                setUrgentCount(urgent);

                console.log(`🔔 [NotificationProvider] State updated - Total: ${notifs.length}, Unread: ${response.data.unread_count}, Urgent: ${urgent}`);
                setError(null);
            }
            // Handle case where response is an object with notifications array but no success field
            else if (response.data && response.data.notifications && Array.isArray(response.data.notifications)) {
                const notifs = response.data.notifications;
                console.log(`🔔 [NotificationProvider] Received ${notifs.length} notifications (object with notifications array)`);

                setNotifications(notifs);
                const unread = notifs.filter(n => !n.is_read).length;
                setUnreadCount(unread);

                const urgent = notifs.filter(n =>
                    !n.is_read && (n.priority === 'urgent' || n.priority === 'high')
                ).length;
                setUrgentCount(urgent);

                console.log(`🔔 [NotificationProvider] State updated - Total: ${notifs.length}, Unread: ${unread}, Urgent: ${urgent}`);
                setError(null);
            }
            else {
                console.log('🔔 [NotificationProvider] Unexpected response format:', response.data);
                // If we got data but in unexpected format, try to use it anyway
                if (response.data && typeof response.data === 'object') {
                    // Try to extract notifications from response
                    let notifs = [];
                    if (Array.isArray(response.data)) {
                        notifs = response.data;
                    } else if (response.data.results && Array.isArray(response.data.results)) {
                        notifs = response.data.results;
                    } else {
                        // Try to find any array in the response
                        for (let key in response.data) {
                            if (Array.isArray(response.data[key])) {
                                notifs = response.data[key];
                                break;
                            }
                        }
                    }

                    if (notifs.length > 0) {
                        console.log(`🔔 [NotificationProvider] Extracted ${notifs.length} notifications from response`);
                        setNotifications(notifs);
                        const unread = notifs.filter(n => !n.is_read).length;
                        setUnreadCount(unread);
                        const urgent = notifs.filter(n =>
                            !n.is_read && (n.priority === 'urgent' || n.priority === 'high')
                        ).length;
                        setUrgentCount(urgent);
                        setError(null);
                    } else {
                        console.log('🔔 [NotificationProvider] No notifications found in response');
                        setNotifications([]);
                        setUnreadCount(0);
                        setUrgentCount(0);
                    }
                } else {
                    setNotifications([]);
                    setUnreadCount(0);
                    setUrgentCount(0);
                }
            }
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('🔔 [NotificationProvider] Request was cancelled');
                return;
            }

            console.error('🔔 [NotificationProvider] Error fetching notifications:', error);
            console.error('🔔 [NotificationProvider] Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            if (isMountedRef.current && !silent) {
                setError('Failed to load notifications');
                if (error.response?.status !== 401) {
                    toast.error('Failed to load notifications');
                }
            }
        } finally {
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }

            if (isMountedRef.current && !silent) {
                setLoading(false);
            }
        }
    }, []);

    // ============================================================
    // MARK AS READ
    // ============================================================

    const markAsRead = useCallback(async (notificationId) => {
        console.log(`🔔 [NotificationProvider] Marking notification ${notificationId} as read`);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.log('🔔 [NotificationProvider] No token, cannot mark as read');
                return;
            }

            await axios.post(
                `${BASE_URL}/notifications/${notificationId}/read/`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`🔔 [NotificationProvider] Notification ${notificationId} marked as read`);

            setNotifications(prev => {
                const updated = prev.map(n =>
                    n.id === notificationId ? { ...n, is_read: true } : n
                );
                console.log(`🔔 [NotificationProvider] Updated notifications: ${updated.length} total`);
                return updated;
            });

            setUnreadCount(prev => {
                const newCount = Math.max(0, prev - 1);
                console.log(`🔔 [NotificationProvider] Unread count updated: ${newCount}`);
                return newCount;
            });

            const notification = notifications.find(n => n.id === notificationId);
            if (notification && (notification.priority === 'urgent' || notification.priority === 'high')) {
                setUrgentCount(prev => Math.max(0, prev - 1));
            }

        } catch (error) {
            console.error('🔔 [NotificationProvider] Error marking notification as read:', error);
            toast.error('Failed to mark notification as read');
        }
    }, [notifications]);

    // ============================================================
    // MARK ALL AS READ
    // ============================================================

    const markAllAsRead = useCallback(async () => {
        console.log('🔔 [NotificationProvider] Marking all notifications as read');

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.log('🔔 [NotificationProvider] No token, cannot mark all as read');
                return;
            }

            const response = await axios.post(
                `${BASE_URL}/notifications/mark-all-read/`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('🔔 [NotificationProvider] Mark all as read response:', response.data);

            if (response.data.success) {
                setNotifications(prev => {
                    const marked = prev.map(n => ({ ...n, is_read: true }));
                    console.log(`🔔 [NotificationProvider] Marked ${marked.length} notifications as read`);
                    return marked;
                });
                setUnreadCount(0);
                setUrgentCount(0);
                toast.success('All notifications marked as read');
            }
        } catch (error) {
            console.error('🔔 [NotificationProvider] Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        }
    }, []);

    // ============================================================
    // CLEAR NOTIFICATIONS
    // ============================================================

    // ============================================================
    // CLEAR NOTIFICATIONS
    // ============================================================

    const clearNotifications = useCallback(async () => {
        console.log('🔔 [NotificationProvider] Clearing all notifications');

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.log('🔔 [NotificationProvider] No token, cannot clear notifications');
                return;
            }

            // Changed from DELETE to POST
            const response = await axios.post(
                `${BASE_URL}/notifications/clear-all/`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('🔔 [NotificationProvider] Clear response:', response.data);

            if (response.data.success) {
                setNotifications([]);
                setUnreadCount(0);
                setUrgentCount(0);
                toast.success(response.data.message || 'Notifications cleared');
            } else {
                toast.error(response.data.message || 'Failed to clear notifications');
            }
        } catch (error) {
            console.error('🔔 [NotificationProvider] Error clearing notifications:', error);
            toast.error('Failed to clear notifications');
        }
    }, []);

    // ============================================================
    // DELETE NOTIFICATION
    // ============================================================

    const deleteNotification = useCallback(async (notificationId) => {
        console.log(`🔔 [NotificationProvider] Deleting notification ${notificationId}`);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.log('🔔 [NotificationProvider] No token, cannot delete notification');
                return;
            }

            // Changed from DELETE to POST
            const response = await axios.post(
                `${BASE_URL}/notifications/${notificationId}/delete/`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('🔔 [NotificationProvider] Delete response:', response.data);

            if (response.data.success) {
                const notification = notifications.find(n => n.id === notificationId);
                setNotifications(prev => {
                    const filtered = prev.filter(n => n.id !== notificationId);
                    console.log(`🔔 [NotificationProvider] Remaining notifications: ${filtered.length}`);
                    return filtered;
                });

                if (notification && !notification.is_read) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                    if (notification.priority === 'urgent' || notification.priority === 'high') {
                        setUrgentCount(prev => Math.max(0, prev - 1));
                    }
                }

                toast.success('Notification deleted');
            } else {
                toast.error(response.data.message || 'Failed to delete notification');
            }
        } catch (error) {
            console.error('🔔 [NotificationProvider] Error deleting notification:', error);
            toast.error('Failed to delete notification');
        }
    }, [notifications]);



    // ============================================================
    // ADD NOTIFICATION
    // ============================================================

    const addNotification = useCallback((notification) => {
        console.log('🔔 [NotificationProvider] Adding notification:', notification);

        setNotifications(prev => {
            const exists = prev.some(n => n.id === notification.id);
            if (exists) {
                console.log('🔔 [NotificationProvider] Notification already exists, skipping');
                return prev;
            }

            const newList = [notification, ...prev];
            console.log(`🔔 [NotificationProvider] Added notification, total: ${newList.length}`);

            if (!notification.is_read) {
                setUnreadCount(count => {
                    const newCount = count + 1;
                    console.log(`🔔 [NotificationProvider] Unread count increased to ${newCount}`);
                    return newCount;
                });
                if (notification.priority === 'urgent' || notification.priority === 'high') {
                    setUrgentCount(count => {
                        const newCount = count + 1;
                        console.log(`🔔 [NotificationProvider] Urgent count increased to ${newCount}`);
                        return newCount;
                    });
                }
            }

            return newList;
        });
    }, []);

    // ============================================================
    // GET NOTIFICATION COUNT
    // ============================================================

    const getNotificationCounts = useCallback(async () => {
        console.log('🔔 [NotificationProvider] Getting notification counts');

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.log('🔔 [NotificationProvider] No token, cannot get counts');
                return null;
            }

            const response = await axios.get(
                `${BASE_URL}/notifications/counts/`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('🔔 [NotificationProvider] Counts response:', response.data);

            if (response.data.success) {
                return response.data.counts;
            }
            return null;
        } catch (error) {
            console.error('🔔 [NotificationProvider] Error getting notification counts:', error);
            return null;
        }
    }, []);

    // ============================================================
    // REFRESH NOTIFICATIONS
    // ============================================================

    const refreshNotifications = useCallback(async () => {
        console.log('🔔 [NotificationProvider] Manual refresh requested');
        await fetchNotifications(false);
    }, [fetchNotifications]);

    // ============================================================
    // SETUP EFFECTS
    // ============================================================

    useEffect(() => {
        console.log('🔔 [NotificationProvider] Component mounted');
        isMountedRef.current = true;

        fetchNotifications(false);

        intervalRef.current = setInterval(() => {
            console.log('🔔 [NotificationProvider] Polling interval triggered');
            fetchNotifications(true);
        }, 30000);

        return () => {
            console.log('🔔 [NotificationProvider] Component unmounting');
            isMountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
        };
    }, [fetchNotifications]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('🔔 [NotificationProvider] Tab became visible, refreshing');
                fetchNotifications(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchNotifications]);

    // ============================================================
    // PROVIDER VALUE
    // ============================================================

    const value = {
        notifications,
        unreadCount,
        urgentCount,
        loading,
        showDropdown,
        setShowDropdown,
        error,
        fetchNotifications,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        deleteNotification,
        addNotification,
        getNotificationCounts,
        hasUnread: unreadCount > 0,
        hasUrgent: urgentCount > 0,
        totalCount: notifications.length,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

// ============================================================
// CUSTOM HOOK
// ============================================================

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

// ============================================================
// OPTIONAL: WITH_NOTIFICATIONS HOC
// ============================================================

export function withNotifications(Component) {
    return function WrappedWithNotifications(props) {
        const notificationProps = useNotifications();
        return <Component {...props} notifications={notificationProps} />;
    };
}