export const conversationTools = [
  {
    name: 'ghl_send_message',
    description: 'Send SMS, Email, or WhatsApp message to a contact',
    inputSchema: {
      type: 'object',
      properties: {
        type: { 
          type: 'string', 
          enum: ['SMS', 'Email', 'WhatsApp'], 
          description: 'Message type' 
        },
        contactId: { 
          type: 'string', 
          description: 'Contact ID to send message to' 
        },
        locationId: { 
          type: 'string', 
          description: 'Location/Sub-account ID' 
        },
        message: { 
          type: 'string', 
          description: 'Message content (for SMS/WhatsApp) or email body text' 
        },
        subject: { 
          type: 'string', 
          description: 'Email subject (required for Email type)' 
        },
        htmlBody: { 
          type: 'string', 
          description: 'HTML email body (optional for Email type)' 
        },
        attachments: { 
          type: 'array', 
          description: 'Email attachments (optional for Email type)',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Attachment filename' },
              url: { type: 'string', description: 'Attachment URL' }
            }
          }
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['type', 'contactId', 'locationId', 'message']
    }
  },
  {
    name: 'ghl_get_conversations',
    description: 'Get conversations for a location or contact',
    inputSchema: {
      type: 'object',
      properties: {
        locationId: { 
          type: 'string', 
          description: 'Location/Sub-account ID' 
        },
        contactId: { 
          type: 'string', 
          description: 'Filter by specific contact ID (optional)' 
        },
        limit: { 
          type: 'number', 
          description: 'Number of results (default: 20)' 
        },
        lastMessageId: { 
          type: 'string', 
          description: 'Pagination cursor - last message ID from previous page' 
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['locationId']
    }
  },
  {
    name: 'ghl_get_messages',
    description: 'Get messages in a specific conversation',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: { 
          type: 'string', 
          description: 'Conversation ID' 
        },
        limit: { 
          type: 'number', 
          description: 'Number of messages to retrieve (default: 20)' 
        },
        lastMessageId: { 
          type: 'string', 
          description: 'Pagination cursor - last message ID from previous page' 
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['conversationId']
    }
  }
];