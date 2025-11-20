# Build stage
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (regenerate lock file for Linux)
RUN rm -rf node_modules package-lock.json && \
    npm install && \
    npm cache clean --force

# Copy source code
COPY . .

# Build both client and server
RUN npm run build

# Production stage
FROM node:20-slim

# Install nginx
RUN apt-get update && \
    apt-get install -y nginx && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Copy the lock file from builder
COPY --from=builder /app/package-lock.json ./

# Install production dependencies only
RUN npm install --omit=dev && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy nginx configuration
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /app/dist/spa; \
    index index.html; \
    \
    # Serve static files \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Proxy API requests to Node.js backend \
    location /api/ { \
        proxy_pass http://localhost:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        proxy_cache_bypass $http_upgrade; \
    } \
    \
    # WebSocket support \
    location /socket.io/ { \
        proxy_pass http://localhost:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/sites-available/default

# Create startup script
RUN echo '#!/bin/bash\n\
node dist/server/node-build.mjs &\n\
nginx -g "daemon off;"' > /start.sh && chmod +x /start.sh

# Expose port
EXPOSE 80

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start both Node.js backend and nginx
CMD ["/start.sh"]
