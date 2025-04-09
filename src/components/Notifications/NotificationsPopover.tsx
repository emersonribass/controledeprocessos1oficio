
import { ReactNode } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BellOff, CheckCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface NotificationsPopoverProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const NotificationsPopover = ({ children, open, onOpenChange }: NotificationsPopoverProps) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notificationId: string, processId?: string) => {
    markAsRead(notificationId);
    
    // Se tiver um ID de processo, navegar para a página de detalhes do processo
    if (processId) {
      navigate(`/processes/${processId}`);
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold">
            Notificações
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                {unreadCount}
              </Badge>
            )}
          </h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary"
              onClick={() => markAllAsRead()}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <Separator />
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <BellOff className="h-8 w-8 text-muted-foreground mb-2" />
            <h4 className="text-sm font-medium">Sem notificações</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Você não tem nenhuma notificação no momento.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${!notification.read ? "bg-primary/5" : ""}`}
                  onClick={() => handleNotificationClick(notification.id, notification.processId)}
                >
                  <p className="text-sm">{notification.message}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(notification.createdAt), "dd MMM, HH:mm", { locale: ptBR })}
                    </p>
                    {!notification.read && (
                      <Badge variant="secondary" className="text-[10px] bg-primary text-primary-foreground h-5">
                        Nova
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
