import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import MemberCard from "../components/MemberCard";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";

interface MembersPageProps {
  onNavigate: (p: Page, userId?: string) => void;
}

export default function MembersPage({ onNavigate }: MembersPageProps) {
  const { isAdmin } = useAuth();
  const { members, relations, removeMember, updateMember } = useApp();
  const [search, setSearch] = useState("");

  const approved = members.filter((m) => m.isApproved);
  const filtered = approved.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  const getRelation = (memberId: string) =>
    relations.find(
      (r) =>
        (r.fromId === memberId || r.toId === memberId) &&
        r.status === "confirmed",
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">Family Members</h1>
        <span className="text-sm text-muted-foreground">
          {approved.length} members
        </span>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-ocid="members.search_input"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12" data-ocid="members.empty_state">
          <p className="text-muted-foreground">No members found.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((member, i) => (
            <MemberCard
              key={member.id}
              member={member}
              relation={getRelation(member.id)}
              isAdmin={isAdmin}
              onViewProfile={() => onNavigate("profile", member.id)}
              onRemove={() => {
                removeMember(member.id);
                toast.success(`${member.name} removed.`);
              }}
              onPromote={() => {
                updateMember(member.id, { role: "admin" });
                toast.success(`${member.name} promoted to admin.`);
              }}
              index={i + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
