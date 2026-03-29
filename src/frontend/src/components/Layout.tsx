import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  BookOpen,
  GitBranch,
  Home,
  Settings,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import type { Page } from "../App";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";

interface LayoutProps {
  page: Page;
  onNavigate: (p: Page, userId?: string) => void;
  children: React.ReactNode;
}

const navItems = [
  { id: "home" as Page, label: "Home", icon: Home },
  { id: "members" as Page, label: "Members", icon: Users },
  { id: "relations" as Page, label: "Relations", icon: GitBranch },
  { id: "stories" as Page, label: "Stories", icon: BookOpen },
];

export default function Layout({ page, onNavigate, children }: LayoutProps) {
  const { currentUser, isAdmin, logout } = useAuth();
  const { unreadCount } = useApp();

  const initials =
    currentUser?.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 flex-shrink-0"
            data-ocid="nav.home.link"
          >
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">
                F
              </span>
            </div>
            <span className="font-bold text-foreground text-base hidden sm:block">
              FamConnect
            </span>
          </button>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => onNavigate(item.id)}
                data-ocid={`nav.${item.id}.link`}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === item.id
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <button
                type="button"
                onClick={() => onNavigate("admin")}
                data-ocid="nav.admin.link"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === "admin"
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </button>
            )}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate("notifications")}
              data-ocid="nav.notifications.link"
              className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                  data-ocid="nav.notifications.toast"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-muted transition-colors"
                  data-ocid="nav.user.dropdown_menu"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={currentUser?.photo}
                      alt={currentUser?.name}
                    />
                    <AvatarFallback className="bg-secondary text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-semibold text-foreground leading-none">
                      {currentUser?.name.split(" ")[0]}
                    </span>
                    <span className="text-[11px] text-muted-foreground capitalize">
                      {currentUser?.role}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => onNavigate("profile", currentUser?.id)}
                  data-ocid="nav.profile.link"
                >
                  <User className="w-4 h-4 mr-2" /> My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate("notifications")}>
                  <Bell className="w-4 h-4 mr-2" /> Notifications
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => onNavigate("admin")}>
                    <ShieldCheck className="w-4 h-4 mr-2" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onNavigate("members")}>
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive"
                  data-ocid="nav.logout.button"
                >
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 pb-24 md:pb-8">{children}</main>

      {/* Mobile Bottom Nav Pill */}
      <nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 md:hidden z-50"
        aria-label="Mobile navigation"
      >
        <div className="bg-card border border-border rounded-full shadow-lg px-3 py-2 flex items-center gap-1">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              data-ocid={`mobile.nav.${item.id}.link`}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-colors min-w-[52px] ${
                page === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => onNavigate("profile", currentUser?.id)}
            data-ocid="mobile.nav.profile.link"
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-colors min-w-[52px] ${
              page === "profile"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[9px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <footer className="bg-foreground text-background py-6 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">FamConnect</span>
            <span className="opacity-60">— Private Family Network</span>
          </div>
          <p className="opacity-60">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-100"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export { Badge };
