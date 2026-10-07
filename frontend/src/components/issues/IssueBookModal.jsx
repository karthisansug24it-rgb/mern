import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { booksApi, studentsApi } from '../../services/api';
import { Loader2, ArrowRight, Calendar, User, Book } from 'lucide-react';

export const IssueBookModal = ({ isOpen, onClose, preselectedBook, onIssued }) => {
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const calculateDateAhead = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (isOpen) {
      setError('');
      setDueDate(calculateDateAhead(14));
      setNotes('');
      if (preselectedBook) {
        setSelectedBookId(preselectedBook.id.toString());
      } else {
        setSelectedBookId('');
      }
      setSelectedStudentId('');
      loadSelectionData();
    }
  }, [isOpen, preselectedBook]);

  const loadSelectionData = async () => {
    setLoadingOptions(true);
    try {
      const [booksRes, studentsRes] = await Promise.all([
        booksApi.getAll({ limit: 100, status: 'available' }),
        studentsApi.getAll({}),
      ]);
      setBooks(booksRes.books || []);
      setStudents(studentsRes.students || []);
    } catch (err) {
      console.error('Error fetching data for issue modal:', err);
      setError('Could not retrieve holdings or scholar roster.');
    } finally {
      setLoadingOptions(false);
    }
  };

  const selectedBook = books.find((b) => String(b.id) === String(selectedBookId)) || preselectedBook;
  const selectedStudent = students.find((s) => String(s.id) === String(selectedStudentId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookId) {
      setError('Please select a catalog volume to issue.');
      return;
    }
    if (!selectedStudentId) {
      setError('Please select a registered scholar borrower.');
      return;
    }
    if (!dueDate) {
      setError('Please specify a scheduled return deadline.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onIssued({
        bookId: parseInt(selectedBookId, 10),
        studentId: parseInt(selectedStudentId, 10),
        dueDate,
        notes,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to issue volume circulation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Volume Circulation"
      subtitle="Charge an available catalog holding to a registered scholar card."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-[4px] bg-overdue-light text-overdue border border-overdue-border font-medium">
            {error}
          </div>
        )}

        {loadingOptions ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Consulting library catalog & registry...</span>
          </div>
        ) : (
          <>
            {/* Select Book */}
            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
                Catalog Volume <span className="text-overdue">*</span>
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-[4px] border border-border bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- Choose volume from general stacks --</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.department}) — {b.availableCopies} available [Shelf: {b.shelfLocation || 'General'}]
                  </option>
                ))}
              </select>
              {selectedBook && (
                <div className="mt-1.5 text-[11px] text-slate-600 bg-surface-warm p-2 rounded-[4px] border border-border-subtle flex items-center justify-between">
                  <span>Author: <strong>{selectedBook.author}</strong></span>
                  <span>Dept: <strong className="text-primary">{selectedBook.department}</strong></span>
                  <span>Available: <strong>{selectedBook.availableCopies} copies</strong></span>
                </div>
              )}
            </div>

            {/* Select Scholar */}
            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
                Scholar Borrower <span className="text-overdue">*</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-[4px] border border-border bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- Choose registered scholar member --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.studentId}) — {s.department} [{s.email}]
                  </option>
                ))}
              </select>
              {selectedStudent && (
                <div className="mt-1.5 text-[11px] text-slate-600 bg-surface-warm p-2 rounded-[4px] border border-border-subtle flex items-center justify-between font-mono">
                  <span>Reg: {selectedStudent.studentId}</span>
                  <span>Active Loans: {selectedStudent.activeIssuedCount || 0}</span>
                </div>
              )}
            </div>

            {/* Due Date & Presets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Scheduled Due Date <span className="text-overdue">*</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDueDate(calculateDateAhead(7))}
                    className="text-[11px] px-2 py-0.5 rounded-[3px] bg-surface-warm hover:bg-surface-sand text-slate-700 border border-border transition-colors"
                  >
                    +7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setDueDate(calculateDateAhead(14))}
                    className="text-[11px] px-2 py-0.5 rounded-[3px] bg-primary-light text-primary border border-primary/30 font-medium transition-colors"
                  >
                    +14 Days (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDueDate(calculateDateAhead(30))}
                    className="text-[11px] px-2 py-0.5 rounded-[3px] bg-surface-warm hover:bg-surface-sand text-slate-700 border border-border transition-colors"
                  >
                    +30 Days (Faculty)
                  </button>
                </div>
              </div>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-[4px] border border-border bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
                Circulation Purpose / Reference Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. BTech Final Year Project reference, Course reserve..."
                className="w-full px-3 py-1.5 text-xs rounded-[4px] border border-border bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            disabled={loadingOptions || !selectedBookId || !selectedStudentId}
            iconRight={ArrowRight}
          >
            Authorize Loan
          </Button>
        </div>
      </form>
    </Modal>
  );
};
