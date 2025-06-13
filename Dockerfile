FROM oven/bun:1.0.29

WORKDIR /

# คัดลอกเฉพาะ dependency files ก่อน (ช่วยให้ Docker build เร็วขึ้น)
COPY package.json bun.lockb ./

# ติดตั้ง dependencies ด้วย bun
RUN bun install --no-progress

# คัดลอก source code ทั้งหมด
COPY . .

EXPOSE 3000

CMD ["bun", "run", "--watch", "index.ts"]
