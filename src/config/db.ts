import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

try {
  const [rows] = await db.query("SELECT 1");
  console.log("✅ Database connected successfully!");
} catch (err) {
  console.error("❌ Database connection failed:", err);
}
