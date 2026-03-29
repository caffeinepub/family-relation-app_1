import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import ActivityCard, { type ActivityItem } from "../components/ActivityCard";
import StoryCircle from "../components/StoryCircle";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { isStoryActive } from "../lib/mockData";

interface HomePageProps {
  onNavigate: (p: Page, userId?: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { currentUser, isAdmin } = useAuth();
  const { members, stories, relations, addStory, viewStory } = useApp();
  const [storyText, setStoryText] = useState("");
  const [storyOpen, setStoryOpen] = useState(false);
  const [viewingStory, setViewingStory] = useState<(typeof stories)[0] | null>(
    null,
  );

  const activeStories = stories.filter(isStoryActive);
  const approvedMembers = members.filter((m) => m.isApproved);

  // Build activity feed
  const activityItems: ActivityItem[] = [
    ...activeStories
      .map((s) => {
        const actor = members.find((m) => m.id === s.authorId);
        if (!actor) return null;
        return {
          id: s.id,
          type: "story" as const,
          actor,
          story: s,
          timestamp: s.createdAt,
          message: "shared a status update",
        };
      })
      .filter(Boolean),
    ...relations
      .filter((r) => r.status === "confirmed")
      .map((r) => {
        const from = members.find((m) => m.id === r.fromId);
        const to = members.find((m) => m.id === r.toId);
        if (!from || !to) return null;
        return {
          id: r.id,
          type: "relation" as const,
          actor: from,
          subject: to,
          relation: r,
          timestamp: r.createdAt,
          message: `is ${to.name}'s ${r.type}`,
        };
      })
      .filter(Boolean),
  ]
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(b!.timestamp).getTime() - new Date(a!.timestamp).getTime(),
    ) as ActivityItem[];

  const handleCreateStory = () => {
    if (!storyText.trim() || !currentUser) return;
    addStory(currentUser.id, "text", storyText.trim());
    setStoryText("");
    setStoryOpen(false);
    toast.success("Status posted!");
  };

  const statusDot: Record<string, string> = {
    available: "bg-status-available",
    busy: "bg-status-busy",
    travelling: "bg-status-travelling",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Left/Main column */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Stories Row */}
          <section
            className="bg-card rounded-2xl border border-border p-4"
            data-ocid="home.stories.section"
          >
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Stories
            </h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {/* Own story */}
              <Dialog open={storyOpen} onOpenChange={setStoryOpen}>
                <DialogTrigger asChild>
                  <div>
                    {currentUser && (
                      <StoryCircle
                        member={currentUser}
                        isOwn
                        onClick={() => setStoryOpen(true)}
                      />
                    )}
                  </div>
                </DialogTrigger>
                <DialogContent data-ocid="story.create.dialog">
                  <DialogHeader>
                    <DialogTitle>Create Status</DialogTitle>
                  </DialogHeader>
                  <Textarea
                    placeholder="What's on your mind?"
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    className="min-h-[120px]"
                    data-ocid="story.create.textarea"
                  />
                  <Button
                    onClick={handleCreateStory}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    data-ocid="story.create.submit_button"
                  >
                    Post Status
                  </Button>
                </DialogContent>
              </Dialog>

              {/* Other members with stories */}
              {approvedMembers
                .filter((m) => m.id !== currentUser?.id)
                .map((member) => {
                  const memberStory = activeStories.find(
                    (s) => s.authorId === member.id,
                  );
                  return (
                    <StoryCircle
                      key={member.id}
                      member={member}
                      story={memberStory}
                      onClick={() => {
                        if (memberStory) {
                          setViewingStory(memberStory);
                          if (currentUser)
                            viewStory(memberStory.id, currentUser.id);
                        }
                      }}
                    />
                  );
                })}
            </div>
          </section>

          {/* Activity Feed */}
          <section data-ocid="home.activity.section">
            <h2 className="text-base font-semibold text-foreground mb-3">
              Activity Feed
            </h2>
            <div className="space-y-3">
              {activityItems.length === 0 ? (
                <div
                  className="bg-card rounded-2xl border border-border p-8 text-center"
                  data-ocid="activity.empty_state"
                >
                  <p className="text-muted-foreground text-sm">
                    No recent activity. Start by posting a status!
                  </p>
                </div>
              ) : (
                activityItems.map((item, i) => (
                  <ActivityCard key={item.id} item={item} index={i + 1} />
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="hidden lg:flex flex-col gap-4 w-80 flex-shrink-0">
          {/* Family Members Quick List */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Family Members
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary h-6"
                onClick={() => onNavigate("members")}
              >
                View All
              </Button>
            </div>
            <div className="space-y-2.5">
              {approvedMembers.slice(0, 5).map((member) => {
                const initials = member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <button
                    type="button"
                    key={member.id}
                    onClick={() => onNavigate("profile", member.id)}
                    className="w-full flex items-center gap-2.5 hover:bg-muted rounded-lg p-1.5 transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.photo} />
                        <AvatarFallback className="bg-secondary text-primary text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-card ${statusDot[member.status]}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-foreground truncate">
                          {member.name}
                        </span>
                        {member.isVerified && (
                          <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                        )}
                        {member.role === "admin" && (
                          <ShieldCheck className="w-3 h-3 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {member.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability Status */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Availability
            </h3>
            <div className="space-y-2">
              {(["available", "busy", "travelling"] as const).map((s) => {
                const count = approvedMembers.filter(
                  (m) => m.status === s,
                ).length;
                const label = s.charAt(0).toUpperCase() + s.slice(1);
                return (
                  <div key={s} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          s === "available"
                            ? "bg-status-available"
                            : s === "busy"
                              ? "bg-status-busy"
                              : "bg-status-travelling"
                        }`}
                      />
                      <span className="text-sm text-foreground">{label}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Panel quick */}
          {isAdmin && (
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" /> Admin Panel
              </h3>
              <div className="space-y-1">
                {[
                  { label: "Manage Members", page: "members" as Page },
                  { label: "Approve Requests", page: "admin" as Page },
                  { label: "Family Relations", page: "relations" as Page },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => onNavigate(item.page)}
                    className="w-full text-left text-sm text-primary hover:bg-secondary rounded-lg px-2 py-1.5 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Story Viewer Modal */}
      <Dialog
        open={!!viewingStory}
        onOpenChange={(o) => !o && setViewingStory(null)}
      >
        <DialogContent data-ocid="story.view.dialog">
          {viewingStory &&
            (() => {
              const author = members.find(
                (m) => m.id === viewingStory.authorId,
              );
              const initials =
                author?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) ?? "?";
              return (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={author?.photo} />
                        <AvatarFallback className="bg-secondary text-primary text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <DialogTitle className="text-sm">
                          {author?.name}
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground">
                          {new Date(viewingStory.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="bg-muted rounded-xl p-4 mt-2">
                    <p className="text-foreground">{viewingStory.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {viewingStory.viewers.length} views
                  </p>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
