# 📄 Dockerfile
FROM node:22                                

WORKDIR /app

# 1️⃣ ติดตั้ง npm 9.x (หลบ bug idealTree ของ npm 10.x)
RUN npm install -g npm@9.9.3

# 2️⃣ คัดลอกไฟล์ lock ก่อน เพื่อใช้ layer cache ได้เต็มที่
COPY package*.json ./

# 3️⃣ สั่ง clean cache แล้วใช้ npm ci (เร็วกว่า/เสถียรกว่า npm install)
RUN npm cache clean --force \
 && npm ci --omit=dev      
# 4️⃣ คัดลอกซอร์สโค้ดทั้งหมด
COPY . .

# 👉 (ถ้าเป็น TypeScript production):
# RUN npm run build     # สร้าง dist/ ก่อนรันจริง

EXPOSE 3000

CMD ["npm", "start"]     # หรือ ["node","dist/index.js"] ถ้าคุณ build ออก JS แล้ว
