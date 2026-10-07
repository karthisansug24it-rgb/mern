const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All librarian management routes are strictly Admin-only
router.use(authenticateToken, authorizeRoles('admin'));

// GET /api/librarians - list all librarians
router.get('/', (req, res) => {
  try {
    const { search = '' } = req.query;

    const whereClauses = ["role = 'librarian'"];
    const params = [];

    if (search.trim()) {
      whereClauses.push('(name LIKE ? OR email LIKE ?)');
      const q = `%${search.trim()}%`;
      params.push(q, q);
    }

    const sql = `
      SELECT id, name, email, role, department, phone, createdAt 
      FROM users 
      WHERE ${whereClauses.join(' AND ')} 
      ORDER BY id DESC
    `;

    const librarians = db.prepare(sql).all(...params);
    res.json({ librarians });
  } catch (error) {
    console.error('Error fetching librarians:', error);
    res.status(500).json({ message: 'Error retrieving librarians' });
  }
});

// POST /api/librarians - add new librarian
router.post('/', async (req, res) => {
  try {
    const { name, email, password = 'lib123', department = 'Library Services', phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (existing) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const insert = db.prepare(`
      INSERT INTO users (name, email, password, role, department, phone)
      VALUES (?, ?, ?, 'librarian', ?, ?)
    `);

    const result = insert.run(name.trim(), email.trim().toLowerCase(), hashedPassword, department.trim(), (phone || '').trim());

    const created = db.prepare('SELECT id, name, email, role, department, phone, createdAt FROM users WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Librarian account created successfully',
      librarian: created
    });
  } catch (error) {
    console.error('Error creating librarian:', error);
    res.status(500).json({ message: 'Failed to create librarian', error: error.message });
  }
});

// PUT /api/librarians/:id - edit librarian
router.put('/:id', async (req, res) => {
  try {
    const targetId = req.params.id;
    const existing = db.prepare('SELECT * FROM users WHERE id = ? AND role = "librarian"').get(targetId);

    if (!existing) {
      return res.status(404).json({ message: 'Librarian not found' });
    }

    const { name, email, password, department, phone } = req.body;

    if (email && email.trim().toLowerCase() !== existing.email.toLowerCase()) {
      const emailCheck = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?').get(email.trim(), targetId);
      if (emailCheck) {
        return res.status(409).json({ message: 'Email is already taken by another user.' });
      }
    }

    let hashedPassword = existing.password;
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    }

    const update = db.prepare(`
      UPDATE users 
      SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        department = COALESCE(?, department),
        phone = COALESCE(?, phone),
        password = ?
      WHERE id = ?
    `);

    update.run(
      name ? name.trim() : null,
      email ? email.trim().toLowerCase() : null,
      department ? department.trim() : null,
      phone !== undefined ? (phone || '').trim() : null,
      hashedPassword,
      targetId
    );

    const updated = db.prepare('SELECT id, name, email, role, department, phone, createdAt FROM users WHERE id = ?').get(targetId);

    res.json({
      message: 'Librarian updated successfully',
      librarian: updated
    });
  } catch (error) {
    console.error('Error updating librarian:', error);
    res.status(500).json({ message: 'Failed to update librarian', error: error.message });
  }
});

// DELETE /api/librarians/:id - delete librarian
router.delete('/:id', (req, res) => {
  try {
    const targetId = req.params.id;
    const librarian = db.prepare('SELECT * FROM users WHERE id = ? AND role = "librarian"').get(targetId);

    if (!librarian) {
      return res.status(404).json({ message: 'Librarian not found' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(targetId);

    res.json({ message: 'Librarian deleted successfully', id: targetId });
  } catch (error) {
    console.error('Error deleting librarian:', error);
    res.status(500).json({ message: 'Failed to delete librarian' });
  }
});

module.exports = router;
