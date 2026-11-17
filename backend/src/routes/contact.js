/**
 * Public endpoint — no auth required.
 * Websites can POST to /api/contact to create a lead from a contact form.
 *
 * Example payload:
 * { "name": "Jane Doe", "email": "jane@example.com", "phone": "555-1234", "source": "website" }
 */
const router = require('express').Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  const { name, email, phone, source } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO leads (name, email, phone, source, status)
       VALUES ($1, $2, $3, $4, 'new') RETURNING id, name, email, source, status, created_at`,
      [name.trim(), email.trim().toLowerCase(), phone?.trim() || null, source?.trim() || 'website']
    );
    return res.status(201).json({ success: true, lead: result.rows[0] });
  } catch (err) {
    console.error('contact form error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
