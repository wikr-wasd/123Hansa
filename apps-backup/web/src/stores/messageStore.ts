import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'support' | 'admin';
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  conversationId: string;
  attachments?: string[];
}

export interface Conversation {
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

interface MessageStore {
  messages: Message[];
  conversations: Conversation[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  markAsRead: (messageId: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  getUnreadCount: (userId: string) => number;
  getConversationMessages: (conversationId: string) => Message[];
  getUserConversations: (userId: string) => Conversation[];
  updateConversation: (conversation: Conversation) => void;
  initializeDefaultData: (userId: string, userName: string, userType: 'user' | 'support' | 'admin') => void;
}

export const useMessageStore = create<MessageStore>()(
  persist(
    (set, get) => ({
      messages: [],
      conversations: [],

      addMessage: (messageData) => {
        const message: Message = {
          ...messageData,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        };

        set((state) => {
          const updatedMessages = [...state.messages, message];
          
          // Update conversation
          const conversationIndex = state.conversations.findIndex(
            (conv) => conv.id === message.conversationId
          );
          
          if (conversationIndex !== -1) {
            const updatedConversations = [...state.conversations];
            updatedConversations[conversationIndex] = {
              ...updatedConversations[conversationIndex],
              lastMessage: message.content,
              lastMessageTime: message.timestamp,
              unreadCount: message.senderId !== message.recipientId 
                ? updatedConversations[conversationIndex].unreadCount + 1 
                : updatedConversations[conversationIndex].unreadCount,
            };
            
            return {
              messages: updatedMessages,
              conversations: updatedConversations,
            };
          }
          
          return { messages: updatedMessages };
        });
      },

      markAsRead: (messageId) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, read: true } : msg
          ),
        }));
      },

      markConversationAsRead: (conversationId) => {
        set((state) => {
          const updatedMessages = state.messages.map((msg) =>
            msg.conversationId === conversationId ? { ...msg, read: true } : msg
          );
          
          const updatedConversations = state.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          );
          
          return {
            messages: updatedMessages,
            conversations: updatedConversations,
          };
        });
      },

      getUnreadCount: (userId) => {
        const state = get();
        return state.messages.filter(
          (msg) => msg.recipientId === userId && !msg.read
        ).length;
      },

      getConversationMessages: (conversationId) => {
        const state = get();
        return state.messages
          .filter((msg) => msg.conversationId === conversationId)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      },

      getUserConversations: (userId) => {
        const state = get();
        return state.conversations
          .filter((conv) => conv.participants.includes(userId))
          .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
      },

      updateConversation: (conversation) => {
        set((state) => {
          const index = state.conversations.findIndex((conv) => conv.id === conversation.id);
          if (index !== -1) {
            const updatedConversations = [...state.conversations];
            updatedConversations[index] = conversation;
            return { conversations: updatedConversations };
          } else {
            return { conversations: [...state.conversations, conversation] };
          }
        });
      },

      initializeDefaultData: (userId, userName, userType) => {
        const state = get();
        
        // Only initialize if no conversations exist for this user
        if (state.conversations.filter(conv => conv.participants.includes(userId)).length === 0) {
          const defaultConversations: Conversation[] = [
            {
              id: `conv_support_${userId}`,
              participants: [userId, 'support'],
              participantNames: [userName, '123Hansa Support'],
              type: 'user_to_support',
              title: 'Support Chat',
              lastMessage: 'Hej! Hur kan vi hjälpa dig idag?',
              lastMessageTime: new Date().toISOString(),
              unreadCount: 1,
              online: true,
            },
          ];

          // Add demo conversations based on user type
          if (userType === 'admin') {
            defaultConversations.push(
              {
                id: `conv_admin_anna_${userId}`,
                participants: [userId, 'user_anna'],
                participantNames: [userName, 'Anna Karlsson'],
                type: 'user_to_user',
                title: 'Chat med Anna Karlsson',
                lastMessage: 'Tack för den snabba supporten!',
                lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                unreadCount: 1,
                online: true,
              },
              {
                id: `conv_admin_erik_${userId}`,
                participants: [userId, 'user_erik'],
                participantNames: [userName, 'Erik Johansson'],
                type: 'user_to_user',
                title: 'Chat med Erik Johansson',
                lastMessage: 'Har du tid för ett möte imorgon?',
                lastMessageTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                unreadCount: 0,
                online: false,
              }
            );
          } else {
            // Add demo user conversations
            defaultConversations.push({
              id: `conv_demo_${userId}`,
              participants: [userId, 'demo_seller'],
              participantNames: [userName, 'Företagssäljare'],
              type: 'user_to_user',
              title: 'Chat med Företagssäljare',
              lastMessage: 'Hej! Intresserad av mitt företag?',
              lastMessageTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              unreadCount: 1,
              online: true,
            });
          }

          // Add default messages
          const defaultMessages: Message[] = [
            {
              id: `msg_support_1_${userId}`,
              senderId: 'support',
              senderName: '123Hansa Support',
              senderType: 'support',
              recipientId: userId,
              recipientName: userName,
              subject: 'Välkommen till 123Hansa!',
              content: 'Hej! Välkommen till 123Hansa. Hur kan vi hjälpa dig idag?',
              timestamp: new Date().toISOString(),
              read: false,
              conversationId: `conv_support_${userId}`,
            },
          ];

          set((state) => ({
            conversations: [...state.conversations, ...defaultConversations],
            messages: [...state.messages, ...defaultMessages],
          }));
        }
      },
    }),
    {
      name: 'message-store',
      version: 1,
    }
  )
);