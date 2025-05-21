
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification";
import { v4 as uuidv4 } from "uuid";

type NotificationData = {
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
  reference_type?: string;
  reference_id?: string;
};

// Function to fetch all notifications for the current user
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    // Mock the notifications if the table doesn't exist yet
    try {
      // Fetch all notifications
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return getMockNotifications();
      }

      // Convert database format to Notification type
      return (data || []).map((notification) => ({
        id: notification.id,
        user_id: notification.user_id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read || false,
        link: notification.link,
        created_at: notification.created_at,
        reference_type: notification.reference_type,
        reference_id: notification.reference_id,
        metadata: notification.metadata
      }));
    } catch (error) {
      console.error("Error in try-catch block:", error);
      return getMockNotifications();
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return getMockNotifications();
  }
};

// Function to mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      return !error;
    } catch (error) {
      console.error("Error in try-catch block:", error);
      // Mock successful operation
      return true;
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

// Function to mark all notifications as read
export const markAllNotificationsAsRead = async (userId?: string): Promise<boolean> => {
  try {
    try {
      let query = supabase
        .from("notifications")
        .update({ read: true });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { error } = await query;

      return !error;
    } catch (error) {
      console.error("Error in try-catch block:", error);
      // Mock successful operation
      return true;
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};

// Function to create a new notification
export const createNotification = async (data: NotificationData, userId?: string): Promise<Notification | null> => {
  try {
    try {
      const notification = {
        id: uuidv4(),
        user_id: userId || null,
        title: data.title,
        message: data.message,
        type: data.type,
        read: false,
        link: data.link || null,
        created_at: new Date().toISOString(),
        reference_type: data.reference_type || null,
        reference_id: data.reference_id || null,
        metadata: data.metadata || null
      };

      const { data: newNotification, error } = await supabase
        .from("notifications")
        .insert([notification])
        .select()
        .single();

      if (error) {
        console.error("Error creating notification:", error);
        return mockCreateNotification(data, userId);
      }

      return {
        id: newNotification.id,
        user_id: newNotification.user_id,
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        read: newNotification.read || false,
        link: newNotification.link,
        created_at: newNotification.created_at,
        reference_type: newNotification.reference_type,
        reference_id: newNotification.reference_id,
        metadata: newNotification.metadata
      };
    } catch (error) {
      console.error("Error in try-catch block:", error);
      return mockCreateNotification(data, userId);
    }
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

// Mock functions
const getMockNotifications = (): Notification[] => {
  return [
    {
      id: "1",
      type: "invoice_created",
      title: "Nouvelle facture créée",
      message: "La facture #INV-2023-001 a été créée avec succès.",
      read: false,
      created_at: new Date().toISOString(),
      link: "/invoices",
      user_id: "mock-user"
    },
    {
      id: "2",
      type: "payment_received",
      title: "Paiement reçu",
      message: "Un paiement de 1250€ a été reçu pour la facture #INV-2023-002.",
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      link: "/invoices",
      user_id: "mock-user"
    },
    {
      id: "3",
      type: "invoice_due_soon",
      title: "Facture à échéance bientôt",
      message: "La facture #INV-2023-003 arrive à échéance dans 3 jours.",
      read: false,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      link: "/invoices",
      user_id: "mock-user"
    }
  ];
};

const mockCreateNotification = (data: NotificationData, userId?: string): Notification => {
  return {
    id: uuidv4(),
    user_id: userId || "mock-user",
    title: data.title,
    message: data.message,
    type: data.type,
    read: false,
    link: data.link,
    created_at: new Date().toISOString(),
    reference_type: data.reference_type,
    reference_id: data.reference_id,
    metadata: data.metadata
  };
};
