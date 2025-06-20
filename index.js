#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import dotenv from 'dotenv';
import { GHLAPIClient } from './src/api-client.js';
import { RateLimiter } from './src/rate-limiter.js';
import { ErrorHandler } from './src/error-handler.js';
import { 
  contactTools, 
  conversationTools, 
  calendarTools,
  opportunityTools,
  paymentTools,
  workflowTools 
} from './src/tools/index.js';

dotenv.config();

// Check if we're running in Railway or as a web service
const PORT = process.env.PORT || 3000;
const isWebService = !!process.env.PORT || process.env.RAILWAY_ENVIRONMENT;

class GoHighLevelMCPServer {
  constructor() {
    this.rateLimiter = new RateLimiter();
    this.apiClient = new GHLAPIClient();
    
    try {
      this.server = new Server({
        name: 'ghl-mcp-server',
        version: '1.0.0'
      }, {
        capabilities: {
          tools: {}
        }
      });
      
      this.setupTools();
    } catch (error) {
      console.error('Error initializing MCP server:', error);
    }
  }
  
  setupTools() {
    try {
      // List all available tools
      this.server.setRequestHandler('tools/list', async () => ({
        tools: [
          ...contactTools,
          ...conversationTools,
          ...calendarTools,
          ...opportunityTools,
          ...paymentTools,
          ...workflowTools
        ]
      }));
      
      // Execute tools
      this.server.setRequestHandler('tools/execute', async (request) => {
        const { name, arguments: args } = request.params;
        
        // Check rate limits
        if (!this.rateLimiter.canMakeRequest(name)) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        try {
          // Validate required token
          if (!args.token && !process.env.GHL_PRIVATE_TOKEN) {
            throw new Error('Authentication token required. Provide token in arguments or set GHL_PRIVATE_TOKEN environment variable.');
          }
          
          const token = args.token || process.env.GHL_PRIVATE_TOKEN;
          const result = await this.executeGHLTool(name, { ...args, token });
          
          this.rateLimiter.recordRequest(name);
          return result;
        } catch (error) {
          return ErrorHandler.handleAPIError(error, { resource: name });
        }
      });
    } catch (error) {
      console.error('Error setting up tools:', error);
    }
  }
  
  async executeGHLTool(toolName, args) {
    switch (toolName) {
      // Contact tools
      case 'ghl_create_contact':
        return this.apiClient.createContact(args);
      case 'ghl_search_contacts':
        return this.apiClient.searchContacts(args);
      case 'ghl_update_contact':
        return this.apiClient.updateContact(args);
      case 'ghl_delete_contact':
        return this.apiClient.deleteContact(args);
      case 'ghl_get_contact':
        return this.apiClient.getContact(args);
      case 'ghl_add_contact_tags':
        return this.apiClient.addContactTags(args);
      case 'ghl_remove_contact_tags':
        return this.apiClient.removeContactTags(args);
        
      // Conversation tools
      case 'ghl_send_message':
        return this.apiClient.sendMessage(args);
      case 'ghl_get_conversations':
        return this.apiClient.getConversations(args);
      case 'ghl_get_messages':
        return this.apiClient.getMessages(args);
        
      // Calendar tools
      case 'ghl_create_calendar':
        return this.apiClient.createCalendar(args);
      case 'ghl_create_appointment':
        return this.apiClient.createAppointment(args);
      case 'ghl_get_calendar_slots':
        return this.apiClient.getCalendarSlots(args);
      case 'ghl_update_appointment':
        return this.apiClient.updateAppointment(args);
      case 'ghl_cancel_appointment':
        return this.apiClient.cancelAppointment(args);
        
      // Opportunity tools
      case 'ghl_create_opportunity':
        return this.apiClient.createOpportunity(args);
      case 'ghl_search_opportunities':
        return this.apiClient.searchOpportunities(args);
      case 'ghl_update_opportunity':
        return this.apiClient.updateOpportunity(args);
      case 'ghl_delete_opportunity':
        return this.apiClient.deleteOpportunity(args);
      case 'ghl_get_pipelines':
        return this.apiClient.getPipelines(args);
        
      // Payment tools
      case 'ghl_create_order':
        return this.apiClient.createOrder(args);
      case 'ghl_get_transactions':
        return this.apiClient.getTransactions(args);
      case 'ghl_get_orders':
        return this.apiClient.getOrders(args);
        
      // Workflow tools
      case 'ghl_add_contact_to_workflow':
        return this.apiClient.addContactToWorkflow(args);
      case 'ghl_remove_contact_from_workflow':
        return this.apiClient.removeContactFromWorkflow(args);
      case 'ghl_get_workflows':
        return this.apiClient.getWorkflows(args);
        
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
  
  async start() {
    if (this.server) {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error('GoHighLevel MCP Server started');
    }
  }
}

// If running as a web service (Railway, Vercel, etc.), provide HTTP endpoints
if (isWebService) {
  console.log('Running as web service on port', PORT);
  
  const app = express();
  app.use(express.json());
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'GoHighLevel MCP Server',
      mode: 'http',
      version: '1.0.0'
    });
  });
  
  // Info endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'GoHighLevel MCP Server',
      description: 'MCP server for GoHighLevel API integration',
      endpoints: {
        health: '/health',
        mcp: '/api/mcp',
        rest: '/api/ghl/*'
      },
      documentation: 'https://github.com/mistermakeithappen/ghl-mcp-server'
    });
  });
  
  // Import and mount API routes
  import('./examples/api-backend.js').then(module => {
    app.use('/api/ghl', module.default);
  }).catch(error => {
    console.error('Error loading API routes:', error);
  });
  
  // Import and mount MCP HTTP endpoint
  import('./api/mcp.js').then(module => {
    app.use('/api/mcp', module.default);
  }).catch(error => {
    console.error('Error loading MCP endpoint:', error);
  });
  
  app.listen(PORT, () => {
    console.log(`GoHighLevel MCP Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
} else {
  // Running as traditional MCP server (CLI mode)
  console.error('Starting in MCP CLI mode...');
  const server = new GoHighLevelMCPServer();
  server.start().catch(console.error);
}