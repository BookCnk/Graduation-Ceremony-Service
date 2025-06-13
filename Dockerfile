FROM oven/bun:1.0.29

WORKDIR /app

# copy manifest + lock (ไม่ว่าไฟล์ไหนจะมีอยู่)
COPY package.json bun.lock* ./

RUN bun install --no-progress

COPY . .

EXPOSE 3000

# ✅ เปิด safe mode เพื่อหลีกเลี่ยง AVX/JIT
ENV BUN_DISABLE_JIT=1

# ✅ รัน Bun หลังจากตั้ง ENV
CMD ["bun", "run", "index.ts"]
