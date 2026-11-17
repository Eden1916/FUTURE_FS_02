const pool = require('../db');

const VALID_STATUSES = ['new', 'contacted', 'converted', 'lost'];

// GET /api/leads
async function getLeads(req, res) {
  const { status, source, search, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`l.status = $${params.length}`);
  }
  if (source) {
    params.push(source);
    conditions.push(`l.source ILIKE $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(l.name ILIKE $${params.length} OR l.email ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM leads l ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(parseInt(limit, 10), offset);
    const dataResult = await pool.query(
      `SELECT l.id, l.name, l.email, l.phone, l.source, l.status,
              l.created_at, l.updated_at,
              a.name AS assigned_to_name
       FROM leads l
       LEFT JOIN admins a ON l.assigned_to = a.id
       ${where}
       ORDER BY l.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return res.json({
      data: dataResult.rows,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (err) {
    console.error('getLeads error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/leads/:id
async function getLead(req, res) {
  const { id } = req.params;
  try {
    const leadResult = await pool.query(
      `SELECT l.*, a.name AS assigned_to_name
       FROM leads l
       LEFT JOIN admins a ON l.assigned_to = a.id
       WHERE l.id = $1`,
      [id]
    );
    if (!leadResult.rows.length) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const notesResult = await pool.query(
      `SELECT n.*, a.name AS author
       FROM notes n
       LEFT JOIN admins a ON n.admin_id = a.id
       WHERE n.lead_id = $1
       ORDER BY n.created_at DESC`,
      [id]
    );

    return res.json({ lead: leadResult.rows[0], notes: notesResult.rows });
  } catch (err) {
    console.error('getLead error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/leads
async function createLead(req, res) {
  const { name, email, phone, source, status } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const leadStatus = VALID_STATUSES.includes(status) ? status : 'new';

  try {
    const result = await pool.query(
      `INSERT INTO leads (name, email, phone, source, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, phone || null, source || 'website', leadStatus]
    );
    return res.status(201).json({ lead: result.rows[0] });
  } catch (err) {
    console.error('createLead error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PATCH /api/leads/:id
async function updateLead(req, res) {
  const { id } = req.params;
  const { name, email, phone, source, status, assigned_to } = req.body;

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    const existing = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = existing.rows[0];
    const result = await pool.query(
      `UPDATE leads
       SET name = $1, email = $2, phone = $3, source = $4,
           status = $5, assigned_to = $6
       WHERE id = $7 RETURNING *`,
      [
        name ?? lead.name,
        email ?? lead.email,
        phone ?? lead.phone,
        source ?? lead.source,
        status ?? lead.status,
        assigned_to !== undefined ? assigned_to : lead.assigned_to,
        id,
      ]
    );
    return res.json({ lead: result.rows[0] });
  } catch (err) {
    console.error('updateLead error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/leads/:id
async function deleteLead(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM leads WHERE id = $1 RETURNING id', [id]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    return res.json({ message: 'Lead deleted' });
  } catch (err) {
    console.error('deleteLead error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getLeads, getLead, createLead, updateLead, deleteLead };
