import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, X, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'claude';
  timestamp: Date;
}

interface ClaudeChatProps {
  onClose?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const ClaudeChat: React.FC<ClaudeChatProps> = ({ 
  onClose, 
  isMinimized = false, 
  onToggleMinimize 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hej! Jag är Claude, din AI-assistent för 123hansa. Jag kan hjälpa dig med frågor om plattformen, företagsvärdering, försäljningsprocesser och mycket mer. Vad kan jag hjälpa dig med idag?',
      sender: 'claude',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Simulate Claude response (in production, this would call your Claude API)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const responses = [
        'Det är en utmärkt fråga! På 123hansa hjälper vi dig genom hela processen av att köpa eller sälja företag. Vår plattform erbjuder säker kommunikation, professionell värdering och juridisk support.',
        'Företagsvärdering är en komplex process som beror på många faktorer som omsättning, tillväxt, marknadsmöjligheter och branschspecifika faktorer. Vi erbjuder både automatiska värderingsverktyg och tillgång till professionella värderare.',
        'Säkerhet är vår högsta prioritet. Vi använder krypterad kommunikation, verifierade användare och säkra betalningslösningar för att skydda både köpare och säljare.',
        'Vår crowdfunding-sektion låter dig investera i spännande nordiska företag och startups. Alla projekt granskas noggrant innan de läggs upp på plattformen.',
        'För att komma igång kan du registrera dig, verifiera din e-post och sedan börja bläddra bland tillgängliga företag eller skapa din egen annons om du vill sälja.'
      ];

      const claudeResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'claude',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, claudeResponse]);
    } catch (error) {
      toast.error('Kunde inte skicka meddelandet. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggleMinimize}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <h3 className="font-semibold">Claude AI Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.sender === 'claude' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                {message.sender === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <div>
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('sv-SE', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Skriv ditt meddelande här..."
            className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Tryck Enter för att skicka, Shift+Enter för ny rad
        </p>
      </div>
    </div>
  );
};