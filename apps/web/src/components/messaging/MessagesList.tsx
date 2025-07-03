import React, { useState, useEffect, useRef } from 'react';
import { Message, User } from '../../services/messageService';
import { getSocketService } from '../../services/socketService';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

interface MessagesListProps {
  conversationId: string;
  messages: Message[];
  currentUserId: string;
  onMessageRead: (messageId: string) => void;
  onMessageDelete: (messageId: string) => void;
  typingUsers: Set<string>;
  users: Map<string, User>;
}

const MessagesList: React.FC<MessagesListProps> = ({
  conversationId,
  messages,
  currentUserId,
  onMessageRead,
  onMessageDelete,
  typingUsers,
  users,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when they come into view
    const unreadMessages = messages.filter(
      msg => msg.receiverId === currentUserId && msg.status !== 'READ'
    );

    unreadMessages.forEach(msg => {
      onMessageRead(msg.id);
    });
  }, [messages, currentUserId, onMessageRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: sv,
    });
  };

  const handleMessageClick = (messageId: string) => {
    setSelectedMessage(selectedMessage === messageId ? null : messageId);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm('Är du säker på att du vill ta bort detta meddelande?')) {
      onMessageDelete(messageId);
    }
    setSelectedMessage(null);
  };

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'FILE':
      case 'IMAGE':
        return (
          <div className="space-y-2">
            {message.content && (
              <p className="text-nordic-gray-800">{message.content}</p>
            )}
            {message.attachments?.map(attachment => (
              <div key={attachment.id} className="border border-nordic-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  {attachment.mimeType.startsWith('image/') ? (
                    <div className="w-8 h-8 bg-nordic-blue-100 rounded flex items-center justify-center">
                      <span className="text-nordic-blue-600 text-sm">🖼️</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-nordic-gray-100 rounded flex items-center justify-center">
                      <span className="text-nordic-gray-600 text-sm">📎</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-nordic-gray-900 truncate">
                      {attachment.originalName}
                    </p>
                    <p className="text-xs text-nordic-gray-500">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-nordic-blue-600 hover:text-nordic-blue-700 text-sm font-medium"
                  >
                    Öppna
                  </a>
                </div>
              </div>
            ))}
          </div>
        );
      case 'SYSTEM':
        return (
          <div className="text-center">
            <span className="bg-nordic-gray-100 text-nordic-gray-600 px-3 py-1 rounded-full text-sm">
              {message.content}
            </span>
          </div>
        );
      default:
        return <p className="text-nordic-gray-800 whitespace-pre-wrap">{message.content}</p>;
    }
  };

  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    const typingUserNames = Array.from(typingUsers)
      .map(userId => {
        const user = users.get(userId);
        return user ? `${user.firstName} ${user.lastName}` : 'Någon';
      })
      .join(', ');

    return (
      <div className="flex justify-start mb-4">
        <div className="bg-nordic-gray-100 rounded-2xl px-4 py-2 max-w-xs">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-nordic-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-nordic-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-nordic-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs text-nordic-gray-500">
              {typingUserNames} skriver...
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-nordic-gray-900 mb-2">
            Inga meddelanden än
          </h3>
          <p className="text-nordic-gray-500">
            Skicka ditt första meddelande för att starta konversationen!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const isOwn = message.senderId === currentUserId;
        const isSystem = message.type === 'SYSTEM';
        const showAvatar = !isOwn && (index === 0 || messages[index - 1].senderId !== message.senderId);
        const showName = !isOwn && showAvatar;

        if (isSystem) {
          return (
            <div key={message.id} className="flex justify-center">
              {renderMessageContent(message)}
            </div>
          );
        }

        return (
          <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              {!isOwn && (
                <div className="flex-shrink-0 mr-2">
                  {showAvatar ? (
                    <div className="w-8 h-8 rounded-full bg-nordic-blue-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {message.sender.firstName[0]}
                      </span>
                    </div>
                  ) : (
                    <div className="w-8 h-8"></div>
                  )}
                </div>
              )}

              {/* Message bubble */}
              <div
                className={`relative group cursor-pointer ${isOwn ? 'ml-2' : ''}`}
                onClick={() => handleMessageClick(message.id)}
              >
                {/* Sender name */}
                {showName && (
                  <p className="text-xs text-nordic-gray-500 mb-1 px-1">
                    {message.sender.firstName} {message.sender.lastName}
                  </p>
                )}

                {/* Message content */}
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isOwn
                      ? 'bg-nordic-blue-600 text-white'
                      : 'bg-white border border-nordic-gray-200 text-nordic-gray-800'
                  } ${selectedMessage === message.id ? 'ring-2 ring-nordic-blue-300' : ''}`}
                >
                  {renderMessageContent(message)}
                </div>

                {/* Message meta */}
                <div className={`flex items-center space-x-2 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs text-nordic-gray-400">
                    {formatMessageTime(message.createdAt)}
                  </span>
                  {isOwn && (
                    <span className="text-xs">
                      {message.status === 'READ' ? (
                        <span className="text-nordic-blue-400">✓✓</span>
                      ) : message.status === 'DELIVERED' ? (
                        <span className="text-nordic-gray-400">✓✓</span>
                      ) : (
                        <span className="text-nordic-gray-400">✓</span>
                      )}
                    </span>
                  )}
                </div>

                {/* Message actions */}
                {selectedMessage === message.id && (
                  <div className={`absolute top-full mt-1 bg-white border border-nordic-gray-200 rounded-lg shadow-lg py-1 z-10 ${
                    isOwn ? 'right-0' : 'left-0'
                  }`}>
                    {isOwn && (
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Ta bort meddelande
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="block w-full px-4 py-2 text-left text-sm text-nordic-gray-600 hover:bg-nordic-gray-50"
                    >
                      Stäng
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {renderTypingIndicator()}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;