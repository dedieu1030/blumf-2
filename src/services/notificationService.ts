
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Notification } from '@/types/notification';

/**
 * Fetch user notifications
 */
export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    // Check if notifications table exists first
    const { data: tableExists } = await supabase
      .from('notifications')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (tableExists === null) {
      console.warn('Notifications table does not exist yet');
      return [];
    }

    // If table exists, fetch notifications
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data as Notification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

/**
 * Marks a notification as read
 */
export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

/**
 * Marks all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};

/**
 * Creates a new notification
 */
export const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return false;
    }

    const notificationData = {
      ...notification,
      user_id: userData.user.id,
      is_read: false
    };

    const { error } = await supabase
      .from('notifications')
      .insert([notificationData]);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
};

/**
 * Subscribes to real-time notifications
 */
export const subscribeToNotifications = (
  onNotification: (notification: Notification) => void
) => {
  const channel = supabase
    .channel('notification-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      },
      (payload) => {
        const newNotification = payload.new as Notification;
        
        // Show toast notification
        toast(newNotification.title, {
          description: newNotification.message,
          duration: 5000
        });
        
        // Call the callback with the new notification
        onNotification(newNotification);
      }
    )
    .subscribe();
    
  // Return a cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
};

