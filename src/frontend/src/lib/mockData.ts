export type Status = "available" | "busy" | "travelling";

export interface ImportantDate {
  id: string;
  label: string;
  date: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  password?: string;
  gender: "male" | "female" | "other";
  dob: string;
  phone: string;
  hometown: string;
  currentLocation: string;
  bio: string;
  photo: string;
  status: Status;
  role: "admin" | "member";
  isVerified: boolean;
  isApproved: boolean;
  importantDates: ImportantDate[];
  joinedAt: string;
}

export interface Relation {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  status: "pending" | "confirmed";
  createdAt: string;
}

export interface Story {
  id: string;
  authorId: string;
  type: "text" | "photo";
  content: string;
  imageUrl?: string;
  createdAt: string;
  expiresAt: string;
  viewers: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: "join" | "relation" | "profile" | "story" | "reminder" | "approval";
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface JoinRequest {
  id: string;
  name: string;
  email: string;
  password: string;
  requestedAt: string;
}

export interface AppData {
  members: Member[];
  relations: Relation[];
  stories: Story[];
  notifications: Notification[];
  joinRequests: JoinRequest[];
  currentUserId: string | null;
}

const DEFAULT_PHOTO =
  "/assets/generated/avatar-default-transparent.dim_200x200.png";

const now = Date.now();

export const SEED_DATA: AppData = {
  currentUserId: null,
  joinRequests: [],
  members: [
    {
      id: "u1",
      name: "Thoufeeq Mohammed",
      email: "thoufeeq2mohd@gmail.com",
      password: "Thoufeeq@123",
      gender: "male",
      dob: "1995-06-15",
      phone: "+91 98765 43210",
      hometown: "Chennai, Tamil Nadu",
      currentLocation: "Bangalore, Karnataka",
      bio: "Family admin & tech enthusiast. Loves bringing family together.",
      photo: DEFAULT_PHOTO,
      status: "available",
      role: "admin",
      isVerified: true,
      isApproved: true,
      importantDates: [
        { id: "d1", label: "Wedding Anniversary", date: "2021-02-14" },
      ],
      joinedAt: new Date(now - 365 * 86400000).toISOString(),
    },
    {
      id: "u2",
      name: "Ahmed Hassan",
      email: "ahmed@family.com",
      password: "Ahmed@123",
      gender: "male",
      dob: "1965-03-10",
      phone: "+91 98765 11111",
      hometown: "Chennai, Tamil Nadu",
      currentLocation: "Chennai, Tamil Nadu",
      bio: "Father. Retired engineer. Loves gardening.",
      photo: DEFAULT_PHOTO,
      status: "available",
      role: "member",
      isVerified: true,
      isApproved: true,
      importantDates: [
        { id: "d2", label: "Wedding Anniversary", date: "1990-05-20" },
      ],
      joinedAt: new Date(now - 300 * 86400000).toISOString(),
    },
    {
      id: "u3",
      name: "Fatima Hassan",
      email: "fatima@family.com",
      password: "Fatima@123",
      gender: "female",
      dob: "1968-07-22",
      phone: "+91 98765 22222",
      hometown: "Chennai, Tamil Nadu",
      currentLocation: "Chennai, Tamil Nadu",
      bio: "Mother. Home maker. Heart of the family.",
      photo: DEFAULT_PHOTO,
      status: "busy",
      role: "member",
      isVerified: true,
      isApproved: true,
      importantDates: [
        { id: "d3", label: "Wedding Anniversary", date: "1990-05-20" },
      ],
      joinedAt: new Date(now - 295 * 86400000).toISOString(),
    },
    {
      id: "u4",
      name: "Zaid Thoufeeq",
      email: "zaid@family.com",
      password: "Zaid@123",
      gender: "male",
      dob: "1998-11-05",
      phone: "+91 98765 33333",
      hometown: "Chennai, Tamil Nadu",
      currentLocation: "Hyderabad, Telangana",
      bio: "Brother. Software developer. Cricket fan.",
      photo: DEFAULT_PHOTO,
      status: "available",
      role: "member",
      isVerified: false,
      isApproved: true,
      importantDates: [],
      joinedAt: new Date(now - 200 * 86400000).toISOString(),
    },
    {
      id: "u5",
      name: "Ayesha Khan",
      email: "ayesha@family.com",
      password: "Ayesha@123",
      gender: "female",
      dob: "2000-01-18",
      phone: "+91 98765 44444",
      hometown: "Chennai, Tamil Nadu",
      currentLocation: "Dubai, UAE",
      bio: "Sister. Fashion designer. World traveller.",
      photo: DEFAULT_PHOTO,
      status: "travelling",
      role: "member",
      isVerified: false,
      isApproved: true,
      importantDates: [{ id: "d5", label: "Engagement", date: "2023-12-01" }],
      joinedAt: new Date(now - 150 * 86400000).toISOString(),
    },
  ],
  relations: [
    {
      id: "r1",
      fromId: "u2",
      toId: "u1",
      type: "Father",
      status: "confirmed",
      createdAt: new Date(now - 290 * 86400000).toISOString(),
    },
    {
      id: "r2",
      fromId: "u3",
      toId: "u1",
      type: "Mother",
      status: "confirmed",
      createdAt: new Date(now - 285 * 86400000).toISOString(),
    },
    {
      id: "r3",
      fromId: "u4",
      toId: "u1",
      type: "Brother",
      status: "confirmed",
      createdAt: new Date(now - 190 * 86400000).toISOString(),
    },
    {
      id: "r4",
      fromId: "u5",
      toId: "u1",
      type: "Sister",
      status: "confirmed",
      createdAt: new Date(now - 140 * 86400000).toISOString(),
    },
  ],
  stories: [
    {
      id: "s1",
      authorId: "u5",
      type: "text",
      content:
        "Just landed in Dubai! The city is breathtaking 🌆✈️ Missing everyone back home!",
      createdAt: new Date(now - 2 * 3600000).toISOString(),
      expiresAt: new Date(now + 22 * 3600000).toISOString(),
      viewers: ["u1"],
    },
    {
      id: "s2",
      authorId: "u2",
      type: "text",
      content:
        "Harvested fresh vegetables from my garden today! 🥕🌱 Nature is the best therapy.",
      createdAt: new Date(now - 5 * 3600000).toISOString(),
      expiresAt: new Date(now + 19 * 3600000).toISOString(),
      viewers: [],
    },
    {
      id: "s3",
      authorId: "u4",
      type: "text",
      content:
        "Hit a century in the local cricket match today! 🏏 Team won by 50 runs. Eid Mubarak everyone!",
      createdAt: new Date(now - 8 * 3600000).toISOString(),
      expiresAt: new Date(now + 16 * 3600000).toISOString(),
      viewers: ["u1", "u2"],
    },
  ],
  notifications: [
    {
      id: "n1",
      userId: "u1",
      type: "relation",
      message: "Ahmed Hassan confirmed your Father relation request.",
      isRead: false,
      createdAt: new Date(now - 1 * 3600000).toISOString(),
    },
    {
      id: "n2",
      userId: "u1",
      type: "story",
      message: "Ayesha Khan posted a new status update.",
      isRead: false,
      createdAt: new Date(now - 3 * 3600000).toISOString(),
    },
    {
      id: "n3",
      userId: "u1",
      type: "join",
      message: "Zaid Thoufeeq joined the family network!",
      isRead: true,
      createdAt: new Date(now - 24 * 3600000).toISOString(),
    },
    {
      id: "n4",
      userId: "u1",
      type: "reminder",
      message: "🎂 Ahmed Hassan's birthday is coming up on March 10!",
      isRead: true,
      createdAt: new Date(now - 48 * 3600000).toISOString(),
    },
  ],
};

const STORAGE_KEY = "famconnect_data";

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppData;
  } catch {
    // ignore
  }
  return { ...SEED_DATA };
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function getStoryCountdown(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "expired";
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs > 0) return `${hrs}h ${mins}m left`;
  return `${mins}m left`;
}

export function isStoryActive(story: Story): boolean {
  return new Date(story.expiresAt).getTime() > Date.now();
}

export const RELATION_TYPES = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Son",
  "Daughter",
  "Grandfather",
  "Grandmother",
  "Uncle",
  "Aunt",
  "Cousin",
  "Husband",
  "Wife",
  "Father-in-law",
  "Mother-in-law",
  "Brother-in-law",
  "Sister-in-law",
  "Nephew",
  "Niece",
];
