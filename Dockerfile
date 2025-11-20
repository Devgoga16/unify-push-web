# Build stage
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install with all dependencies (including optional like @rollup/rollup-linux-x64-gnu)
# This fixes the Rollup native module issue in Linux containers
RUN rm -rf node_modules package-lock.json && \
    npm install && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build
# -------------------------------------------------------------

# Production stage
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Copy the synchronized package-lock.json from builder stage
COPY --from=builder /app/package-lock.json ./

# Install production dependencies only
# Use npm install instead of npm ci since the lock file was generated in builder stage
RUN npm install --omit=dev && npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy necessary files
COPY --from=builder /app/.env.example ./.env.example

# Create a non-root user
RUN addgroup --system nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nodejs

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]