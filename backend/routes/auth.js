const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    // Role check if provided
    if (role && user.role !== role) {
      return res.status(403).json({
        message: `Role mismatch: This account has '${user.role}' permissions, not '${role}'. Please switch to ${user.role} role.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      phone: user.phone,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, department, studentId, phone, createdAt FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Auth /me error:', error);
    res.status(500).json({ message: 'Server error fetching user details' });
  }
});

// POST /api/auth/register (for self registration of students if desired)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, phone, studentId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedStudentId = studentId || `STU-${Date.now().toString().slice(-4)}`;

    const insert = db.prepare(`
      INSERT INTO users (name, email, password, role, department, studentId, phone)
      VALUES (?, ?, ?, 'student', ?, ?, ?)
    `);

    const result = insert.run(name.trim(), email.trim().toLowerCase(), hashedPassword, department || 'General', assignedStudentId, phone || '');

    const newUser = {
      id: result.lastInsertRowid,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'student',
      department: department || 'General',
      studentId: assignedStudentId,
      phone: phone || ''
    };

    const token = jwt.sign(newUser, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// GET /api/auth/demo-accounts (convenience for demo review)
router.get('/demo-accounts', (req, res) => {
  res.json({
    accounts: [
      { role: 'admin', label: 'Admin', email: 'admin@library.com', password: 'admin123', name: 'Prof. Rajeshwari Sen (Director)' },
      { role: 'librarian', label: 'Librarian', email: 'savitri.librarian@library.com', password: 'lib123', name: 'Dr. Savitri Venkataraman (Chief Librarian)' },
      { role: 'student', label: 'Student (Aarav)', email: 'aarav.sharma@university.edu', password: 'student123', name: 'Aarav Sharma (Computer Science)' },
      { role: 'student', label: 'Student (Priya)', email: 'priya.patel@university.edu', password: 'student123', name: 'Priya Patel (Electrical)' }
    ]
  });
});

module.exports = router;
