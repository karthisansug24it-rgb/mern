const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/books - search, filter by department, filter by availability, pagination
router.get('/', authenticateToken, (req, res) => {
  try {
    const {
      search = '',
      department = '',
      status = '',
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'DESC'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const whereClauses = [];
    const params = [];

    if (search.trim()) {
      whereClauses.push('(b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (department && department !== 'All') {
      whereClauses.push('b.department = ?');
      params.push(department);
    }

    if (status && status !== 'All') {
      if (status === 'available') {
        whereClauses.push('b.availableCopies > 0');
      } else if (status === 'issued') {
        whereClauses.push('b.availableCopies = 0');
      }
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM books b ${whereSql}`;
    const totalResult = db.prepare(countSql).get(...params);
    const total = totalResult ? totalResult.total : 0;
    const totalPages = Math.ceil(total / limitNum);

    // Allowed sort columns
    const allowedSortColumns = ['id', 'title', 'price', 'department', 'totalCopies', 'availableCopies', 'createdAt'];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id';
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Query books with latest active issue info (e.g., due date if issued)
    const booksSql = `
      SELECT 
        b.id,
        b.title,
        b.author,
        b.isbn,
        b.price,
        b.department,
        b.totalCopies,
        b.availableCopies,
        b.shelfLocation,
        b.publishedYear,
        b.description,
        b.status,
        b.createdAt,
        (
          SELECT i.dueDate 
          FROM issues i 
          WHERE i.bookId = b.id AND i.status = 'issued' 
          ORDER BY i.dueDate ASC 
          LIMIT 1
        ) as nextDueDate,
        (
          SELECT COUNT(*) 
          FROM issues i 
          WHERE i.bookId = b.id AND i.status = 'issued'
        ) as activeIssuedCount
      FROM books b
      ${whereSql}
      ORDER BY b.${validSortBy} ${validSortOrder}
      LIMIT ? OFFSET ?
    `;

    const books = db.prepare(booksSql).all(...params, limitNum, offset);

    res.json({
      books,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Error retrieving books', error: error.message });
  }
});

// GET /api/books/departments - list distinct departments with counts
router.get('/departments', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT department, COUNT(*) as bookCount 
      FROM books 
      GROUP BY department 
      ORDER BY department ASC
    `).all();
    res.json({ departments: rows });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Error retrieving departments' });
  }
});

// GET /api/books/:id - single book with detailed issue records
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const issues = db.prepare(`
      SELECT 
        i.*,
        u.name as studentName,
        u.email as studentEmail,
        u.studentId as studentRegNo,
        u.department as studentDept
      FROM issues i
      JOIN users u ON i.studentId = u.id
      WHERE i.bookId = ?
      ORDER BY i.createdAt DESC
    `).all(req.params.id);

    res.json({ book, issues });
  } catch (error) {
    console.error('Error fetching book detail:', error);
    res.status(500).json({ message: 'Error retrieving book details' });
  }
});

// POST /api/books - create new book (Librarian, Admin)
router.post('/', authenticateToken, authorizeRoles('librarian', 'admin'), (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      price,
      department,
      totalCopies = 1,
      shelfLocation,
      publishedYear,
      description
    } = req.body;

    if (!title || !author || !department || price === undefined || price === null) {
      return res.status(400).json({ message: 'Title, Author, Department, and Price are required.' });
    }

    const copies = Math.max(1, parseInt(totalCopies, 10) || 1);
    const numPrice = parseFloat(price) || 0.0;

    const insert = db.prepare(`
      INSERT INTO books (title, author, isbn, price, department, totalCopies, availableCopies, shelfLocation, publishedYear, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
    `);

    const result = insert.run(
      title.trim(),
      author.trim(),
      (isbn || '').trim(),
      numPrice,
      department.trim(),
      copies,
      copies,
      (shelfLocation || '').trim(),
      parseInt(publishedYear, 10) || null,
      (description || '').trim()
    );

    const createdBook = db.prepare('SELECT * FROM books WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Book added successfully',
      book: createdBook
    });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Failed to add book', error: error.message });
  }
});

// PUT /api/books/:id - update book (Librarian, Admin)
router.put('/:id', authenticateToken, authorizeRoles('librarian', 'admin'), (req, res) => {
  try {
    const bookId = req.params.id;
    const existing = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);

    if (!existing) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const {
      title,
      author,
      isbn,
      price,
      department,
      totalCopies,
      shelfLocation,
      publishedYear,
      description
    } = req.body;

    const newTotal = totalCopies !== undefined ? Math.max(1, parseInt(totalCopies, 10) || 1) : existing.totalCopies;
    const issuedCount = existing.totalCopies - existing.availableCopies;
    const newAvailable = Math.max(0, newTotal - issuedCount);
    const newStatus = newAvailable === 0 ? 'issued' : 'available';

    const update = db.prepare(`
      UPDATE books 
      SET 
        title = COALESCE(?, title),
        author = COALESCE(?, author),
        isbn = COALESCE(?, isbn),
        price = COALESCE(?, price),
        department = COALESCE(?, department),
        totalCopies = ?,
        availableCopies = ?,
        shelfLocation = COALESCE(?, shelfLocation),
        publishedYear = COALESCE(?, publishedYear),
        description = COALESCE(?, description),
        status = ?
      WHERE id = ?
    `);

    update.run(
      title ? title.trim() : null,
      author ? author.trim() : null,
      isbn !== undefined ? (isbn || '').trim() : null,
      price !== undefined ? parseFloat(price) : null,
      department ? department.trim() : null,
      newTotal,
      newAvailable,
      shelfLocation !== undefined ? (shelfLocation || '').trim() : null,
      publishedYear !== undefined ? parseInt(publishedYear, 10) : null,
      description !== undefined ? (description || '').trim() : null,
      newStatus,
      bookId
    );

    const updatedBook = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);

    res.json({
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Failed to update book', error: error.message });
  }
});

// DELETE /api/books/:id - delete book (Librarian, Admin)
router.delete('/:id', authenticateToken,  authorizeRoles('librarian', 'admin'), (req, res) => {
  try {
    const bookId = req.params.id;
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if book currently has active unreturned issues
    const activeIssue = db.prepare(`SELECT COUNT(*) as count FROM issues WHERE bookId = ? AND status = 'issued'`).get(bookId);
    if (activeIssue && activeIssue.count > 0) {
      return res.status(400).json({
        message: `Cannot delete book while ${activeIssue.count} copy is currently issued. Please return all copies first.`
      });
    }

    db.prepare('DELETE FROM books WHERE id = ?').run(bookId);

    res.json({ message: 'Book deleted successfully', id: bookId });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Failed to delete book', error: error.message });
  }
});

module.exports = router;
