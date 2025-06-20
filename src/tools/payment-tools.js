export const paymentTools = [
  {
    name: 'ghl_create_order',
    description: 'Create a new payment order',
    inputSchema: {
      type: 'object',
      properties: {
        orderData: {
          type: 'object',
          description: 'Order details',
          properties: {
            locationId: { type: 'string', description: 'Location/Sub-account ID' },
            contactId: { type: 'string', description: 'Contact ID for the order' },
            amount: { type: 'number', description: 'Order amount in dollars (will be converted to cents)' },
            currency: { type: 'string', description: 'Currency code (e.g., USD)', default: 'USD' },
            source: { type: 'string', description: 'Order source', default: 'manual' },
            items: {
              type: 'array',
              description: 'Order line items',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Product/service name' },
                  price: { type: 'number', description: 'Item price in dollars' },
                  quantity: { type: 'number', description: 'Quantity', default: 1 },
                  description: { type: 'string', description: 'Item description' }
                },
                required: ['name', 'price']
              }
            },
            couponCode: { type: 'string', description: 'Applied coupon code' },
            notes: { type: 'string', description: 'Order notes' }
          },
          required: ['locationId', 'contactId', 'amount']
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['orderData']
    }
  },
  {
    name: 'ghl_get_transactions',
    description: 'Get payment transaction history',
    inputSchema: {
      type: 'object',
      properties: {
        locationId: { 
          type: 'string', 
          description: 'Location/Sub-account ID' 
        },
        contactId: { 
          type: 'string', 
          description: 'Filter by contact ID (optional)' 
        },
        startAfter: { 
          type: 'string', 
          description: 'Start date filter (ISO format or YYYY-MM-DD)' 
        },
        endBefore: { 
          type: 'string', 
          description: 'End date filter (ISO format or YYYY-MM-DD)' 
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
    name: 'ghl_get_orders',
    description: 'Get payment orders',
    inputSchema: {
      type: 'object',
      properties: {
        locationId: { 
          type: 'string', 
          description: 'Location/Sub-account ID' 
        },
        contactId: { 
          type: 'string', 
          description: 'Filter by contact ID (optional)' 
        },
        startAfter: { 
          type: 'string', 
          description: 'Start date filter (ISO format or YYYY-MM-DD)' 
        },
        endBefore: { 
          type: 'string', 
          description: 'End date filter (ISO format or YYYY-MM-DD)' 
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['locationId']
    }
  }
];