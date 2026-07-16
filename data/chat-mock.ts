import type { ChatData, ChatConversation, ChatUser } from "@/types/chat";

const currentUser: ChatUser = {
  id: "admin",
  name: "ADMIN",
  username: "@ZES_ADMIN",
  avatar: "/avatars/user_krimson.png",
  isOnline: true,
};

const users: Record<string, ChatUser> = {
  codex: {
    id: "codex",
    name: "CODEX",
    username: "@CODEX_AGENT",
    avatar: "/avatars/user_krimson.png",
    isOnline: true,
  },
  hermes: {
    id: "hermes",
    name: "HERMES",
    username: "@MEMORY_SYNC",
    avatar: "/avatars/user_mati.png",
    isOnline: false,
  },
  nineRouter: {
    id: "9router",
    name: "9ROUTER",
    username: "@API_GATEWAY",
    avatar: "/avatars/user_pek.png",
    isOnline: true,
  },
  openclaude: {
    id: "openclaude",
    name: "OPENCLAUDE",
    username: "@AGENT_SERVICE",
    avatar: "/avatars/user_joyboy.png",
    isOnline: true,
  },
};

const conversations: ChatConversation[] = [
  {
    id: "conv-codex",
    participants: [currentUser, users.codex],
    unreadCount: 2,
    lastMessage: {
      id: "msg-codex-1",
      content: "System monitoring active — 4/7 services online",
      timestamp: "2026-07-16T12:44:00Z",
      senderId: "codex",
      isFromCurrentUser: false,
    },
    messages: [
      {
        id: "msg-codex-1",
        content: "System monitoring active — 4/7 services online",
        timestamp: "2026-07-16T12:44:00Z",
        senderId: "codex",
        isFromCurrentUser: false,
      },
      {
        id: "msg-codex-2",
        content: "Flask API (:5002), Dashboard (:5173) nominal",
        timestamp: "2026-07-16T12:44:05Z",
        senderId: "codex",
        isFromCurrentUser: false,
      },
    ],
  },
  {
    id: "conv-hermes",
    participants: [currentUser, users.hermes],
    unreadCount: 1,
    lastMessage: {
      id: "msg-hermes-1",
      content: "⚠️ API key rejected — OpenCode billing required",
      timestamp: "2026-07-16T12:44:10Z",
      senderId: "hermes",
      isFromCurrentUser: false,
    },
    messages: [
      {
        id: "msg-hermes-1",
        content: "⚠️ API key rejected — OpenCode billing required",
        timestamp: "2026-07-16T12:44:10Z",
        senderId: "hermes",
        isFromCurrentUser: false,
      },
    ],
  },
  {
    id: "conv-9router",
    participants: [currentUser, users.nineRouter],
    unreadCount: 0,
    lastMessage: {
      id: "msg-9r-1",
      content: "Gateway online — routing 0 active requests",
      timestamp: "2026-07-16T12:44:00Z",
      senderId: "9router",
      isFromCurrentUser: false,
    },
    messages: [
      {
        id: "msg-9r-1",
        content: "Gateway online — routing 0 active requests",
        timestamp: "2026-07-16T12:44:00Z",
        senderId: "9router",
        isFromCurrentUser: false,
      },
    ],
  },
  {
    id: "conv-oc",
    participants: [currentUser, users.openclaude],
    unreadCount: 0,
    lastMessage: {
      id: "msg-oc-1",
      content: "gRPC ready — awaiting tasks on :50051",
      timestamp: "2026-07-16T12:44:00Z",
      senderId: "openclaude",
      isFromCurrentUser: false,
    },
    messages: [
      {
        id: "msg-oc-1",
        content: "gRPC ready — awaiting tasks on :50051",
        timestamp: "2026-07-16T12:44:00Z",
        senderId: "openclaude",
        isFromCurrentUser: false,
      },
    ],
  },
];

export const mockChatData: ChatData = {
  currentUser,
  conversations,
};
