import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Trash2, X } from "lucide-react";
import type { Member, Relation } from "../lib/mockData";

interface RelationCardProps {
  relation: Relation;
  fromMember?: Member;
  toMember?: Member;
  currentUserId: string;
  isAdmin?: boolean;
  onConfirm?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  index: number;
}

export default function RelationCard({
  relation,
  fromMember,
  toMember,
  currentUserId,
  isAdmin,
  onConfirm,
  onReject,
  onDelete,
  index,
}: RelationCardProps) {
  const other = fromMember?.id === currentUserId ? toMember : fromMember;
  const isIncoming =
    relation.toId === currentUserId && relation.status === "pending";
  const initials =
    other?.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <div
      className="bg-card rounded-xl border border-border p-4 flex items-center gap-3"
      data-ocid={`relations.item.${index}`}
    >
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={other?.photo} alt={other?.name} />
        <AvatarFallback className="bg-secondary text-primary text-sm font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground truncate">
            {other?.name}
          </span>
          <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0 flex-shrink-0">
            {relation.type}
          </Badge>
        </div>
        <Badge
          variant={relation.status === "confirmed" ? "secondary" : "outline"}
          className="text-[10px] mt-0.5"
        >
          {relation.status === "confirmed"
            ? "✓ Confirmed"
            : isIncoming
              ? "Incoming Request"
              : "Pending"}
        </Badge>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {isIncoming && (
          <>
            <Button
              size="icon"
              className="w-7 h-7 bg-primary hover:bg-primary/90"
              onClick={onConfirm}
              data-ocid={`relations.item.${index}.confirm_button`}
            >
              <Check className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="w-7 h-7"
              onClick={onReject}
              data-ocid={`relations.item.${index}.cancel_button`}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
        {(isAdmin ||
          (relation.status === "confirmed" &&
            fromMember?.id === currentUserId)) && (
          <Button
            size="icon"
            variant="ghost"
            className="w-7 h-7 text-destructive hover:text-destructive"
            onClick={onDelete}
            data-ocid={`relations.item.${index}.delete_button`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
