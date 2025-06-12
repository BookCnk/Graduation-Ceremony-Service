FROM node:22

WORKDIR /

COPY . .

RUN npm install

EXPOSE 3000

CMD ["node", "index.ts"]
