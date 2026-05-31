# Use official Node.js LTS for production
FROM node:20-alpine AS base
WORKDIR /app

# Copy package files separately to leverage Docker layer caching
COPY package.json package-lock.json ./
COPY .npmrc* ./

# Install dependencies (production and build)
RUN npm ci --ignore-scripts

# Copy the rest of the source code
COPY . .

# Build all TypeScript packages and Next.js app
RUN npm run build

# Expose the API port
ENV PORT=3001
EXPOSE 3001

# Default command runs the API server and worker
CMD [ "npm", "start" ]