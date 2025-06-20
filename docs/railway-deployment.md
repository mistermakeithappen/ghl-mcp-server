# Deploying GoHighLevel MCP Server to Railway

Railway is perfect for MCP servers because it supports:
- ✅ WebSocket connections (full MCP support)
- ✅ Persistent services
- ✅ Easy environment variables
- ✅ Automatic SSL/HTTPS
- ✅ GitHub integration

## Quick Deploy to Railway

### Option 1: Deploy via Railway Button (Easiest)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/YOUR_TEMPLATE)

### Option 2: Deploy via CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize new project
railway init

# Link to your project (or create new)
railway link

# Set environment variables
railway variables set GHL_PRIVATE_TOKEN=your_gohighlevel_token
railway variables set GHL_DEFAULT_LOCATION=your_location_id

# Deploy
railway up

# Get your deployment URL
railway open
```

### Option 3: Deploy via GitHub

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - GoHighLevel MCP Server"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ghl-mcp-server.git
   git push -u origin main
   ```

2. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Node.js and deploy

3. **Configure Environment Variables**:
   - Go to your project settings
   - Click on "Variables"
   - Add:
     ```
     GHL_PRIVATE_TOKEN=your_gohighlevel_token
     GHL_DEFAULT_LOCATION=your_location_id (optional)
     GHL_CLIENT_ID=your_oauth_client_id (optional)
     GHL_CLIENT_SECRET=your_oauth_client_secret (optional)
     ```

## Using Your Railway Deployment

### For MCP (with Claude Desktop or other MCP clients)

Once deployed, update your MCP client configuration:

```json
{
  "mcpServers": {
    "ghl": {
      "url": "wss://your-app.railway.app",
      "transport": "websocket"
    }
  }
}
```

Or if Railway provides an HTTP URL:

```json
{
  "mcpServers": {
    "ghl": {
      "url": "https://your-app.railway.app/mcp",
      "transport": "http"
    }
  }
}
```

### For REST API Access

Your Railway deployment also provides REST endpoints:

```javascript
const RAILWAY_URL = 'https://your-app.railway.app';

// Create contact
const response = await fetch(`${RAILWAY_URL}/api/ghl/contacts`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    locationId: 'your_location_id'
  })
});
```

## Railway-Specific Features

### 1. **Custom Domain**
```bash
# Add custom domain
railway domain add yourdomain.com
```

### 2. **Scaling**
Railway automatically scales your service based on usage.

### 3. **Monitoring**
- View logs: `railway logs`
- View metrics in Railway dashboard
- Set up alerts for errors

### 4. **Database (if needed)**
```bash
# Add PostgreSQL
railway add postgresql

# Access database
railway connect postgresql
```

## Environment Variables on Railway

Set these in your Railway project:

| Variable | Description | Required |
|----------|-------------|----------|
| `GHL_PRIVATE_TOKEN` | Your GoHighLevel private integration token | Yes |
| `GHL_DEFAULT_LOCATION` | Default location ID for operations | No |
| `GHL_CLIENT_ID` | OAuth client ID (for OAuth flow) | No |
| `GHL_CLIENT_SECRET` | OAuth client secret | No |
| `GHL_WEBHOOK_SECRET` | Webhook signature verification secret | No |
| `PORT` | Port number (Railway sets this automatically) | Auto |

## Testing Your Railway Deployment

```bash
# Check if server is running
curl https://your-app.railway.app/health

# Test MCP endpoint
curl -X POST https://your-app.railway.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/list",
    "params": {}
  }'

# Test creating a contact
curl -X POST https://your-app.railway.app/api/ghl/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "locationId": "your_location_id"
  }'
```

## Troubleshooting

### 1. **Build Failures**
- Check Railway build logs
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### 2. **WebSocket Connection Issues**
- Railway supports WebSocket by default
- Ensure your client uses `wss://` for secure WebSocket
- Check CORS settings if connecting from browser

### 3. **Environment Variables Not Working**
- Variables are case-sensitive
- Restart service after adding variables
- Use `railway variables` to list current vars

### 4. **High Memory Usage**
- Railway provides metrics dashboard
- Consider implementing caching
- Optimize concurrent request handling

## Cost Optimization

Railway pricing tips:
- **Free tier**: $5 credit monthly
- **Hobby plan**: $5/month flat fee
- **Usage-based**: Pay for what you use
- **Sleep on inactivity**: Service sleeps when not in use (Hobby plan)

## CI/CD with Railway

Railway automatically deploys when you push to GitHub:

```yaml
# .github/workflows/railway.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: ghl-mcp-server
```

## Monitoring and Logs

```bash
# View real-time logs
railway logs

# View last 100 lines
railway logs -n 100

# Follow logs
railway logs -f
```

## Next Steps

1. Deploy your server
2. Test all endpoints
3. Configure your MCP client
4. Set up monitoring
5. Add custom domain (optional)

Railway provides the best experience for MCP servers with full WebSocket support!