import { db } from "../config/db";

export const getGraduatesByFacultyPaginated = async (
  facultyId: number,
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: any[]; total: number; page: number; pageSize: number }> => {
  const offset = (page - 1) * pageSize;

  const result1 = await db.query(
    `
    SELECT 
        g.id,
        g.prefix,
        g.first_name,
        g.last_name,
        g.degree_level,
        g.degree_name,
        f.name AS faculty_name,
        g.sequence,
        gr.round_number,
        gr.description AS round_description
    FROM graduation_ceremony.graduate g
    JOIN graduation_ceremony.faculty f ON g.faculty_id = f.id
    LEFT JOIN graduation_ceremony.graduation_round gr ON g.round_id = gr.id
    WHERE g.faculty_id = ?
    ORDER BY gr.round_number, f.name, g.sequence
    LIMIT ? OFFSET ?
    `,
    [facultyId, pageSize, offset]
  );

  const rows = (result1 as any[])[0];

  const result2 = await db.query(
    `SELECT COUNT(*) as total FROM graduation_ceremony.graduate WHERE faculty_id = ?`,
    [facultyId]
  );
  const total = (result2 as any[])[0][0].total;

  return {
    data: rows,
    total,
    page,
    pageSize,
  };
};

export const getGroupedQuotaByRound = async () => {
  const [rows]: any = await db.query(`
    -- 🔹 ข้อมูลคณะที่จัดรอบแล้ว + นับเฉพาะคนที่ยังไม่ถูกจัดรอบ
    SELECT 
        r.round_number,
        f.id AS faculty_id,
        f.name AS faculty_name,
        rq.quota,
        COUNT(g.id) AS student_count
    FROM graduation_ceremony.round_quota rq
    JOIN graduation_ceremony.faculty f ON rq.faculty_id = f.id
    JOIN graduation_ceremony.graduation_round r ON rq.round_id = r.id
    LEFT JOIN graduation_ceremony.graduate g 
        ON g.faculty_id = f.id AND g.round_id IS NULL
    GROUP BY r.round_number, f.id, f.name, rq.quota

    UNION ALL

    -- 🔹 ข้อมูล "เฉพาะ" คณะที่ยังไม่อยู่ใน round_quota
    SELECT 
        NULL AS round_number,
        f.id AS faculty_id,
        f.name AS faculty_name,
        0 AS quota,
        COUNT(g.id) AS student_count
    FROM graduation_ceremony.faculty f
    LEFT JOIN graduation_ceremony.graduate g 
        ON g.faculty_id = f.id AND g.round_id IS NULL
    WHERE f.id NOT IN (
        SELECT DISTINCT faculty_id FROM graduation_ceremony.round_quota
    )
    GROUP BY f.id, f.name

    UNION ALL

    -- 🔹 ดึง "เฉพาะคณะที่มีนักศึกษายังไม่ได้จัดรอบ" ซ้ำอีกรอบเพื่อแสดงใน "ยังไม่จัดรอบ"
    SELECT 
        NULL AS round_number,
        f.id AS faculty_id,
        f.name AS faculty_name,
        0 AS quota,
        COUNT(g.id) AS student_count
    FROM graduation_ceremony.faculty f
    JOIN graduation_ceremony.graduate g 
        ON g.faculty_id = f.id AND g.round_id IS NULL
    WHERE f.id IN (
        SELECT DISTINCT faculty_id FROM graduation_ceremony.round_quota
    )
    GROUP BY f.id, f.name

    ORDER BY faculty_id;
  `);

  // ✅ Grouping โดยแยกตามรอบ
  const grouped: Record<string, any[]> = {};

  for (const row of rows) {
    const title = row.round_number
      ? `รอบที่ ${row.round_number}`
      : "คณะที่ยังไม่ได้จัดรอบ";

    if (!grouped[title]) grouped[title] = [];

    // ป้องกันข้อมูลซ้ำในรายการ "คณะที่ยังไม่ได้จัดรอบ"
    const isDuplicate = grouped[title].some(
      (item) => item.id === row.faculty_id
    );

    // ✅ ถ้าอยู่ในหมวด "คณะที่ยังไม่ได้จัดรอบ" และยังไม่เคยเพิ่ม ก็เพิ่ม
    if (title === "คณะที่ยังไม่ได้จัดรอบ" && isDuplicate) continue;

    grouped[title].push({
      id: row.faculty_id,
      name: row.faculty_name,
      value: row.quota,
      student_count: row.student_count,
    });
  }

  return Object.entries(grouped).map(([title, items]) => ({ title, items }));
};

