# -------- Build stage --------
FROM node:20-slim AS builder
WORKDIR /app

# 1. dependencies layer
COPY package*.json ./
RUN npm ci            

# 2. copy sources and build
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build     

# -------- Runtime stage ------
FROM node:20-slim      
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# pull compiled JS only
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
