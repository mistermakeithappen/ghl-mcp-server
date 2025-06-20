# Deploying GoHighLevel MCP Server to Vercel

## Important Note About MCP on Vercel

Vercel's serverless functions don't support WebSocket connections, which MCP typically uses. However, we've created two deployment options:

1. **REST API endpoints** - Full GoHighLevel functionality via HTTP
2. **HTTP-based MCP endpoint** - MCP-compatible but using HTTP instead of WebSocket

## Deployment Steps

### 1. Prepare Your Repository

```bash
# If you haven't already, initialize git
git init
git add .
git commit -m "Initial commit"

# Create a GitHub repository and push
git remote add origin https://github.com/yourusername/ghl-mcp-server.git
git push -u origin main
```

### 2. Set Up Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)

### 3. Environment Variables

In Vercel dashboard, go to Settings > Environment Variables and add:

```
GHL_PRIVATE_TOKEN = your_gohighlevel_private_token
GHL_DEFAULT_LOCATION = your_default_location_id (optional)
GHL_CLIENT_ID = your_oauth_client_id (optional)
GHL_CLIENT_SECRET = your_oauth_client_secret (optional)
GHL_WEBHOOK_SECRET = your_webhook_secret (optional)
```

### 4. Deploy

Click "Deploy" and Vercel will build and deploy your project.

## Available Endpoints After Deployment

Your Vercel deployment will provide these endpoints:

### REST API Endpoints

```
https://your-app.vercel.app/api/ghl/contacts          # POST - Create contact
https://your-app.vercel.app/api/ghl/contacts/search   # GET - Search contacts
https://your-app.vercel.app/api/ghl/messages          # POST - Send message
https://your-app.vercel.app/api/ghl/appointments      # POST - Create appointment
https://your-app.vercel.app/api/ghl/opportunities     # GET/POST - Opportunities
https://your-app.vercel.app/api/ghl/workflows/add-contact # POST - Add to workflow
```

### MCP HTTP Endpoint

```
https://your-app.vercel.app/api/mcp
```

## Using the Deployed API

### From Your Application

```javascript
// Example: Create a contact
const response = await fetch('https://your-app.vercel.app/api/ghl/contacts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    locationId: 'your_location_id'
  })
});

const result = await response.json();
console.log('Contact created:', result);
```

### Using the MCP HTTP Endpoint

```javascript
// List available tools
const toolsResponse = await fetch('https://your-app.vercel.app/api/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    method: 'tools/list',
    params: {}
  })
});

const tools = await toolsResponse.json();
console.log('Available tools:', tools);

// Execute a tool
const executeResponse = await fetch('https://your-app.vercel.app/api/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    method: 'tools/execute',
    params: {
      name: 'ghl_create_contact',
      arguments: {
        locationId: 'your_location_id',
        contactData: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com'
        }
      }
    }
  })
});

const result = await executeResponse.json();
console.log('Tool result:', result);
```

## Alternative: Deploy MCP Server Elsewhere

Since Vercel doesn't support WebSocket, consider these alternatives for full MCP functionality:

### 1. Railway.app
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### 2. Render.com
- Create a new Web Service
- Connect your GitHub repo
- Set environment variables
- Deploy

### 3. Fly.io
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly secrets set GHL_PRIVATE_TOKEN=your_token
fly deploy
```

### 4. Self-hosted (VPS)
```bash
# On your VPS
git clone https://github.com/yourusername/ghl-mcp-server.git
cd ghl-mcp-server
npm install
npm start
```

## Using Vercel Edge Functions (Experimental)

For WebSocket support, you can try Vercel Edge Functions:

```javascript
// api/mcp-edge.js
export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // Edge function implementation
  // Note: Still experimental for WebSocket
}
```

## Monitoring and Logs

1. **Vercel Dashboard**: View function logs, errors, and usage
2. **Custom Logging**: Add logging service integration
3. **Error Tracking**: Integrate Sentry or similar

## Security Best Practices

1. **Never commit tokens**: Use environment variables
2. **Enable CORS**: Configure allowed origins
3. **Rate Limiting**: The server includes built-in rate limiting
4. **API Keys**: Consider adding API key authentication for your endpoints

## Testing Your Deployment

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Test creating a contact
curl -X POST https://your-app.vercel.app/api/ghl/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "locationId": "your_location_id"
  }'
```

## Troubleshooting

1. **Function Timeout**: Vercel has a 10-second timeout for serverless functions
2. **Cold Starts**: First request may be slower
3. **Environment Variables**: Make sure all required vars are set
4. **CORS Issues**: Check your CORS configuration

## Cost Considerations

- Vercel Free Tier: 100GB bandwidth, 100K function invocations
- Monitor usage in Vercel dashboard
- Consider caching for frequently accessed data