// Backend API endpoints for your existing application
// This creates REST endpoints that your frontend can call

import express from 'express';
import { GoHighLevelIntegration } from './simple-integration.js';

const router = express.Router();
const ghl = new GoHighLevelIntegration(process.env.GHL_PRIVATE_TOKEN);

// Middleware for error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Create contact
router.post('/contacts', asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, tags, customFields } = req.body;
  const locationId = req.body.locationId || process.env.GHL_DEFAULT_LOCATION;
  
  const contact = await ghl.createContact(
    firstName,
    lastName,
    email,
    phone,
    locationId
  );
  
  res.json({ success: true, contact });
}));

// Search contacts
router.get('/contacts/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  const locationId = req.query.locationId || process.env.GHL_DEFAULT_LOCATION;
  
  const contacts = await ghl.searchContacts(locationId, q);
  res.json({ contacts });
}));

// Send message
router.post('/messages', asyncHandler(async (req, res) => {
  const { type, contactId, message, subject, htmlBody } = req.body;
  const locationId = req.body.locationId || process.env.GHL_DEFAULT_LOCATION;
  
  let result;
  if (type === 'SMS') {
    result = await ghl.sendSMS(contactId, locationId, message);
  } else if (type === 'Email') {
    // You would extend the integration class to handle emails
    result = await ghl.client.sendMessage({
      type: 'Email',
      contactId,
      locationId,
      message,
      subject,
      htmlBody,
      token: ghl.token
    });
    result = JSON.parse(result.content[0].text);
  }
  
  res.json(result);
}));

// Get calendar slots
router.get('/calendars/:calendarId/slots', asyncHandler(async (req, res) => {
  const { calendarId } = req.params;
  const { startDate, endDate } = req.query;
  
  const result = await ghl.client.getCalendarSlots({
    calendarId,
    startDate,
    endDate,
    token: ghl.token
  });
  
  const data = JSON.parse(result.content[0].text);
  res.json(data);
}));

// Create appointment
router.post('/appointments', asyncHandler(async (req, res) => {
  const appointmentData = req.body;
  const locationId = appointmentData.locationId || process.env.GHL_DEFAULT_LOCATION;
  
  const appointment = await ghl.bookAppointment(
    appointmentData.calendarId,
    appointmentData.contactId,
    locationId,
    appointmentData.startTime,
    appointmentData.endTime,
    appointmentData.title
  );
  
  res.json({ success: true, appointment });
}));

// Add to workflow
router.post('/workflows/add-contact', asyncHandler(async (req, res) => {
  const { contactId, workflowId } = req.body;
  
  const result = await ghl.addToWorkflow(contactId, workflowId);
  res.json(result);
}));

// Get opportunities
router.get('/opportunities', asyncHandler(async (req, res) => {
  const locationId = req.query.locationId || process.env.GHL_DEFAULT_LOCATION;
  
  const result = await ghl.client.searchOpportunities({
    locationId,
    token: ghl.token
  });
  
  const data = JSON.parse(result.content[0].text);
  res.json(data);
}));

// Create opportunity
router.post('/opportunities', asyncHandler(async (req, res) => {
  const opportunityData = {
    ...req.body,
    locationId: req.body.locationId || process.env.GHL_DEFAULT_LOCATION
  };
  
  const result = await ghl.client.createOpportunity({
    opportunityData,
    token: ghl.token
  });
  
  const data = JSON.parse(result.content[0].text);
  res.json(data);
}));

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    details: error.data || {}
  });
});

// Example: Complete Express app setup
export function createGHLAPIServer() {
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // CORS (adjust for your needs)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  
  // Mount the API routes
  app.use('/api/ghl', router);
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'GoHighLevel API' });
  });
  
  return app;
}

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createGHLAPIServer();
  const port = process.env.PORT || 3001;
  
  app.listen(port, () => {
    console.log(`GoHighLevel API server running on port ${port}`);
  });
}

export default router;