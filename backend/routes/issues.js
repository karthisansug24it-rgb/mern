const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/issues - list issue records (Student sees only their own, Librarian/Admin sees all)
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status, studentId, search } = req.query;
    const isStudent = req.user.role === 'student';

    const whereClauses = [];
    const params = [];

    // Enforce student scoping
    if (isStudent) {
      whereClauses.push('i.studentId = ?');
      params.push(req.user.id);
    } else if (studentId) {
      whereClauses.push('i.studentId = ?');
      params.push(studentId);
    }

    if (search && search.trim()) {
      whereClauses.push('(b.title LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR u.studentId LIKE ?)');
      const q = `%${search.trim()}%`;
      params.push(q, q, q, q);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (status) {
      if (status === 'issued') {
        whereClauses.push("i.status = 'issued'");
      } else if (status === 'returned') {
        whereClauses.push("i.status = 'returned'");
      } else if (status === 'overdue') {
        whereClauses.push(`i.status = 'issued' AND date(i.dueDate) < date('${todayStr}')`);
      }
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT 
        i.id,
        i.bookId,
        i.studentId,
        i.issuedById,
        i.issueDate,
        i.dueDate,
        i.returnDate,
        i.status,
        i.fine,
        i.notes,
        i.createdAt,
        b.title as bookTitle,
        b.author as bookAuthor,
        b.isbn as bookIsbn,
        b.price as bookPrice,
        b.department as bookDepartment,
        b.shelfLocation,
        u.name as studentName,
        u.email as studentEmail,
        u.studentId as studentRegNo,
        u.department as studentDepartment,
        issuer.name as issuedByName,
        CASE 
          WHEN i.status = 'issued' AND date(i.dueDate) < date('${todayStr}') THEN 1 
          ELSE 0 
        END as isOverdue,
        CASE 
          WHEN i.status = 'issued' AND date(i.dueDate) < date('${todayStr}') 
          THEN CAST(julianday('${todayStr}') - julianday(i.dueDate) AS INTEGER)
          ELSE 0
        END as daysOverdue,
        CASE 
          WHEN i.status = 'issued' AND date(i.dueDate) >= date('${todayStr}') 
          THEN CAST(julianday(i.dueDate) - julianday('${todayStr}') AS INTEGER)
          ELSE 0
        END as daysRemaining
      FROM issues i
      JOIN books b ON i.bookId = b.id
      JOIN users u ON i.studentId = u.id
      LEFT JOIN users issuer ON i.issuedById = issuer.id
      ${whereSql}
      ORDER BY 
        CASE WHEN i.status = 'issued' AND date(i.dueDate) < date('${todayStr}') THEN 0 ELSE 1 END,
        i.dueDate ASC,
        i.id DESC
    `;

    const issues = db.prepare(sql).all(...params);
    res.json({ issues });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: 'Error retrieving issue records', error: error.message });
  }
});

// POST /api/issues - issue a book to a student (Librarian, Admin)
router.post('/', authenticateToken, authorizeRoles('librarian', 'admin'), (req, res) => {
  try {
    const { bookId, studentId, dueDate, notes } = req.body;

    if (!bookId || !studentId || !dueDate) {
      return res.status(400).json({ message: 'Book, Student, and Due Date are required.' });
    }

    // Verify book exists and has available copies
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        message: `Book "${book.title}" is currently out of stock. All copies are currently issued.`
      });
    }

    // Verify student exists
    const student = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'student'").get(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Check if student already has this exact book currently issued
    const alreadyIssued = db.prepare(`
      SELECT id FROM issues 
      WHERE bookId = ? AND studentId = ? AND status = 'issued'
    `).get(bookId, studentId);

    if (alreadyIssued) {
      return res.status(400).json({
        message: `Student "${student.name}" already has an active copy of this book issued.`
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Begin database transaction: insert issue & decrement book copies
    const insertIssue = db.prepare(`
      INSERT INTO issues (bookId, studentId, issuedById, issueDate, dueDate, status, fine, notes)
      VALUES (?, ?, ?, ?, ?, 'issued', 0.0, ?)
    `);

    const result = insertIssue.run(
      bookId,
      studentId,
      req.user.id,
      todayStr,
      dueDate,
      notes ? notes.trim() : ''
    );

    const newAvailable = book.availableCopies - 1;
    const newStatus = newAvailable === 0 ? 'issued' : 'available';

    db.prepare(`
      UPDATE books 
      SET availableCopies = ?, status = ? 
      WHERE id = ?
    `).run(newAvailable, newStatus, bookId);

    // Fetch the newly created record with enriched fields
    const issueRecord = db.prepare(`
      SELECT 
        i.*,
        b.title as bookTitle,
        b.author as bookAuthor,
        b.price as bookPrice,
        b.department as bookDepartment,
        u.name as studentName,
        u.email as studentEmail,
        u.studentId as studentRegNo,
        u.department as studentDepartment
      FROM issues i
      JOIN books b ON i.bookId = b.id
      JOIN users u ON i.studentId = u.id
      WHERE i.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      message: `Book "${book.title}" successfully issued to ${student.name}.`,
      issue: issueRecord
    });
  } catch (error) {
    console.error('Error issuing book:', error);
    res.status(500).json({ message: 'Failed to issue book', error: error.message });
  }
});

// POST /api/issues/:id/return - return an issued book (Librarian, Admin)
router.post('/:id/return', authenticateToken, authorizeRoles('librarian', 'admin'), (req, res) => {
  try {
    const issueId = req.params.id;
    const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);

    if (!issue) {
      return res.status(404).json({ message: 'Issue record not found.' });
    }

    if (issue.status === 'returned') {
      return res.status(400).json({ message: 'This book has already been returned.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Calculate overdue fine if applicable (e.g., $1.00 per day overdue)
    let fine = 0.0;
    if (new Date(todayStr) > new Date(issue.dueDate)) {
      const diffTime = Math.abs(new Date(todayStr) - new Date(issue.dueDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine = diffDays * 1.0;
    }

    // Update issue record to returned
    db.prepare(`
      UPDATE issues 
      SET returnDate = ?, status = 'returned', fine = ? 
      WHERE id = ?
    `).run(todayStr, fine, issueId);

    // Increment book available copies
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(issue.bookId);
    if (book) {
      const newAvailable = Math.min(book.totalCopies, book.availableCopies + 1);
      db.prepare(`
        UPDATE books 
        SET availableCopies = ?, status = 'available' 
        WHERE id = ?
      `).run(newAvailable, issue.bookId);
    }

    const updatedIssue = db.prepare(`
      SELECT 
        i.*,
        b.title as bookTitle,
        u.name as studentName
      FROM issues i
      JOIN books b ON i.bookId = b.id
      JOIN users u ON i.studentId = u.id
      WHERE i.id = ?
    `).get(issueId);

    res.json({
      message: `Book "${updatedIssue.bookTitle}" successfully returned by ${updatedIssue.studentName}.`,
      issue: updatedIssue
    });
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ message: 'Failed to process return', error: error.message });
  }
});

module.exports = router;
