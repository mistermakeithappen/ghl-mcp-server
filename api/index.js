// Vercel API endpoint for MCP Server
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { WebSocketServerTransport } from '@modelcontextprotocol/sdk/server/websocket.js';
import { createGHLAPIServer } from '../examples/api-backend.js';

// For HTTP endpoints (REST API)
const app = createGHLAPIServer();

// Main handler for Vercel
export default async function handler(req, res) {
  // Handle WebSocket upgrade for MCP
  if (req.headers.upgrade === 'websocket') {
    // Note: Vercel doesn't support WebSocket in serverless functions
    // You'll need to use Vercel's Edge Functions or a different approach
    return res.status(501).json({ 
      error: 'WebSocket not supported in Vercel Serverless Functions',
      solution: 'Use the REST API endpoints or deploy to a WebSocket-compatible service'
    });
  }
  
  // Handle regular HTTP requests
  return app(req, res);
}