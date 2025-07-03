import React from 'react';
import { Conversation } from '../../services/messageService';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  currentUserId: string;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserId,
  isLoading = false,
  onLoadMore,
  hasMore = false,
}) => {
  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: sv,
    });
  };

  const truncateMessage = (content: string, maxLength = 60) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    const lastMessage = conversation.messages?.[0];
    if (!lastMessage) return 'Ingen meddelandehistorik';

    const senderName = lastMessage.senderId === currentUserId 
      ? 'Du' 
      : lastMessage.sender.firstName;

    switch (lastMessage.type) {
      case 'FILE':
      case 'IMAGE':
        return `${senderName}: 📎 ${lastMessage.attachments?.[0]?.originalName || 'Bilaga'}`;
      case 'SYSTEM':
        return lastMessage.content;
      default:
        return `${senderName}: ${truncateMessage(lastMessage.content)}`;
    }
  };

  if (conversations.length === 0 && !isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-nordic-gray-900 mb-2">
          Inga konversationer
        </h3>
        <p className="text-nordic-gray-500">
          Dina meddelanden kommer att visas här
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => {
          const otherUser = conversation.otherUser;
          const isSelected = selectedConversationId === conversation.id;
          const hasUnread = conversation.unreadCount > 0;

          return (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`p-4 border-b border-nordic-gray-100 cursor-pointer transition-colors hover:bg-nordic-gray-50 ${
                isSelected ? 'bg-nordic-blue-50 border-nordic-blue-200' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-nordic-blue-500 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {otherUser.firstName[0]}{otherUser.lastName[0]}
                    </span>
                  </div>
                  {/* Online indicator */}
                  {otherUser.isOnline && (
                    <div className="absolute -bottom-0 -right-0 w-4 h-4 bg-nordic-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                {/* Conversation info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-medium truncate ${
                      hasUnread ? 'text-nordic-gray-900' : 'text-nordic-gray-700'
                    }`}>
                      {otherUser.firstName} {otherUser.lastName}
                    </h3>
                    {conversation.lastMessageAt && (
                      <span className={`text-xs flex-shrink-0 ml-2 ${
                        hasUnread ? 'text-nordic-blue-600 font-medium' : 'text-nordic-gray-500'
                      }`}>
                        {formatLastMessageTime(conversation.lastMessageAt)}
                      </span>
                    )}
                  </div>

                  {/* Listing info */}
                  {conversation.listing && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-nordic-blue-600 bg-nordic-blue-50 px-2 py-1 rounded-full">
                        🏢 {conversation.listing.title}
                      </span>
                    </div>
                  )}

                  {/* Last message preview */}
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${
                      hasUnread ? 'text-nordic-gray-900 font-medium' : 'text-nordic-gray-500'
                    }`}>
                      {getLastMessagePreview(conversation)}
                    </p>
                    {hasUnread && (
                      <span className="flex-shrink-0 ml-2 bg-nordic-blue-600 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Conversation status */}
                  {conversation.status === 'BLOCKED' && (
                    <div className="mt-1">
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        🚫 Blockerad
                      </span>
                    </div>
                  )}
                  {conversation.status === 'ARCHIVED' && (
                    <div className="mt-1">
                      <span className="text-xs text-nordic-gray-600 bg-nordic-gray-100 px-2 py-1 rounded-full">
                        📁 Arkiverad
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Load more button */}
        {hasMore && (
          <div className="p-4 text-center">
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="text-nordic-blue-600 hover:text-nordic-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? 'Laddar...' : 'Ladda fler konversationer'}
            </button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && conversations.length === 0 && (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nordic-blue-600 mx-auto mb-4"></div>
          <p className="text-nordic-gray-500">Laddar konversationer...</p>
        </div>
      )}
    </div>
  );
};

export default ConversationsList;