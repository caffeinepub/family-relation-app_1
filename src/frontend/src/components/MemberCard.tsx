import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  MoreVertical,
  ShieldCheck,
  ShieldPlus,
  UserX,
} from "lucide-react";
import type { Member, Relation } from "../lib/mockData";

interface MemberCardProps {
  member: Member;
  relation?: Relation;
  isAdmin?: boolean;
  onViewProfile?: () => void;
  onRemove?: () => void;
  onPromote?: () => void;
  index: number;
}

const statusLabel: Record<string, string> = {
  available: "Available",
  busy: "Busy",
  travelling: "Travelling",
};

const statusDot: Record<string, string> = {
  available: "bg-status-available",
  busy: "bg-status-busy",
  travelling: "bg-status-travelling",
};

export default function MemberCard({
  member,
  relation,
  isAdmin,
  onViewProfile,
  onRemove,
  onPromote,
  index,
}: MemberCardProps) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="bg-card rounded-2xl border border-border p-4 flex items-start gap-3 hover:shadow-md transition-shadow"
      data-ocid={`members.item.${index}`}
    >
      <button
        type="button"
        onClick={onViewProfile}
        className="relative flex-shrink-0"
      >
        <Avatar className="w-12 h-12">
          <AvatarImage src={member.photo} alt={member.name} />
          <AvatarFallback className="bg-secondary text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${statusDot[member.status]}`}
        />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onViewProfile}
            className="font-semibold text-foreground text-sm hover:text-primary transition-colors"
          >
            {member.name}
          </button>
          {member.isVerified && (
            <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          )}
          {member.role === "admin" && (
            <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            {member.role === "admin" ? "Admin" : "Member"}
          </Badge>
          {relation && (
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0">
              {relation.type}
            </Badge>
          )}
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span
              className={`w-1.5 h-1.5 rounded-full ${statusDot[member.status]}`}
            />
            {statusLabel[member.status]}
          </span>
        </div>

        {member.currentLocation && (
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            📍 {member.currentLocation}
          </p>
        )}
      </div>

      {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 flex-shrink-0"
              data-ocid={`members.item.${index}.dropdown_menu`}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewProfile}>
              View Profile
            </DropdownMenuItem>
            {member.role !== "admin" && (
              <DropdownMenuItem
                onClick={onPromote}
                data-ocid={`members.item.${index}.edit_button`}
              >
                <ShieldPlus className="w-4 h-4 mr-2" /> Promote to Admin
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={onRemove}
              className="text-destructive"
              data-ocid={`members.item.${index}.delete_button`}
            >
              <UserX className="w-4 h-4 mr-2" /> Remove Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
