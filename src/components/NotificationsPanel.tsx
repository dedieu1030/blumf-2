
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BellRing, Check, CircleAlert, Clock, CreditCard, FileCheck, FileWarning } from "lucide-react";
import { useNotifications } from "@/context/NotificationsContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export function NotificationsPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { notifications, markAsRead, markAllAsRead, loading } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle navigation if notification has a link
    if (notification.link) {
      onOpenChange(false);
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'invoice_created':
        return <FileCheck className="h-4 w-4 text-blue-500" />;
      case 'invoice_due_soon':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'invoice_overdue':
        return <FileWarning className="h-4 w-4 text-red-500" />;
      default:
        return <BellRing className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="space-y-2 pb-4">
          <div className="flex justify-between items-center">
            <SheetTitle className="flex items-center">
              <BellRing className="h-5 w-5 mr-2" />
              Notifications
            </SheetTitle>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs flex items-center h-8"
                onClick={() => markAllAsRead()}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Marquer tout comme lu
              </Button>
            )}
          </div>
          <Separator />
        </SheetHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 p-8">
            <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mb-4"></div>
            <p className="text-muted-foreground">Chargement des notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 p-8">
            <div className="bg-muted/50 p-3 rounded-full mb-3">
              <BellRing className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium">Pas de notifications</h3>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Vous n'avez pas reçu de notifications récemment.
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-1">
            <div className="space-y-4 py-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-colors",
                    notification.read
                      ? "bg-background"
                      : "bg-muted/30 border-muted-foreground/20"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex gap-3">
                      <div className={cn(
                        "mt-0.5 p-1.5 rounded-full",
                        notification.read ? "bg-muted" : "bg-primary/10"
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div>
                        <h4 className={cn(
                          "text-sm font-medium",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                          {!notification.read && (
                            <span className="inline-flex ml-2 w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-2">
                          {format(new Date(notification.created_at), "d MMM, HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}
