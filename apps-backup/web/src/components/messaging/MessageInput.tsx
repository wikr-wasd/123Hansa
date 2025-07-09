import React, { useState, useRef, useCallback } from 'react';
import { getSocketService } from '../../services/socketService';

interface MessageInputProps {
  conversationId: string;
  onSendMessage: (content: string, type?: string, metadata?: any) => void;
  onFileUpload?: (files: File[]) => void;
  isBlocked?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  onSendMessage,
  onFileUpload,
  isBlocked = false,
  placeholder = 'Skriv ett meddelande...',
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const socketService = getSocketService();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      socketService.startTyping(conversationId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socketService.stopTyping(conversationId);
      }
    }, 1000);
  }, [conversationId, isTyping, socketService]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, []);

  const handleSendMessage = useCallback(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isBlocked) return;

    onSendMessage(trimmedMessage);
    setMessage('');
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      socketService.stopTyping(conversationId);
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, isBlocked, isTyping, conversationId, onSendMessage, socketService]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files);
    }
    // Reset file input
    e.target.value = '';
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files);
    }
  }, [onFileUpload]);

  if (isBlocked) {
    return (
      <div className="p-4 bg-nordic-gray-50 border-t border-nordic-gray-200">
        <div className="text-center">
          <span className="text-sm text-nordic-gray-500">
            🚫 Denna konversation är blockerad
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border-t border-nordic-gray-200">
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-nordic-blue-50 bg-opacity-90 flex items-center justify-center z-10 border-2 border-dashed border-nordic-blue-300 rounded-lg">
          <div className="text-center">
            <div className="text-4xl mb-2">📎</div>
            <p className="text-nordic-blue-600 font-medium">Släpp filer här för att ladda upp</p>
          </div>
        </div>
      )}

      <div
        className="relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-end space-x-3">
          {/* File upload button */}
          {onFileUpload && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 p-2 text-nordic-gray-500 hover:text-nordic-blue-600 hover:bg-nordic-blue-50 rounded-lg transition-colors"
              title="Bifoga fil"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
          )}

          {/* Message input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              rows={1}
              className="w-full px-4 py-3 border border-nordic-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-nordic-blue-500 focus:border-transparent"
              style={{ minHeight: '44px', maxHeight: '150px' }}
            />
            
            {/* Character count (show if approaching limit) */}
            {message.length > 800 && (
              <div className="absolute bottom-1 right-3 text-xs text-nordic-gray-400">
                {message.length}/1000
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={`flex-shrink-0 p-3 rounded-full transition-colors ${
              message.trim()
                ? 'bg-nordic-blue-600 text-white hover:bg-nordic-blue-700'
                : 'bg-nordic-gray-200 text-nordic-gray-400 cursor-not-allowed'
            }`}
            title="Skicka meddelande"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        {/* File input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />

        {/* Quick actions */}
        <div className="flex items-center justify-between mt-2 text-xs text-nordic-gray-500">
          <div className="flex items-center space-x-4">
            <span>Tryck Enter för att skicka, Shift+Enter för ny rad</span>
          </div>
          <div className="flex items-center space-x-2">
            {isTyping && (
              <span className="text-nordic-blue-600">Skriver...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;