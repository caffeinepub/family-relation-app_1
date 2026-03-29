import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Member, Story } from "../lib/mockData";
import { getStoryCountdown } from "../lib/mockData";

interface StoryCircleProps {
  member: Member;
  story?: Story;
  isOwn?: boolean;
  onClick: () => void;
}

const statusRing: Record<string, string> = {
  available: "ring-2 ring-offset-1 ring-[oklch(0.723_0.178_145.0)]",
  busy: "ring-2 ring-offset-1 ring-[oklch(0.628_0.225_27.0)]",
  travelling: "ring-2 ring-offset-1 ring-[oklch(0.748_0.172_65.0)]",
};

export default function StoryCircle({
  member,
  story,
  isOwn,
  onClick,
}: StoryCircleProps) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const hasStory = !!story;
  const storyRing = hasStory
    ? "ring-2 ring-offset-2 ring-primary"
    : (statusRing[member.status] ?? "");

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16"
      data-ocid="story.item.1"
    >
      <div className="relative">
        <Avatar className={`w-14 h-14 ${storyRing}`}>
          <AvatarImage src={member.photo} alt={member.name} />
          <AvatarFallback className="bg-secondary text-primary font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        {isOwn && (
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full border-2 border-card flex items-center justify-center">
            <span className="text-primary-foreground text-[10px] font-bold leading-none">
              +
            </span>
          </div>
        )}
        <span
          className={`absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-card ${
            member.status === "available"
              ? "bg-status-available"
              : member.status === "busy"
                ? "bg-status-busy"
                : "bg-status-travelling"
          }`}
        />
      </div>
      <span className="text-[10px] text-foreground font-medium text-center leading-tight w-full truncate">
        {isOwn ? "Your Story" : member.name.split(" ")[0]}
      </span>
      {story && (
        <span className="text-[9px] text-muted-foreground">
          {getStoryCountdown(story.expiresAt)}
        </span>
      )}
    </button>
  );
}
