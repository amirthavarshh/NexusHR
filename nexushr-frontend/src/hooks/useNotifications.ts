import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { api } from '../api';

export interface NotificationDTO {
    id: number;
    title: string;
    message: string;
    type: string;
    recipientId: number;
    senderId: number;
    read: boolean;
    createdAt: string;
}

export function useNotifications(userId: number | undefined) {
    const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!userId) return;

        // Initial fetch
        api.getMyNotifications().then(setNotifications).catch(console.error);
        api.getUnreadCount().then(setUnreadCount).catch(console.error);

        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                stompClient.subscribe(`/user/${userId}/queue/notifications`, (message: any) => {
                    const newNotif = JSON.parse(message.body);
                    setNotifications(prev => [newNotif, ...prev]);
                    setUnreadCount(prev => prev + 1);
                });
            },
        });

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, [userId]);

    const markAsRead = async (id: number) => {
        await api.markNotificationAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        await api.markAllNotificationsAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const deleteNotification = async (id: number) => {
        await api.deleteNotification(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        // recalculate unread if deleted was unread, handled locally or re-fetch
    };

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification
    };
}
