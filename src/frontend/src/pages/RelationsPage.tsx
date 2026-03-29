import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import RelationCard from "../components/RelationCard";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { RELATION_TYPES } from "../lib/mockData";

export default function RelationsPage() {
  const { currentUser, isAdmin } = useAuth();
  const {
    members,
    relations,
    addRelation,
    confirmRelation,
    rejectRelation,
    deleteRelation,
  } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [targetUser, setTargetUser] = useState("");
  const [relationType, setRelationType] = useState("");

  const approved = members.filter(
    (m) => m.isApproved && m.id !== currentUser?.id,
  );
  const myRelations = relations.filter(
    (r) => r.fromId === currentUser?.id || r.toId === currentUser?.id,
  );
  const confirmed = myRelations.filter((r) => r.status === "confirmed");
  const pending = myRelations.filter((r) => r.status === "pending");

  const handleAdd = () => {
    if (!targetUser || !relationType || !currentUser) return;
    addRelation(currentUser.id, targetUser, relationType);
    setAddOpen(false);
    setTargetUser("");
    setRelationType("");
    toast.success("Relation request sent!");
  };

  // Simple SVG family tree
  const treeMembers = confirmed
    .slice(0, 6)
    .map((r) => {
      const other = members.find(
        (m) => m.id === (r.fromId === currentUser?.id ? r.toId : r.fromId),
      );
      return { relation: r, other };
    })
    .filter((x) => x.other);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">Family Relations</h1>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="relations.add.open_modal_button"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Relation
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="relations.add.dialog">
            <DialogHeader>
              <DialogTitle>Add Relation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Select Member</Label>
                <Select value={targetUser} onValueChange={setTargetUser}>
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="relations.member.select"
                  >
                    <SelectValue placeholder="Choose a family member" />
                  </SelectTrigger>
                  <SelectContent>
                    {approved.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Relation Type</Label>
                <Select value={relationType} onValueChange={setRelationType}>
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="relations.type.select"
                  >
                    <SelectValue placeholder="Choose relation type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAdd}
                  disabled={!targetUser || !relationType}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  data-ocid="relations.add.submit_button"
                >
                  Send Request
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                  data-ocid="relations.add.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Visual Family Tree */}
      {treeMembers.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Family Tree
          </h2>
          <div className="relative overflow-x-auto">
            <svg
              width="100%"
              height="180"
              viewBox="0 0 600 180"
              className="min-w-[400px]"
              role="img"
              aria-label="Family tree diagram"
            >
              <title>Family Tree</title>
              <circle
                cx="300"
                cy="100"
                r="28"
                fill="oklch(0.949 0.038 162.5)"
                stroke="oklch(0.548 0.122 162.5)"
                strokeWidth="2"
              />
              <text
                x="300"
                y="104"
                textAnchor="middle"
                fontSize="11"
                fill="oklch(0.197 0.016 200.0)"
                fontWeight="600"
              >
                {currentUser?.name.split(" ")[0]}
              </text>
              {treeMembers.map((item, i) => {
                const total = treeMembers.length;
                const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
                const r = 110;
                const cx = 300 + r * Math.cos(angle);
                const cy = 100 + r * Math.sin(angle);
                return (
                  <g key={item.relation.id}>
                    <line
                      x1="300"
                      y1="100"
                      x2={cx}
                      y2={cy}
                      stroke="oklch(0.929 0.012 162.5)"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="24"
                      fill="oklch(0.949 0.038 162.5)"
                      stroke="oklch(0.548 0.122 162.5)"
                      strokeWidth="1.5"
                    />
                    <text
                      x={cx}
                      y={cy - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fill="oklch(0.197 0.016 200.0)"
                      fontWeight="600"
                    >
                      {item.other?.name.split(" ")[0]}
                    </text>
                    <text
                      x={cx}
                      y={cy + 8}
                      textAnchor="middle"
                      fontSize="8"
                      fill="oklch(0.548 0.122 162.5)"
                    >
                      {item.relation.type}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Pending Requests */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground mb-3">
            Pending Requests
          </h2>
          <div className="space-y-2">
            {pending.map((rel, i) => (
              <RelationCard
                key={rel.id}
                relation={rel}
                fromMember={members.find((m) => m.id === rel.fromId)}
                toMember={members.find((m) => m.id === rel.toId)}
                currentUserId={currentUser?.id ?? ""}
                isAdmin={isAdmin}
                onConfirm={() => {
                  confirmRelation(rel.id);
                  toast.success("Relation confirmed!");
                }}
                onReject={() => {
                  rejectRelation(rel.id);
                  toast.success("Relation request rejected.");
                }}
                onDelete={() => {
                  deleteRelation(rel.id);
                  toast.success("Relation deleted.");
                }}
                index={i + 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Confirmed Relations */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">
          Confirmed Relations ({confirmed.length})
        </h2>
        {confirmed.length === 0 ? (
          <div
            className="bg-card rounded-2xl border border-border p-8 text-center"
            data-ocid="relations.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No confirmed relations yet. Add a relation to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {confirmed.map((rel, i) => (
              <RelationCard
                key={rel.id}
                relation={rel}
                fromMember={members.find((m) => m.id === rel.fromId)}
                toMember={members.find((m) => m.id === rel.toId)}
                currentUserId={currentUser?.id ?? ""}
                isAdmin={isAdmin}
                onDelete={() => {
                  deleteRelation(rel.id);
                  toast.success("Relation deleted.");
                }}
                index={i + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
