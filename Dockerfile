# Single-stage Dockerfile: build **and** run in the same image
FROM node:20-slim

WORKDIR /

# 1️⃣  Copy dependency manifests first for better layer caching
COPY package*.json ./
COPY tsconfig*.json ./

# 2️⃣  Install **all** deps (dev + prod) so we can compile TypeScript
RUN npm install && npm cache clean --force

# 3️⃣  Copy the rest of the source
COPY . .

# 4️⃣  Build TypeScript, then remove dev-only deps to slim the image
RUN npm run build \
 && npm prune --production

EXPOSE 3000
CMD ["npm", "run", "dev"]
