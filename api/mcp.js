// Alternative MCP implementation for Vercel using HTTP transport
import { GHLAPIClient } from '../src/api-client.js';
import { RateLimiter } from '../src/rate-limiter.js';
import { ErrorHandler } from '../src/error-handler.js';

const rateLimiter = new RateLimiter();
const apiClient = new GHLAPIClient();

// MCP-compatible HTTP endpoint
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { method, params } = req.body;
  
  try {
    switch (method) {
      case 'tools/list':
        return res.json({
          tools: await getToolsList()
        });
        
      case 'tools/execute':
        const { name, arguments: args } = params;
        
        // Check rate limits
        if (!rateLimiter.canMakeRequest(name)) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        // Get token from env or args
        const token = args.token || process.env.GHL_PRIVATE_TOKEN;
        if (!token) {
          throw new Error('Authentication token required');
        }
        
        // Execute tool
        const result = await executeGHLTool(name, { ...args, token });
        rateLimiter.recordRequest(name);
        
        return res.json(result);
        
      default:
        return res.status(404).json({ error: 'Unknown method' });
    }
  } catch (error) {
    const errorResponse = await ErrorHandler.handleAPIError(error, { resource: params?.name });
    return res.status(error.status || 500).json(errorResponse);
  }
}

async function getToolsList() {
  // Import all tools
  const { contactTools } = await import('../src/tools/contact-tools.js');
  const { conversationTools } = await import('../src/tools/conversation-tools.js');
  const { calendarTools } = await import('../src/tools/calendar-tools.js');
  const { opportunityTools } = await import('../src/tools/opportunity-tools.js');
  const { paymentTools } = await import('../src/tools/payment-tools.js');
  const { workflowTools } = await import('../src/tools/workflow-tools.js');
  
  return [
    ...contactTools,
    ...conversationTools,
    ...calendarTools,
    ...opportunityTools,
    ...paymentTools,
    ...workflowTools
  ];
}

async function executeGHLTool(toolName, args) {
  switch (toolName) {
    // Contact tools
    case 'ghl_create_contact':
      return apiClient.createContact(args);
    case 'ghl_search_contacts':
      return apiClient.searchContacts(args);
    case 'ghl_update_contact':
      return apiClient.updateContact(args);
    case 'ghl_delete_contact':
      return apiClient.deleteContact(args);
    case 'ghl_get_contact':
      return apiClient.getContact(args);
    case 'ghl_add_contact_tags':
      return apiClient.addContactTags(args);
    case 'ghl_remove_contact_tags':
      return apiClient.removeContactTags(args);
      
    // Conversation tools
    case 'ghl_send_message':
      return apiClient.sendMessage(args);
    case 'ghl_get_conversations':
      return apiClient.getConversations(args);
    case 'ghl_get_messages':
      return apiClient.getMessages(args);
      
    // Calendar tools
    case 'ghl_create_calendar':
      return apiClient.createCalendar(args);
    case 'ghl_create_appointment':
      return apiClient.createAppointment(args);
    case 'ghl_get_calendar_slots':
      return apiClient.getCalendarSlots(args);
    case 'ghl_update_appointment':
      return apiClient.updateAppointment(args);
    case 'ghl_cancel_appointment':
      return apiClient.cancelAppointment(args);
      
    // Opportunity tools
    case 'ghl_create_opportunity':
      return apiClient.createOpportunity(args);
    case 'ghl_search_opportunities':
      return apiClient.searchOpportunities(args);
    case 'ghl_update_opportunity':
      return apiClient.updateOpportunity(args);
    case 'ghl_delete_opportunity':
      return apiClient.deleteOpportunity(args);
    case 'ghl_get_pipelines':
      return apiClient.getPipelines(args);
      
    // Payment tools
    case 'ghl_create_order':
      return apiClient.createOrder(args);
    case 'ghl_get_transactions':
      return apiClient.getTransactions(args);
    case 'ghl_get_orders':
      return apiClient.getOrders(args);
      
    // Workflow tools
    case 'ghl_add_contact_to_workflow':
      return apiClient.addContactToWorkflow(args);
    case 'ghl_remove_contact_from_workflow':
      return apiClient.removeContactFromWorkflow(args);
    case 'ghl_get_workflows':
      return apiClient.getWorkflows(args);
      
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}