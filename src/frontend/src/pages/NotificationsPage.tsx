import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";
import NotificationItem from "../components/NotificationItem";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } =
    useApp();

  const myNotifs = notifications
    .filter((n) => n.userId === currentUser?.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const unread = myNotifs.filter((n) => !n.isRead);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          {unread.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {unread.length} unread
            </p>
          )}
        </div>
        {unread.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllNotificationsRead}
            data-ocid="notifications.mark_all.button"
          >
            <CheckCheck className="w-4 h-4 mr-1.5" /> Mark all read
          </Button>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {myNotifs.length === 0 ? (
          <div
            className="p-12 text-center"
            data-ocid="notifications.empty_state"
          >
            <p className="text-3xl mb-2">🔔</p>
            <p className="text-muted-foreground text-sm">
              No notifications yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {myNotifs.map((n, i) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={() => markNotificationRead(n.id)}
                index={i + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
