import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { initializeSocket, disconnectSocket } from '../../services/socketService';
import ChatInterface from '../../components/messaging/ChatInterface';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

const MessagesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  const initialConversationId = searchParams.get('conversation') || undefined;

  useEffect(() => {
    let mounted = true;

    const connectToSocket = async () => {
      if (!user) {
        setIsConnecting(false);
        return;
      }

      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No access token found');
        }

        await initializeSocket(token);
        
        if (mounted) {
          setIsSocketConnected(true);
          setIsConnecting(false);
        }
      } catch (error) {
        console.error('Failed to connect to chat server:', error);
        if (mounted) {
          setIsConnecting(false);
          toast.error('Kunde inte ansluta till chattservern. Vissa funktioner kan vara begränsade.');
        }
      }
    };

    connectToSocket();

    return () => {
      mounted = false;
      disconnectSocket();
    };
  }, [user]);

  // Redirect to login if not authenticated
  if (!user) {
    window.location.href = '/login?redirect=/messages';
    return null;
  }

  if (isConnecting) {
    return (
      <>
        <Helmet>
          <title>Meddelanden - Tubba</title>
          <meta name="description" content="Hantera dina meddelanden och konversationer på Tubba" />
        </Helmet>
        
        <div className="min-h-screen bg-nordic-gray-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-nordic-gray-600">Ansluter till chattservern...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Meddelanden - Tubba</title>
        <meta name="description" content="Hantera dina meddelanden och konversationer på Tubba" />
      </Helmet>

      <div className="h-screen overflow-hidden">
        <ChatInterface
          currentUserId={user.id}
          initialConversationId={initialConversationId}
        />
        
        {/* Connection status indicator */}
        {!isSocketConnected && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-nordic-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
            ⚠️ Begränsad anslutning - Real-time funktioner kan inte fungera
          </div>
        )}
      </div>
    </>
  );
};

export default MessagesPage;