# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build
# (Optional) Run server build if you have a separate build step, currently it echoes
RUN npm run server:build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server ./server
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/install-server.js ./

# Copy media directories if they exist (adjust based on your actual structure)
COPY --from=builder /app/IPL_Player_Photos ./IPL_Player_Photos
COPY --from=builder /app/Logos ./Logos
COPY --from=builder /app/"Player Video" ./"Player Video"
COPY --from=builder /app/"Team videos" ./"Team videos"

# Create a volume directory for sqlite if needed, though usually handled by platform
RUN mkdir -p server/database

# Expose ports
EXPOSE 3000
EXPOSE 5000

# Start command
CMD ["npm", "run", "start"]