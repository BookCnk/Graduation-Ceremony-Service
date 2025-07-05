// services/dropdown-service.ts
import { db } from "../config/db";

export const getFaculty = async () => {
  const [rows]: any = await db.query(
    "SELECT id, name FROM faculty ORDER BY id ASC"
  );
  return rows;
};

export const createFaculty = async (id: number, name: string) => {
  await db.query(
    `INSERT INTO graduation_ceremony.faculty (id, name) VALUES (?, ?)`,
    [id, name]
  );
};

export const deleteFaculty = async (id: number) => {
  await db.query(`DELETE FROM graduation_ceremony.faculty WHERE id = ?`, [id]);
};

export const createRoundQuota = async (
  id: number,
  round_id: number,
  faculty_id: number,
  quota: number
) => {
  await db.query(
    `
    INSERT INTO graduation_ceremony.round_quota 
      (id, round_id, faculty_id, quota) 
    VALUES (?, ?, ?, ?)
  `,
    [id, round_id, faculty_id, quota]
  );
};

export const createGraduate = async (
  id: number,
  prefix: string,
  first_name: string,
  last_name: string,
  degree_level: string,
  degree_name: string,
  faculty_id: number,
  sequence: number,
  round_id: number,
  has_received_card: number = 0, // default เป็น 0
  graduate_type: string | null = null, // เพิ่ม field graduate_type
  global_sequence: number // เพิ่ม field graduate_type
) => {
  await db.query(
    `
    INSERT INTO graduation_ceremony.graduate
      (id, prefix, first_name, last_name, degree_level, degree_name, faculty_id, sequence, round_id, has_received_card, graduate_type,global_sequence)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
    `,
    [
      id,
      prefix,
      first_name,
      last_name,
      degree_level,
      degree_name,
      faculty_id,
      sequence,
      round_id,
      has_received_card,
      graduate_type,
      global_sequence,
    ]
  );
};