interface QuotaFaculty {
  faculty_id: number;
  quota: number;
}

interface QuotaGroupPayload {
  round: number;
  faculties: QuotaFaculty[];
}

export const insertQuotaData = async (
  payload: QuotaGroupPayload[]
): Promise<{ success: boolean }> => {
  // 🔍 รอบทั้งหมดที่ผู้ใช้ส่งมา
  const incomingRounds = payload.map((g) => g.round);

  // 🧹 ลบรอบที่ "ไม่ได้อยู่ใน payload"
  if (incomingRounds.length > 0) {
    const placeholders = incomingRounds.map(() => "?").join(",");
    const [rows]: any = await db.query(
      `SELECT id FROM graduation_ceremony.graduation_round 
       WHERE round_number NOT IN (${placeholders})`,
      incomingRounds
    );

    const roundIdsToDelete = rows.map((r: any) => r.id);

    if (roundIdsToDelete.length > 0) {
      // ลบ quota เดิม
      await db.query(
        `DELETE FROM graduation_ceremony.round_quota 
         WHERE round_id IN (${roundIdsToDelete.map(() => "?").join(",")})`,
        roundIdsToDelete
      );

      // ล้าง graduate.round_id
      await db.query(
        `UPDATE graduation_ceremony.graduate 
         SET round_id = NULL 
         WHERE round_id IN (${roundIdsToDelete.map(() => "?").join(",")})`,
        roundIdsToDelete
      );

      // ลบ round ออกจากระบบ
      await db.query(
        `DELETE FROM graduation_ceremony.graduation_round 
         WHERE id IN (${roundIdsToDelete.map(() => "?").join(",")})`,
        roundIdsToDelete
      );
    }
  } else {
    // ✅ ถ้า payload = [] → ลบทุกอย่าง
    const [rows]: any = await db.query(
      `SELECT id FROM graduation_ceremony.graduation_round`
    );

    const allRoundIds = rows.map((r: any) => r.id);

    if (allRoundIds.length > 0) {
      await db.query(
        `DELETE FROM graduation_ceremony.round_quota 
         WHERE round_id IN (${allRoundIds.map(() => "?").join(",")})`,
        allRoundIds
      );
      await db.query(
        `UPDATE graduation_ceremony.graduate 
         SET round_id = NULL 
         WHERE round_id IN (${allRoundIds.map(() => "?").join(",")})`,
        allRoundIds
      );
      await db.query(
        `DELETE FROM graduation_ceremony.graduation_round 
         WHERE id IN (${allRoundIds.map(() => "?").join(",")})`,
        allRoundIds
      );
    }

    return { success: true };
  }

  // ✅ ทำงานตามรอบที่ส่งเข้ามา
  for (const group of payload) {
    // 🔍 ตรวจรอบ
    const [existingRounds]: any = await db.query(
      `SELECT id FROM graduation_ceremony.graduation_round 
       WHERE round_number = ?`,
      [group.round]
    );

    let roundId: number;

    if (existingRounds.length > 0) {
      roundId = existingRounds[0].id;
    } else {
      // ไม่มี faculty → ไม่ต้องสร้างรอบใหม่
      if (!group.faculties || group.faculties.length === 0) continue;

      const [inserted]: any = await db.query(
        `INSERT INTO graduation_ceremony.graduation_round 
         (round_number, max_capacity, description)
         VALUES (?, ?, ?)`,
        [group.round, 100, `รอบที่ ${group.round}`]
      );
      roundId = inserted.insertId;
    }

    // 🧹 ล้างข้อมูลเดิมของรอบนี้
    await db.query(
      `DELETE FROM graduation_ceremony.round_quota 
       WHERE round_id = ?`,
      [roundId]
    );
    await db.query(
      `UPDATE graduation_ceremony.graduate 
       SET round_id = NULL 
       WHERE round_id = ?`,
      [roundId]
    );

    // ⛔ ไม่มี faculty → จบแค่นี้
    if (!group.faculties || group.faculties.length === 0) continue;

    // 🔁 เพิ่ม quota ใหม่
    for (const faculty of group.faculties) {
      await db.query(
        `INSERT INTO graduation_ceremony.round_quota 
         (round_id, faculty_id, quota)
         VALUES (?, ?, ?)`,
        [roundId, faculty.faculty_id, faculty.quota]
      );

      // 🔁 จัดนักศึกษาเข้ารอบตามลำดับ sequence
      const [graduatesToUpdate]: any = await db.query(
        `SELECT id FROM graduation_ceremony.graduate
         WHERE faculty_id = ? AND round_id IS NULL
         ORDER BY sequence ASC
         LIMIT ?`,
        [faculty.faculty_id, faculty.quota]
      );

      if (graduatesToUpdate.length > 0) {
        const ids = graduatesToUpdate.map((g: any) => g.id);
        await db.query(
          `UPDATE graduation_ceremony.graduate 
           SET round_id = ?
           WHERE id IN (${ids.map(() => "?").join(",")})`,
          [roundId, ...ids]
        );
      }
    }
  }

  return { success: true };
};

