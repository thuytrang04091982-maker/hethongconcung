
import { Message, User, GroupDetails } from './types';

export const CURRENT_USER: User = {
  id: 'me',
  name: 'Bạn',
  avatar: 'https://picsum.photos/seed/me/100/100',
};

export const DEFAULT_GROUP: GroupDetails = {
  id: 'global_community',
  name: 'Cộng đồng Mẹ & Bé',
  memberCount: 1250,
  description: 'Nơi chia sẻ kinh nghiệm chăm sóc con cái, tư vấn dinh dưỡng và kết nối các bà mẹ bỉm sữa hiện đại.',
  rules: [
    'Tôn trọng các thành viên khác.',
    'Không đăng tải nội dung quảng cáo rác.',
    'Chia sẻ kiến thức có chọn lọc và chính xác.',
    'Giữ gìn ngôn ngữ lịch sự, văn minh.'
  ],
  avatar: 'https://picsum.photos/seed/group/200/200',
  adminId: 'u2', // Chị Lan is admin
  pendingMemberIds: []
};

export const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    sender: { id: 'sys', name: 'Hệ thống', avatar: '' },
    text: 'Minh Thư đã tham gia nhóm',
    timestamp: '10:00',
    isMe: false,
    type: 'system'
  },
  {
    id: '2',
    sender: { id: 'u1', name: 'Minh Thư', avatar: 'https://picsum.photos/seed/u1/100/100' },
    text: 'Chào cả nhà ạ! Bé nhà em mới được 3 tháng, đang tìm hiểu về ăn dặm.',
    timestamp: '10:02',
    isMe: false,
    type: 'chat'
  }
];

export const MOCK_MEMBERS: User[] = [
  { id: 'u2', name: 'Chị Lan', avatar: 'https://picsum.photos/seed/u2/100/100', isAdmin: true, isOnline: true },
  { id: 'u1', name: 'Minh Thư', avatar: 'https://picsum.photos/seed/u1/100/100', isOnline: true },
  { id: 'u3', name: 'Hoàng Oanh', avatar: 'https://picsum.photos/seed/u3/100/100', isOnline: false },
  { id: 'u4', name: 'Thu Thảo', avatar: 'https://picsum.photos/seed/u4/100/100', isOnline: false },
  { id: 'u5', name: 'Ngọc Diệp', avatar: 'https://picsum.photos/seed/u5/100/100', isOnline: true },
];

// Added FB_MOCK_PROFILES to fix missing constant error in App.tsx
export const FB_MOCK_PROFILES = [
  { name: 'Nguyễn Văn An', avatar: 'https://picsum.photos/seed/fb1/100/100' },
  { name: 'Lê Thị Bình', avatar: 'https://picsum.photos/seed/fb2/100/100' },
  { name: 'Trần Văn Cường', avatar: 'https://picsum.photos/seed/fb3/100/100' },
  { name: 'Phạm Thị Dung', avatar: 'https://picsum.photos/seed/fb4/100/100' },
  { name: 'Đỗ Văn Em', avatar: 'https://picsum.photos/seed/fb5/100/100' },
];
