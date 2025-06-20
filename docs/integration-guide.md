# GoHighLevel MCP Server Integration Guide

## What is an MCP Server?

An MCP (Model Context Protocol) server is a bridge that allows AI assistants to interact with external APIs. It's not a library you import into your code, but a standalone service that AI assistants can call.

## Integration Options

### Option 1: Claude Desktop Integration (Recommended for Development)

1. **Install Claude Desktop** from https://claude.ai/download

2. **Configure Claude Desktop** to use your MCP server:

   On macOS, edit: `~/Library/Application Support/Claude/claude_desktop_config.json`
   
   On Windows, edit: `%APPDATA%\Claude\claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "ghl": {
         "command": "node",
         "args": ["/path/to/your/ghl-mcp-server/index.js"],
         "env": {
           "GHL_PRIVATE_TOKEN": "your_gohighlevel_token_here"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

4. **Use in conversations**:
   ```
   "Can you create a new contact in GoHighLevel with the name John Doe and email john@example.com?"
   
   "Search for all contacts tagged with 'new-lead' in location XYZ"
   
   "Send an SMS to contact ABC saying 'Thanks for signing up!'"
   ```

### Option 2: Programmatic Integration via MCP Client

If you want to use the MCP server programmatically in your application:

```javascript
// Install the MCP SDK
// npm install @modelcontextprotocol/sdk

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

// Create MCP client
async function createGHLClient() {
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['/path/to/ghl-mcp-server/index.js'],
    env: {
      ...process.env,
      GHL_PRIVATE_TOKEN: 'your_token_here'
    }
  });

  const client = new Client({
    name: 'ghl-client',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  await client.connect(transport);
  return client;
}

// Use the client
async function useGHL() {
  const client = await createGHLClient();
  
  // List available tools
  const tools = await client.request('tools/list', {});
  console.log('Available tools:', tools);
  
  // Create a contact
  const result = await client.request('tools/execute', {
    name: 'ghl_create_contact',
    arguments: {
      locationId: 'your_location_id',
      contactData: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      }
    }
  });
  
  console.log('Contact created:', result);
}
```

### Option 3: Direct API Integration (Without MCP)

If you prefer direct API calls without MCP, you can use the API client directly:

```javascript
// Extract the API client from the MCP server
import { GHLAPIClient } from './ghl-mcp-server/src/api-client.js';

const client = new GHLAPIClient();
const token = 'your_gohighlevel_token';

// Create contact directly
async function createContact() {
  const result = await client.createContact({
    locationId: 'your_location_id',
    contactData: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    },
    token: token
  });
  
  return JSON.parse(result.content[0].text);
}

// Send message directly
async function sendSMS() {
  const result = await client.sendMessage({
    type: 'SMS',
    contactId: 'contact_id',
    locationId: 'location_id',
    message: 'Hello from GoHighLevel!',
    token: token
  });
  
  return JSON.parse(result.content[0].text);
}
```

### Option 4: REST API Wrapper

Create a simple REST API wrapper for your application:

```javascript
import express from 'express';
import { GHLAPIClient } from './ghl-mcp-server/src/api-client.js';

const app = express();
const ghlClient = new GHLAPIClient();

app.use(express.json());

// Create contact endpoint
app.post('/api/contacts', async (req, res) => {
  try {
    const result = await ghlClient.createContact({
      locationId: req.body.locationId,
      contactData: req.body.contactData,
      token: process.env.GHL_PRIVATE_TOKEN
    });
    
    const data = JSON.parse(result.content[0].text);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message endpoint
app.post('/api/messages', async (req, res) => {
  try {
    const result = await ghlClient.sendMessage({
      type: req.body.type,
      contactId: req.body.contactId,
      locationId: req.body.locationId,
      message: req.body.message,
      token: process.env.GHL_PRIVATE_TOKEN
    });
    
    const data = JSON.parse(result.content[0].text);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('GHL API wrapper running on port 3000');
});
```

## Common Use Cases

### 1. Customer Support Automation
Use Claude Desktop with the MCP server to:
- Look up customer information
- Update contact details
- Send follow-up messages
- Schedule appointments

### 2. Sales Pipeline Management
- Create and update opportunities
- Move deals through pipeline stages
- Track deal values and assignments

### 3. Marketing Automation
- Add contacts to workflows
- Send bulk messages
- Tag and segment contacts

### 4. Appointment Scheduling
- Check calendar availability
- Book appointments
- Send appointment reminders

## Best Practices

1. **Security**: Never expose your GHL token in client-side code
2. **Rate Limiting**: The MCP server handles rate limits automatically
3. **Error Handling**: Always handle errors gracefully
4. **Logging**: Log API calls for debugging

## Example: Full Integration in Existing App

```javascript
// In your existing application
import { spawn } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class GoHighLevelService {
  constructor() {
    this.client = null;
  }
  
  async initialize() {
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['./ghl-mcp-server/index.js'],
      env: {
        ...process.env,
        GHL_PRIVATE_TOKEN: process.env.GHL_TOKEN
      }
    });
    
    this.client = new Client({
      name: 'app-ghl-client',
      version: '1.0.0'
    }, {
      capabilities: {}
    });
    
    await this.client.connect(transport);
  }
  
  async createContact(data) {
    const result = await this.client.request('tools/execute', {
      name: 'ghl_create_contact',
      arguments: {
        locationId: data.locationId,
        contactData: data
      }
    });
    
    return JSON.parse(result.content[0].text);
  }
  
  async sendMessage(type, contactId, message) {
    const result = await this.client.request('tools/execute', {
      name: 'ghl_send_message',
      arguments: {
        type,
        contactId,
        locationId: process.env.GHL_LOCATION_ID,
        message
      }
    });
    
    return JSON.parse(result.content[0].text);
  }
}

// Use in your app
const ghl = new GoHighLevelService();
await ghl.initialize();

// Now use it anywhere
const contact = await ghl.createContact({
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  locationId: 'your_location_id'
});
```

## Quick Start Checklist

- [ ] Copy the MCP server to your project or install it globally
- [ ] Set up your GHL token in environment variables
- [ ] Choose integration method (Claude Desktop, MCP Client, or Direct API)
- [ ] Test with a simple operation (e.g., search contacts)
- [ ] Implement error handling
- [ ] Add to your application workflow

## Need Help?

- Check the [README.md](../README.md) for tool documentation
- Review [src/api-client.js](../src/api-client.js) for available methods
- Test tools in Claude Desktop first to understand the data format