interface QuotaSummary {
  round_number: number;
  faculty_id: number;
  faculty_name: string;
  quota: number;
  assigned: number;
  remaining: number;
}

export const getQuotaSummaryByRound = async (): Promise<QuotaSummary[]> => {
  const [rows]: any = await db.query(`
    SELECT 
        r.round_number,
        f.id AS faculty_id,
        f.name AS faculty_name,
        rq.quota,
        COUNT(g.id) AS assigned,
        rq.quota - COUNT(g.id) AS remaining
    FROM graduation_ceremony.round_quota rq
    JOIN graduation_ceremony.graduation_round r ON r.id = rq.round_id
    JOIN graduation_ceremony.faculty f ON f.id = rq.faculty_id
    LEFT JOIN graduation_ceremony.graduate g 
        ON g.round_id = rq.round_id AND g.faculty_id = rq.faculty_id
    GROUP BY r.round_number, f.id, f.name, rq.quota
    ORDER BY r.round_number, f.id;
  `);

  return rows as QuotaSummary[];
};

export const getRemainingNotReceivedByEarliestRound = async (): Promise<{
  round_number: number;
  remaining_not_received: number;
} | null> => {
  const [rows]: any = await db.query(`
    SELECT r.round_number, COUNT(*) AS remaining_not_received
    FROM graduation_ceremony.graduate g
    JOIN graduation_ceremony.graduation_round r
      ON g.round_id = r.id
    WHERE g.has_received_card = 0
      AND r.round_number = (
        SELECT MIN(r2.round_number)
        FROM graduation_ceremony.graduate g2
        JOIN graduation_ceremony.graduation_round r2
          ON g2.round_id = r2.id
        WHERE g2.has_received_card = 0
          AND g2.round_id IS NOT NULL
      )
    GROUP BY r.round_number;
  `);

  return rows.length > 0 ? rows[0] : null;
};

