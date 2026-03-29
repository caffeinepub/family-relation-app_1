import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { type AppData, type Member, loadData, saveData } from "../lib/mockData";

interface AuthContextValue {
  currentUser: Member | null;
  isAdmin: boolean;
  isApproved: boolean;
  isPendingApproval: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<string | null>;
  logout: () => void;
  updateCurrentUser: (updates: Partial<Member>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  useEffect(() => {
    const data = loadData();
    if (data.currentUserId) {
      const user =
        data.members.find((m) => m.id === data.currentUserId) ?? null;
      if (user) {
        setCurrentUser(user);
        if (!user.isApproved) setIsPendingApproval(true);
      }
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const data = loadData();
      const user = data.members.find(
        (m) =>
          m.email.toLowerCase() === email.toLowerCase() &&
          m.password === password,
      );
      if (!user) return "Invalid email or password.";
      if (!user.isApproved) {
        setIsPendingApproval(true);
        return null;
      }
      data.currentUserId = user.id;
      saveData(data);
      setCurrentUser(user);
      setIsPendingApproval(false);
      return null;
    },
    [],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
    ): Promise<string | null> => {
      const data = loadData();
      if (
        data.members.find((m) => m.email.toLowerCase() === email.toLowerCase())
      ) {
        return "An account with this email already exists.";
      }
      const existing = data.joinRequests.find(
        (r) => r.email.toLowerCase() === email.toLowerCase(),
      );
      if (existing) return "A join request for this email is already pending.";
      const req = {
        id: `req_${Date.now()}`,
        name,
        email,
        password,
        requestedAt: new Date().toISOString(),
      };
      data.joinRequests.push(req);
      // Add notification for admin
      data.notifications.push({
        id: `n_${Date.now()}`,
        userId: "u1",
        type: "join",
        message: `${name} has requested to join the family network.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      saveData(data);
      setIsPendingApproval(true);
      return null;
    },
    [],
  );

  const logout = useCallback(() => {
    const data = loadData();
    data.currentUserId = null;
    saveData(data);
    setCurrentUser(null);
    setIsPendingApproval(false);
  }, []);

  const updateCurrentUser = useCallback(
    (updates: Partial<Member>) => {
      if (!currentUser) return;
      const data = loadData();
      const idx = data.members.findIndex((m) => m.id === currentUser.id);
      if (idx === -1) return;
      const updated = { ...data.members[idx], ...updates };
      data.members[idx] = updated;
      saveData(data);
      setCurrentUser(updated);
    },
    [currentUser],
  );

  const isAdmin = currentUser?.role === "admin";
  const isApproved = currentUser?.isApproved ?? false;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isApproved,
        isPendingApproval,
        login,
        register,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export type { AppData };
