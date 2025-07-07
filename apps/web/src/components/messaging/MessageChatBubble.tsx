import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';
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
}

export const MessageChatBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const { user: authUser } = useAuthStore();

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
      type: 'sent'
    };

    // Save message for sender
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(`userMessages_${authUser.id}`, JSON.stringify(updatedMessages));

    // Save message for recipient
    const recipientMessages = JSON.parse(localStorage.getItem(`userMessages_${recipient}`) || '[]');
    recipientMessages.push({ ...message, type: 'received' });
    localStorage.setItem(`userMessages_${recipient}`, JSON.stringify(recipientMessages));

    // Clear form
    setNewMessage('');
    setRecipient('');
    setSubject('');
    
    toast.success('Meddelande skickat!');
  };

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

  if (!authUser) return null;

  return (
    <>
      {/* Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110"
      >
        <MessageSquare className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              <h3 className="font-medium">Meddelanden</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length > 0 ? (
              messages.slice(-20).map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    !message.read && message.type === 'received'
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                  onClick={() => message.type === 'received' && !message.read && markAsRead(message.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className={`text-sm font-medium ${
                          !message.read && message.type === 'received' ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          {message.type === 'received' ? message.fromName : `Till: ${message.to}`}
                        </span>
                        {!message.read && message.type === 'received' && (
                          <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 font-medium mt-1">{message.subject}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-400 ml-2">{formatDate(message.timestamp)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">Inga meddelanden än</p>
              </div>
            )}
          </div>

          {/* Send Message Form */}
          <div className="border-t border-gray-200 p-4 space-y-3">
            <input
              type="text"
              placeholder="Mottagare (användar-ID)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Ämne"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Skriv ett meddelande..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};