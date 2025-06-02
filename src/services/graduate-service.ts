import { db } from "@/config/db";

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
    SELECT 
        r.round_number,
        f.id AS faculty_id,
        f.name AS faculty_name,
        rq.quota,
        COUNT(g.id) AS student_count
    FROM graduation_ceremony.round_quota rq
    JOIN graduation_ceremony.faculty f ON rq.faculty_id = f.id
    JOIN graduation_ceremony.graduation_round r ON rq.round_id = r.id
    LEFT JOIN graduation_ceremony.graduate g ON g.faculty_id = f.id
    GROUP BY r.round_number, f.id, f.name, rq.quota

    UNION ALL

    SELECT 
        NULL AS round_number,
        f.id AS faculty_id,
        f.name AS faculty_name,
        0 AS quota,
        COUNT(g.id) AS student_count
    FROM graduation_ceremony.faculty f
    LEFT JOIN graduation_ceremony.graduate g ON g.faculty_id = f.id AND g.round_id IS NULL
    WHERE f.id NOT IN (
        SELECT DISTINCT faculty_id FROM graduation_ceremony.round_quota
    )
    GROUP BY f.id, f.name
    ORDER BY round_number, faculty_name;
  `);

  // Grouping by round
  const grouped: Record<string, any[]> = {};

  for (const row of rows) {
    const title = row.round_number
      ? `รอบที่ ${row.round_number}`
      : "คณะที่ยังไม่ได้จัดรอบ";

    if (!grouped[title]) grouped[title] = [];

    grouped[title].push({
      id: row.faculty_id,
      name: row.faculty_name,
      value: row.quota,
      student_count: row.student_count,
    });
  }

  return Object.entries(grouped).map(([title, items]) => ({ title, items }));
};
