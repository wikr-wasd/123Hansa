import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  X, 
  Check, 
  CheckCheck, 
  Phone, 
  Video, 
  MoreHorizontal,
  Star,
  Archive,
  Flag,
  User,
  Clock,
  AlertCircle,
  MessageCircle,
  Image,
  File,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ChatMessage {
  id: string;
  sender: 'admin' | 'customer';
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
  attachments?: {
    name: string;
    type: string;
    url: string;
    size: number;
  }[];
}

interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
  ticketId?: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  rating?: number;
  totalMessages?: number;
}

interface EnhancedSupportChatProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  ticketId?: string;
}

const EnhancedSupportChat: React.FC<EnhancedSupportChatProps> = ({
  isOpen,
  onClose,
  customer,
  ticketId
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatStatus, setChatStatus] = useState<'active' | 'resolved' | 'closed'>('active');
  const [customerRating, setCustomerRating] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock customer data if not provided
  const currentCustomer = customer || {
    id: 'customer-001',
    name: 'Anna Svensson',
    email: 'anna@example.se',
    status: 'online' as const,
    priority: 'medium' as const,
    category: 'payment',
    rating: 4.5,
    totalMessages: 23
  };

  // Mock messages
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: '1',
          sender: 'customer',
          message: 'Hej! Jag har problem med betalningen för min annons. Får felmeddelande 400.',
          timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
          status: 'read',
          type: 'text'
        },
        {
          id: '2',
          sender: 'admin',
          message: 'Hej Anna! Jag hjälper dig gärna med betalningsproblemet. Kan du berätta vilken betalningsmetod du försöker använda?',
          timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
          status: 'read',
          type: 'text'
        },
        {
          id: '3',
          sender: 'customer',
          message: 'Jag försöker betala med mitt Visa-kort som slutar på 1234. Det har fungerat förut.',
          timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
          status: 'read',
          type: 'text'
        },
        {
          id: '4',
          sender: 'admin',
          message: 'Tack för informationen! Jag tittar på ditt konto nu. Det verkar vara ett temporärt problem med betalningsprocessorn. Kan du försöka igen om några minuter?',
          timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
          status: 'read',
          type: 'text'
        }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'admin',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: 'delivered' as const }
            : msg
        )
      );
    }, 1000);

    // Simulate customer reading
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: 'read' as const }
            : msg
        )
      );
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const handleResolveTicket = () => {
    setChatStatus('resolved');
    toast.success('Ticket markerat som löst!');
  };

  const handleRateCustomer = (rating: number) => {
    setCustomerRating(rating);
    toast.success(`Kund betygsatt: ${rating}/5 stjärnor`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                currentCustomer.status === 'online' ? 'bg-green-500' : 
                currentCustomer.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{currentCustomer.name}</h3>
              <p className="text-xs text-blue-100 truncate">{currentCustomer.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Customer Info Bar */}
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentCustomer.priority === 'high' ? 'bg-red-100 text-red-800' :
                    currentCustomer.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {currentCustomer.priority === 'high' ? 'Hög prioritet' :
                     currentCustomer.priority === 'medium' ? 'Medium prioritet' :
                     'Låg prioritet'}
                  </span>
                  <span className="text-gray-600">{currentCustomer.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500 hover:text-blue-600 cursor-pointer" />
                  <Video className="w-4 h-4 text-gray-500 hover:text-blue-600 cursor-pointer" />
                  <MoreHorizontal className="w-4 h-4 text-gray-500 hover:text-blue-600 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      message.sender === 'admin'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <div className={`flex items-center justify-between mt-1 ${
                      message.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">{formatTime(message.timestamp)}</span>
                      {message.sender === 'admin' && (
                        <div className="ml-2">
                          {getMessageStatusIcon(message.status)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleResolveTicket}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-xs"
                  >
                    <Check className="w-3 h-3" />
                    <span>Löst</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors text-xs">
                    <Archive className="w-3 h-3" />
                    <span>Arkiv</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-xs">
                    <Flag className="w-3 h-3" />
                    <span>Flagga</span>
                  </button>
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRateCustomer(star)}
                      className={`w-4 h-4 ${
                        star <= customerRating ? 'text-yellow-400' : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors`}
                    >
                      <Star className="w-full h-full fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAttachments(!showAttachments)}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Skriv ditt svar..."
                    className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={1}
                  />
                </div>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedSupportChat;