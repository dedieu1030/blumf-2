
import React, { createContext, useContext, useState, useEffect } from "react";
import { Notification } from "@/types/notification";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";
import { initializeTables } from "@/utils/mockDatabaseSetup";

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchUserNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loading: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUserNotifications = async () => {
    setLoading(true);
    try {
      const userNotifications = await fetchNotifications();
      setNotifications(userNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const success = await markNotificationAsRead(id);
      if (success) {
        setNotifications(
          notifications.map((notification) => {
            if (notification.id === id) {
              return { ...notification, read: true };
            }
            return notification;
          })
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const success = await markAllNotificationsAsRead();
      if (success) {
        setNotifications(
          notifications.map((notification) => ({ ...notification, read: true }))
        );
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  useEffect(() => {
    // Initialize tables to ensure they exist
    initializeTables();
    
    // Fetch notifications
    fetchUserNotifications();
    
    // Set up polling for new notifications every 5 minutes
    const intervalId = setInterval(fetchUserNotifications, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchUserNotifications,
        markAsRead,
        markAllAsRead,
        loading,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};
