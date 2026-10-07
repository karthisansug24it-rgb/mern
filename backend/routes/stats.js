const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/stats/summary - Dashboard statistics tailored to user role
router.get('/summary', authenticateToken, (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    // Global counts
    const totalBooksRow = db.prepare('SELECT SUM(totalCopies) as totalCopies, COUNT(*) as uniqueTitles FROM books').get();
    const totalBooks = totalBooksRow ? totalBooksRow.totalCopies || 0 : 0;
    const uniqueTitles = totalBooksRow ? totalBooksRow.uniqueTitles || 0 : 0;

    const availableCopiesRow = db.prepare('SELECT SUM(availableCopies) as available FROM books').get();
    const totalAvailable = availableCopiesRow ? availableCopiesRow.available || 0 : 0;

    const issuedCountRow = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'issued'").get();
    const totalIssued = issuedCountRow ? issuedCountRow.count : 0;

    const overdueCountRow = db.prepare(`
      SELECT COUNT(*) as count 
      FROM issues 
      WHERE status = 'issued' AND date(dueDate) < date('${todayStr}')
    `).get();
    const totalOverdue = overdueCountRow ? overdueCountRow.count : 0;

    const studentsCountRow = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get();
    const totalStudents = studentsCountRow ? studentsCountRow.count : 0;

    const librariansCountRow = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'librarian'").get();
    const totalLibrarians = librariansCountRow ? librariansCountRow.count : 0;

    // Department distribution of books
    const departmentDistribution = db.prepare(`
      SELECT department, COUNT(*) as bookCount, SUM(totalCopies) as totalCopies
      FROM books
      GROUP BY department
      ORDER BY totalCopies DESC
    `).all();

    // Recent activity (latest 5 issues/returns)
    const recentActivity = db.prepare(`
      SELECT 
        i.id,
        i.status,
        i.issueDate,
        i.dueDate,
        i.returnDate,
        b.title as bookTitle,
        b.department as bookDepartment,
        u.name as studentName,
        u.studentId as studentRegNo,
        CASE 
          WHEN i.status = 'issued' AND date(i.dueDate) < date('${todayStr}') THEN 1 
          ELSE 0 
        END as isOverdue
      FROM issues i
      JOIN books b ON i.bookId = b.id
      JOIN users u ON i.studentId = u.id
      ORDER BY i.createdAt DESC
      LIMIT 6
    `).all();

    // Critical Overdue items list
    const criticalOverdue = db.prepare(`
      SELECT 
        i.id,
        i.dueDate,
        b.title as bookTitle,
        b.price as bookPrice,
        b.department as bookDepartment,
        u.name as studentName,
        u.email as studentEmail,
        u.department as studentDept,
        u.studentId as studentRegNo,
        CAST(julianday('${todayStr}') - julianday(i.dueDate) AS INTEGER) as daysOverdue
      FROM issues i
      JOIN books b ON i.bookId = b.id
      JOIN users u ON i.studentId = u.id
      WHERE i.status = 'issued' AND date(i.dueDate) < date('${todayStr}')
      ORDER BY i.dueDate ASC
      LIMIT 6
    `).all();

    // Due This Week items list
    const dueThisWeek = db.prepare(`
      SELECT 
        i.id,
        i.dueDate,
        i.issueDate,
        b.title as bookTitle,
        b.author as bookAuthor,
        b.department as bookDepartment,
        u.name as studentName,
        u.studentId as studentRegNo,
        u.department as studentDept,
        u.email as studentEmail,
        CAST(julianday(i.dueDate) - julianday('${todayStr}') AS INTEGER) as daysRemaining
      FROM issues i
      JOIN books b ON i.bookId = b.id
      JOIN users u ON i.studentId = u.id
      WHERE i.status = 'issued' 
        AND date(i.dueDate) >= date('${todayStr}') 
        AND date(i.dueDate) <= date('${todayStr}', '+7 days')
      ORDER BY i.dueDate ASC
      LIMIT 8
    `).all();

    // Student specific stats
    let studentStats = null;
    if (role === 'student') {
      const myIssuedRow = db.prepare("SELECT COUNT(*) as count FROM issues WHERE studentId = ? AND status = 'issued'").get(userId);
      const myOverdueRow = db.prepare(`
        SELECT COUNT(*) as count 
        FROM issues 
        WHERE studentId = ? AND status = 'issued' AND date(dueDate) < date('${todayStr}')
      `).get(userId);
      const myReturnedRow = db.prepare("SELECT COUNT(*) as count FROM issues WHERE studentId = ? AND status = 'returned'").get(userId);

      const nextDueRow = db.prepare(`
        SELECT dueDate 
        FROM issues 
        WHERE studentId = ? AND status = 'issued' 
        ORDER BY dueDate ASC 
        LIMIT 1
      `).get(userId);

      const myActiveIssues = db.prepare(`
        SELECT 
          i.id,
          i.issueDate,
          i.dueDate,
          i.status,
          b.title as bookTitle,
          b.author as bookAuthor,
          b.department as bookDepartment,
          b.price as bookPrice,
          CASE 
            WHEN date(i.dueDate) < date('${todayStr}') THEN 1 
            ELSE 0 
          END as isOverdue,
          CASE 
            WHEN date(i.dueDate) < date('${todayStr}') 
            THEN CAST(julianday('${todayStr}') - julianday(i.dueDate) AS INTEGER)
            ELSE 0
          END as daysOverdue,
          CASE 
            WHEN date(i.dueDate) >= date('${todayStr}') 
            THEN CAST(julianday(i.dueDate) - julianday('${todayStr}') AS INTEGER)
            ELSE 0
          END as daysRemaining
        FROM issues i
        JOIN books b ON i.bookId = b.id
        WHERE i.studentId = ? AND i.status = 'issued'
        ORDER BY i.dueDate ASC
      `).all(userId);

      studentStats = {
        myIssuedCount: myIssuedRow ? myIssuedRow.count : 0,
        myOverdueCount: myOverdueRow ? myOverdueRow.count : 0,
        myReturnedCount: myReturnedRow ? myReturnedRow.count : 0,
        nextDueDate: nextDueRow ? nextDueRow.dueDate : null,
        myActiveIssues
      };
    }

    res.json({
      role,
      summary: {
        totalBooks,
        uniqueTitles,
        totalAvailable,
        totalIssued,
        totalOverdue,
        totalStudents,
        totalLibrarians
      },
      departmentDistribution,
      recentActivity,
      criticalOverdue,
      dueThisWeek,
      studentStats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error retrieving statistics', error: error.message });
  }
});

module.exports = router;
