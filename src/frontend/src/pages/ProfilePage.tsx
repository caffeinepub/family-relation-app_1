import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  CheckCircle2,
  Edit2,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import type { ImportantDate, Member, Status } from "../lib/mockData";

interface ProfilePageProps {
  userId: string | null;
  onNavigate: (p: Page, userId?: string) => void;
}

const statusOptions: { value: Status; label: string; dot: string }[] = [
  { value: "available", label: "Available", dot: "bg-status-available" },
  { value: "busy", label: "Busy", dot: "bg-status-busy" },
  { value: "travelling", label: "Travelling", dot: "bg-status-travelling" },
];

export default function ProfilePage({ userId, onNavigate }: ProfilePageProps) {
  const { currentUser, isAdmin, updateCurrentUser } = useAuth();
  const { getMember, getRelationsFor, members, updateMember, setMemberStatus } =
    useApp();

  const targetId = userId ?? currentUser?.id ?? null;
  const isOwn = targetId === currentUser?.id;

  const [member, setMember] = useState<Member | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Member>>({});

  useEffect(() => {
    if (targetId) {
      const m = isOwn ? currentUser : getMember(targetId);
      setMember(m ?? null);
      if (m) setForm({ ...m });
    }
  }, [targetId, currentUser, getMember, isOwn]);

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-muted-foreground">Member not found.</p>
      </div>
    );
  }

  const relations = getRelationsFor(member.id).filter(
    (r) => r.status === "confirmed",
  );
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSave = () => {
    if (!form.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    if (isOwn) {
      updateCurrentUser(form);
    } else if (isAdmin) {
      updateMember(member.id, form);
    }
    setMember((prev) => (prev ? { ...prev, ...form } : prev));
    setEditing(false);
    toast.success("Profile updated!");
  };

  const handleStatusChange = (s: Status) => {
    setMemberStatus(member.id, s);
    if (isOwn) updateCurrentUser({ status: s });
    setMember((prev) => (prev ? { ...prev, status: s } : prev));
  };

  const handleAddDate = () => {
    const dates = form.importantDates ?? [];
    setForm((f) => ({
      ...f,
      importantDates: [
        ...dates,
        { id: `d_${Date.now()}`, label: "", date: "" },
      ],
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, photo: url }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header card */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <Avatar className="w-20 h-20">
              <AvatarImage src={form.photo ?? member.photo} alt={member.name} />
              <AvatarFallback className="bg-secondary text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-card ${
                member.status === "available"
                  ? "bg-status-available"
                  : member.status === "busy"
                    ? "bg-status-busy"
                    : "bg-status-travelling"
              }`}
            />
            {(isOwn || isAdmin) && editing && (
              <label
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer"
                data-ocid="profile.photo.upload_button"
              >
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoUpload}
                />
              </label>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">
                {member.name}
              </h1>
              {member.isVerified && (
                <CheckCircle2
                  className="w-5 h-5 text-primary"
                  aria-label="Verified"
                />
              )}
              {member.role === "admin" && (
                <ShieldCheck
                  className="w-5 h-5 text-primary"
                  aria-label="Admin"
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {member.email}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge
                variant={member.role === "admin" ? "default" : "secondary"}
              >
                {member.role === "admin" ? "Admin" : "Member"}
              </Badge>
              {member.isVerified && (
                <Badge className="bg-primary/10 text-primary border-0">
                  ✓ Verified
                </Badge>
              )}
            </div>

            {/* Status selector */}
            {(isOwn || isAdmin) && (
              <div className="mt-3">
                <Select
                  value={member.status}
                  onValueChange={(v) => handleStatusChange(v as Status)}
                >
                  <SelectTrigger
                    className="w-36 h-7 text-xs"
                    data-ocid="profile.status.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            {(isOwn || isAdmin) && !editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                data-ocid="profile.edit_button"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Info Form */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Personal Info
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {editing ? (
            <>
              <div>
                <Label>Full Name</Label>
                <Input
                  value={form.name ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="profile.name.input"
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select
                  value={form.gender ?? ""}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, gender: v as Member["gender"] }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="profile.gender.select"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={form.dob ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dob: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="profile.dob.input"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="profile.phone.input"
                />
              </div>
              <div>
                <Label>Hometown</Label>
                <Input
                  value={form.hometown ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hometown: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="profile.hometown.input"
                />
              </div>
              <div>
                <Label>Current Location</Label>
                <Input
                  value={form.currentLocation ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, currentLocation: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="profile.location.input"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Bio</Label>
                <Textarea
                  value={form.bio ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="profile.bio.textarea"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="text-sm capitalize">{member.gender || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="text-sm">
                  {member.dob ? new Date(member.dob).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm">{member.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hometown</p>
                <p className="text-sm">{member.hometown || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Current Location
                </p>
                <p className="text-sm">{member.currentLocation || "—"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Bio</p>
                <p className="text-sm">{member.bio || "—"}</p>
              </div>
            </>
          )}
        </div>

        {editing && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="profile.save_button"
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(false);
                setForm({ ...member });
              }}
              data-ocid="profile.cancel_button"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Important Dates */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">
            Important Dates
          </h2>
          {(isOwn || isAdmin) && editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddDate}
              data-ocid="profile.dates.button"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          )}
        </div>
        {((editing ? form.importantDates : member.importantDates) ?? [])
          .length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No important dates added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {(editing ? form.importantDates : member.importantDates)?.map(
              (d: ImportantDate, i: number) => (
                <div key={d.id} className="flex items-center gap-2">
                  {editing ? (
                    <>
                      <Input
                        placeholder="Label (e.g. Wedding Anniversary)"
                        value={d.label}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            importantDates: (f.importantDates ?? []).map(
                              (x, j) =>
                                j === i ? { ...x, label: e.target.value } : x,
                            ),
                          }))
                        }
                        className="flex-1 text-sm"
                      />
                      <Input
                        type="date"
                        value={d.date}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            importantDates: (f.importantDates ?? []).map(
                              (x, j) =>
                                j === i ? { ...x, date: e.target.value } : x,
                            ),
                          }))
                        }
                        className="w-36 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-destructive"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            importantDates: (f.importantDates ?? []).filter(
                              (_, j) => j !== i,
                            ),
                          }))
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-foreground flex-1">
                        {d.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {d.date ? new Date(d.date).toLocaleDateString() : "—"}
                      </span>
                    </>
                  )}
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* Relations */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Relations</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("relations")}
          >
            Manage
          </Button>
        </div>
        {relations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No confirmed relations yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {relations.map((rel) => {
              const other = members.find(
                (m) =>
                  m.id === (rel.fromId === member.id ? rel.toId : rel.fromId),
              );
              return (
                <button
                  type="button"
                  key={rel.id}
                  onClick={() => other && onNavigate("profile", other.id)}
                  className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5 hover:bg-accent transition-colors"
                >
                  <span className="text-xs font-medium text-foreground">
                    {other?.name}
                  </span>
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0">
                    {rel.type}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin actions */}
      {isAdmin && !isOwn && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Admin Actions
          </h2>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateMember(member.id, { isVerified: !member.isVerified });
                setMember((m) => (m ? { ...m, isVerified: !m.isVerified } : m));
                toast.success(
                  member.isVerified
                    ? "Verification removed"
                    : "Profile verified!",
                );
              }}
              data-ocid="profile.verify.button"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {member.isVerified ? "Remove Verification" : "Verify Profile"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateMember(member.id, {
                  role: member.role === "admin" ? "member" : "admin",
                });
                setMember((m) =>
                  m
                    ? { ...m, role: m.role === "admin" ? "member" : "admin" }
                    : m,
                );
                toast.success("Role updated!");
              }}
              data-ocid="profile.role.button"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              {member.role === "admin"
                ? "Demote to Member"
                : "Promote to Admin"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
