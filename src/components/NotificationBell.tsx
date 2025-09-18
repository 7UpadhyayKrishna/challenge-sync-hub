import { useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleNotificationClick = (notificationId: string, read: boolean) => {
    if (!read) {
      markAsRead(notificationId);
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-auto p-1"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No notifications yet
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`px-3 py-3 cursor-pointer ${
                  !notification.read ? 'bg-accent/20' : ''
                }`}
                onClick={() => handleNotificationClick(notification.id, notification.read)}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full ml-2 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};