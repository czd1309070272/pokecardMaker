
import React, { useEffect } from 'react';
import { Notification } from '../types';
import { XIcon } from './Icons';

interface ToastProps {
    notifications: Notification[];
    removeNotification: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ notifications, removeNotification }) => {
    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
            {notifications.map(n => (
                <ToastItem key={n.id} notification={n} onDismiss={() => removeNotification(n.id)} />
            ))}
        </div>
    );
};

const ToastItem: React.FC<{ notification: Notification; onDismiss: () => void }> = ({ notification, onDismiss }) => {
    // Auto dismiss
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const bg = notification.type === 'success' ? 'bg-green-600' : notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600';

    return (
        <div className={`pointer-events-auto flex items-center gap-3 ${bg} text-white px-4 py-3 rounded-lg shadow-xl shadow-black/20 animate-in slide-in-from-right-full duration-300 min-w-[280px]`}>
            <div className="flex-grow text-sm font-bold">{notification.message}</div>
            <button onClick={onDismiss} className="hover:bg-white/20 rounded p-1 transition-colors">
                <XIcon className="w-4 h-4" />
            </button>
        </div>
    );
};