export const getFirstGraduateNotReceivedInEarliestRound = async (): Promise<{
  id: number;
  prefix: string;
  first_name: string;
  last_name: string;
  sequence: number;
  degree_name: string;
  faculty_name: string;
  round_number: number;
} | null> => {
  const [rows]: any = await db.query(`
    SELECT 
      g.id,
      g.prefix,
      g.first_name,
      g.last_name,
      g.sequence,
      g.degree_name,
      f.name AS faculty_name,
      r.round_number
    FROM graduation_ceremony.graduate g
    JOIN graduation_ceremony.graduation_round r
      ON g.round_id = r.id
    JOIN graduation_ceremony.faculty f
      ON g.faculty_id = f.id
    WHERE g.has_received_card = 0
      AND r.round_number = (
        SELECT MIN(r2.round_number)
        FROM graduation_ceremony.graduate g2
        JOIN graduation_ceremony.graduation_round r2 ON g2.round_id = r2.id
        WHERE g2.has_received_card = 0
      )
    ORDER BY g.id ASC
    LIMIT 1;
  `);

  return rows.length > 0 ? rows[0] : null;
};

export const getRoundCallSummary = async (): Promise<{
  current_round: number;
  total_in_round: number;
  already_called: number;
  remaining: number;
  latest_called_sequence: number | null;
  total_all_rounds: number;
} | null> => {
  const [rows]: any = await db.query(`
    SELECT 
      r.round_number AS current_round,
      COUNT(*) AS total_in_round,
      SUM(CASE WHEN g.has_received_card = 1 THEN 1 ELSE 0 END) AS already_called,
      SUM(CASE WHEN g.has_received_card = 0 THEN 1 ELSE 0 END) AS remaining,
      MAX(CASE WHEN g.has_received_card = 1 THEN g.sequence ELSE NULL END) AS latest_called_sequence,
      (SELECT COUNT(*) FROM graduation_ceremony.graduate WHERE round_id IS NOT NULL) AS total_all_rounds
    FROM graduation_ceremony.graduate g
    JOIN graduation_ceremony.graduation_round r ON g.round_id = r.id
    WHERE r.round_number = (
      SELECT MIN(r2.round_number)
      FROM graduation_ceremony.graduate g2
      JOIN graduation_ceremony.graduation_round r2 ON g2.round_id = r2.id
      WHERE g2.has_received_card = 0
    )
    GROUP BY r.round_number;
  `);

  return rows.length > 0 ? rows[0] : null;
};

export const getNextGraduatesAfterFirst = async (): Promise<any[]> => {
  const [rows]: any = await db.query(`
    SELECT 
      g.id,
      g.sequence,
      g.prefix,
      g.first_name,
      g.last_name,
      g.faculty_id,
      f.name AS faculty_name,
      r.round_number
    FROM graduation_ceremony.graduate g
    JOIN graduation_ceremony.faculty f ON g.faculty_id = f.id
    JOIN graduation_ceremony.graduation_round r ON g.round_id = r.id
    WHERE g.has_received_card = 0
      AND g.round_id = (
        SELECT r2.id
        FROM graduation_ceremony.graduate g2
        JOIN graduation_ceremony.graduation_round r2 ON g2.round_id = r2.id
        WHERE g2.has_received_card = 0
        ORDER BY r2.round_number ASC
        LIMIT 1
      )
      AND g.sequence > (
        SELECT COALESCE(MAX(g3.sequence), 0)
        FROM graduation_ceremony.graduate g3
        WHERE g3.has_received_card = 1
          AND g3.round_id = (
            SELECT r2.id
            FROM graduation_ceremony.graduate g2
            JOIN graduation_ceremony.graduation_round r2 ON g2.round_id = r2.id
            WHERE g2.has_received_card = 0
            ORDER BY r2.round_number ASC
            LIMIT 1
          )
      )
    ORDER BY g.faculty_id ASC, g.sequence ASC
    LIMIT 2 OFFSET 1;
  `);

  return rows;
};

export const setGraduateAsReceived = async (
  id: number
): Promise<{ success: boolean }> => {
  await db.query(
    `UPDATE graduation_ceremony.graduate
     SET has_received_card = 1
     WHERE id = ?`,
    [id]
  );

  return { success: true };
};

export const resetReceivedCards = async (): Promise<{ success: boolean }> => {
  const [result]: any = await db.query(
    `UPDATE graduation_ceremony.graduate 
     SET has_received_card = 0 
     WHERE has_received_card = 1`
  );

  return { success: result.affectedRows > 0 };
};
