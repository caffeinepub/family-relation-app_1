import {
  Bell,
  BookOpen,
  Calendar,
  GitBranch,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Notification } from "../lib/mockData";
import { formatRelativeTime } from "../lib/mockData";

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  index: number;
}

const typeIcon: Record<string, React.ReactNode> = {
  join: <Users className="w-4 h-4" />,
  relation: <GitBranch className="w-4 h-4" />,
  profile: <Users className="w-4 h-4" />,
  story: <BookOpen className="w-4 h-4" />,
  reminder: <Calendar className="w-4 h-4" />,
  approval: <ShieldCheck className="w-4 h-4" />,
};

const typeColor: Record<string, string> = {
  join: "bg-primary/10 text-primary",
  relation: "bg-blue-100 text-blue-600",
  profile: "bg-purple-100 text-purple-600",
  story: "bg-amber-100 text-amber-600",
  reminder: "bg-rose-100 text-rose-600",
  approval: "bg-primary/10 text-primary",
};

export default function NotificationItem({
  notification,
  onClick,
  index,
}: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors rounded-xl ${
        !notification.isRead ? "bg-secondary/40" : ""
      }`}
      data-ocid={`notifications.item.${index}`}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${typeColor[notification.type] ?? "bg-muted text-muted-foreground"}`}
      >
        {typeIcon[notification.type] ?? <Bell className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${!notification.isRead ? "font-medium text-foreground" : "text-muted-foreground"}`}
        >
          {notification.message}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
      )}
    </button>
  );
}
