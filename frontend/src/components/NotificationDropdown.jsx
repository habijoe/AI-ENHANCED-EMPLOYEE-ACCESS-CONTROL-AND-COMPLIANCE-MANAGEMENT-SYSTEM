import React, { useRef, useEffect } from 'react';
import {
    Bell,
    X,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    Info,
    Clock,
    UserCheck,
    Shield,
    FileText,
    Settings,
    Trash2,
    CheckCheck
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export function NotificationDropdown({ isOpen, onClose }) {
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        clearNotifications,
    } = useNotifications();

    const dropdownRef = useRef(null);

    // Debug: Log notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            console.log('🔔 [NotificationDropdown] Dropdown opened');
            console.log('🔔 [NotificationDropdown] Notifications:', notifications);
            console.log('🔔 [NotificationDropdown] Unread count:', unreadCount);
            console.log('🔔 [NotificationDropdown] Loading:', loading);
        }
    }, [isOpen, notifications, unreadCount, loading]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                console.log('🔔 [NotificationDropdown] Clicked outside, closing');
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const getIcon = (type) => {
        switch (type) {
            case 'danger':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'info':
                return <Info className="h-5 w-5 text-blue-500" />;
            case 'assignment':
                return <UserCheck className="h-5 w-5 text-purple-500" />;
            case 'security':
                return <Shield className="h-5 w-5 text-indigo-500" />;
            case 'report':
                return <FileText className="h-5 w-5 text-orange-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const getTimeAgo = (timestamp) => {
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch {
            return 'Unknown';
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Notifications</span>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={clearNotifications}
                            className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Clear
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-4 w-4 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No notifications</p>
                        <p className="text-sm text-gray-400">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">

                        {notifications.map((notification) => {
                            console.log('🔔 [NotificationDropdown] Rendering notification:', notification);
                            return (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.is_read ? 'bg-blue-50/50' : ''
                                        }`}
                                    onClick={() => {
                                        console.log(`🔔 [NotificationDropdown] Clicked notification ${notification.id}`);
                                        if (!notification.is_read) {
                                            markAsRead(notification.id);
                                        }
                                        if (notification.action_link) {
                                            console.log(`🔔 [NotificationDropdown] Navigating to: ${notification.action_link}`);
                                            window.location.href = notification.action_link;
                                            onClose();
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getIcon(notification.notification_type || notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.message || notification.title}
                                                </p>
                                                {!notification.is_read && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                                )}
                                            </div>
                                            {notification.title && notification.title !== notification.message && (
                                                <p className="text-xs text-gray-500 mt-0.5">{notification.title}</p>
                                            )}
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {notification.time_ago || getTimeAgo(notification.created_at)}
                                                </span>
                                                {notification.priority && notification.priority !== 'medium' && (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${notification.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                            notification.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                                notification.priority === 'low' ? 'bg-gray-100 text-gray-600' :
                                                                    'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {notification.priority.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            {/* {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-center">
                    <button
                        onClick={() => {
                            console.log('🔔 [NotificationDropdown] View all notifications clicked');
                            onClose();
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        View all notifications
                    </button>
                </div>
            )} */}
        </div>
    );
}