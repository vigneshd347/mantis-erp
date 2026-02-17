
# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies
# Note: specific flag --production might skip devDependencies needed for build (tsc)
# So we install all, build, then maybe prune. For simplicity, just install all.
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies (optional optimization)
# RUN npm prune --production

# Expose API Port
EXPOSE 8000

# Start command
CMD ["npm", "start"]
