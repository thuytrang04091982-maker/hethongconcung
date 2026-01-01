
import React, { useState } from 'react';
import { ChevronLeft, InfoIcon, LinkIcon } from './Icons';
import { GroupDetails } from '../types';

interface ChatHeaderProps {
  onBack: () => void;
  onShowInfo: () => void;
  group: GroupDetails;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onBack, onShowInfo, group }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('group', group.id);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center space-x-3">
        <button onClick={onBack} className="p-1 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={group.avatar} 
              alt="Group" 
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-50"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="max-w-[150px]">
            <h1 className="text-base font-bold text-gray-800 line-clamp-1 leading-tight">{group.name}</h1>
            <p className="text-xs text-gray-500 font-medium">{group.memberCount.toLocaleString()} thành viên</p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <button 
          onClick={handleCopyLink} 
          className={`relative p-2 rounded-full transition-all ${copied ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
          title="Mời bạn bè"
        >
          <LinkIcon className="w-5 h-5" />
          {copied && (
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap animate-fade-in">
              Đã sao chép!
            </span>
          )}
        </button>
        <button onClick={onShowInfo} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
          <InfoIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
