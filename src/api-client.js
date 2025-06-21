import fetch from 'node-fetch';
import { GHL_CONFIG } from './config.js';

export class GHLAPIClient {
  constructor() {
    this.baseUrl = GHL_CONFIG.BASE_URL;
    this.apiVersion = GHL_CONFIG.API_VERSION;
  }
  
  async makeRequest(endpoint, method = 'GET', data = null, token) {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': this.apiVersion,
        'Accept': 'application/json'
      }
    };
    
    if (data && method !== 'GET') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      const error = new Error('API Request Failed');
      error.response = response;
      error.status = response.status;
      try {
        error.data = await response.json();
      } catch {
        error.data = await response.text();
      }
      throw error;
    }
    
    return response.json();
  }
  
  // Contact methods
  async createContact({ locationId, contactData, token }) {
    const contact = await this.makeRequest('/contacts/', 'POST', {
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
      ...(offset > 0 && { offset: offset.toString() })
    });
    
    const result = await this.makeRequest(`/contacts/?${params}`, 'GET', null, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          contacts: result.contacts || result,
          total: result.meta?.total || result.total || result.length,
          meta: result.meta,
          page: Math.floor(offset / limit) + 1
        }, null, 2)
      }]
    };
  }
  
  async getContact({ contactId, token }) {
    const contact = await this.makeRequest(`/contacts/${contactId}`, 'GET', null, token);
    
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
  
  async updateContact({ contactId, updateData, token }) {
    const contact = await this.makeRequest(`/contacts/${contactId}`, 'PUT', updateData, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          contact: contact.contact || contact
        }, null, 2)
      }]
    };
  }
  
  async deleteContact({ contactId, token }) {
    await this.makeRequest(`/contacts/${contactId}`, 'DELETE', null, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: `Contact ${contactId} deleted successfully`
        }, null, 2)
      }]
    };
  }
  
  async addContactTags({ contactId, tags, token }) {
    const result = await this.makeRequest(`/contacts/${contactId}/tags`, 'POST', { tags }, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          tags: result.tags || tags,
          message: `Tags added to contact ${contactId}`
        }, null, 2)
      }]
    };
  }
  
  async removeContactTags({ contactId, tags, token }) {
    await this.makeRequest(`/contacts/${contactId}/tags`, 'DELETE', { tags }, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: `Tags removed from contact ${contactId}`
        }, null, 2)
      }]
    };
  }
  
  // Conversation methods
  async sendMessage({ type, contactId, locationId, message, subject, htmlBody, attachments, token }) {
    const messageData = {
      type,
      contactId,
      locationId
    };
    
    if (type === 'SMS' || type === 'WhatsApp') {
      messageData.message = message;
    } else if (type === 'Email') {
      messageData.subject = subject;
      messageData.htmlBody = htmlBody || message;
      messageData.textBody = message;
      if (attachments) {
        messageData.attachments = attachments;
      }
    }
    
    const result = await this.makeRequest('/conversations/messages', 'POST', messageData, token);
    
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
  
  async getConversations({ locationId, contactId, limit = 20, lastMessageId, token }) {
    const params = new URLSearchParams({
      locationId,
      ...(contactId && { contactId }),
      limit: limit.toString(),
      ...(lastMessageId && { lastMessageId })
    });
    
    const result = await this.makeRequest(`/conversations/search?${params}`, 'GET', null, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          conversations: result.conversations || result,
          total: result.total
        }, null, 2)
      }]
    };
  }
  
  async getMessages({ conversationId, limit = 20, lastMessageId, token }) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(lastMessageId && { lastMessageId })
    });
    
    const result = await this.makeRequest(`/conversations/${conversationId}/messages?${params}`, 'GET', null, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          messages: result.messages || result,
          total: result.total
        }, null, 2)
      }]
    };
  }
  
  // Calendar methods
  async createCalendar({ calendarData, token }) {
    const calendar = await this.makeRequest('/calendars/', 'POST', calendarData, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          calendar: calendar
        }, null, 2)
      }]
    };
  }
  
  async createAppointment({ appointmentData, token }) {
    const appointment = await this.makeRequest('/calendars/events/appointments', 'POST', appointmentData, token);
    
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
    
    const slots = await this.makeRequest(`/calendars/${calendarId}/free-slots?${params}`, 'GET', null, token);
    
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
  
  async updateAppointment({ appointmentId, updateData, token }) {
    const appointment = await this.makeRequest(`/calendars/events/appointments/${appointmentId}`, 'PUT', updateData, token);
    
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
  
  async cancelAppointment({ appointmentId, token }) {
    await this.makeRequest(`/calendars/events/appointments/${appointmentId}`, 'DELETE', null, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: `Appointment ${appointmentId} cancelled successfully`
        }, null, 2)
      }]
    };
  }
  
  // Opportunity methods
  async createOpportunity({ opportunityData, token }) {
    const opportunity = await this.makeRequest('/opportunities/', 'POST', opportunityData, token);
    
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
      ...(pipelineId && { pipelineId }),
      ...(query && { query }),
      ...(assignedTo && { assignedTo }),
      location_id: locationId
    });
    
    const result = await this.makeRequest(`/opportunities/search?${params}`, 'GET', null, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          opportunities: result.opportunities || result,
          total: result.total
        }, null, 2)
      }]
    };
  }
  
  async updateOpportunity({ opportunityId, updateData, token }) {
    const opportunity = await this.makeRequest(`/opportunities/${opportunityId}`, 'PUT', updateData, token);
    
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
  
  async deleteOpportunity({ opportunityId, token }) {
    await this.makeRequest(`/opportunities/${opportunityId}`, 'DELETE', null, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: `Opportunity ${opportunityId} deleted successfully`
        }, null, 2)
      }]
    };
  }
  
  async getPipelines({ locationId, token }) {
    const params = new URLSearchParams({ locationId });
    const result = await this.makeRequest(`/opportunities/pipelines?${params}`, 'GET', null, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          pipelines: result.pipelines || result
        }, null, 2)
      }]
    };
  }
  
  // Payment methods
  async createOrder({ orderData, token }) {
    const order = await this.makeRequest('/payments/orders', 'POST', orderData, token);
    
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
      altId: locationId,
      altType: 'location',
      ...(contactId && { contactId }),
      ...(startAfter && { startAfter }),
      ...(endBefore && { endBefore })
    });
    
    const result = await this.makeRequest(`/payments/transactions?${params}`, 'GET', null, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          transactions: result.transactions || result,
          total: result.total
        }, null, 2)
      }]
    };
  }
  
  async getOrders({ locationId, contactId, startAfter, endBefore, token }) {
    const params = new URLSearchParams({
      altId: locationId,
      altType: 'location',
      ...(contactId && { contactId }),
      ...(startAfter && { startAfter }),
      ...(endBefore && { endBefore })
    });
    
    const result = await this.makeRequest(`/payments/orders?${params}`, 'GET', null, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          orders: result.orders || result,
          total: result.total
        }, null, 2)
      }]
    };
  }
  
  // Workflow methods
  async addContactToWorkflow({ contactId, workflowId, token }) {
    await this.makeRequest(`/contacts/${contactId}/workflow/${workflowId}`, 'POST', {}, token);
    
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
  
  async removeContactFromWorkflow({ contactId, workflowId, token }) {
    await this.makeRequest(`/contacts/${contactId}/workflow/${workflowId}`, 'DELETE', null, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: `Contact ${contactId} successfully removed from workflow ${workflowId}`
        }, null, 2)
      }]
    };
  }
  
  async getWorkflows({ locationId, token }) {
    const params = new URLSearchParams({ locationId });
    const result = await this.makeRequest(`/workflows/?${params}`, 'GET', null, token);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          workflows: result.workflows || result
        }, null, 2)
      }]
    };
  }
}