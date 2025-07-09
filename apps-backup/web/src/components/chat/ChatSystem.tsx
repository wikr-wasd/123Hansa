import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize, Maximize, User, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMessageStore } from '../../stores/messageStore';

interface ChatSystemProps {
  currentUserId: string;
  currentUserName: string;
  currentUserType: 'user' | 'support' | 'admin';
}

const ChatSystem: React.FC<ChatSystemProps> = ({ currentUserId, currentUserName, currentUserType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Message store
  const {
    addMessage,
    markConversationAsRead,
    getUnreadCount,
    getConversationMessages,
    getUserConversations,
    initializeDefaultData,
  } = useMessageStore();

  // Get user conversations and unread count
  const userConversations = getUserConversations(currentUserId);
  const totalUnreadCount = getUnreadCount(currentUserId);

  // Initialize default data if needed
  useEffect(() => {
    if (userConversations.length === 0) {
      initializeDefaultData(currentUserId, currentUserName, currentUserType);
    }
  }, [currentUserId, currentUserName, currentUserType, userConversations.length, initializeDefaultData]);

  // Get messages for active conversation
  const activeConversationMessages = activeConversation 
    ? getConversationMessages(activeConversation) 
    : [];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationMessages]);

  // Send message
  const sendMessage = () => {
    if (!message.trim() || !activeConversation) return;

    const conversation = userConversations.find(c => c.id === activeConversation);
    if (!conversation) return;

    const recipientId = conversation.participants.find(p => p !== currentUserId) || '';
    const recipientName = conversation.participantNames.find((name, index) => 
      conversation.participants[index] !== currentUserId
    ) || '';

    addMessage({
      senderId: currentUserId,
      senderName: currentUserName,
      senderType: currentUserType,
      recipientId,
      recipientName,
      subject: conversation.title,
      content: message,
      read: false,
      conversationId: activeConversation,
    });

    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    markConversationAsRead(conversationId);
    if (isMinimized) setIsMinimized(false);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('sv-SE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Chat Bubble */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative"
        >
          <MessageSquare className="w-6 h-6" />
          {totalUnreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {totalUnreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <h3 className="font-semibold">
              {activeConversation 
                ? userConversations.find(c => c.id === activeConversation)?.title 
                : 'Meddelanden'
              }
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              >
                {isMinimized ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {!activeConversation ? (
                /* Conversation List */
                <div className="flex-1 overflow-y-auto">
                  {userConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => openConversation(conversation.id)}
                      className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{conversation.title}</div>
                            <div className="text-xs text-gray-500 truncate w-40">
                              {conversation.lastMessage}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">
                            {formatTime(conversation.lastMessageTime)}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-1 mt-1 inline-block">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Back Button */}
                  <div className="p-2 border-b border-gray-200">
                    <button
                      onClick={() => setActiveConversation(null)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      ← Tillbaka till konversationer
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {activeConversationMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-lg ${
                            msg.senderId === currentUserId
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <div className="text-sm">{msg.content}</div>
                          <div className={`text-xs mt-1 ${
                            msg.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Skriv ett meddelande..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!message.trim()}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatSystem;