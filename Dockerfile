FROM node:22

# Create app directory
WORKDIR /

# Copy package files separately for better caching

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Install ts-node and typescript globally (optional, can be local too)
RUN npm install -g ts-node typescript

# Expose the app port
EXPOSE 3000

# Run with ts-node
CMD ["ts-node", "index.ts"]
