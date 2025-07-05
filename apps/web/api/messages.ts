import { VercelRequest, VercelResponse } from '@vercel/node';

interface MessageData {
  listingId: string;
  sellerId: string;
  inquiryType: string;
  message: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

// Mock messages storage (in production, this would be a database)
const messages: any[] = [];

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const messageData: MessageData = req.body;

      // Validate required fields
      if (!messageData.message?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Meddelande är obligatoriskt'
        });
      }

      if (!messageData.name?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Namn är obligatoriskt'
        });
      }

      if (!messageData.email?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'E-post är obligatorisk'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(messageData.email)) {
        return res.status(400).json({
          success: false,
          error: 'Ogiltig e-postadress'
        });
      }

      // Create message object
      const newMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...messageData,
        timestamp: new Date().toISOString(),
        status: 'unread',
        conversationId: `conv_${messageData.listingId}_${messageData.sellerId}`,
      };

      // Store message (in production, save to database)
      messages.push(newMessage);

      // In production, you would:
      // 1. Save to database
      // 2. Send email notification to seller
      // 3. Send confirmation email to buyer
      // 4. Create conversation thread
      
      console.log('New message received:', {
        id: newMessage.id,
        listingId: messageData.listingId,
        from: messageData.email,
        type: messageData.inquiryType
      });

      // Simulate email sending (replace with real email service)
      console.log(`Email notification sent to seller for listing ${messageData.listingId}`);
      console.log(`Confirmation email sent to ${messageData.email}`);

      res.status(200).json({
        success: true,
        data: {
          messageId: newMessage.id,
          conversationId: newMessage.conversationId,
          status: 'sent',
          estimatedResponse: '24-48 timmar'
        },
        message: 'Meddelandet har skickats framgångsrikt'
      });

    } catch (error) {
      console.error('Error processing message:', error);
      res.status(500).json({
        success: false,
        error: 'Internt serverfel',
        message: 'Kunde inte skicka meddelandet. Försök igen senare.'
      });
    }
  } else if (req.method === 'GET') {
    // Get messages for a specific conversation or user
    const { conversationId, sellerId, buyerId } = req.query;

    try {
      let filteredMessages = messages;

      if (conversationId) {
        filteredMessages = messages.filter(msg => msg.conversationId === conversationId);
      } else if (sellerId) {
        filteredMessages = messages.filter(msg => msg.sellerId === sellerId);
      } else if (buyerId) {
        filteredMessages = messages.filter(msg => msg.email === buyerId);
      }

      res.status(200).json({
        success: true,
        data: {
          messages: filteredMessages.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ),
          totalCount: filteredMessages.length
        }
      });

    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({
        success: false,
        error: 'Kunde inte hämta meddelanden'
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: `Method ${req.method} not allowed`
    });
  }
}