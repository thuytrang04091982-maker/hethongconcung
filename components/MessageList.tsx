
import React from 'react';
import { Message } from '../types';
import { VerifiedBadge } from './Icons';

interface MessageListProps {
  messages: Message[];
  onImageClick: (url: string) => void;
  isMeAdmin?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, onImageClick, isMeAdmin }) => {
  return (
    <div className="flex flex-col px-4 py-6 space-y-4">
      {messages.map((msg) => {
        if (msg.type === 'system') {
          return (
            <div key={msg.id} className="flex justify-center">
              <span className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-100 rounded-full text-center">
                {msg.text}
              </span>
            </div>
          );
        }

        const isMe = msg.isMe;

        return (
          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {!isMe && (
              <img 
                src={msg.sender.avatar} 
                alt={msg.sender.name} 
                className="w-8 h-8 rounded-full mt-1 flex-shrink-0 object-cover shadow-sm"
              />
            )}
            <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start ml-2'}`}>
              {!isMe && (
                <div className="flex items-center space-x-1 mb-1 ml-1">
                  <span className="text-[11px] font-bold text-gray-600">{msg.sender.name}</span>
                  {msg.sender.isAdmin && (
                    <VerifiedBadge className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[10px] text-gray-400">• {msg.timestamp}</span>
                </div>
              )}
              
              {/* Message content */}
              <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed
                ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                {msg.text}
              </div>

              {/* Images if any */}
              {msg.images && msg.images.length > 0 && (
                <div className={`mt-2 grid gap-1 ${msg.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} overflow-hidden rounded-xl`}>
                  {msg.images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt="Message attachment" 
                      onClick={() => onImageClick(img)}
                      className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  ))}
                </div>
              )}
              
              {isMe && (
                <div className="flex items-center space-x-1 mt-1 mr-1">
                   {msg.sender.isAdmin && <VerifiedBadge className="w-3 h-3" />}
                   <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
