import React from 'react';
import { Notification } from '../types';
import { Icon } from './Icon';
import { toDate } from '../utils/format';

interface NotificationDropdownProps {
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    onMarkAllAsRead: () => void;
}

const timeSince = (input?: string | Date | null): string => {
    const d = toDate(input);
    if (!d) return '0 s';
    const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} años`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} días`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} h`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} m`;
    return `${Math.floor(seconds)} s`;
};


const NotificationItem: React.FC<{ notification: Notification; onClick: () => void; }> = ({ notification, onClick }) => {
    const iconMap: Record<Notification['type'], any> = {
        'NEW_ASSIGNMENT': { name: 'wrench', color: 'text-blue-400' },
        'DIAGNOSTIC_COMPLETED': { name: 'clipboard', color: 'text-yellow-400' },
        'QUOTE_APPROVED': { name: 'check-circle', color: 'text-green-400' },
        'QUOTE_REJECTED': { name: 'x-circle', color: 'text-red-400' },
        'UNFORESEEN_ISSUE_REPORTED': { name: 'exclamation-triangle', color: 'text-orange-400' },
        'WORK_ORDER_CREATED': { name: 'plus', color: 'text-purple-400' },
        'WORK_ORDER_CANCELED': { name: 'trash', color: 'text-gray-400' },
        'WELCOME': { name: 'bell', color: 'text-brand-red' },
    };
    const icon = iconMap[notification.type] || { name: 'bell', color: 'text-gray-400' };

    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-3 flex items-start gap-3 transition-colors ${
                notification.isRead ? 'hover:bg-gray-800/50' : 'bg-brand-red/10 hover:bg-brand-red/20'
            }`}
        >
            <div className={`mt-1 flex-shrink-0 ${icon.color}`}>
                <Icon name={icon.name} className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <p className={`text-sm ${notification.isRead ? 'text-gray-300' : 'text-white font-semibold'}`}>
                    {notification.message}
                </p>
                <p className="text-xs text-gray-500">{timeSince(notification.timestamp)} atrás</p>
            </div>
            {!notification.isRead && (
                <div className="w-2.5 h-2.5 bg-brand-red rounded-full mt-1.5 flex-shrink-0"></div>
            )}
        </button>
    );
};


const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onNotificationClick, onMarkAllAsRead }) => {
    return (
        <div className="absolute right-0 mt-2 w-80 bg-dark-light rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5">
            <div className="flex justify-between items-center p-3 border-b border-gray-700">
                <h3 className="font-semibold text-white">Notificaciones</h3>
                <button 
                    onClick={onMarkAllAsRead}
                    className="text-xs text-brand-red hover:underline"
                >
                    Marcar todo como leído
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <NotificationItem key={notif.id} notification={notif} onClick={() => onNotificationClick(notif)} />
                    ))
                ) : (
                    <div className="p-6 text-center text-sm text-gray-500">
                        No tienes notificaciones.
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;