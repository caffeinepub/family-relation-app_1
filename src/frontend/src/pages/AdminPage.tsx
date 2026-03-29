import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  CheckCircle2,
  GitBranch,
  ShieldCheck,
  UserX,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { Page } from "../App";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";

interface AdminPageProps {
  onNavigate: (p: Page, userId?: string) => void;
}

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const { isAdmin } = useAuth();
  const {
    members,
    relations,
    stories,
    joinRequests,
    approveJoinRequest,
    rejectJoinRequest,
    updateMember,
    removeMember,
  } = useApp();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    );
  }

  const approved = members.filter((m) => m.isApproved);
  const unverified = approved.filter((m) => !m.isVerified);

  const stats = [
    {
      label: "Total Members",
      value: approved.length,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Pending Requests",
      value: joinRequests.length,
      icon: Users,
      color: "text-status-travelling",
    },
    {
      label: "Active Stories",
      value: stories.filter((s) => new Date(s.expiresAt) > new Date()).length,
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      label: "Total Relations",
      value: relations.filter((r) => r.status === "confirmed").length,
      icon: GitBranch,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-primary" /> Admin Dashboard
      </h1>

      {/* Stats */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        data-ocid="admin.stats.section"
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-2xl border border-border p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Pending Join Requests */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Pending Join Requests ({joinRequests.length})
        </h2>
        {joinRequests.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="admin.requests.empty_state"
          >
            No pending requests.
          </p>
        ) : (
          <div className="space-y-3">
            {joinRequests.map((req, i) => (
              <div
                key={req.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
                data-ocid={`admin.requests.item.${i + 1}`}
              >
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-sm">
                    {req.name[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {req.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{req.email}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(req.requestedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-7 text-xs"
                    onClick={() => {
                      approveJoinRequest(req.id);
                      toast.success(`${req.name} approved!`);
                    }}
                    data-ocid={`admin.requests.item.${i + 1}.confirm_button`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-destructive border-destructive/30"
                    onClick={() => {
                      rejectJoinRequest(req.id);
                      toast.success("Request rejected.");
                    }}
                    data-ocid={`admin.requests.item.${i + 1}.cancel_button`}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unverified Profiles */}
      {unverified.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Profiles Awaiting Verification ({unverified.length})
          </h2>
          <div className="space-y-2">
            {unverified.map((m, i) => {
              const initials = m.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
                  data-ocid={`admin.verify.item.${i + 1}`}
                >
                  <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarImage src={m.photo} />
                    <AvatarFallback className="bg-secondary text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {m.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs flex-shrink-0"
                    onClick={() => {
                      updateMember(m.id, { isVerified: true });
                      toast.success(`${m.name} verified!`);
                    }}
                    data-ocid={`admin.verify.item.${i + 1}.confirm_button`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verify
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Member Management Table */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Member Management
        </h2>
        <div className="overflow-x-auto">
          <Table data-ocid="admin.members.table">
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approved.map((m, i) => {
                const initials = m.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <TableRow key={m.id} data-ocid={`admin.members.row.${i + 1}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={m.photo} />
                          <AvatarFallback className="bg-secondary text-primary text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {m.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {m.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={m.role === "admin" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {m.role === "admin" ? "Admin" : "Member"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs capitalize flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            m.status === "available"
                              ? "bg-status-available"
                              : m.status === "busy"
                                ? "bg-status-busy"
                                : "bg-status-travelling"
                          }`}
                        />
                        {m.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {m.isVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => onNavigate("profile", m.id)}
                        >
                          View
                        </Button>
                        {m.role !== "admin" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-primary"
                            onClick={() => {
                              updateMember(m.id, { role: "admin" });
                              toast.success(`${m.name} promoted!`);
                            }}
                            data-ocid={`admin.members.row.${i + 1}.edit_button`}
                          >
                            <ShieldCheck className="w-3 h-3 mr-1" /> Promote
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive"
                          onClick={() => {
                            removeMember(m.id);
                            toast.success(`${m.name} removed.`);
                          }}
                          data-ocid={`admin.members.row.${i + 1}.delete_button`}
                        >
                          <UserX className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
