
import React, { useState, useRef } from 'react';
import { SendIcon, ImagePlaceHolder, EmojiIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (text: string, images?: string[]) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState('');
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (text.trim() || previews.length > 0) {
      onSendMessage(text, previews.length > 0 ? previews : undefined);
      setText('');
      setPreviews([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPreviews: string[] = [];
    const filesArray = Array.from(files);
    
    // Fix: Explicitly type 'file' as File to resolve TypeScript inference error
    filesArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === filesArray.length) {
          setPreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input value to allow re-selecting same file
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isSendDisabled = !text.trim() && previews.length === 0;

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-100 px-3 py-3 pb-8 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-20">
      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar pb-3 animate-fade-in">
          {previews.map((src, idx) => (
            <div key={idx} className="relative flex-shrink-0">
              <img 
                src={src} 
                alt="preview" 
                className="w-16 h-16 rounded-xl object-cover border border-gray-200" 
              />
              <button 
                onClick={() => removePreview(idx)}
                className="absolute -top-1.5 -right-1.5 bg-gray-900/80 text-white rounded-full p-0.5 shadow-md"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 flex-shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-all"
          >
            <span className="text-xl font-light">+</span>
          </button>
        </div>
      )}

      <div className="flex items-end space-x-2">
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple 
          accept="image/*" 
          className="hidden" 
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-blue-500 transition-colors mb-0.5"
        >
          <ImagePlaceHolder className="w-6 h-6" />
        </button>
        
        <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors mb-0.5">
          <EmojiIcon className="w-6 h-6" />
        </button>

        <div className="flex-1 relative">
          <textarea
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              // Auto resize textarea
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="w-full bg-gray-100 border-none rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400 resize-none max-h-32"
          />
        </div>

        <button 
          onClick={handleSend}
          disabled={isSendDisabled}
          className={`p-2.5 rounded-full shadow-md transition-all mb-0.5 ${!isSendDisabled ? 'bg-blue-600 text-white scale-100' : 'bg-gray-200 text-gray-400 scale-95 opacity-50'}`}
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
