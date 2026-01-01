
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppScreen, Message, User, GroupDetails } from './types';
import { CURRENT_USER, DEFAULT_GROUP, FB_MOCK_PROFILES } from './constants';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { FacebookIcon, ChevronLeft } from './components/Icons';
import { supabase } from './supabase';

const ADMIN_ID = 'u2';

const getSessionUser = (): User => {
  const saved = sessionStorage.getItem('chat_session_user');
  if (saved) return JSON.parse(saved);
  const guestUser = { ...CURRENT_USER, id: 'guest_' + Math.random().toString(36).substr(2, 9) };
  return guestUser;
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.GROUP_LIST);
  const [groups, setGroups] = useState<GroupDetails[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [user, setUser] = useState<User>(CURRENT_USER);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // 1. Hàm tải danh sách nhóm (Dùng useCallback để ổn định)
  const fetchGroups = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('groups').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setGroups(data.map((g: any) => ({
          ...g,
          adminId: g.admin_id,
          memberCount: g.member_count,
          rules: g.rules || []
        })));
      }
    } catch (e) {
      console.error("Lỗi fetch groups:", e);
    }
  }, []);

  // 2. Khởi tạo User và tải dữ liệu ban đầu
  useEffect(() => {
    setUser(getSessionUser());
    fetchGroups();
  }, [fetchGroups]);

  // 3. Xử lý Realtime & Tin nhắn
  useEffect(() => {
    if (!activeGroupId) return;

    // Tải tin nhắn cũ
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('group_id', activeGroupId)
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (data) {
        setMessages(data.map(m => ({
          id: m.id,
          sender: { id: m.sender_id, name: m.sender_name, avatar: m.sender_avatar },
          text: m.text,
          images: m.images,
          isMe: m.sender_id === user.id,
          type: m.type || 'chat',
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      }
    };

    fetchMessages();

    // Kết nối Realtime
    const channel = supabase.channel(`room-${activeGroupId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${activeGroupId}` }, 
        (payload) => {
          const m = payload.new;
          setMessages(prev => {
            if (prev.some(msg => msg.id === m.id)) return prev;
            return [...prev, {
              id: m.id,
              sender: { id: m.sender_id, name: m.sender_name, avatar: m.sender_avatar },
              text: m.text,
              images: m.images,
              isMe: m.sender_id === user.id,
              type: m.type || 'chat',
              timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }];
          });
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'groups', filter: `id=eq.${activeGroupId}` }, () => {
        fetchGroups();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeGroupId, user.id, fetchGroups]);

  // Cuộn xuống tin nhắn mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, screen]);

  // 4. Gửi tin nhắn (Optimistic UI)
  const handleSendMessage = async (text: string, images?: string[]) => {
    if (!activeGroupId) return;
    
    const messageId = crypto.randomUUID();
    const now = new Date();

    const optimisticMsg: Message = {
      id: messageId,
      sender: user,
      text: text.trim(),
      images: images,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'chat'
    };
    
    setMessages(prev => [...prev, optimisticMsg]);

    const { error } = await supabase.from('messages').insert({
      id: messageId,
      group_id: activeGroupId,
      sender_id: user.id,
      sender_name: user.name,
      sender_avatar: user.avatar,
      text: text.trim() || null,
      images: images || [],
      type: 'chat',
      created_at: now.toISOString()
    });

    if (error) {
      console.error("Gửi tin nhắn thất bại:", error);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    }
  };

  const joinWithFacebook = async () => {
    const randomProfile = FB_MOCK_PROFILES[Math.floor(Math.random() * FB_MOCK_PROFILES.length)];
    const fbUser: User = { 
      id: 'fb_' + Math.random().toString(36).substr(2, 5), 
      name: randomProfile.name, 
      avatar: randomProfile.avatar, 
      isOnline: true, 
      isAdmin: false 
    };
    
    sessionStorage.setItem('chat_session_user', JSON.stringify(fbUser));
    setUser(fbUser);

    if (activeGroupId) {
      const group = groups.find(g => g.id === activeGroupId);
      await supabase.from('groups').update({ 
        member_count: (group?.memberCount || 0) + 1 
      }).eq('id', activeGroupId);

      await supabase.from('messages').insert({
        id: 'sys_' + Date.now(),
        group_id: activeGroupId,
        sender_id: 'sys',
        sender_name: 'Hệ thống',
        sender_avatar: '',
        text: `${fbUser.name} đã gia nhập cộng đồng! 👋`,
        type: 'system'
      });

      setScreen(AppScreen.CHAT);
      fetchGroups();
    }
  };

  const loginAsAdmin = () => {
    const adminUser: User = { id: ADMIN_ID, name: 'Quản trị viên', avatar: 'https://picsum.photos/seed/admin/100/100', isAdmin: true, isVerified: true, isOnline: true };
    setUser(adminUser);
    sessionStorage.setItem('chat_session_user', JSON.stringify(adminUser));
    setScreen(AppScreen.GROUP_LIST);
  };

  const activeGroup = groups.find(g => g.id === activeGroupId) || DEFAULT_GROUP;

  return (
    <div className="max-w-md mx-auto h-screen bg-white relative overflow-hidden shadow-2xl flex flex-col">
      {screen === AppScreen.GROUP_LIST && (
        <div className="flex flex-col h-full bg-gray-50 animate-fade-in">
          <div className="bg-white px-6 py-6 border-b border-gray-100 shadow-sm flex justify-between items-center shrink-0">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">ConnectGroup</h1>
              <p className="text-sm text-gray-500 font-medium">Khám phá cộng đồng</p>
            </div>
            {user.isAdmin && (
              <button onClick={() => setScreen(AppScreen.CREATE_GROUP)} className="bg-blue-600 text-white p-2.5 rounded-full shadow-lg active:scale-90 transition-all">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {groups.map(group => (
              <div key={group.id} onClick={() => { 
                setActiveGroupId(group.id); 
                if (user.id.startsWith('guest_')) setScreen(AppScreen.WELCOME);
                else setScreen(AppScreen.CHAT);
              }} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 active:bg-blue-50 cursor-pointer group">
                <img src={group.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-inner" alt="" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{group.name}</h3>
                  <p className="text-xs text-gray-400 font-medium">{group.memberCount} thành viên</p>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
              </div>
            ))}
            {groups.length === 0 && (
              <div className="text-center py-20 text-gray-400 text-sm">Đang tải danh sách nhóm...</div>
            )}
          </div>
        </div>
      )}

      {screen === AppScreen.WELCOME && (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-600 to-gray-50 p-6 animate-fade-in items-center justify-center text-center">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-8 rotate-3 border-4 border-blue-100 overflow-hidden">
            <img src={activeGroup.avatar} alt="Group Icon" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Tham gia cộng đồng</h1>
          <p className="text-blue-100 mb-8">{activeGroup.name}</p>
          <button onClick={joinWithFacebook} className="w-full bg-white text-blue-700 py-4 px-6 rounded-2xl font-bold shadow-xl flex items-center justify-center space-x-3 active:scale-95 transition-all">
            <FacebookIcon className="w-6 h-6" />
            <span>Tiếp tục với Facebook</span>
          </button>
          {!user.isAdmin && (
            <button onClick={loginAsAdmin} className="mt-6 text-blue-200 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">Đăng nhập quyền Admin</button>
          )}
          <button onClick={() => setScreen(AppScreen.GROUP_LIST)} className="mt-8 text-blue-100 text-sm hover:underline">Quay lại</button>
        </div>
      )}

      {screen === AppScreen.CHAT && (
        <div className="flex flex-col h-full bg-[#F8FAFC]">
          <ChatHeader onBack={() => setScreen(AppScreen.GROUP_LIST)} onShowInfo={() => setScreen(AppScreen.INFO)} group={activeGroup} />
          <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar">
            <MessageList messages={messages} onImageClick={setSelectedImage} />
          </div>
          <ChatInput onSendMessage={handleSendMessage} />
          {selectedImage && (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
              <img src={selectedImage} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            </div>
          )}
        </div>
      )}

      {screen === AppScreen.CREATE_GROUP && (
        <div className="flex flex-col h-full bg-white animate-fade-in">
          <div className="p-4 flex items-center border-b border-gray-100">
            <button onClick={() => setScreen(AppScreen.GROUP_LIST)} className="p-2 -ml-2 text-gray-500 rounded-full hover:bg-gray-100">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="ml-2 text-lg font-bold text-gray-900">Tạo nhóm mới</h2>
          </div>
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tên nhóm</label>
              <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Nhập tên nhóm..." className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mô tả</label>
              <textarea value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="Mô tả về cộng đồng..." className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none" rows={4} />
            </div>
            <button 
              disabled={!newGroupName.trim()}
              onClick={async () => {
                const gId = crypto.randomUUID();
                await supabase.from('groups').insert({ 
                  id: gId, 
                  name: newGroupName, 
                  description: newGroupDesc, 
                  admin_id: user.id, 
                  avatar: `https://picsum.photos/seed/${gId}/200/200`,
                  member_count: 1
                });
                fetchGroups(); setScreen(AppScreen.GROUP_LIST);
              }} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl active:scale-95 disabled:opacity-50">Tạo nhóm ngay</button>
          </div>
        </div>
      )}

      {screen === AppScreen.INFO && (
        <div className="flex flex-col h-full bg-white animate-fade-in">
          <div className="sticky top-0 bg-white z-10 border-b border-gray-100 flex items-center px-4 py-3">
            <button onClick={() => setScreen(AppScreen.CHAT)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="ml-2 text-lg font-bold">Thông tin nhóm</h2>
          </div>
          <div className="flex-1 overflow-y-auto pb-10">
            <div className="p-8 flex flex-col items-center border-b border-gray-50">
              <img src={activeGroup.avatar} className="w-28 h-28 rounded-full border-4 border-blue-50 shadow-md object-cover mb-4" />
              <h1 className="text-xl font-bold">{activeGroup.name}</h1>
              <p className="text-sm text-gray-500">{activeGroup.memberCount} thành viên</p>
            </div>
            <div className="p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Giới thiệu</h3>
              <p className="text-gray-700 text-sm bg-gray-50 p-5 rounded-2xl border border-gray-100 leading-relaxed">
                {activeGroup.description || "Chưa có mô tả cho nhóm này."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
