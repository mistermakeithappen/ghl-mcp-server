// Simple integration example for existing projects
// This shows how to use the GoHighLevel MCP server in your app

import { GHLAPIClient } from '../src/api-client.js';

// Option 1: Direct API Client Usage (Simplest)
class GoHighLevelIntegration {
  constructor(token) {
    this.client = new GHLAPIClient();
    this.token = token || process.env.GHL_PRIVATE_TOKEN;
  }
  
  // Create a new contact
  async createContact(firstName, lastName, email, phone, locationId) {
    try {
      const result = await this.client.createContact({
        locationId: locationId,
        contactData: {
          firstName,
          lastName,
          email,
          phone,
          tags: ['website-signup']
        },
        token: this.token
      });
      
      // Parse the response
      const response = JSON.parse(result.content[0].text);
      
      if (response.success) {
        console.log('Contact created:', response.contact.id);
        return response.contact;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }
  
  // Send SMS message
  async sendSMS(contactId, locationId, message) {
    try {
      const result = await this.client.sendMessage({
        type: 'SMS',
        contactId,
        locationId,
        message,
        token: this.token
      });
      
      const response = JSON.parse(result.content[0].text);
      return response;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }
  
  // Search contacts
  async searchContacts(locationId, searchQuery) {
    try {
      const result = await this.client.searchContacts({
        locationId,
        query: searchQuery,
        limit: 50,
        token: this.token
      });
      
      const response = JSON.parse(result.content[0].text);
      return response.contacts;
    } catch (error) {
      console.error('Error searching contacts:', error);
      throw error;
    }
  }
  
  // Create appointment
  async bookAppointment(calendarId, contactId, locationId, startTime, endTime, title) {
    try {
      const result = await this.client.createAppointment({
        appointmentData: {
          calendarId,
          locationId,
          contactId,
          startTime,
          endTime,
          title,
          appointmentStatus: 'confirmed'
        },
        token: this.token
      });
      
      const response = JSON.parse(result.content[0].text);
      return response.appointment;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  }
  
  // Add contact to workflow
  async addToWorkflow(contactId, workflowId) {
    try {
      const result = await this.client.addContactToWorkflow({
        contactId,
        workflowId,
        token: this.token
      });
      
      const response = JSON.parse(result.content[0].text);
      return response;
    } catch (error) {
      console.error('Error adding to workflow:', error);
      throw error;
    }
  }
}

// Example usage in your application
async function main() {
  // Initialize with your token
  const ghl = new GoHighLevelIntegration('your_ghl_token_here');
  
  // Example 1: Create a contact when user signs up
  const newContact = await ghl.createContact(
    'John',
    'Doe',
    'john@example.com',
    '+1234567890',
    'your_location_id'
  );
  console.log('New contact ID:', newContact.id);
  
  // Example 2: Send welcome SMS
  await ghl.sendSMS(
    newContact.id,
    'your_location_id',
    'Welcome to our service! Reply STOP to opt out.'
  );
  
  // Example 3: Search for contacts
  const contacts = await ghl.searchContacts(
    'your_location_id',
    'john'
  );
  console.log(`Found ${contacts.length} contacts`);
  
  // Example 4: Book an appointment
  const appointment = await ghl.bookAppointment(
    'calendar_id',
    newContact.id,
    'your_location_id',
    '2025-01-20T10:00:00Z',
    '2025-01-20T11:00:00Z',
    'Initial Consultation'
  );
  console.log('Appointment booked:', appointment.id);
  
  // Example 5: Add to welcome workflow
  await ghl.addToWorkflow(
    newContact.id,
    'welcome_workflow_id'
  );
}

// Express.js integration example
import express from 'express';

const app = express();
app.use(express.json());

const ghl = new GoHighLevelIntegration(process.env.GHL_PRIVATE_TOKEN);

// Webhook endpoint for form submissions
app.post('/webhook/form-submission', async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    
    // Create contact in GoHighLevel
    const contact = await ghl.createContact(
      firstName,
      lastName,
      email,
      phone,
      process.env.GHL_LOCATION_ID
    );
    
    // Send welcome message
    await ghl.sendSMS(
      contact.id,
      process.env.GHL_LOCATION_ID,
      `Hi ${firstName}! Thanks for signing up. We'll be in touch soon.`
    );
    
    // Add to nurture workflow
    await ghl.addToWorkflow(
      contact.id,
      process.env.GHL_WELCOME_WORKFLOW_ID
    );
    
    res.json({ success: true, contactId: contact.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search contacts endpoint
app.get('/api/contacts/search', async (req, res) => {
  try {
    const { q } = req.query;
    const contacts = await ghl.searchContacts(
      process.env.GHL_LOCATION_ID,
      q
    );
    res.json({ contacts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { GoHighLevelIntegration };