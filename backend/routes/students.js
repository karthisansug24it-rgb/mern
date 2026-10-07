const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/students - list students with search, dept filter, and active issues count
router.get('/', authenticateToken, authorizeRoles('admin', 'librarian'), (req, res) => {
  try {
    const { search = '', department = '' } = req.query;

    const whereClauses = ["u.role = 'student'"];
    const params = [];

    if (search.trim()) {
      whereClauses.push('(u.name LIKE ? OR u.email LIKE ? OR u.studentId LIKE ?)');
      const q = `%${search.trim()}%`;
      params.push(q, q, q);
    }

    if (department && department !== 'All') {
      whereClauses.push('u.department = ?');
      params.push(department);
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

    const sql = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.department,
        u.studentId,
        u.phone,
        u.createdAt,
        (
          SELECT COUNT(*) 
          FROM issues i 
          WHERE i.studentId = u.id AND i.status = 'issued'
        ) as activeIssuedCount,
        (
          SELECT COUNT(*) 
          FROM issues i 
          WHERE i.studentId = u.id AND i.status = 'issued' AND date('now') > date(i.dueDate)
        ) as overdueCount
      FROM users u
      ${whereSql}
      ORDER BY u.id DESC
    `;

    const students = db.prepare(sql).all(...params);
    res.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error retrieving students', error: error.message });
  }
});

// GET /api/students/:id - student profile and issue history
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const targetId = req.params.id;

    // Student can only view their own profile unless admin/librarian
    if (req.user.role === 'student' && String(req.user.id) !== String(targetId)) {
      return res.status(403).json({ message: 'Access denied: You can only view your own profile.' });
    }

    const student = db.prepare(`
      SELECT id, name, email, role, department, studentId, phone, createdAt 
      FROM users 
      WHERE id = ? AND role = 'student'
    `).get(targetId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const issues = db.prepare(`
      SELECT 
        i.*,
        b.title as bookTitle,
        b.author as bookAuthor,
        b.department as bookDepartment,
        b.price as bookPrice,
        b.isbn as bookIsbn
      FROM issues i
      JOIN books b ON i.bookId = b.id
      WHERE i.studentId = ?
      ORDER BY i.issueDate DESC
    `).all(targetId);

    res.json({ student, issues });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ message: 'Error retrieving student details' });
  }
});

// POST /api/students - add new student (Librarian, Admin)
router.post('/', authenticateToken, authorizeRoles('admin', 'librarian'), async (req, res) => {
  try {
    const { name, email, department, studentId, phone, password = 'student123' } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({ message: 'Name, email, and department are required.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (existing) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedId = (studentId || `STU-${Date.now().toString().slice(-4)}`).trim();

    const insert = db.prepare(`
      INSERT INTO users (name, email, password, role, department, studentId, phone)
      VALUES (?, ?, ?, 'student', ?, ?, ?)
    `);

    const result = insert.run(
      name.trim(),
      email.trim().toLowerCase(),
      hashedPassword,
      department.trim(),
      assignedId,
      (phone || '').trim()
    );

    const created = db.prepare(`
      SELECT id, name, email, role, department, studentId, phone, createdAt 
      FROM users 
      WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Student created successfully',
      student: { ...created, activeIssuedCount: 0, overdueCount: 0 }
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Failed to create student', error: error.message });
  }
});

// PUT /api/students/:id - edit student (Librarian, Admin)
router.put('/:id', authenticateToken, authorizeRoles('admin', 'librarian'), async (req, res) => {
  try {
    const targetId = req.params.id;
    const existing = db.prepare('SELECT * FROM users WHERE id = ? AND role = "student"').get(targetId);

    if (!existing) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { name, email, department, studentId, phone, password } = req.body;

    if (email && email.trim().toLowerCase() !== existing.email.toLowerCase()) {
      const emailCheck = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?').get(email.trim(), targetId);
      if (emailCheck) {
        return res.status(409).json({ message: 'Email is already in use by another account.' });
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
        studentId = COALESCE(?, studentId),
        phone = COALESCE(?, phone),
        password = ?
      WHERE id = ?
    `);

    update.run(
      name ? name.trim() : null,
      email ? email.trim().toLowerCase() : null,
      department ? department.trim() : null,
      studentId ? studentId.trim() : null,
      phone !== undefined ? (phone || '').trim() : null,
      hashedPassword,
      targetId
    );

    const updated = db.prepare(`
      SELECT id, name, email, role, department, studentId, phone, createdAt 
      FROM users 
      WHERE id = ?
    `).get(targetId);

    res.json({ message: 'Student updated successfully', student: updated });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student', error: error.message });
  }
});

// DELETE /api/students/:id - delete student (Librarian, Admin)
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'librarian'), (req, res) => {
  try {
    const targetId = req.params.id;
    const student = db.prepare('SELECT * FROM users WHERE id = ? AND role = "student"').get(targetId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student has active unreturned books
    const active = db.prepare('SELECT COUNT(*) as count FROM issues WHERE studentId = ? AND status = "issued"').get(targetId);
    if (active && active.count > 0) {
      return res.status(400).json({
        message: `Cannot delete student who has ${active.count} active borrowed book(s). Return books first.`
      });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(targetId);

    res.json({ message: 'Student deleted successfully', id: targetId });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Failed to delete student', error: error.message });
  }
});

module.exports = router;
