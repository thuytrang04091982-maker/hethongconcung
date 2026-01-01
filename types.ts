
export interface User {
  id: string;
  name: string;
  avatar: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  sender: User;
  text?: string;
  images?: string[];
  timestamp: string;
  isMe: boolean;
  type: 'chat' | 'system';
}

export enum AppScreen {
  WELCOME = 'welcome',
  CHAT = 'chat',
  INFO = 'info',
  GROUP_LIST = 'group_list',
  CREATE_GROUP = 'create_group',
  PROFILE_EDIT = 'profile_edit'
}

export interface GroupDetails {
  id: string;
  name: string;
  memberCount: number;
  description: string;
  rules: string[];
  avatar: string;
  adminId: string;
  pendingMemberIds?: string[];
}
