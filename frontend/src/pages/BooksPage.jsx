import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { booksApi, issuesApi } from '../services/api';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { DataTable } from '../components/common/DataTable';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { BookModal } from '../components/books/BookModal';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { IssueBookModal } from '../components/issues/IssueBookModal';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ArrowLeftRight,
  BookOpen,
  Calendar,
  X
} from 'lucide-react';

const DEPARTMENTS = [
  'All',
  'Computer Science',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Economics & Management',
  'Mathematics & Computing',
  'Literature & Philosophy',
];

export const BooksPage = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const isStaff = role === 'admin' || role === 'librarian';

  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals state
  const [selectedBookForDetail, setSelectedBookForDetail] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingBook, setDeletingBook] = useState(null);
  const [issuingBook, setIssuingBook] = useState(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const fetchBooks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await booksApi.getAll({
        search: searchTerm,
        department: selectedDept === 'All' ? '' : selectedDept,
        status: selectedStatus === 'All' ? '' : selectedStatus,
        page,
        limit: 10,
      });
      setBooks(data.books || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Error fetching books:', err);
      showToast('Could not load books catalog', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedDept, selectedStatus, showToast]);

  useEffect(() => {
    fetchBooks(1);
  }, [fetchBooks]);

  const handleCreateOrUpdateBook = async (bookData) => {
    if (editingBook) {
      await booksApi.update(editingBook.id, bookData);
      showToast(`Catalog record "${bookData.title}" updated.`, 'success');
      setEditingBook(null);
    } else {
      await booksApi.create(bookData);
      showToast(`Book "${bookData.title}" accessioned to catalog.`, 'success');
      setIsAddModalOpen(false);
    }
    fetchBooks(pagination.page);
  };

  const handleDeleteBook = async () => {
    if (!deletingBook) return;
    setIsDeletingLoading(true);
    try {
      await booksApi.delete(deletingBook.id);
      showToast(`Book "${deletingBook.title}" de-accessioned from catalog.`, 'success');
      setDeletingBook(null);
      fetchBooks(pagination.page);
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.message || 'Could not de-accession book', 'error');
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleIssueBook = async (issueData) => {
    await issuesApi.issueBook(issueData);
    showToast('Book successfully issued to scholar.', 'success');
    setIssuingBook(null);
    fetchBooks(pagination.page);
  };

  // Define Table Columns
  const columns = [
    {
      key: 'title',
      label: 'Volume Title & Authorship',
      render: (val, book) => (
        <div className="max-w-md">
          <button
            type="button"
            onClick={() => setSelectedBookForDetail(book)}
            className="text-left font-semibold text-slate-900 hover:text-primary transition-colors block line-clamp-1"
          >
            {book.title}
          </button>
          <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            {book.author}
          </div>
          {book.shelfLocation && (
            <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
              Shelf: {book.shelfLocation}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (dept) => <Badge variant="department">{dept}</Badge>,
    },
    {
      key: 'price',
      label: 'Ref. Value',
      render: (price) => (
        <span className="font-mono text-xs text-slate-700">
          ${Number(price).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'availableCopies',
      label: 'Stack Stock',
      render: (_, book) => {
        const isAvailable = book.availableCopies > 0;
        return (
          <div>
            {isAvailable ? (
              <Badge variant="available" dot>
                {book.availableCopies} of {book.totalCopies} Available
              </Badge>
            ) : (
              <Badge variant="overdue" dot>
                0 of {book.totalCopies} Available
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'nextDueDate',
      label: 'Scheduled Return',
      render: (date) => (
        date ? (
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-700 bg-surface-warm px-2 py-0.5 rounded-[4px] border border-border">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{date}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-mono italic">In Stack</span>
        )
      ),
    },
  ];

  // Define Row Action Menu Items
  const rowActions = (book) => {
    const isAvailable = book.availableCopies > 0;
    const actions = [
      {
        label: 'Inspect Details',
        icon: Eye,
        onClick: () => setSelectedBookForDetail(book),
      },
    ];

    if (isStaff && isAvailable) {
      actions.push({
        label: 'Issue to Scholar',
        icon: ArrowLeftRight,
        onClick: () => setIssuingBook(book),
      });
    }

    if (isStaff) {
      actions.push({
        label: 'Edit Catalog Record',
        icon: Edit2,
        onClick: () => setEditingBook(book),
      });
      actions.push({
        label: 'De-accession Book',
        icon: Trash2,
        danger: true,
        onClick: () => setDeletingBook(book),
      });
    }

    return actions;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Library Collections & Holdings"
        title="General Books Catalog"
        description="Search monographs, textbooks, reference editions, and department course reserves."
        actions={
          isStaff ? (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              Catalog New Book
            </Button>
          ) : null
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 rounded-[6px] border border-border shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search catalog by title, author, or ISBN..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-warm/60 rounded-[4px] border border-border focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-800"
            />
          </div>

          {/* Department Filter Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-[4px] border border-border bg-surface text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Academic Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-[4px] border border-border bg-surface text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Stack Availability</option>
              <option value="available">Available in Stacks</option>
              <option value="issued">Fully Circulating (0 Copies)</option>
            </select>
          </div>
        </div>

        {/* Department Quick Filter Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs border-t border-border-subtle">
          <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider mr-1 flex-shrink-0">
            Departments:
          </span>
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDept === dept;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-2.5 py-0.5 rounded-[4px] text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-primary text-white border border-primary'
                    : 'bg-surface-warm text-slate-700 hover:bg-surface-sand border border-border'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dense DataTable with Sticky Header */}
      <DataTable
        columns={columns}
        data={books}
        loading={loading}
        emptyMessage="No catalog items match your search inquiry"
        emptySubtext="Verify spelling, clear department filters, or search by a broader subject keyword."
        rowActions={rowActions}
        onRowClick={(book) => setSelectedBookForDetail(book)}
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          limit: pagination.limit,
          onPageChange: (newPage) => fetchBooks(newPage),
        }}
      />

      {/* Add / Edit Book Modal */}
      <BookModal
        isOpen={isAddModalOpen || Boolean(editingBook)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBook(null);
        }}
        book={editingBook}
        onSave={handleCreateOrUpdateBook}
      />

      {/* Book Detail Modal */}
      <BookDetailModal
        isOpen={Boolean(selectedBookForDetail)}
        onClose={() => setSelectedBookForDetail(null)}
        book={selectedBookForDetail}
        userRole={role}
        onIssueClick={(b) => setIssuingBook(b)}
      />

      {/* Issue Book Modal */}
      <IssueBookModal
        isOpen={Boolean(issuingBook)}
        onClose={() => setIssuingBook(null)}
        preselectedBook={issuingBook}
        onIssued={handleIssueBook}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingBook)}
        onClose={() => setDeletingBook(null)}
        onConfirm={handleDeleteBook}
        title="De-accession Catalog Volume"
        message={`Are you sure you wish to permanently de-accession "${deletingBook?.title}" from the university catalog? All recorded shelf holdings will be removed.`}
        confirmText="De-accession Volume"
        isLoading={isDeletingLoading}
      />
    </div>
  );
};
