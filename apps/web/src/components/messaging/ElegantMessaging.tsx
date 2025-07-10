import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Search,
  Filter,
  Star,
  Archive,
  Circle,
  CheckCircle,
  CheckCircle2,
  Phone,
  Video,
  Info,
  X,
  ChevronDown,
  User,
  Clock,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: 'image' | 'document' | 'video';
  }>;
  isSystem?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline: boolean;
  isTyping?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  listingId?: string;
  listingTitle?: string;
}

interface ElegantMessagingProps {
  currentUserId: string;
  currentUserName: string;
  conversations: Conversation[];
  messages: Message[];
  activeConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  onMessageSend: (conversationId: string, content: string) => void;
  onMessageRead: (messageId: string) => void;
}

const ElegantMessaging: React.FC<ElegantMessagingProps> = ({
  currentUserId,
  currentUserName,
  conversations,
  messages,
  activeConversationId,
  onConversationSelect,
  onMessageSend,
  onMessageRead
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showConversationInfo, setShowConversationInfo] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'pinned' | 'archived'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Remove auto-scroll on conversation change - let users control scroll position
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (filterType) {
      case 'unread':
        return matchesSearch && conv.unreadCount > 0;
      case 'pinned':
        return matchesSearch && conv.isPinned;
      case 'archived':
        return matchesSearch && conv.isArchived;
      default:
        return matchesSearch && !conv.isArchived;
    }
  });

  const handleSendMessage = () => {
    if (newMessage.trim() && activeConversationId) {
      onMessageSend(activeConversationId, newMessage.trim());
      setNewMessage('');
      // Scroll to bottom after sending message
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'nu';
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-300" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Left Sidebar - Conversations */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
              Meddelanden
            </h2>
            <button className="p-2 hover:bg-white rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Sök konversationer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="p-2 border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-1">
            {[
              { key: 'all', label: 'Alla', icon: MessageSquare },
              { key: 'unread', label: 'Olästa', icon: Circle },
              { key: 'pinned', label: 'Fästa', icon: Star },
              { key: 'archived', label: 'Arkiv', icon: Archive }
            ].map(filter => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.key}
                  onClick={() => setFilterType(filter.key as any)}
                  className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filterType === filter.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-100 ${
                  activeConversationId === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {conversation.avatar ? (
                        <img src={conversation.avatar} alt={conversation.name} className="w-full h-full rounded-full" />
                      ) : (
                        getInitials(conversation.name)
                      )}
                    </div>
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate flex items-center">
                        {conversation.name}
                        {conversation.isPinned && (
                          <Star className="w-4 h-4 ml-1 text-yellow-500 fill-current" />
                        )}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {conversation.lastMessageTime && (
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        )}
                        {conversation.unreadCount > 0 && (
                          <span className="min-w-[20px] h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {conversation.listingTitle && (
                      <p className="text-xs text-blue-600 truncate font-medium">
                        📄 {conversation.listingTitle}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.isTyping ? (
                          <span className="text-blue-600 font-medium">skriver...</span>
                        ) : (
                          conversation.lastMessage || 'Ingen meddelande'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Inga konversationer hittades</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Messages */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {activeConversation.avatar ? (
                        <img src={activeConversation.avatar} alt={activeConversation.name} className="w-full h-full rounded-full" />
                      ) : (
                        getInitials(activeConversation.name)
                      )}
                    </div>
                    {activeConversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{activeConversation.name}</h3>
                    <p className="text-sm text-gray-600">
                      {activeConversation.isOnline ? 'Online' : 'Offline'}
                      {activeConversation.isTyping && ' • skriver...'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <Video className="w-5 h-5 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => setShowConversationInfo(!showConversationInfo)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <Info className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.senderId === currentUserId
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  }`}>
                    {message.isSystem ? (
                      <div className="text-center text-sm text-gray-500 italic">
                        {message.content}
                      </div>
                    ) : (
                      <>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map(attachment => (
                              <div key={attachment.id} className="flex items-center space-x-2 text-xs">
                                <Paperclip className="w-3 h-3" />
                                <span className="truncate">{attachment.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className={`flex items-center justify-between mt-2 text-xs ${
                          message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>{formatTime(message.timestamp)}</span>
                          {message.senderId === currentUserId && (
                            <div className="flex items-center space-x-1">
                              {getMessageStatusIcon(message.status)}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Skriv ett meddelande..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32 bg-gray-50"
                    rows={1}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                    <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                      <Smile className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Välj en konversation</h3>
              <p className="text-gray-600">Välj en konversation för att börja chatta</p>
            </div>
          </div>
        )}
      </div>

      {/* Conversation Info Sidebar */}
      {showConversationInfo && activeConversation && (
        <div className="w-80 border-l border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Information</h3>
            <button
              onClick={() => setShowConversationInfo(false)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold mb-2">
                {activeConversation.avatar ? (
                  <img src={activeConversation.avatar} alt={activeConversation.name} className="w-full h-full rounded-full" />
                ) : (
                  getInitials(activeConversation.name)
                )}
              </div>
              <h4 className="font-semibold text-gray-900">{activeConversation.name}</h4>
              <p className="text-sm text-gray-600">
                {activeConversation.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
            
            {activeConversation.listingTitle && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Relaterad annons</p>
                <p className="text-sm text-blue-700">{activeConversation.listingTitle}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Notifieringar</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </button>
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Fäst konversation</span>
                  <Star className="w-4 h-4 text-gray-500" />
                </div>
              </button>
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Arkivera</span>
                  <Archive className="w-4 h-4 text-gray-500" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElegantMessaging;