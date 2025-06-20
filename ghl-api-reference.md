# GoHighLevel MCP Server API Reference

## Overview

This reference document provides comprehensive information for building an MCP (Model Context Protocol) server that integrates with the GoHighLevel API v2. The MCP server will enable AI assistants to interact with GoHighLevel's full suite of CRM, marketing automation, and business management tools.

### Key Features
- Complete OAuth 2.0 authentication flow
- Full CRUD operations for all major GoHighLevel entities
- Webhook support for real-time events
- Rate limiting and error handling
- Support for both agency and location-level access

### Base Configuration
```javascript
const GHL_CONFIG = {
  BASE_URL: 'https://services.leadconnectorhq.com',
  OAUTH_BASE: 'https://marketplace.gohighlevel.com',
  OAUTH_BASE_WHITE_LABEL: 'https://marketplace.leadconnectorhq.com',
  API_VERSION: '2021-07-28',
  RATE_LIMITS: {
    BURST: 100, // per 10 seconds
    DAILY: 200000 // per day
  }
};
```

## Authentication

### OAuth 2.0 Implementation

#### 1. Authorization Flow
```javascript
// Generate authorization URL
function getAuthorizationUrl(clientId, redirectUri, scopes) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(' ')
  });
  
  return `${GHL_CONFIG.OAUTH_BASE}/oauth/chooselocation?${params}`;
}
```

#### 2. Token Exchange
```javascript
async function exchangeCodeForToken(code, clientId, clientSecret, redirectUri) {
  const response = await fetch(`${GHL_CONFIG.BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code: code
    })
  });
  
  return response.json();
}
```

#### 3. Location Token Exchange
```javascript
async function getLocationToken(accessToken, locationId) {
  const response = await fetch(`${GHL_CONFIG.BASE_URL}/oauth/locationToken`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Version': GHL_CONFIG.API_VERSION,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ locationId })
  });
  
  return response.json();
}
```

### Required OAuth Scopes
```javascript
const GHL_SCOPES = [
  // Core scopes
  'contacts.readonly', 'contacts.write',
  'conversations.readonly', 'conversations.write',
  'calendars.readonly', 'calendars.write',
  'calendars/events.readonly', 'calendars/events.write',
  
  // Business scopes
  'opportunities.readonly', 'opportunities.write',
  'payments/orders.readonly', 'payments/orders.write',
  'products.readonly', 'products.write',
  
  // Automation scopes
  'workflows.readonly', 'workflows.write',
  'campaigns.readonly', 'campaigns.write',
  'forms.readonly', 'forms.write',
  
  // Additional scopes
  'users.readonly', 'users.write',
  'locations.readonly', 'locations.write',
  'businesses.readonly', 'businesses.write',
  'companies.readonly', 'companies.write',
  'snapshots.readonly', 'snapshots.write',
  'medias.readonly', 'medias.write',
  'surveys.readonly', 'surveys.write',
  'social.readonly', 'social.write',
  'links.readonly', 'links.write',
  'courses.readonly', 'courses.write',
  'saas.readonly', 'saas.write',
  'oauth.readonly', 'oauth.write'
];
```

## MCP Server Structure

### Basic MCP Server Implementation
```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

class GHLMCPServer {
  constructor() {
    this.server = new Server({
      name: 'ghl-mcp-server',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {}
      }
    });
    
    this.setupTools();
  }
  
  setupTools() {
    // Tool registration will be added here
  }
  
  async makeGHLRequest(endpoint, method = 'GET', data = null, token) {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': GHL_CONFIG.API_VERSION,
        'Accept': 'application/json'
      }
    };
    
    if (data && method !== 'GET') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${GHL_CONFIG.BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`GHL API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
}
```

## Core API Endpoints

### Contacts Module

#### MCP Tool: Contact Management
```javascript
// Create Contact Tool
server.setRequestHandler('tools/execute', async (request) => {
  if (request.params.name === 'ghl_create_contact') {
    const { locationId, contactData, token } = request.params.arguments;
    
    const contact = await this.makeGHLRequest('/contacts/', 'POST', {
      locationId,
      ...contactData
    }, token);
    
    return { 
      content: [{ 
        type: 'text', 
        text: `Contact created: ${contact.id}` 
      }] 
    };
  }
});

// Search Contacts Tool
server.setRequestHandler('tools/execute', async (request) => {
  if (request.params.name === 'ghl_search_contacts') {
    const { locationId, query, limit = 20, offset = 0, token } = request.params.arguments;
    
    const params = new URLSearchParams({
      locationId,
      query,
      limit,
      offset
    });
    
    const contacts = await this.makeGHLRequest(`/contacts/?${params}`, 'GET', null, token);
    
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(contacts, null, 2) 
      }] 
    };
  }
});
```

#### Contact Schema
```typescript
interface Contact {
  id: string;
  locationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  dnd: boolean;
  dndSettings?: {
    [channel: string]: {
      status: 'active' | 'inactive';
      message: string;
    };
  };
  tags?: string[];
  customFields?: Array<{
    key: string;
    field_value: any;
  }>;
  source?: string;
  assignedTo?: string;
  dateOfBirth?: string;
  companyName?: string;
}
```

### Conversations Module

#### MCP Tool: Conversation Management
```javascript
// Send Message Tool
server.setRequestHandler('tools/execute', async (request) => {
  if (request.params.name === 'ghl_send_message') {
    const { type, contactId, locationId, message, token } = request.params.arguments;
    
    const messageData = {
      type, // SMS, Email, WhatsApp, etc.
      contactId,
      locationId,
      message
    };
    
    const result = await this.makeGHLRequest('/conversations/messages', 'POST', messageData, token);
    
    return { 
      content: [{ 
        type: 'text', 
        text: `Message sent: ${result.messageId}` 
      }] 
    };
  }
});

// Get Conversations Tool
server.setRequestHandler('tools/execute', async (request) => {
  if (request.params.name === 'ghl_get_conversations') {
    const { locationId, contactId, limit = 20, token } = request.params.arguments;
    
    const params = new URLSearchParams({
      locationId,
      ...(contactId && { contactId }),
      limit
    });
    
    const conversations = await this.makeGHLRequest(`/conversations/?${params}`, 'GET', null, token);
    
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(conversations, null, 2) 
      }] 
    };
  }
});
```

### Calendars Module

#### MCP Tool: Calendar Management
```javascript
// Create Calendar Tool
server.setRequestHandler('tools/execute', async (request) => {
  if (request.params.name === 'ghl_create_calendar') {
    const { calendarData, token } = request.params.arguments;
    
    const calendar = await this.makeGHLRequest('/calendars/', 'POST', calendarData, token);
    
    return { 
      content: [{ 
        type: 'text', 
        text: `Calendar created: ${calendar.id}` 
      }] 
    };
  }
});

// Create Appointment Tool
server.setRequestHandler('tools/execute', async (request) => {
  if (request.params.name === 'ghl_create_appointment') {
    const { appointmentData, token } = request.params.arguments;
    
    const appointment = await this.makeGHLRequest('/calendars/events/appointments', 'POST', appointmentData, token);
    
    return { 
      content: [{ 
        type: 'text', 
        text: `Appointment created: ${appointment.id}` 
      }] 
    };
  }
});

// Get Available Slots Tool
server.setRequestHandler('tools/execute', async (request) => {
  if (request.params.name === 'ghl_get_calendar_slots') {
    const { calendarId, startDate, endDate, timezone, token } = request.params.arguments;
    
    const params = new URLSearchParams({
      startDate,
      endDate,
      ...(timezone && { timezone })
    });
    
    const slots = await this.makeGHLRequest(`/calendars/${calendarId}/free-slots?${params}`, 'GET', null, token);
    
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(slots, null, 2) 
      }] 
    };
  }
});
```

## Business Operations

### Opportunities Module

#### MCP Tool: Opportunity Management
```javascript
// Create Opportunity Tool
server.setRequestHandler('tools/execute', async (request) => {
  if (request.params.name === 'ghl_create_opportunity') {
    const { opportunityData, token } = request.params.arguments;
    
    const opportunity = await this.makeGHLRequest('/opportunities/', 'POST', opportunityData, token);
    
    return { 
      content: [{ 
        type: 'text', 
        text: `Opportunity created: ${opportunity.id}` 
      }] 
    };
  }
});

// Search Opportunities Tool
server.setRequestHandler('tools/execute', async (request) => {
  if (request.params.name === 'ghl_search_opportunities') {
    const { locationId, pipelineId, query, assignedTo, token } = request.params.arguments;
    
    const params = new URLSearchParams({
      locationId,
      ...(pipelineId && { pipelineId }),
      ...(query && { query }),
      ...(assignedTo && { assignedTo })
    });
    
    const opportunities = await this.makeGHLRequest(`/opportunities/search?${params}`, 'GET', null, token);
    
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(opportunities, null, 2) 
      }] 
    };
  }
});
```

#### Opportunity Schema
```typescript
interface Opportunity {
  id: string;
  pipelineId: string;
  locationId: string;
  name: string;
  pipelineStageId: string;
  status: 'open' | 'won' | 'lost' | 'abandoned';
  contactId: string;
  monetaryValue?: number;
  assignedTo?: string;
  notes?: string;
  customFields?: Record<string, any>;
  lastStageChangeAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Payments Module

#### MCP Tool: Payment Operations
```javascript
// Create Order Tool
server.setRequestHandler('tools/execute', async (request) => {
  if (request.params.name === 'ghl_create_order') {
    const { orderData, token } = request.params.arguments;
    
    const order = await this.makeGHLRequest('/payments/orders', 'POST', orderData, token);
    
    return { 
      content: [{ 
        type: 'text', 
        text: `Order created: ${order.id}` 
      }] 
    };
  }
});

// Get Transactions Tool
server.setRequestHandler('tools/execute', async (request) => {
  if (request.params.name === 'ghl_get_transactions') {
    const { locationId, contactId, startAfter, endBefore, token } = request.params.arguments;
    
    const params = new URLSearchParams({
      locationId,
      ...(contactId && { contactId }),
      ...(startAfter && { startAfter }),
      ...(endBefore && { endBefore })
    });
    
    const transactions = await this.makeGHLRequest(`/payments/transactions?${params}`, 'GET', null, token);
    
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(transactions, null, 2) 
      }] 
    };
  }
});
```

## Automation Features

### Workflows Module

#### MCP Tool: Workflow Management
```javascript
// Create Workflow Tool
server.setRequestHandler('tools/execute', async (request) => {
  if (request.params.name === 'ghl_create_workflow') {
    const { workflowData, token } = request.params.arguments;
    
    const workflow = await this.makeGHLRequest('/workflows/', 'POST', workflowData, token);
    
    return { 
      content: [{ 
        type: 'text', 
        text: `Workflow created: ${workflow.id}` 
      }] 
    };
  }
});

// Add Contact to Workflow Tool
server.setRequestHandler('tools/execute', async (request) => {
  if (request.params.name === 'ghl_add_contact_to_workflow') {
    const { contactId, workflowId, token } = request.params.arguments;
    
    await this.makeGHLRequest(`/contacts/${contactId}/workflow/${workflowId}`, 'POST', {}, token);
    
    return { 
      content: [{ 
        type: 'text', 
        text: `Contact ${contactId} added to workflow ${workflowId}` 
      }] 
    };
  }
});
```

### Campaigns Module

#### MCP Tool: Campaign Management
```javascript
// Create Campaign Tool
server.setRequestHandler('tools/execute', async (request) => {
  if (request.params.name === 'ghl_create_campaign') {
    const { campaignData, token } = request.params.arguments;
    
    const campaign = await this.makeGHLRequest('/campaigns/', 'POST', campaignData, token);
    
    return { 
      content: [{ 
        type: 'text', 
        text: `Campaign created: ${campaign.id}` 
      }] 
    };
  }
});

// Schedule Campaign Tool
server.setRequestHandler('tools/execute', async (request) => {
  if (request.params.name === 'ghl_schedule_campaign') {
    const { campaignId, scheduleData, token } = request.params.arguments;
    
    const result = await this.makeGHLRequest(`/campaigns/${campaignId}/schedule`, 'POST', scheduleData, token);
    
    return { 
      content: [{ 
        type: 'text', 
        text: `Campaign scheduled: ${result.scheduledAt}` 
      }] 
    };
  }
});
```

## Webhook Handling

### Webhook Server Implementation
```javascript
import express from 'express';
import crypto from 'crypto';

class GHLWebhookHandler {
  constructor(webhookSecret) {
    this.webhookSecret = webhookSecret;
    this.app = express();
    this.setupRoutes();
  }
  
  verifyWebhookSignature(payload, signature) {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return `sha256=${expectedSignature}` === signature;
  }
  
  setupRoutes() {
    this.app.use(express.raw({ type: 'application/json' }));
    
    this.app.post('/webhooks/ghl', (req, res) => {
      const signature = req.headers['x-ghl-signature'];
      
      if (!this.verifyWebhookSignature(req.body, signature)) {
        return res.status(401).send('Unauthorized');
      }
      
      const event = JSON.parse(req.body.toString());
      this.handleWebhookEvent(event);
      
      res.status(200).send('OK');
    });
  }
  
  handleWebhookEvent(event) {
    switch (event.type) {
      case 'InboundMessage':
        this.handleInboundMessage(event);
        break;
      case 'ContactEvent':
        this.handleContactEvent(event);
        break;
      case 'OpportunityEvent':
        this.handleOpportunityEvent(event);
        break;
      case 'Appointment':
        this.handleAppointmentEvent(event);
        break;
      default:
        console.log('Unknown webhook event type:', event.type);
    }
  }
  
  handleInboundMessage(event) {
    // Process inbound message
    console.log('Inbound message from:', event.contactId);
    console.log('Message:', event.message);
  }
  
  handleContactEvent(event) {
    // Process contact event
    console.log('Contact event:', event.eventType);
    console.log('Contact ID:', event.contactId);
  }
  
  handleOpportunityEvent(event) {
    // Process opportunity event
    console.log('Opportunity event:', event.eventType);
    console.log('Opportunity ID:', event.opportunityId);
  }
  
  handleAppointmentEvent(event) {
    // Process appointment event
    console.log('Appointment event:', event.eventType);
    console.log('Appointment ID:', event.appointmentId);
  }
}
```

## Error Handling and Rate Limiting

### Error Handler Implementation
```javascript
class GHLErrorHandler {
  static async handleAPIError(error, context) {
    if (error.response) {
      const status = error.response.status;
      const data = await error.response.json();
      
      switch (status) {
        case 400:
          throw new Error(`Bad Request: ${data.message || 'Invalid request parameters'}`);
        case 401:
          throw new Error('Unauthorized: Invalid or expired token');
        case 403:
          throw new Error('Forbidden: Insufficient permissions');
        case 404:
          throw new Error(`Not Found: ${context.resource} not found`);
        case 429:
          const retryAfter = error.response.headers.get('X-RateLimit-Reset');
          throw new Error(`Rate Limited: Try again after ${retryAfter} seconds`);
        case 500:
          throw new Error('Internal Server Error: GoHighLevel service error');
        default:
          throw new Error(`API Error: ${status} - ${data.message || 'Unknown error'}`);
      }
    }
    throw error;
  }
}
```

### Rate Limiter Implementation
```javascript
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.dailyRequests = new Map();
  }
  
  canMakeRequest(resource) {
    const now = Date.now();
    const tenSecondsAgo = now - 10000;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    
    // Check burst limit (100 per 10 seconds)
    const recentRequests = this.getRecentRequests(resource, tenSecondsAgo);
    if (recentRequests.length >= GHL_CONFIG.RATE_LIMITS.BURST) {
      return false;
    }
    
    // Check daily limit (200,000 per day)
    const dailyCount = this.getDailyCount(resource, todayStart);
    if (dailyCount >= GHL_CONFIG.RATE_LIMITS.DAILY) {
      return false;
    }
    
    return true;
  }
  
  recordRequest(resource) {
    const now = Date.now();
    
    if (!this.requests.has(resource)) {
      this.requests.set(resource, []);
    }
    this.requests.get(resource).push(now);
    
    // Update daily count
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const key = `${resource}-${todayStart}`;
    this.dailyRequests.set(key, (this.dailyRequests.get(key) || 0) + 1);
  }
  
  getRecentRequests(resource, since) {
    const requests = this.requests.get(resource) || [];
    return requests.filter(time => time > since);
  }
  
  getDailyCount(resource, dayStart) {
    const key = `${resource}-${dayStart}`;
    return this.dailyRequests.get(key) || 0;
  }
}
```

## Complete MCP Tool Registry

### Tool Definitions
```javascript
const GHL_MCP_TOOLS = [
  // Contact Tools
  {
    name: 'ghl_create_contact',
    description: 'Create a new contact in GoHighLevel',
    inputSchema: {
      type: 'object',
      properties: {
        locationId: { type: 'string', description: 'Location ID' },
        contactData: { type: 'object', description: 'Contact information' },
        token: { type: 'string', description: 'Access token' }
      },
      required: ['locationId', 'contactData', 'token']
    }
  },
  {
    name: 'ghl_search_contacts',
    description: 'Search for contacts in GoHighLevel',
    inputSchema: {
      type: 'object',
      properties: {
        locationId: { type: 'string', description: 'Location ID' },
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'number', description: 'Results limit' },
        offset: { type: 'number', description: 'Results offset' },
        token: { type: 'string', description: 'Access token' }
      },
      required: ['locationId', 'token']
    }
  },
  {
    name: 'ghl_update_contact',
    description: 'Update an existing contact',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { type: 'string', description: 'Contact ID' },
        updateData: { type: 'object', description: 'Fields to update' },
        token: { type: 'string', description: 'Access token' }
      },
      required: ['contactId', 'updateData', 'token']
    }
  },
  
  // Conversation Tools
  {
    name: 'ghl_send_message',
    description: 'Send a message to a contact',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['SMS', 'Email', 'WhatsApp'], description: 'Message type' },
        contactId: { type: 'string', description: 'Contact ID' },
        locationId: { type: 'string', description: 'Location ID' },
        message: { type: 'string', description: 'Message content' },
        token: { type: 'string', description: 'Access token' }
      },
      required: ['type', 'contactId', 'locationId', 'message', 'token']
    }
  },
  
  // Calendar Tools
  {
    name: 'ghl_create_appointment',
    description: 'Create a new appointment',
    inputSchema: {
      type: 'object',
      properties: {
        appointmentData: { type: 'object', description: 'Appointment details' },
        token: { type: 'string', description: 'Access token' }
      },
      required: ['appointmentData', 'token']
    }
  },
  {
    name: 'ghl_get_calendar_slots',
    description: 'Get available calendar slots',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: { type: 'string', description: 'Calendar ID' },
        startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        endDate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        timezone: { type: 'string', description: 'Timezone' },
        token: { type: 'string', description: 'Access token' }
      },
      required: ['calendarId', 'startDate', 'endDate', 'token']
    }
  },
  
  // Opportunity Tools
  {
    name: 'ghl_create_opportunity',
    description: 'Create a new opportunity',
    inputSchema: {
      type: 'object',
      properties: {
        opportunityData: { type: 'object', description: 'Opportunity details' },
        token: { type: 'string', description: 'Access token' }
      },
      required: ['opportunityData', 'token']
    }
  },
  {
    name: 'ghl_search_opportunities',
    description: 'Search opportunities',
    inputSchema: {
      type: 'object',
      properties: {
        locationId: { type: 'string', description: 'Location ID' },
        pipelineId: { type: 'string', description: 'Pipeline ID' },
        query: { type: 'string', description: 'Search query' },
        assignedTo: { type: 'string', description: 'Assigned user ID' },
        token: { type: 'string', description: 'Access token' }
      },
      required: ['locationId', 'token']
    }
  },
  
  // Workflow Tools
  {
    name: 'ghl_add_contact_to_workflow',
    description: 'Add a contact to a workflow',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { type: 'string', description: 'Contact ID' },
        workflowId: { type: 'string', description: 'Workflow ID' },
        token: { type: 'string', description: 'Access token' }
      },
      required: ['contactId', 'workflowId', 'token']
    }
  },
  
  // Payment Tools
  {
    name: 'ghl_create_order',
    description: 'Create a new order',
    inputSchema: {
      type: 'object',
      properties: {
        orderData: { type: 'object', description: 'Order details' },
        token: { type: 'string', description: 'Access token' }
      },
      required: ['orderData', 'token']
    }
  },
  {
    name: 'ghl_get_transactions',
    description: 'Get payment transactions',
    inputSchema: {
      type: 'object',
      properties: {
        locationId: { type: 'string', description: 'Location ID' },
        contactId: { type: 'string', description: 'Contact ID' },
        startAfter: { type: 'string', description: 'Start date filter' },
        endBefore: { type: 'string', description: 'End date filter' },
        token: { type: 'string', description: 'Access token' }
      },
      required: ['locationId', 'token']
    }
  }
];
```

## Implementation Example

### Complete MCP Server
```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

class GoHighLevelMCPServer {
  constructor() {
    this.rateLimiter = new RateLimiter();
    this.server = new Server({
      name: 'ghl-mcp-server',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {}
      }
    });
    
    this.setupTools();
    this.startServer();
  }
  
  setupTools() {
    // List available tools
    this.server.setRequestHandler('tools/list', async () => ({
      tools: GHL_MCP_TOOLS
    }));
    
    // Execute tools
    this.server.setRequestHandler('tools/execute', async (request) => {
      const { name, arguments: args } = request.params;
      
      // Check rate limits
      if (!this.rateLimiter.canMakeRequest(name)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      try {
        const result = await this.executeGHLTool(name, args);
        this.rateLimiter.recordRequest(name);
        return result;
      } catch (error) {
        return GHLErrorHandler.handleAPIError(error, { resource: name });
      }
    });
  }
  
  async executeGHLTool(toolName, args) {
    switch (toolName) {
      case 'ghl_create_contact':
        return this.createContact(args);
      case 'ghl_search_contacts':
        return this.searchContacts(args);
      case 'ghl_send_message':
        return this.sendMessage(args);
      case 'ghl_create_appointment':
        return this.createAppointment(args);
      case 'ghl_get_calendar_slots':
        return this.getCalendarSlots(args);
      case 'ghl_create_opportunity':
        return this.createOpportunity(args);
      case 'ghl_search_opportunities':
        return this.searchOpportunities(args);
      case 'ghl_add_contact_to_workflow':
        return this.addContactToWorkflow(args);
      case 'ghl_create_order':
        return this.createOrder(args);
      case 'ghl_get_transactions':
        return this.getTransactions(args);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
  
  async makeGHLRequest(endpoint, method = 'GET', data = null, token) {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': GHL_CONFIG.API_VERSION,
        'Accept': 'application/json'
      }
    };
    
    if (data && method !== 'GET') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${GHL_CONFIG.BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const error = new Error('API Request Failed');
      error.response = response;
      throw error;
    }
    
    return response.json();
  }
  
  // Tool implementations
  async createContact({ locationId, contactData, token }) {
    const contact = await this.makeGHLRequest('/contacts/', 'POST', {
      locationId,
      ...contactData
    }, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          contact: contact
        }, null, 2)
      }]
    };
  }
  
  async searchContacts({ locationId, query, limit = 20, offset = 0, token }) {
    const params = new URLSearchParams({
      locationId,
      ...(query && { query }),
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    const result = await this.makeGHLRequest(`/contacts/?${params}`, 'GET', null, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          contacts: result.contacts,
          total: result.total,
          page: Math.floor(offset / limit) + 1
        }, null, 2)
      }]
    };
  }
  
  async sendMessage({ type, contactId, locationId, message, token }) {
    const messageData = {
      type,
      contactId,
      locationId,
      message
    };
    
    const result = await this.makeGHLRequest('/conversations/messages', 'POST', messageData, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          messageId: result.messageId,
          conversationId: result.conversationId,
          status: 'sent'
        }, null, 2)
      }]
    };
  }
  
  async createAppointment({ appointmentData, token }) {
    const appointment = await this.makeGHLRequest('/calendars/events/appointments', 'POST', appointmentData, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          appointment: appointment
        }, null, 2)
      }]
    };
  }
  
  async getCalendarSlots({ calendarId, startDate, endDate, timezone, token }) {
    const params = new URLSearchParams({
      startDate,
      endDate,
      ...(timezone && { timezone })
    });
    
    const slots = await this.makeGHLRequest(`/calendars/${calendarId}/free-slots?${params}`, 'GET', null, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          slots: slots,
          totalSlots: slots.length
        }, null, 2)
      }]
    };
  }
  
  async createOpportunity({ opportunityData, token }) {
    const opportunity = await this.makeGHLRequest('/opportunities/', 'POST', opportunityData, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          opportunity: opportunity
        }, null, 2)
      }]
    };
  }
  
  async searchOpportunities({ locationId, pipelineId, query, assignedTo, token }) {
    const params = new URLSearchParams({
      locationId,
      ...(pipelineId && { pipelineId }),
      ...(query && { query }),
      ...(assignedTo && { assignedTo })
    });
    
    const result = await this.makeGHLRequest(`/opportunities/search?${params}`, 'GET', null, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          opportunities: result.opportunities,
          total: result.total
        }, null, 2)
      }]
    };
  }
  
  async addContactToWorkflow({ contactId, workflowId, token }) {
    await this.makeGHLRequest(`/contacts/${contactId}/workflow/${workflowId}`, 'POST', {}, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: `Contact ${contactId} successfully added to workflow ${workflowId}`
        }, null, 2)
      }]
    };
  }
  
  async createOrder({ orderData, token }) {
    const order = await this.makeGHLRequest('/payments/orders', 'POST', orderData, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          order: order
        }, null, 2)
      }]
    };
  }
  
  async getTransactions({ locationId, contactId, startAfter, endBefore, token }) {
    const params = new URLSearchParams({
      locationId,
      ...(contactId && { contactId }),
      ...(startAfter && { startAfter }),
      ...(endBefore && { endBefore })
    });
    
    const result = await this.makeGHLRequest(`/payments/transactions?${params}`, 'GET', null, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          transactions: result.transactions,
          total: result.total
        }, null, 2)
      }]
    };
  }
  
  async startServer() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('GoHighLevel MCP Server started');
  }
}

// Start the server
new GoHighLevelMCPServer();
```

## Deployment and Configuration

### Package.json
```json
{
  "name": "ghl-mcp-server",
  "version": "1.0.0",
  "description": "MCP server for GoHighLevel API integration",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "express": "^4.18.2"
  },
  "bin": {
    "ghl-mcp-server": "./index.js"
  }
}
```

### MCP Configuration
```json
{
  "mcpServers": {
    "ghl": {
      "command": "npx",
      "args": ["ghl-mcp-server"],
      "env": {
        "GHL_CLIENT_ID": "your_client_id",
        "GHL_CLIENT_SECRET": "your_client_secret",
        "GHL_WEBHOOK_SECRET": "your_webhook_secret"
      }
    }
  }
}
```

## Security Best Practices

1. **Token Storage**: Never store tokens in plain text. Use secure storage solutions.
2. **Webhook Verification**: Always verify webhook signatures before processing.
3. **Rate Limiting**: Implement client-side rate limiting to prevent API abuse.
4. **Error Handling**: Never expose sensitive information in error messages.
5. **Scope Management**: Request only the minimum required OAuth scopes.
6. **HTTPS Only**: Always use HTTPS for API communications.
7. **Token Refresh**: Implement automatic token refresh before expiration.

## Testing Guide

### Unit Tests Example
```javascript
import { describe, it, expect } from '@jest/globals';

describe('GoHighLevel MCP Server', () => {
  describe('Contact Operations', () => {
    it('should create a contact successfully', async () => {
      const server = new GoHighLevelMCPServer();
      const result = await server.createContact({
        locationId: 'test_location',
        contactData: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com'
        },
        token: 'test_token'
      });
      
      expect(result.content[0].text).toContain('success": true');
    });
  });
  
  describe('Rate Limiting', () => {
    it('should enforce burst limits', async () => {
      const limiter = new RateLimiter();
      
      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        expect(limiter.canMakeRequest('test')).toBe(true);
        limiter.recordRequest('test');
      }
      
      // 101st request should fail
      expect(limiter.canMakeRequest('test')).toBe(false);
    });
  });
});
```

## Troubleshooting

### Common Issues and Solutions

1. **401 Unauthorized Errors**
   - Verify token is valid and not expired
   - Check if token has required scopes
   - Ensure correct Authorization header format

2. **429 Rate Limit Errors**
   - Implement exponential backoff
   - Check rate limit headers
   - Consider request batching

3. **Webhook Delivery Failures**
   - Verify webhook URL is publicly accessible
   - Check signature verification logic
   - Ensure proper response codes (200 OK)

4. **OAuth Flow Issues**
   - Verify redirect URI matches registered URL
   - Check client credentials
   - Ensure all required scopes are requested

## Conclusion

This reference document provides a comprehensive guide for building an MCP server that integrates with the GoHighLevel API v2. The implementation includes:

- Complete OAuth 2.0 authentication flow
- All major API endpoints with MCP tool wrappers
- Webhook handling with signature verification
- Rate limiting and error handling
- Security best practices
- Testing and deployment guidelines

For the latest updates and additional endpoints, refer to the official GoHighLevel API documentation at https://highlevel.stoplight.io/docs/integrations.