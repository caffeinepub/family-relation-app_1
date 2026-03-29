import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Layout from "./components/Layout";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import MembersPage from "./pages/MembersPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import RelationsPage from "./pages/RelationsPage";
import StoriesPage from "./pages/StoriesPage";

export type Page =
  | "home"
  | "members"
  | "profile"
  | "relations"
  | "stories"
  | "notifications"
  | "admin";

function AppInner() {
  const { currentUser, isPendingApproval } = useAuth();
  const [page, setPage] = useState<Page>("home");
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  if (!currentUser && !isPendingApproval) {
    return <AuthPage />;
  }

  if (isPendingApproval && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Waiting for Approval
          </h2>
          <p className="text-muted-foreground text-sm">
            Your request to join the family network has been sent to the admin.
            You will be notified once approved.
          </p>
        </div>
      </div>
    );
  }

  const navigateTo = (p: Page, userId?: string) => {
    setPage(p);
    if (userId) setProfileUserId(userId);
  };

  return (
    <Layout page={page} onNavigate={navigateTo}>
      {page === "home" && <HomePage onNavigate={navigateTo} />}
      {page === "members" && <MembersPage onNavigate={navigateTo} />}
      {page === "profile" && (
        <ProfilePage userId={profileUserId} onNavigate={navigateTo} />
      )}
      {page === "relations" && <RelationsPage />}
      {page === "stories" && <StoriesPage />}
      {page === "notifications" && <NotificationsPage />}
      {page === "admin" && <AdminPage onNavigate={navigateTo} />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppInner />
        <Toaster richColors position="top-right" />
      </AppProvider>
    </AuthProvider>
  );
}
