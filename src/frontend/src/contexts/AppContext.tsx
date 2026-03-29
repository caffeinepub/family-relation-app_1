import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import {
  type JoinRequest,
  type Member,
  type Notification,
  type Relation,
  type Status,
  type Story,
  loadData,
  saveData,
} from "../lib/mockData";

interface AppContextValue {
  members: Member[];
  relations: Relation[];
  stories: Story[];
  notifications: Notification[];
  joinRequests: JoinRequest[];
  unreadCount: number;
  refresh: () => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  removeMember: (id: string) => void;
  addRelation: (fromId: string, toId: string, type: string) => void;
  confirmRelation: (id: string) => void;
  rejectRelation: (id: string) => void;
  deleteRelation: (id: string) => void;
  addStory: (
    authorId: string,
    type: "text" | "photo",
    content: string,
    imageUrl?: string,
  ) => void;
  deleteStory: (id: string) => void;
  viewStory: (storyId: string, userId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  approveJoinRequest: (reqId: string) => void;
  rejectJoinRequest: (reqId: string) => void;
  getMember: (id: string) => Member | undefined;
  getRelationsFor: (userId: string) => Relation[];
  setMemberStatus: (id: string, status: Status) => void;
  addNotification: (
    userId: string,
    type: Notification["type"],
    message: string,
  ) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(() => loadData());

  const refresh = useCallback(() => setData(loadData()), []);

  const persist = useCallback(
    (
      updater: (d: ReturnType<typeof loadData>) => ReturnType<typeof loadData>,
    ) => {
      setData((prev) => {
        const next = updater({ ...prev });
        saveData(next);
        return next;
      });
    },
    [],
  );

  const updateMember = useCallback(
    (id: string, updates: Partial<Member>) => {
      persist((d) => ({
        ...d,
        members: d.members.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      }));
    },
    [persist],
  );

  const removeMember = useCallback(
    (id: string) => {
      persist((d) => ({
        ...d,
        members: d.members.filter((m) => m.id !== id),
        relations: d.relations.filter((r) => r.fromId !== id && r.toId !== id),
      }));
    },
    [persist],
  );

  const addRelation = useCallback(
    (fromId: string, toId: string, type: string) => {
      const rel: Relation = {
        id: `r_${Date.now()}`,
        fromId,
        toId,
        type,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      persist((d) => ({
        ...d,
        relations: [...d.relations, rel],
        notifications: [
          ...d.notifications,
          {
            id: `n_${Date.now()}`,
            userId: toId,
            type: "relation",
            message: `${d.members.find((m) => m.id === fromId)?.name} sent you a relation request: ${type}`,
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    },
    [persist],
  );

  const confirmRelation = useCallback(
    (id: string) => {
      persist((d) => ({
        ...d,
        relations: d.relations.map((r) =>
          r.id === id ? { ...r, status: "confirmed" } : r,
        ),
      }));
    },
    [persist],
  );

  const rejectRelation = useCallback(
    (id: string) => {
      persist((d) => ({
        ...d,
        relations: d.relations.filter((r) => r.id !== id),
      }));
    },
    [persist],
  );

  const deleteRelation = useCallback(
    (id: string) => {
      persist((d) => ({
        ...d,
        relations: d.relations.filter((r) => r.id !== id),
      }));
    },
    [persist],
  );

  const addStory = useCallback(
    (
      authorId: string,
      type: "text" | "photo",
      content: string,
      imageUrl?: string,
    ) => {
      const story: Story = {
        id: `s_${Date.now()}`,
        authorId,
        type,
        content,
        imageUrl,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
        viewers: [],
      };
      persist((d) => ({ ...d, stories: [...d.stories, story] }));
    },
    [persist],
  );

  const deleteStory = useCallback(
    (id: string) => {
      persist((d) => ({ ...d, stories: d.stories.filter((s) => s.id !== id) }));
    },
    [persist],
  );

  const viewStory = useCallback(
    (storyId: string, userId: string) => {
      persist((d) => ({
        ...d,
        stories: d.stories.map((s) =>
          s.id === storyId && !s.viewers.includes(userId)
            ? { ...s, viewers: [...s.viewers, userId] }
            : s,
        ),
      }));
    },
    [persist],
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      persist((d) => ({
        ...d,
        notifications: d.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
      }));
    },
    [persist],
  );

  const markAllNotificationsRead = useCallback(() => {
    persist((d) => ({
      ...d,
      notifications: d.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  }, [persist]);

  const approveJoinRequest = useCallback(
    (reqId: string) => {
      persist((d) => {
        const req = d.joinRequests.find((r) => r.id === reqId);
        if (!req) return d;
        const newMember: Member = {
          id: `u_${Date.now()}`,
          name: req.name,
          email: req.email,
          password: req.password,
          gender: "male",
          dob: "",
          phone: "",
          hometown: "",
          currentLocation: "",
          bio: "",
          photo: "/assets/generated/avatar-default-transparent.dim_200x200.png",
          status: "available",
          role: "member",
          isVerified: false,
          isApproved: true,
          importantDates: [],
          joinedAt: new Date().toISOString(),
        };
        return {
          ...d,
          members: [...d.members, newMember],
          joinRequests: d.joinRequests.filter((r) => r.id !== reqId),
          notifications: [
            ...d.notifications,
            {
              id: `n_${Date.now()}`,
              userId: "u1",
              type: "join",
              message: `${req.name} was approved and joined the family network.`,
              isRead: false,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      });
    },
    [persist],
  );

  const rejectJoinRequest = useCallback(
    (reqId: string) => {
      persist((d) => ({
        ...d,
        joinRequests: d.joinRequests.filter((r) => r.id !== reqId),
      }));
    },
    [persist],
  );

  const getMember = useCallback(
    (id: string) => data.members.find((m) => m.id === id),
    [data.members],
  );

  const getRelationsFor = useCallback(
    (userId: string) =>
      data.relations.filter((r) => r.fromId === userId || r.toId === userId),
    [data.relations],
  );

  const setMemberStatus = useCallback(
    (id: string, status: Status) => {
      updateMember(id, { status });
    },
    [updateMember],
  );

  const addNotification = useCallback(
    (userId: string, type: Notification["type"], message: string) => {
      persist((d) => ({
        ...d,
        notifications: [
          ...d.notifications,
          {
            id: `n_${Date.now()}`,
            userId,
            type,
            message,
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    },
    [persist],
  );

  const unreadCount = data.notifications.filter(
    (n) =>
      !n.isRead &&
      (data.currentUserId ? n.userId === data.currentUserId : false),
  ).length;

  return (
    <AppContext.Provider
      value={{
        members: data.members,
        relations: data.relations,
        stories: data.stories,
        notifications: data.notifications,
        joinRequests: data.joinRequests,
        unreadCount,
        refresh,
        updateMember,
        removeMember,
        addRelation,
        confirmRelation,
        rejectRelation,
        deleteRelation,
        addStory,
        deleteStory,
        viewStory,
        markNotificationRead,
        markAllNotificationsRead,
        approveJoinRequest,
        rejectJoinRequest,
        getMember,
        getRelationsFor,
        setMemberStatus,
        addNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export type { Member, Relation, Story, Notification, JoinRequest };
