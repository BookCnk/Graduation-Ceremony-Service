import { db } from "../config/db";

export const getCurrentRoundOverview = async (): Promise<any | null> => {
  const [rows]: any = await db.query(`
    WITH earliest_round AS (
      SELECT MIN(r2.round_number) AS min_round
      FROM graduation_ceremony.graduate g2
      JOIN graduation_ceremony.graduation_round r2 ON g2.round_id = r2.id
      WHERE g2.has_received_card = 0 AND g2.round_id IS NOT NULL
    ),
    current_round AS (
      SELECT r.id, r.round_number
      FROM graduation_ceremony.graduation_round r
      JOIN earliest_round er ON r.round_number = er.min_round
    ),
    round_quota_total AS (
      SELECT rq.round_id, SUM(rq.quota) AS total_quota
      FROM graduation_ceremony.round_quota rq
      GROUP BY rq.round_id
    ),
    graduate_summary AS (
      SELECT
        g.round_id,
        COUNT(CASE WHEN g.has_received_card = 1 THEN 1 END) AS called_count,
        COUNT(CASE WHEN g.has_received_card = 0 THEN 1 END) AS remaining_count
      FROM graduation_ceremony.graduate g
      JOIN current_round cr ON g.round_id = cr.id
      GROUP BY g.round_id
    ),
    current_calling AS (
      SELECT 
        g.id, g.first_name, g.last_name, g.sequence, g.round_id,
        g.faculty_id
      FROM graduation_ceremony.graduate g
      JOIN current_round cr ON g.round_id = cr.id
      WHERE g.has_received_card = 0
      ORDER BY g.global_sequence ASC
      LIMIT 1
    ),
    current_faculty_quota AS (
      SELECT 
        g.faculty_id,
        COUNT(*) AS total_students
      FROM graduation_ceremony.graduate g
      JOIN current_calling cc ON g.faculty_id = cc.faculty_id
      GROUP BY g.faculty_id
    ),
    current_faculty_called AS (
      SELECT 
        g.faculty_id,
        COUNT(*) AS called_count
      FROM graduation_ceremony.graduate g
      JOIN current_calling cc ON g.faculty_id = cc.faculty_id
      WHERE g.has_received_card = 1
      GROUP BY g.faculty_id
    )

    SELECT 
      cr.round_number,
      rq.total_quota AS total_capacity,
      gs.called_count,
      gs.remaining_count,
      COALESCE(cc.id, 0) AS current_calling_id,
      COALESCE(cc.sequence, 0) AS current_calling_sequence,
      COALESCE(f.name, '') AS current_faculty_name,
      COALESCE(cfq.total_students, 0) AS current_faculty_quota,
      COALESCE(cfc.called_count, 0) AS current_faculty_called,
      COALESCE(cfq.total_students, 0) - COALESCE(cfc.called_count, 0) AS current_faculty_remaining
    FROM current_round cr
    JOIN round_quota_total rq ON rq.round_id = cr.id
    JOIN graduate_summary gs ON gs.round_id = cr.id
    LEFT JOIN current_calling cc ON cc.round_id = cr.id
    LEFT JOIN graduation_ceremony.faculty f ON f.id = cc.faculty_id
    LEFT JOIN current_faculty_quota cfq ON cfq.faculty_id = cc.faculty_id
    LEFT JOIN current_faculty_called cfc ON cfc.faculty_id = cc.faculty_id;
  `);

  // ✅ Ensure something is returned even if no rows found
  if (rows.length > 0) return rows[0];
  return {
    round_number: 0,
    total_capacity: 0,
    called_count: 0,
    remaining_count: 0,
    current_calling_id: 0,
    current_calling_sequence: 0,
    current_faculty_name: "",
    current_faculty_quota: 0,
    current_faculty_called: 0,
    current_faculty_remaining: 0,
  };
};

