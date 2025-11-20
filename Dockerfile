# Build stage
# Mantenemos 'slim' ya que es más compatible que 'alpine'
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files (package.json, package-lock.json, etc.)
COPY package*.json ./

# 🛑 SOLUCIÓN CLAVE: Usamos 'npm ci' para la coherencia (ya que el lock file está ahora sincronizado), 
# y la bandera '--include=optional' para forzar a Rollup a instalar su binario nativo.
RUN npm ci --include=optional && npm cache clean --force 

# Copy source code
COPY . .

# Build the application
RUN npm run build
# -------------------------------------------------------------

# Production stage
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files (Copia el package.json original)
COPY package.json ./

# Copiar el package-lock.json SINCRONIZADO desde la etapa 'builder'. 
COPY --from=builder /app/package-lock.json ./

# Usar npm ci para producción (Mantenemos --only=production)
# Nota: Los binarios opcionales ya no son un problema aquí, ya que Rollup es una devDependency.
RUN npm ci --only=production && npm cache clean --force

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