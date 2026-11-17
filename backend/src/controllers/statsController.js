const pool = require('../db');

// GET /api/stats  — dashboard summary
async function getStats(req, res) {
  try {
    const [totals, byStatus, bySource, recent] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM leads'),
      pool.query(
        `SELECT status, COUNT(*) AS count FROM leads GROUP BY status ORDER BY status`
      ),
      pool.query(
        `SELECT source, COUNT(*) AS count FROM leads GROUP BY source ORDER BY count DESC LIMIT 10`
      ),
      pool.query(
        `SELECT id, name, email, status, created_at FROM leads ORDER BY created_at DESC LIMIT 5`
      ),
    ]);

    return res.json({
      total: parseInt(totals.rows[0].total, 10),
      byStatus: byStatus.rows,
      bySource: bySource.rows,
      recentLeads: recent.rows,
    });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getStats };
