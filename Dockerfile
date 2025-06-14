FROM node:22-slim

WORKDIR /

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install && npm cache clean --force

COPY . .

RUN npm run build \
 && npm prune --production

EXPOSE 3000
CMD ["npm", "start"]
