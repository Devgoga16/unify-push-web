# Build stage
# 🛑 CAMBIO CLAVE: Usar 'slim' en lugar de 'alpine' para compatibilidad con Rollup
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files (package.json, package-lock.json, etc.)
COPY package*.json ./

# Instalar todas las dependencias y forzar la sincronización del lock file.
# Mantenemos 'npm install' para evitar el error de sincronización de lock file anterior.
RUN npm install && npm cache clean --force 

# Copy source code
COPY . .

# Build the application
RUN npm run build
# -------------------------------------------------------------

# Production stage
# 🛑 CAMBIO CLAVE: Usar 'slim' en lugar de 'alpine' en la etapa de producción
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files (Copia el package.json original)
COPY package.json ./

# Copiar el package-lock.json SINCRONIZADO desde la etapa 'builder'. 
COPY --from=builder /app/package-lock.json ./

# Usar npm ci para producción (Ahora funcionará con el lock file sincronizado)
# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy necessary files
COPY --from=builder /app/.env.example ./.env.example

# Create a non-root user (Este paso puede requerir instalar 'shadow' en Debian, 
# pero la mayoría de las veces funciona directamente con 'slim')
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