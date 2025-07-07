import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize, Maximize, User, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'support' | 'admin';
  message: string;
  timestamp: string;
  read: boolean;
  attachments?: string[];
}

interface ChatConversation {
  id: string;
  participants: string[];
  participantNames: string[];
  type: 'user_to_user' | 'user_to_support' | 'group';
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
}

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
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatRecipient, setNewChatRecipient] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamisk konversations-data baserat på användare
  const initializeConversations = () => {
    const baseConversations = [
      {
        id: 'conv_support',
        participants: [currentUserId, 'support'],
        participantNames: [currentUserName, '123Hansa Support'],
        type: 'user_to_support' as const,
        title: 'Support Chat',
        lastMessage: 'Hej! Hur kan vi hjälpa dig idag?',
        lastMessageTime: '2024-06-26 10:30',
        unreadCount: 1,
        online: true
      }
    ];

    // Lägg till specifika konversationer baserat på användartyp och ID
    if (currentUserType === 'admin') {
      baseConversations.push(
        {
          id: 'conv_user_anna',
          participants: [currentUserId, 'user_anna'],
          participantNames: [currentUserName, 'Anna Karlsson'],
          type: 'user_to_user' as 'user_to_user',
          title: 'Chat med Anna Karlsson',
          lastMessage: 'Tack för den snabba supporten!',
          lastMessageTime: '2024-06-26 15:20',
          unreadCount: 1,
          online: true
        },
        {
          id: 'conv_user_erik',
          participants: [currentUserId, 'user_erik'],
          participantNames: [currentUserName, 'Erik Johansson'],
          type: 'user_to_user' as 'user_to_user',
          title: 'Chat med Erik Johansson',
          lastMessage: 'Har du tid för ett möte imorgon?',
          lastMessageTime: '2024-06-26 14:15',
          unreadCount: 0,
          online: false
        }
      );
    } else {
      // För vanliga användare - lägg till andra användare de kan chatta med
      if (currentUserName.includes('Anna')) {
        baseConversations.push({
          id: 'conv_user_erik',
          participants: [currentUserId, 'user_erik'],
          participantNames: [currentUserName, 'Erik Johansson'],
          type: 'user_to_user' as 'user_to_user',
          title: 'Chat med Erik Johansson',
          lastMessage: 'Intressant företag du har till salu!',
          lastMessageTime: '2024-06-26 11:30',
          unreadCount: 2,
          online: true
        });
      } else if (currentUserName.includes('Erik')) {
        baseConversations.push({
          id: 'conv_user_anna',
          participants: [currentUserId, 'user_anna'],
          participantNames: [currentUserName, 'Anna Karlsson'],
          type: 'user_to_user' as 'user_to_user',
          title: 'Chat med Anna Karlsson',
          lastMessage: 'Tack för informationen!',
          lastMessageTime: '2024-06-26 12:45',
          unreadCount: 0,
          online: true
        });
      } else {
        // För andra användare - lägg till demo-konversationer
        baseConversations.push(
          {
            id: 'conv_demo_seller',
            participants: [currentUserId, 'demo_seller'],
            participantNames: [currentUserName, 'Företagssäljare'],
            type: 'user_to_user' as 'user_to_user',
            title: 'Chat med Företagssäljare',
            lastMessage: 'Hej! Intresserad av mitt företag?',
            lastMessageTime: '2024-06-26 10:15',
            unreadCount: 1,
            online: true
          },
          {
            id: 'conv_demo_buyer',
            participants: [currentUserId, 'demo_buyer'],
            participantNames: [currentUserName, 'Potentiell Köpare'],
            type: 'user_to_user' as 'user_to_user',
            title: 'Chat med Potentiell Köpare',
            lastMessage: 'Kan vi diskutera priset?',
            lastMessageTime: '2024-06-25 18:20',
            unreadCount: 0,
            online: false
          }
        );
      }
    }

    return baseConversations;
  };

  const [conversations, setConversations] = useState<ChatConversation[]>(() => initializeConversations());

  const initializeMessages = () => {
    const baseMessages: { [conversationId: string]: ChatMessage[] } = {
      conv_support: [
        {
          id: 'msg_support_1',
          senderId: 'support',
          senderName: '123Hansa Support',
          senderType: 'support',
          message: `Hej ${currentUserName.split(' ')[0]}! Hur kan vi hjälpa dig idag?`,
          timestamp: '2024-06-26 10:30',
          read: false
        }
      ]
    };

    if (currentUserType === 'admin') {
      baseMessages['conv_user_anna'] = [
        {
          id: 'msg_anna_1',
          senderId: 'user_anna',
          senderName: 'Anna Karlsson',
          senderType: 'user',
          message: 'Hej Willi! Tack för den snabba supporten med min annons.',
          timestamp: '2024-06-26 15:20',
          read: false
        }
      ];
      baseMessages['conv_user_erik'] = [
        {
          id: 'msg_erik_1',
          senderId: 'user_erik',
          senderName: 'Erik Johansson',
          senderType: 'user',
          message: 'Hej! Har du tid för ett möte imorgon om plattformen?',
          timestamp: '2024-06-26 14:15',
          read: true
        }
      ];
    } else if (currentUserName.includes('Anna')) {
      baseMessages['conv_user_erik'] = [
        {
          id: 'msg_erik_to_anna_1',
          senderId: 'user_erik',
          senderName: 'Erik Johansson',
          senderType: 'user',
          message: 'Hej Anna! Jag såg ditt TechStartup-företag. Kan du berätta mer om det?',
          timestamp: '2024-06-26 11:00',
          read: true
        },
        {
          id: 'msg_anna_reply_1',
          senderId: currentUserId,
          senderName: currentUserName,
          senderType: currentUserType,
          message: 'Hej Erik! Absolut, det är ett innovativt teknikföretag med stark tillväxt.',
          timestamp: '2024-06-26 11:15',
          read: true
        },
        {
          id: 'msg_erik_to_anna_2',
          senderId: 'user_erik',
          senderName: 'Erik Johansson',
          senderType: 'user',
          message: 'Intressant! Kan vi boka ett möte för att diskutera mer?',
          timestamp: '2024-06-26 11:30',
          read: false
        }
      ];
    } else if (currentUserName.includes('Erik')) {
      baseMessages['conv_user_anna'] = [
        {
          id: 'msg_anna_to_erik_1',
          senderId: 'user_anna',
          senderName: 'Anna Karlsson',
          senderType: 'user',
          message: 'Hej Erik! Tack för intresset för mitt företag.',
          timestamp: '2024-06-26 12:30',
          read: true
        },
        {
          id: 'msg_erik_reply_1',
          senderId: currentUserId,
          senderName: currentUserName,
          senderType: currentUserType,
          message: 'Hej Anna! Jag är mycket intresserad. Kan du skicka mer information?',
          timestamp: '2024-06-26 12:45',
          read: true
        }
      ];
    } else {
      baseMessages['conv_demo_seller'] = [
        {
          id: 'msg_seller_1',
          senderId: 'demo_seller',
          senderName: 'Företagssäljare',
          senderType: 'user',
          message: 'Hej! Intresserad av mitt företag? Det har bra potential.',
          timestamp: '2024-06-26 10:15',
          read: false
        }
      ];
      baseMessages['conv_demo_buyer'] = [
        {
          id: 'msg_buyer_1',
          senderId: 'demo_buyer',
          senderName: 'Potentiell Köpare',
          senderType: 'user',
          message: 'Hej! Kan vi diskutera priset för ditt företag?',
          timestamp: '2024-06-25 18:20',
          read: true
        }
      ];
    }

    return baseMessages;
  };

  const [messages, setMessages] = useState<{ [conversationId: string]: ChatMessage[] }>(() => initializeMessages());

  const totalUnreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversation]);

  const handleSendMessage = () => {
    if (!message.trim() || !activeConversation) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderType: currentUserType,
      message: message.trim(),
      timestamp: new Date().toLocaleString('sv-SE'),
      read: true
    };

    setMessages(prev => ({
      ...prev,
      [activeConversation]: [...(prev[activeConversation] || []), newMessage]
    }));

    // Update conversation last message
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation 
        ? { ...conv, lastMessage: message.trim(), lastMessageTime: newMessage.timestamp }
        : conv
    ));

    setMessage('');
    toast.success('Meddelande skickat!');
  };

  const handleMarkAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ));

    setMessages(prev => ({
      ...prev,
      [conversationId]: prev[conversationId]?.map(msg => ({ ...msg, read: true })) || []
    }));
  };

  const getStatusColor = (online: boolean) => {
    return online ? 'bg-green-400' : 'bg-gray-400';
  };

  const getSenderTypeColor = (senderType: string) => {
    switch (senderType) {
      case 'support': return 'bg-blue-100 text-blue-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <MessageSquare className="w-6 h-6" />
        {totalUnreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border z-50 transition-all duration-200 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          <h3 className="font-semibold">
            {activeConversation 
              ? conversations.find(c => c.id === activeConversation)?.title || 'Chat'
              : 'Meddelanden'
            }
          </h3>
          {totalUnreadCount > 0 && !isMinimized && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {totalUnreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-1 hover:bg-blue-700 rounded"
          >
            {isMinimized ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="p-1 hover:bg-blue-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {!activeConversation ? (
            /* Conversation List */
            <div className="flex-1 overflow-hidden">
              <div className="p-4 border-b">
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Ny konversation
                </button>
              </div>
              
              <div className="overflow-y-auto h-[500px]">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setActiveConversation(conversation.id);
                      handleMarkAsRead(conversation.id);
                    }}
                    className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="relative">
                          <User className="w-8 h-8 text-gray-400" />
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conversation.online)}`}></div>
                        </div>
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-900">{conversation.title}</h4>
                          <div className="flex items-center">
                            {conversation.type === 'user_to_support' && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mr-2">
                                Support
                              </span>
                            )}
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {conversation.lastMessageTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="flex flex-col h-[536px]">
              {/* Back Button */}
              <div className="p-3 border-b">
                <button
                  onClick={() => setActiveConversation(null)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ← Tillbaka till konversationer
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(messages[activeConversation] || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.senderId === currentUserId
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {msg.senderId !== currentUserId && (
                        <div className="flex items-center mb-1">
                          <span className="text-xs font-medium">{msg.senderName}</span>
                          {msg.senderType !== 'user' && (
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getSenderTypeColor(msg.senderType)}`}>
                              {msg.senderType === 'support' ? 'Support' : 'Admin'}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Skriv ditt meddelande..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ny konversation</h3>
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatRecipient('');
                  setNewChatMessage('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mottagare
                </label>
                <select
                  value={newChatRecipient}
                  onChange={(e) => setNewChatRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Välj mottagare...</option>
                  <option value="support">Support</option>
                  <option value="marketing">Marknadsföring</option>
                  <option value="company">Kundjänst</option>
                  {currentUserType === 'admin' && (
                    <>
                      <option value="user_anna">Anna Karlsson</option>
                      <option value="user_erik">Erik Johansson</option>
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meddelande
                </label>
                <textarea
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  rows={3}
                  placeholder="Skriv ditt meddelande här..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatRecipient('');
                  setNewChatMessage('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={() => {
                  if (newChatRecipient && newChatMessage.trim()) {
                    // Create new conversation
                    const recipientNames = {
                      support: 'Support',
                      marketing: 'Marknadsföring',
                      company: 'Kundjänst',
                      user_anna: 'Anna Karlsson',
                      user_erik: 'Erik Johansson'
                    };
                    
                    const newConvId = `conv_new_${Date.now()}`;
                    const recipientName = recipientNames[newChatRecipient as keyof typeof recipientNames] || 'Okänd användare';
                    
                    const newConversation: ChatConversation = {
                      id: newConvId,
                      participants: [currentUserId, newChatRecipient],
                      participantNames: [currentUserName, recipientName],
                      type: ['support', 'marketing', 'company'].includes(newChatRecipient) ? 'user_to_support' : 'user_to_user',
                      title: `Chat med ${recipientName}`,
                      lastMessage: newChatMessage.trim(),
                      lastMessageTime: new Date().toLocaleString('sv-SE'),
                      unreadCount: 0,
                      online: true
                    };
                    
                    const newMessage: ChatMessage = {
                      id: `msg_${Date.now()}`,
                      senderId: currentUserId,
                      senderName: currentUserName,
                      senderType: currentUserType,
                      message: newChatMessage.trim(),
                      timestamp: new Date().toLocaleString('sv-SE'),
                      read: true
                    };
                    
                    setConversations(prev => [newConversation, ...prev]);
                    setMessages(prev => ({
                      ...prev,
                      [newConvId]: [newMessage]
                    }));
                    
                    setActiveConversation(newConvId);
                    setShowNewChatModal(false);
                    setNewChatRecipient('');
                    setNewChatMessage('');
                    
                    toast.success('Ny konversation skapad!');
                  } else {
                    toast.error('Välj mottagare och skriv ett meddelande');
                  }
                }}
                disabled={!newChatRecipient || !newChatMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Skapa konversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSystem;