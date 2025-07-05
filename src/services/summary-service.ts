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
        rq.round_id, rq.faculty_id, rq.quota
      FROM graduation_ceremony.round_quota rq
      JOIN current_calling cc ON cc.round_id = rq.round_id AND cc.faculty_id = rq.faculty_id
    ),
    current_faculty_summary AS (
      SELECT 
        g.round_id,
        g.faculty_id,
        COUNT(*) AS faculty_called_count
      FROM graduation_ceremony.graduate g
      JOIN current_calling cc 
        ON g.round_id = cc.round_id AND g.faculty_id = cc.faculty_id
      WHERE g.has_received_card = 1
      GROUP BY g.round_id, g.faculty_id
    )
    SELECT 
      cr.round_number,
      rq.total_quota AS total_capacity,
      gs.called_count,
      gs.remaining_count,
      cc.id AS current_calling_id,
      cc.sequence AS current_calling_sequence,
      f.name AS current_faculty_name,
      cfq.quota AS current_faculty_quota,
      COALESCE(cfs.faculty_called_count, 0) AS current_faculty_called,
      cfq.quota - COALESCE(cfs.faculty_called_count, 0) AS current_faculty_remaining
    FROM current_round cr
    JOIN round_quota_total rq ON rq.round_id = cr.id
    JOIN graduate_summary gs ON gs.round_id = cr.id
    LEFT JOIN current_calling cc ON cc.round_id = cr.id
    LEFT JOIN graduation_ceremony.faculty f ON f.id = cc.faculty_id
    LEFT JOIN current_faculty_quota cfq ON cfq.round_id = cr.id AND cfq.faculty_id = cc.faculty_id
    LEFT JOIN current_faculty_summary cfs ON cfs.round_id = cr.id AND cfs.faculty_id = cc.faculty_id;
  `);

  return rows.length > 0 ? rows[0] : null;
};
