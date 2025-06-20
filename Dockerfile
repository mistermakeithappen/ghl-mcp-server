FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy all files
COPY . .

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the MCP server
CMD ["node", "index.js"]