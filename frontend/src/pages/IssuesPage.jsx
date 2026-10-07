import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { issuesApi } from '../services/api';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { DataTable } from '../components/common/DataTable';
import { IssueBookModal } from '../components/issues/IssueBookModal';
import { ReturnModal } from '../components/issues/ReturnModal';
import {
  ArrowLeftRight,
  Search,
  Plus,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const IssuesPage = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'issued', 'overdue', 'returned'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedIssueForReturn, setSelectedIssueForReturn] = useState(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const data = await issuesApi.getAll({
        status: statusFilter === 'all' ? '' : statusFilter,
        search: searchQuery,
      });
      setIssues(data.issues || []);
    } catch (err) {
      console.error('Error fetching circulation records:', err);
      showToast('Could not load circulation ledger', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, showToast]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleIssueBook = async (issueData) => {
    await issuesApi.issueBook(issueData);
    showToast('Book circulation issued successfully.', 'success');
    setIsIssueModalOpen(false);
    fetchIssues();
  };

  const handleConfirmReturn = async (issueId) => {
    await issuesApi.returnBook(issueId);
    showToast('Book check-in registered in system.', 'success');
    setSelectedIssueForReturn(null);
    fetchIssues();
  };

  const overdueCount = issues.filter((i) => i.isOverdue).length;
  const activeCount = issues.filter((i) => i.status === 'issued' && !i.isOverdue).length;
  const returnedCount = issues.filter((i) => i.status === 'returned').length;

  // Table Columns
  const columns = [
    {
      key: 'bookTitle',
      label: 'Catalog Volume',
      render: (val, issue) => (
        <div className="max-w-xs">
          <p className="font-semibold text-slate-900 line-clamp-1">{issue.bookTitle}</p>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
            <span>{issue.bookDepartment}</span>
            <span>•</span>
            <span className="font-mono">${Number(issue.bookPrice).toFixed(2)}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'studentName',
      label: 'Borrower Scholar',
      render: (val, issue) => (
        <div>
          <p className="font-medium text-slate-800">{issue.studentName}</p>
          <p className="text-xs text-slate-500 font-mono">
            {issue.studentRegNo} • {issue.studentDepartment}
          </p>
        </div>
      ),
    },
    {
      key: 'issueDate',
      label: 'Loan Date',
      render: (date) => <span className="font-mono text-xs text-slate-600">{date}</span>,
    },
    {
      key: 'dueDate',
      label: 'Scheduled Due Date',
      render: (date, issue) => {
        const isOverdue = Boolean(issue.isOverdue);
        return (
          <div
            className={`font-mono text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] border ${
              isOverdue
                ? 'bg-overdue-light text-overdue border-overdue-border font-bold'
                : 'bg-surface-warm text-slate-700 border-border'
            }`}
          >
            <Calendar className="w-3 h-3 opacity-60" />
            <span>{date}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Circulation Compliance',
      render: (_, issue) => {
        const isOverdue = Boolean(issue.isOverdue);
        const isReturned = issue.status === 'returned';

        if (isOverdue) {
          return (
            <div>
              <Badge variant="overdue" dot>
                Overdue ({issue.daysOverdue} days past schedule)
              </Badge>
              {issue.fine > 0 && (
                <p className="text-[11px] font-mono text-overdue font-semibold mt-0.5">
                  Accrued fine: ${Number(issue.fine).toFixed(2)}
                </p>
              )}
            </div>
          );
        }

        if (isReturned) {
          return (
            <div>
              <Badge variant="neutral">Returned</Badge>
              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                on {issue.returnDate}
              </span>
            </div>
          );
        }

        return (
          <Badge variant="issued" dot>
            {issue.daysRemaining === 0 ? 'Due Today' : `Due in ${issue.daysRemaining} days`}
          </Badge>
        );
      },
    },
  ];

  // Table Row Actions
  const rowActions = (issue) => {
    if (issue.status === 'returned') return null;

    return [
      {
        label: 'Process Return / Check-in',
        icon: ArrowLeftRight,
        danger: issue.isOverdue,
        onClick: () => setSelectedIssueForReturn(issue),
      },
    ];
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Library Circulation Department"
        title="Circulation Desk & Loan Ledger"
        description="Monitor scholar book loans, track scheduled due dates, and enforce overdue returns."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsIssueModalOpen(true)}
          >
            Issue Circulation to Scholar
          </Button>
        }
      />

      {/* Filter Tabs and Search Bar */}
      <div className="bg-surface p-4 rounded-[6px] border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-surface-warm border border-border rounded-[4px] text-xs">
          {[
            { id: 'all', label: `All Loans (${issues.length})` },
            { id: 'overdue', label: `Overdue (${overdueCount})` },
            { id: 'issued', label: `Active (${activeCount})` },
            { id: 'returned', label: `Returned (${returnedCount})` },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            const isOverdueTab = tab.id === 'overdue' && overdueCount > 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-[3px] font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? isOverdueTab
                      ? 'bg-overdue text-white shadow-sm'
                      : 'bg-surface text-slate-900 shadow-sm border border-border/70'
                    : isOverdueTab
                    ? 'text-overdue hover:bg-overdue-light'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by book title or scholar name..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-warm/60 rounded-[4px] border border-border focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-800"
          />
        </div>
      </div>

      {/* Dense DataTable */}
      <DataTable
        columns={columns}
        data={issues}
        loading={loading}
        emptyMessage="No circulation entries match your criteria"
        emptySubtext="Switch filter tabs or clear your search term to see other circulation records."
        rowActions={rowActions}
      />

      {/* Modals */}
      <IssueBookModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onIssued={handleIssueBook}
      />

      <ReturnModal
        isOpen={Boolean(selectedIssueForReturn)}
        onClose={() => setSelectedIssueForReturn(null)}
        issue={selectedIssueForReturn}
        onConfirmReturn={handleConfirmReturn}
      />
    </div>
  );
};
