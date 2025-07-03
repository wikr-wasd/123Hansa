import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Conversation, Message, User, messageService } from '../../services/messageService';
import { getSocketService } from '../../services/socketService';
import ConversationsList from './ConversationsList';
import MessagesList from './MessagesList';
import MessageInput from './MessageInput';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ChatInterfaceProps {
  currentUserId: string;
  initialConversationId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentUserId,
  initialConversationId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const socketService = getSocketService();

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const result = await messageService.getUserConversations();
      setConversations(result.conversations || []);
      
      // Build users map
      const usersMap = new Map<string, User>();
      result.conversations?.forEach(conv => {
        usersMap.set(conv.initiator.id, conv.initiator);
        usersMap.set(conv.receiver.id, conv.receiver);
      });
      setUsers(usersMap);

      // Auto-select conversation if specified
      if (initialConversationId) {
        const targetConv = result.conversations?.find(c => c.id === initialConversationId);
        if (targetConv) {
          handleSelectConversation(targetConv);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Kunde inte ladda konversationer');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [initialConversationId]);

  // Load messages for selected conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setIsLoadingMessages(true);
      const result = await messageService.getConversationMessages(conversationId);
      setMessages(result.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Kunde inte ladda meddelanden');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Handle conversation selection
  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    socketService.joinConversation(conversation.id);
    await loadMessages(conversation.id);
    
    // Mark conversation as read
    try {
      await messageService.markConversationAsRead(conversation.id);
      // Update local state
      setConversations(prev => prev.map(c => 
        c.id === conversation.id ? { ...c, unreadCount: 0 } : c
      ));
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
    }
  }, [socketService, loadMessages]);

  // Handle sending messages
  const handleSendMessage = useCallback(async (content: string, type = 'TEXT', metadata?: any) => {
    if (!selectedConversation) return;

    try {
      // Send via socket for real-time delivery
      socketService.sendMessage({
        conversationId: selectedConversation.id,
        content,
        type,
        metadata,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Kunde inte skicka meddelandet');
    }
  }, [selectedConversation, socketService]);

  // Handle message read
  const handleMessageRead = useCallback((messageId: string) => {
    socketService.markMessageAsRead(messageId);
  }, [socketService]);

  // Handle message delete
  const handleMessageDelete = useCallback(async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success('Meddelandet har tagits bort');
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Kunde inte ta bort meddelandet');
    }
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: File[]) => {
    if (!selectedConversation) return;

    // For now, send a text message about the file
    // In a full implementation, you'd upload the file first
    const fileNames = files.map(f => f.name).join(', ');
    await handleSendMessage(`📎 Bifogade filer: ${fileNames}`, 'FILE');
    
    toast.success(`${files.length} fil(er) bifogade`);
  }, [selectedConversation, handleSendMessage]);

  // Socket event handlers
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Update conversation's last message time and unread count
      setConversations(prev => prev.map(conv => {
        if (conv.id === message.conversationId) {
          const isFromCurrentUser = message.senderId === currentUserId;
          return {
            ...conv,
            lastMessageAt: message.createdAt,
            unreadCount: isFromCurrentUser ? conv.unreadCount : conv.unreadCount + 1,
          };
        }
        return conv;
      }));
      
      // Show toast notification if message is not from current user and not in current conversation
      if (message.senderId !== currentUserId && 
          (!selectedConversation || selectedConversation.id !== message.conversationId)) {
        toast(`💬 ${message.sender.firstName}: ${message.content.substring(0, 50)}`, {
          duration: 4000,
        });
      }
    };

    const handleMessageRead = (data: { messageId: string; conversationId: string; readBy: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, status: 'READ', readAt: new Date().toISOString() } : msg
      ));
    };

    const handleMessageDeleted = (data: { messageId: string; conversationId: string }) => {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
    };

    const handleUserTyping = (data: { userId: string; conversationId: string; isTyping: boolean }) => {
      if (data.userId === currentUserId) return;
      
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    };

    const handleUserStatusChange = (data: { userId: string; isOnline: boolean; timestamp: Date }) => {
      setUsers(prev => {
        const user = prev.get(data.userId);
        if (user) {
          const updated = new Map(prev);
          updated.set(data.userId, { ...user, isOnline: data.isOnline });
          return updated;
        }
        return prev;
      });
    };

    // Register socket event listeners
    socketService.on('new_message', handleNewMessage);
    socketService.on('message_read', handleMessageRead);
    socketService.on('message_deleted', handleMessageDeleted);
    socketService.on('user_typing', handleUserTyping);
    socketService.on('user_status_change', handleUserStatusChange);

    return () => {
      // Cleanup listeners
      socketService.off('new_message', handleNewMessage);
      socketService.off('message_read', handleMessageRead);
      socketService.off('message_deleted', handleMessageDeleted);
      socketService.off('user_typing', handleUserTyping);
      socketService.off('user_status_change', handleUserStatusChange);
    };
  }, [currentUserId, selectedConversation, socketService]);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (selectedConversation) {
        socketService.leaveConversation(selectedConversation.id);
      }
    };
  }, [selectedConversation, socketService]);

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.otherUser.firstName.toLowerCase().includes(query) ||
      conv.otherUser.lastName.toLowerCase().includes(query) ||
      conv.listing?.title.toLowerCase().includes(query) ||
      conv.subject?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex h-screen bg-nordic-gray-50">
      {/* Conversations sidebar */}
      <div className="w-80 bg-white border-r border-nordic-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-nordic-gray-200">
          <h2 className="text-lg font-semibold text-nordic-gray-900 mb-3">Meddelanden</h2>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Sök konversationer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-nordic-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-nordic-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Conversations list */}
        <ConversationsList
          conversations={filteredConversations}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={handleSelectConversation}
          currentUserId={currentUserId}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div className="p-4 bg-white border-b border-nordic-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-nordic-blue-500 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {selectedConversation.otherUser.firstName[0]}{selectedConversation.otherUser.lastName[0]}
                      </span>
                    </div>
                    {selectedConversation.otherUser.isOnline && (
                      <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-nordic-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-nordic-gray-900">
                      {selectedConversation.otherUser.firstName} {selectedConversation.otherUser.lastName}
                    </h3>
                    {selectedConversation.listing && (
                      <p className="text-sm text-nordic-gray-500">
                        🏢 {selectedConversation.listing.title}
                      </p>
                    )}
                  </div>
                </div>

                {/* Chat actions */}
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-nordic-gray-500 hover:text-nordic-blue-600 hover:bg-nordic-blue-50 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <button className="p-2 text-nordic-gray-500 hover:text-nordic-blue-600 hover:bg-nordic-blue-50 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            {isLoadingMessages ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <MessagesList
                conversationId={selectedConversation.id}
                messages={messages}
                currentUserId={currentUserId}
                onMessageRead={handleMessageRead}
                onMessageDelete={handleMessageDelete}
                typingUsers={typingUsers}
                users={users}
              />
            )}

            {/* Message input */}
            <MessageInput
              conversationId={selectedConversation.id}
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              isBlocked={selectedConversation.status === 'BLOCKED'}
            />
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-medium text-nordic-gray-900 mb-2">
                Välkommen till meddelanden
              </h3>
              <p className="text-nordic-gray-500 max-w-md">
                Välj en konversation från listan för att börja chatta, eller starta en ny konversation från en företagsannons.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;