import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, User, Plus, Bell, Search, Trash2, Reply } from 'lucide-react';
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
  const [activeView, setActiveView] = useState<'list' | 'compose' | 'conversation'>('list');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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

    // Clear form and go back to list view
    setNewMessage('');
    setRecipient('');
    setSubject('');
    setActiveView('list');
    
    toast.success('Meddelande skickat!');
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
    toast.success('Meddelande borttaget');
  };

  const startNewConversation = () => {
    setRecipient('');
    setSubject('');
    setNewMessage('');
    setActiveView('compose');
  };

  const getConversations = () => {
    const conversations: Record<string, Message[]> = {};
    messages.forEach(message => {
      const key = message.type === 'sent' ? message.to : message.from;
      if (!conversations[key]) {
        conversations[key] = [];
      }
      conversations[key].push(message);
    });
    return conversations;
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

  if (!authUser) return null;

  return (
    <>
      {/* Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 ${
          unreadCount > 0 ? 'animate-pulse' : ''
        }`}
      >
        {unreadCount > 0 ? (
          <Bell className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              <h3 className="font-medium">
                {activeView === 'compose' ? 'Nytt meddelande' : 'Meddelanden'}
              </h3>
              {unreadCount > 0 && activeView === 'list' && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {activeView === 'list' && (
                <button
                  onClick={startNewConversation}
                  className="text-white hover:text-gray-200"
                  title="Nytt meddelande"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
              {activeView === 'compose' && (
                <button
                  onClick={() => setActiveView('list')}
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

          {/* Search bar (only in list view) */}
          {activeView === 'list' && (
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sök meddelanden..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeView === 'list' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredMessages.length > 0 ? (
                  filteredMessages.slice(-20).reverse().map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg transition-colors group hover:bg-gray-100 ${
                        !message.read && message.type === 'received'
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 cursor-pointer" onClick={() => message.type === 'received' && !message.read && markAsRead(message.id)}>
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
                          <span className="text-xs text-gray-400 mt-1">{formatDate(message.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium">Inga meddelanden än</p>
                    <p className="text-xs text-gray-400 mt-1">Starta en ny konversation!</p>
                    <button
                      onClick={startNewConversation}
                      className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Nytt meddelande
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeView === 'compose' && (
              <div className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Till:</label>
                    <input
                      type="text"
                      placeholder="Mottagarens användar-ID eller e-post"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ämne:</label>
                    <input
                      type="text"
                      placeholder="Ämne för meddelandet"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Meddelande:</label>
                    <textarea
                      placeholder="Skriv ditt meddelande här..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setActiveView('list')}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Avbryt
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!recipient || !subject || !newMessage}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Skicka
                    </button>
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