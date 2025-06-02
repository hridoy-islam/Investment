import { NotificationItem } from '@/components/shared/notification-item';
import { socket, setupSocket } from '../../lib/socket';
import { useSelector } from 'react-redux';
import axiosInstance from '../../lib/axios';
import { useEffect, useState } from 'react';

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useSelector((state: any) => state.auth);

  // Fetch notifications on component mount
  useEffect(() => {
    const loadNotifications = async (userId: string) => {
      try {
        const { data } = await axiosInstance.get(`/notifications/${userId}`);
        setNotifications(data.data.result); // Set the fetched notifications in state
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (user?._id) {
      loadNotifications(user._id);
    }

    // Set up socket connection
    if (user?._id) {
      setupSocket(user._id);

      // Listen for real-time notifications
      socket.on('notification', (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      // Cleanup socket listeners on unmount
      return () => {
        socket.off('notification');
      };
    }
  }, [user?._id]);

  const markAsRead = async (id: string) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`, { isRead: true }); // API call to mark notification as read
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  return (
    <div className="container mx-auto mt-2">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Notifications</h1>
      </div>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            onClick={() => markAsRead(notification._id)}
            className="overflow-hidden rounded-lg"
          >
            <NotificationItem notification={notification} />
          </div>
        ))}
      </div>
    </div>
  );
}
