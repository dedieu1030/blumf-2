
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification";
import { v4 as uuidv4 } from "uuid";

type NotificationData = {
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
};

// Function to fetch all notifications for the current user
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    // Get current user ID from localStorage or auth context
    const userId = localStorage.getItem("user_id") || undefined;

    // Fetch all notifications
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    // Convert database format to Notification type
    return (data || []).map((notification) => ({
      id: notification.id,
      user_id: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read || false, // Use 'read' instead of 'is_read'
      link: notification.link,
      created_at: notification.created_at,
      reference_type: notification.reference_type,
      reference_id: notification.reference_id,
      metadata: notification.metadata
    }));
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

// Function to mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true }) // Use 'read' instead of 'is_read'
      .eq("id", notificationId);

    return !error;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

// Function to mark all notifications as read
export const markAllNotificationsAsRead = async (userId?: string): Promise<boolean> => {
  try {
    let query = supabase
      .from("notifications")
      .update({ read: true }); // Use 'read' instead of 'is_read'

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { error } = await query;

    return !error;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};

// Function to create a new notification
export const createNotification = async (data: NotificationData, userId?: string): Promise<Notification | null> => {
  try {
    const notification = {
      id: uuidv4(),
      user_id: userId || null,
      title: data.title,
      message: data.message,
      type: data.type,
      read: false, // Use 'read' instead of 'is_read'
      link: data.link || null,
      created_at: new Date().toISOString(),
      metadata: data.metadata || null
    };

    const { data: newNotification, error } = await supabase
      .from("notifications")
      .insert([notification])
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return null;
    }

    return {
      id: newNotification.id,
      user_id: newNotification.user_id,
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type,
      read: newNotification.read || false, // Use 'read' instead of 'is_read' 
      link: newNotification.link,
      created_at: newNotification.created_at,
      metadata: newNotification.metadata
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// Function to delete a notification
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    return !error;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
};
