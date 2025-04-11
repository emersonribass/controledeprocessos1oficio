
import { Button } from "@/components/ui/button";
import { BellIcon } from "lucide-react";
import NotificationsPopover from "../Notifications/NotificationsPopover";
import { useNotifications } from "@/hooks/useNotifications";
import { useState } from "react";

export const NotificationsButton = () => {
  const { unreadCount } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <NotificationsPopover
      open={notificationsOpen}
      onOpenChange={setNotificationsOpen}
    >
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setNotificationsOpen(true)}
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
    </NotificationsPopover>
  );
};
