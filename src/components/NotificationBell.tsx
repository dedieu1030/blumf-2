
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BellRing, Check, Clock, CreditCard, FileCheck, FileWarning } from "lucide-react";
import { useNotifications } from "@/context/NotificationsContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { NotificationsPanel } from "./NotificationsPanel";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [panelOpen, setPanelOpen] = useState(false);

  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    setOpen(false);

    // Handle navigation if notification has a link
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate("/notifications");
  };

  const handleOpenPanel = () => {
    setOpen(false);
    setPanelOpen(true);
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

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setPanelOpen(true)}
        >
          <BellRing className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
        <NotificationsPanel open={panelOpen} onOpenChange={setPanelOpen} />
      </>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <BellRing className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <div className="flex items-center justify-between p-4 pb-2">
            <h4 className="font-medium">Notifications</h4>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <ScrollArea className="h-[calc(var(--radix-popover-content-available-height)-110px)] pb-0">
            <div className="space-y-2 p-2">
              {recentNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-4">
                  <p className="text-sm text-muted-foreground">Pas de notifications</p>
                </div>
              ) : (
                recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-2 p-2 rounded-md cursor-pointer hover:bg-accent",
                      !notification.read && "bg-accent/50"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="mt-0.5 p-1 rounded-full bg-accent/70">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={cn(
                        "text-sm",
                        !notification.read ? "font-medium" : "text-muted-foreground"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(notification.created_at), "d MMM, HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between p-2 border-t">
            <Button variant="ghost" size="sm" onClick={handleViewAll}>
              Voir toutes
            </Button>
            {isMobile ? null : (
              <Button variant="outline" size="sm" onClick={handleOpenPanel}>
                Plein écran
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <NotificationsPanel open={panelOpen} onOpenChange={setPanelOpen} />
    </>
  );
}
