FROM node:20-alpine

WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose API port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
