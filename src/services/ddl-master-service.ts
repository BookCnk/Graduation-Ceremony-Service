// services/dropdown-service.ts
import { db } from "../config/db";

export const getFaculty = async () => {
  const [rows]: any = await db.query(
    "SELECT id, name, faculty_code FROM faculty ORDER BY id ASC"
  );
  return rows;
};
