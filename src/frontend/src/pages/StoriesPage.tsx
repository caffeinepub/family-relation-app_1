import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import {
  formatRelativeTime,
  getStoryCountdown,
  isStoryActive,
} from "../lib/mockData";
import type { Story } from "../lib/mockData";

export default function StoriesPage() {
  const { currentUser, isAdmin } = useAuth();
  const { members, stories, addStory, deleteStory, viewStory } = useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [viewingStory, setViewingStory] = useState<Story | null>(null);

  const activeStories = stories.filter(isStoryActive);

  const handleCreate = () => {
    if (!storyText.trim() || !currentUser) return;
    addStory(currentUser.id, "text", storyText.trim());
    setStoryText("");
    setCreateOpen(false);
    toast.success("Status posted!");
  };

  const handleView = (s: Story) => {
    setViewingStory(s);
    if (currentUser) viewStory(s.id, currentUser.id);
  };

  const storyColors = [
    "bg-primary/10",
    "bg-blue-50",
    "bg-amber-50",
    "bg-rose-50",
    "bg-purple-50",
    "bg-emerald-50",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">Stories & Status</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="stories.create.open_modal_button"
            >
              <Plus className="w-4 h-4 mr-1.5" /> New Status
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="stories.create.dialog">
            <DialogHeader>
              <DialogTitle>Create Status</DialogTitle>
            </DialogHeader>
            <Textarea
              placeholder="What's on your mind?"
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              className="min-h-[120px]"
              data-ocid="stories.create.textarea"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={!storyText.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                data-ocid="stories.create.submit_button"
              >
                Post
              </Button>
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
                data-ocid="stories.create.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activeStories.length === 0 ? (
        <div className="text-center py-16" data-ocid="stories.empty_state">
          <p className="text-4xl mb-3">📸</p>
          <p className="text-muted-foreground">
            No active stories. Post one to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeStories.map((story, i) => {
            const author = members.find((m) => m.id === story.authorId);
            const initials =
              author?.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) ?? "?";
            const isOwn = story.authorId === currentUser?.id;
            const colorClass = storyColors[i % storyColors.length];

            return (
              <div
                key={story.id}
                className={`rounded-2xl border border-border p-4 ${colorClass} relative`}
                data-ocid={`stories.item.${i + 1}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={author?.photo} />
                    <AvatarFallback className="bg-secondary text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {author?.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(story.createdAt)}
                    </p>
                  </div>
                  {(isOwn || isAdmin) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-destructive hover:text-destructive flex-shrink-0"
                      onClick={() => {
                        deleteStory(story.id);
                        toast.success("Story deleted.");
                      }}
                      data-ocid={`stories.item.${i + 1}.delete_button`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>

                <p className="text-sm text-foreground leading-relaxed line-clamp-4">
                  {story.content}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground">
                    {getStoryCountdown(story.expiresAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleView(story)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                    data-ocid={`stories.item.${i + 1}.button`}
                  >
                    <Eye className="w-3 h-3" /> {story.viewers.length} views
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Story Modal */}
      <Dialog
        open={!!viewingStory}
        onOpenChange={(o) => !o && setViewingStory(null)}
      >
        <DialogContent data-ocid="stories.view.dialog">
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
                          {formatRelativeTime(viewingStory.createdAt)} ·{" "}
                          {getStoryCountdown(viewingStory.expiresAt)}
                        </p>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-foreground leading-relaxed">
                      {viewingStory.content}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {viewingStory.viewers.length} view(s)
                  </p>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
