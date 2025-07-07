import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, X, Send, User, Plus, Bell, Search, Trash2, Reply,
  Edit3, Crown, Star, Shield, Zap, MessageCircle, Check, Archive,
  Pin, Download, File, Image, Paperclip, Smile, MoreHorizontal
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'sent' | 'received';
  edited?: boolean;
  editHistory?: string[];
  pinned?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: string[];
  reactions?: Record<string, string[]>;
}

interface PremiumFeatures {
  editMessages: boolean;
  priorityMessages: boolean;
  messageReactions: boolean;
  fileAttachments: boolean;
  messageSearch: boolean;
  conversationThreads: boolean;
  messageArchive: boolean;
  readReceipts: boolean;
}

export const PremiumChatBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [activeView, setActiveView] = useState<'list' | 'compose' | 'conversation' | 'edit'>('list');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [showPremiumFeatures, setShowPremiumFeatures] = useState(false);
  const { user: authUser } = useAuthStore();

  // Premium features - in real app, this would come from user's subscription
  const premiumFeatures: PremiumFeatures = {
    editMessages: true,
    priorityMessages: true,
    messageReactions: true,
    fileAttachments: true,
    messageSearch: true,
    conversationThreads: true,
    messageArchive: true,
    readReceipts: true
  };

  // Load user messages
  useEffect(() => {
    if (authUser) {
      const userMessages = JSON.parse(localStorage.getItem(`userMessages_${authUser.id}`) || '[]');
      setMessages(userMessages);
    }
  }, [authUser, isOpen]);

  const unreadCount = messages.filter(m => !m.read && m.type === 'received').length;

  const handleSendMessage = () => {
    if (!authUser || !recipient || !subject || !newMessage) {
      toast.error('Fyll i alla fält');
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      from: authUser.id,
      fromName: `${authUser.firstName} ${authUser.lastName}`,
      to: recipient,
      subject,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'sent',
      priority: selectedPriority,
      reactions: {}
    };

    // Save message for sender
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(`userMessages_${authUser.id}`, JSON.stringify(updatedMessages));

    // Save message for recipient
    const recipientMessages = JSON.parse(localStorage.getItem(`userMessages_${recipient}`) || '[]');
    recipientMessages.push({ ...message, type: 'received' });
    localStorage.setItem(`userMessages_${recipient}`, JSON.stringify(recipientMessages));

    // Clear form and go back to list view
    setNewMessage('');
    setRecipient('');
    setSubject('');
    setSelectedPriority('normal');
    setActiveView('list');
    
    toast.success('💎 Premium meddelande skickat!');
  };

  const handleEditMessage = (message: Message) => {
    if (!premiumFeatures.editMessages) {
      toast.error('Premium funktion: Redigera meddelanden');
      return;
    }
    setEditingMessage(message);
    setNewMessage(message.content);
    setActiveView('edit');
  };

  const handleSaveEdit = () => {
    if (!editingMessage || !authUser) return;

    const updatedMessages = messages.map(m => {
      if (m.id === editingMessage.id) {
        return {
          ...m,
          content: newMessage,
          edited: true,
          editHistory: [...(m.editHistory || []), m.content]
        };
      }
      return m;
    });

    setMessages(updatedMessages);
    localStorage.setItem(`userMessages_${authUser.id}`, JSON.stringify(updatedMessages));
    
    setEditingMessage(null);
    setNewMessage('');
    setActiveView('list');
    toast.success('✨ Meddelande uppdaterat!');
  };

  const handleReply = (originalMessage: Message) => {
    setRecipient(originalMessage.from);
    setSubject(`Re: ${originalMessage.subject}`);
    setActiveView('compose');
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!authUser) return;
    
    const updatedMessages = messages.filter(m => m.id !== messageId);
    setMessages(updatedMessages);
    localStorage.setItem(`userMessages_${authUser.id}`, JSON.stringify(updatedMessages));
    toast.success('🗑️ Meddelande borttaget');
  };

  const handlePinMessage = (messageId: string) => {
    if (!premiumFeatures.messageArchive) {
      toast.error('Premium funktion: Organisera meddelanden');
      return;
    }

    const updatedMessages = messages.map(m => 
      m.id === messageId ? { ...m, pinned: !m.pinned } : m
    );
    setMessages(updatedMessages);
    localStorage.setItem(`userMessages_${authUser?.id}`, JSON.stringify(updatedMessages));
    toast.success('📌 Meddelande ' + (messages.find(m => m.id === messageId)?.pinned ? 'avfäst' : 'fäst'));
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!premiumFeatures.messageReactions) {
      toast.error('Premium funktion: Reaktioner');
      return;
    }

    const userId = authUser?.id || 'anonymous';
    const updatedMessages = messages.map(m => {
      if (m.id === messageId) {
        const reactions = { ...m.reactions };
        if (!reactions[emoji]) reactions[emoji] = [];
        
        if (reactions[emoji].includes(userId)) {
          reactions[emoji] = reactions[emoji].filter(id => id !== userId);
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          reactions[emoji].push(userId);
        }
        
        return { ...m, reactions };
      }
      return m;
    });
    
    setMessages(updatedMessages);
    localStorage.setItem(`userMessages_${authUser?.id}`, JSON.stringify(updatedMessages));
  };

  const startNewConversation = () => {
    setRecipient('');
    setSubject('');
    setNewMessage('');
    setSelectedPriority('normal');
    setActiveView('compose');
  };

  const filteredMessages = messages.filter(message => 
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.fromName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const markAsRead = (messageId: string) => {
    const updatedMessages = messages.map(m => 
      m.id === messageId ? { ...m, read: true } : m
    );
    setMessages(updatedMessages);
    localStorage.setItem(`userMessages_${authUser?.id}`, JSON.stringify(updatedMessages));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Zap className="w-4 h-4 text-red-500" />;
      case 'high': return <Star className="w-4 h-4 text-orange-500" />;
      case 'low': return <MessageCircle className="w-4 h-4 text-gray-400" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-red-500 bg-red-50';
      case 'high': return 'border-l-4 border-orange-500 bg-orange-50';
      case 'low': return 'border-l-4 border-gray-300 bg-gray-50';
      default: return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  if (!authUser) return null;

  return (
    <>
      {/* Premium Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full p-4 shadow-xl transition-all duration-200 hover:scale-110 ${
          unreadCount > 0 ? 'animate-pulse' : ''
        }`}
      >
        <div className="relative">
          {unreadCount > 0 ? (
            <Bell className="w-6 h-6" />
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}
          <Crown className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
        </div>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Premium Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Premium Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-xl">
            <div className="flex items-center">
              <div className="relative">
                <MessageSquare className="w-5 h-5 mr-2" />
                <Crown className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
              </div>
              <h3 className="font-medium">
                {activeView === 'compose' ? 'Nytt Premium Meddelande' : 
                 activeView === 'edit' ? 'Redigera Meddelande' : 'Premium Chat'}
              </h3>
              {unreadCount > 0 && activeView === 'list' && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPremiumFeatures(!showPremiumFeatures)}
                className="text-yellow-300 hover:text-yellow-100"
                title="Premium Funktioner"
              >
                <Crown className="w-4 h-4" />
              </button>
              {activeView === 'list' && (
                <button
                  onClick={startNewConversation}
                  className="text-white hover:text-gray-200"
                  title="Nytt meddelande"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
              {(activeView === 'compose' || activeView === 'edit') && (
                <button
                  onClick={() => {
                    setActiveView('list');
                    setEditingMessage(null);
                    setNewMessage('');
                  }}
                  className="text-white hover:text-gray-200"
                  title="Tillbaka"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Premium Features Panel */}
          {showPremiumFeatures && (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
              <div className="text-xs text-gray-600 mb-2 font-medium">✨ Premium Funktioner Aktiverade:</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center text-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  Redigera meddelanden
                </div>
                <div className="flex items-center text-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  Prioritet nivåer
                </div>
                <div className="flex items-center text-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  Reaktioner
                </div>
                <div className="flex items-center text-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  Läsbekräftelser
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Search bar */}
          {activeView === 'list' && premiumFeatures.messageSearch && (
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="🔍 Sök meddelanden med AI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeView === 'list' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {/* Pinned Messages */}
                {filteredMessages.filter(m => m.pinned).length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                      <Pin className="w-3 h-3 mr-1" />
                      Fästa meddelanden
                    </div>
                    {filteredMessages.filter(m => m.pinned).map((message) => (
                      <div key={`pinned-${message.id}`} className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
                        <div className="font-medium">{message.subject}</div>
                        <div className="text-gray-600 truncate">{message.content}</div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredMessages.length > 0 ? (
                  filteredMessages.slice(-20).reverse().map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg transition-colors group hover:bg-gray-100 ${
                        !message.read && message.type === 'received'
                          ? getPriorityColor(message.priority || 'normal')
                          : 'bg-gray-50 border border-gray-200'
                      } ${message.pinned ? 'ring-2 ring-yellow-300' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 cursor-pointer" onClick={() => message.type === 'received' && !message.read && markAsRead(message.id)}>
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            {getPriorityIcon(message.priority || 'normal')}
                            <span className={`text-sm font-medium ml-1 ${
                              !message.read && message.type === 'received' ? 'text-purple-700' : 'text-gray-700'
                            }`}>
                              {message.type === 'received' ? message.fromName : `Till: ${message.to}`}
                            </span>
                            {!message.read && message.type === 'received' && (
                              <span className="ml-2 w-2 h-2 bg-purple-500 rounded-full"></span>
                            )}
                            {message.edited && (
                              <span className="ml-2 text-xs text-gray-500">(redigerad)</span>
                            )}
                            {message.pinned && (
                              <Pin className="w-3 h-3 ml-2 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 font-medium mt-1">{message.subject}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{message.content}</p>
                          
                          {/* Reactions */}
                          {message.reactions && Object.keys(message.reactions).length > 0 && (
                            <div className="flex items-center space-x-1 mt-2">
                              {Object.entries(message.reactions).map(([emoji, users]) => (
                                <button
                                  key={emoji}
                                  onClick={() => addReaction(message.id, emoji)}
                                  className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1 text-xs"
                                >
                                  <span>{emoji}</span>
                                  <span className="text-gray-500">{users.length}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-400">{formatDate(message.timestamp)}</span>
                            {premiumFeatures.readReceipts && message.type === 'sent' && (
                              <div className="flex items-center text-xs text-green-500">
                                <Check className="w-3 h-3 mr-1" />
                                Läst
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => addReaction(message.id, '👍')}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Gilla"
                          >
                            <Smile className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePinMessage(message.id)}
                            className="p-1 text-gray-400 hover:text-yellow-600"
                            title="Fäst meddelande"
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                          {message.type === 'sent' && (
                            <button
                              onClick={() => handleEditMessage(message)}
                              className="p-1 text-gray-400 hover:text-green-600"
                              title="Redigera"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleReply(message)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Svara"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Ta bort"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="relative">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <Crown className="w-6 h-6 text-yellow-400 absolute top-0 right-1/2 transform translate-x-6" />
                    </div>
                    <p className="text-sm font-medium">Inga premium meddelanden än</p>
                    <p className="text-xs text-gray-400 mt-1">Starta en ny konversation med premium funktioner!</p>
                    <button
                      onClick={startNewConversation}
                      className="mt-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:from-purple-700 hover:to-blue-700 transition-colors"
                    >
                      ✨ Nytt Premium Meddelande
                    </button>
                  </div>
                )}
              </div>
            )}

            {(activeView === 'compose' || activeView === 'edit') && (
              <div className="flex-1 p-4">
                <div className="space-y-4">
                  {activeView === 'compose' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Till:</label>
                        <input
                          type="text"
                          placeholder="Mottagarens användar-ID eller e-post"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Ämne:</label>
                        <input
                          type="text"
                          placeholder="Ämne för meddelandet"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      {/* Priority Selector */}
                      {premiumFeatures.priorityMessages && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Prioritet:</label>
                          <select
                            value={selectedPriority}
                            onChange={(e) => setSelectedPriority(e.target.value as any)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="low">🔵 Låg prioritet</option>
                            <option value="normal">⚪ Normal prioritet</option>
                            <option value="high">🟡 Hög prioritet</option>
                            <option value="urgent">🔴 Brådskande</option>
                          </select>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {activeView === 'edit' ? 'Redigera meddelande:' : 'Meddelande:'}
                    </label>
                    <textarea
                      placeholder={activeView === 'edit' ? 'Uppdatera ditt meddelande...' : 'Skriv ditt premium meddelande här...'}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      {premiumFeatures.fileAttachments && (
                        <button className="flex items-center text-purple-600 hover:text-purple-700">
                          <Paperclip className="w-4 h-4 mr-1" />
                          Bifoga fil
                        </button>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setActiveView('list');
                          setEditingMessage(null);
                          setNewMessage('');
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Avbryt
                      </button>
                      <button
                        onClick={activeView === 'edit' ? handleSaveEdit : handleSendMessage}
                        disabled={activeView === 'compose' ? (!recipient || !subject || !newMessage) : !newMessage}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center"
                      >
                        {activeView === 'edit' ? (
                          <>
                            <Edit3 className="w-4 h-4 mr-1" />
                            Spara ändringar
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            Skicka Premium
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};