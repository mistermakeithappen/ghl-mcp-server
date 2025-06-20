# GoHighLevel MCP Server

A Model Context Protocol (MCP) server that provides comprehensive integration with the GoHighLevel API v2. This server enables AI assistants to interact with GoHighLevel's CRM, marketing automation, and business management tools.

## Features

- 🚀 **Complete API Coverage**: Access to contacts, conversations, calendars, opportunities, payments, workflows, and more
- 🔐 **Flexible Authentication**: Supports both OAuth 2.0 and Private Integration tokens
- ⚡ **Built-in Rate Limiting**: Automatic rate limit management (100 requests/10s, 200k/day)
- 🛡️ **Error Handling**: Comprehensive error handling with detailed error messages
- 📦 **Vercel Ready**: Designed for deployment on Vercel with MCP support
- 🎯 **Type-Safe**: Full input validation and schema definitions for all tools

## Installation

```bash
npm install ghl-mcp-server
```

Or install globally:

```bash
npm install -g ghl-mcp-server
```

## Quick Start

### 1. Set up environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your GoHighLevel credentials:

```env
# Private Integration Token (simplest method)
GHL_PRIVATE_TOKEN=your_private_integration_token_here

# Or use OAuth (for multi-account access)
GHL_CLIENT_ID=your_oauth_client_id
GHL_CLIENT_SECRET=your_oauth_client_secret
```

### 2. Configure your MCP client

Add to your Claude Desktop or other MCP client configuration:

```json
{
  "mcpServers": {
    "ghl": {
      "command": "npx",
      "args": ["ghl-mcp-server"],
      "env": {
        "GHL_PRIVATE_TOKEN": "your_token_here"
      }
    }
  }
}
```

### 3. Start using GoHighLevel tools

The server provides the following tools:

#### Contact Management
- `ghl_create_contact` - Create a new contact
- `ghl_search_contacts` - Search for contacts
- `ghl_get_contact` - Get contact details
- `ghl_update_contact` - Update contact information
- `ghl_delete_contact` - Delete a contact
- `ghl_add_contact_tags` - Add tags to a contact
- `ghl_remove_contact_tags` - Remove tags from a contact

#### Conversations & Messaging
- `ghl_send_message` - Send SMS, Email, or WhatsApp messages
- `ghl_get_conversations` - Get conversation list
- `ghl_get_messages` - Get messages in a conversation

#### Calendar & Appointments
- `ghl_create_calendar` - Create a new calendar
- `ghl_create_appointment` - Book an appointment
- `ghl_get_calendar_slots` - Get available time slots
- `ghl_update_appointment` - Update appointment details
- `ghl_cancel_appointment` - Cancel an appointment

#### Sales & Opportunities
- `ghl_create_opportunity` - Create a sales opportunity
- `ghl_search_opportunities` - Search opportunities
- `ghl_update_opportunity` - Update opportunity details
- `ghl_delete_opportunity` - Delete an opportunity
- `ghl_get_pipelines` - Get pipeline list

#### Payments
- `ghl_create_order` - Create a payment order
- `ghl_get_transactions` - Get transaction history
- `ghl_get_orders` - Get order list

#### Automation
- `ghl_add_contact_to_workflow` - Add contact to workflow
- `ghl_remove_contact_from_workflow` - Remove from workflow
- `ghl_get_workflows` - Get workflow list

## Usage Examples

### Create a Contact

```javascript
{
  "tool": "ghl_create_contact",
  "arguments": {
    "locationId": "your_location_id",
    "contactData": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "tags": ["new-lead", "website"]
    }
  }
}
```

### Send a Message

```javascript
{
  "tool": "ghl_send_message",
  "arguments": {
    "type": "SMS",
    "contactId": "contact_id",
    "locationId": "location_id",
    "message": "Hello! Thanks for your interest."
  }
}
```

### Create an Appointment

```javascript
{
  "tool": "ghl_create_appointment",
  "arguments": {
    "appointmentData": {
      "calendarId": "calendar_id",
      "locationId": "location_id",
      "contactId": "contact_id",
      "startTime": "2025-07-23T15:00:00Z",
      "endTime": "2025-07-23T16:00:00Z",
      "title": "Consultation Call"
    }
  }
}
```

## Authentication Methods

### Method 1: Private Integration Token (Recommended for single account)

1. Go to Settings > Integrations > Private Integration in GoHighLevel
2. Create a new private integration
3. Copy the token and add to your `.env` file

### Method 2: OAuth 2.0 (For marketplace apps)

1. Register your app in GoHighLevel Marketplace
2. Set up OAuth with the required scopes
3. Use the OAuth flow to get access tokens

## Development

### Running locally

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Project Structure

```
ghl-mcp-server/
├── index.js              # Main server entry point
├── src/
│   ├── api-client.js     # GoHighLevel API client
│   ├── config.js         # Configuration constants
│   ├── rate-limiter.js   # Rate limiting logic
│   ├── error-handler.js  # Error handling utilities
│   └── tools/            # Tool definitions
│       ├── contact-tools.js
│       ├── conversation-tools.js
│       ├── calendar-tools.js
│       ├── opportunity-tools.js
│       ├── payment-tools.js
│       └── workflow-tools.js
└── package.json
```

## Deployment on Vercel

1. Fork this repository
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

The server is designed to work with Vercel's MCP integration out of the box.

## Error Handling

The server provides detailed error messages for common scenarios:

- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: Insufficient permissions/scopes
- **404 Not Found**: Resource not found
- **429 Rate Limited**: Too many requests
- **422 Unprocessable Entity**: Validation errors

## Rate Limits

GoHighLevel enforces the following rate limits:
- **Burst**: 100 requests per 10 seconds
- **Daily**: 200,000 requests per day

The server automatically tracks and enforces these limits.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

- [GoHighLevel API Documentation](https://highlevel.stoplight.io/docs/integrations)
- [MCP Documentation](https://modelcontextprotocol.com)
- [Issues](https://github.com/mistermakeithappen/ghl-mcp-server/issues)
