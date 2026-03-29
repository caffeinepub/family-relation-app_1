import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { Member, Relation, Story } from "../lib/mockData";
import { formatRelativeTime } from "../lib/mockData";

interface ActivityItem {
  id: string;
  type: "story" | "relation" | "joined" | "profile";
  actor: Member;
  subject?: Member;
  story?: Story;
  relation?: Relation;
  timestamp: string;
  message: string;
}

interface ActivityCardProps {
  item: ActivityItem;
  index: number;
}

export default function ActivityCard({ item, index }: ActivityCardProps) {
  const initials = item.actor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="bg-card rounded-2xl border border-border p-4"
      data-ocid={`activity.item.${index}`}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <Avatar className="w-10 h-10">
            <AvatarImage src={item.actor.photo} alt={item.actor.name} />
            <AvatarFallback className="bg-secondary text-primary text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sm text-foreground">
              {item.actor.name}
            </span>
            {item.actor.isVerified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            )}
            {item.actor.role === "admin" && (
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            )}
            {item.relation && (
              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0">
                {item.relation.type}
              </Badge>
            )}
            <span className="text-[11px] text-muted-foreground ml-auto">
              {formatRelativeTime(item.timestamp)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{item.message}</p>
          {item.story && item.story.type === "text" && (
            <div className="mt-2 p-3 bg-muted rounded-xl">
              <p className="text-sm text-foreground">{item.story.content}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export type { ActivityItem };
