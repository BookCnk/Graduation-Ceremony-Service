FROM oven/bun:1.0

WORKDIR /app

COPY package.json .
COPY package-lock.json* .
COPY bun.lockb* .

RUN bun install

COPY . .

EXPOSE 3000

CMD ["bun", "run", "dev"]
