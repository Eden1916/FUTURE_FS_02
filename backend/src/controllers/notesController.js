const pool = require('../db');

// POST /api/leads/:leadId/notes
async function createNote(req, res) {
  const { leadId } = req.params;
  const { content, follow_up_date } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Note content is required' });
  }

  try {
    const leadCheck = await pool.query('SELECT id FROM leads WHERE id = $1', [leadId]);
    if (!leadCheck.rows.length) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const result = await pool.query(
      `INSERT INTO notes (lead_id, admin_id, content, follow_up_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [leadId, req.admin.id, content.trim(), follow_up_date || null]
    );

    // Attach author name
    const note = result.rows[0];
    note.author = req.admin.name;

    return res.status(201).json({ note });
  } catch (err) {
    console.error('createNote error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PATCH /api/notes/:id
async function updateNote(req, res) {
  const { id } = req.params;
  const { content, follow_up_date } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM notes WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const note = existing.rows[0];
    const result = await pool.query(
      `UPDATE notes SET content = $1, follow_up_date = $2 WHERE id = $3 RETURNING *`,
      [content ?? note.content, follow_up_date !== undefined ? follow_up_date : note.follow_up_date, id]
    );
    return res.json({ note: result.rows[0] });
  } catch (err) {
    console.error('updateNote error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/notes/:id
async function deleteNote(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM notes WHERE id = $1 RETURNING id', [id]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Note not found' });
    }
    return res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error('deleteNote error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/follow-ups  — upcoming follow-ups across all leads
async function getFollowUps(req, res) {
  try {
    const result = await pool.query(
      `SELECT n.id, n.content, n.follow_up_date, n.created_at,
              l.id AS lead_id, l.name AS lead_name, l.email AS lead_email,
              a.name AS author
       FROM notes n
       JOIN leads l ON n.lead_id = l.id
       LEFT JOIN admins a ON n.admin_id = a.id
       WHERE n.follow_up_date IS NOT NULL
         AND n.follow_up_date >= CURRENT_DATE
       ORDER BY n.follow_up_date ASC
       LIMIT 50`
    );
    return res.json({ data: result.rows });
  } catch (err) {
    console.error('getFollowUps error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createNote, updateNote, deleteNote, getFollowUps };
