import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { issuesApi } from '../services/api';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  BookmarkCheck,
  BookOpen,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export const MyBooksPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active'); // 'active' | 'overdue' | 'returned'

  useEffect(() => {
    loadMyBooks();
  }, []);

  const loadMyBooks = async () => {
    setLoading(true);
    try {
      const data = await issuesApi.getAll({});
      setIssues(data.issues || []);
    } catch (err) {
      console.error('Error fetching student issues:', err);
      showToast('Could not load your borrowed volumes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const activeIssues = issues.filter((i) => i.status === 'issued');
  const overdueIssues = activeIssues.filter((i) => i.isOverdue);
  const returnedIssues = issues.filter((i) => i.status === 'returned');

  const displayedList =
    tab === 'active'
      ? activeIssues
      : tab === 'overdue'
      ? overdueIssues
      : returnedIssues;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="University Library • Scholar Portal"
        title="Personal Borrowing Ledger"
        description="Review all academic monographs and textbooks currently charged to your university account."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={BookOpen}
            onClick={() => navigate('/books')}
          >
            Search Catalog
          </Button>
        }
      />

      {/* Overdue Notice Banner (Muted Brick Red) */}
      {overdueIssues.length > 0 && (
        <div className="p-4 rounded-[6px] bg-overdue-light border border-overdue-border text-overdue flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-overdue" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider">
                Overdue Volumes Notice ({overdueIssues.length} items)
              </p>
              <p className="text-xs text-slate-700 mt-0.5">
                Volumes highlighted in red have exceeded standard loan duration. Please return them to the circulation desk.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setTab('overdue')}
          >
            View Overdue Items
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-0.5 bg-surface-warm border border-border rounded-[4px] text-xs max-w-md">
        <button
          type="button"
          onClick={() => setTab('active')}
          className={`flex-1 py-1.5 px-3 rounded-[3px] font-medium transition-colors ${
            tab === 'active'
              ? 'bg-surface text-slate-900 shadow-sm border border-border/70'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active Loans ({activeIssues.length})
        </button>

        <button
          type="button"
          onClick={() => setTab('overdue')}
          className={`flex-1 py-1.5 px-3 rounded-[3px] font-medium transition-colors ${
            tab === 'overdue'
              ? 'bg-overdue text-white shadow-sm'
              : overdueIssues.length > 0
              ? 'text-overdue hover:bg-overdue-light font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overdue ({overdueIssues.length})
        </button>

        <button
          type="button"
          onClick={() => setTab('returned')}
          className={`flex-1 py-1.5 px-3 rounded-[3px] font-medium transition-colors ${
            tab === 'returned'
              ? 'bg-surface text-slate-900 shadow-sm border border-border/70'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Completed Returns ({returnedIssues.length})
        </button>
      </div>

      {/* Loans Grid / Ledger */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-xs uppercase tracking-wider font-medium">Opening Scholar Record...</p>
        </div>
      ) : displayedList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedList.map((item) => {
            const isOverdue = Boolean(item.isOverdue);
            const isReturned = item.status === 'returned';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-[6px] border bg-surface transition-colors ${
                  isOverdue
                    ? 'border-overdue-border bg-overdue-light/40'
                    : 'border-border hover:border-border-dark'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Badge variant="department">{item.bookDepartment}</Badge>
                  {isOverdue ? (
                    <Badge variant="overdue" dot>
                      Overdue ({item.daysOverdue}d past schedule)
                    </Badge>
                  ) : isReturned ? (
                    <Badge variant="neutral">Returned</Badge>
                  ) : (
                    <Badge variant="issued" dot>
                      {item.daysRemaining === 0 ? 'Due Today' : `Due in ${item.daysRemaining} days`}
                    </Badge>
                  )}
                </div>

                <h3 className="font-serif text-base font-semibold text-slate-900 line-clamp-1">
                  {item.bookTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">by {item.bookAuthor}</p>

                <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-border-subtle text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
                      Date Borrowed
                    </span>
                    <span className="font-mono text-slate-700">{item.issueDate}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
                      {isReturned ? 'Date Returned' : 'Scheduled Due Date'}
                    </span>
                    <span
                      className={`font-mono font-medium ${
                        isOverdue ? 'text-overdue' : 'text-slate-900'
                      }`}
                    >
                      {isReturned ? item.returnDate : item.dueDate}
                    </span>
                  </div>
                </div>

                {isOverdue && (
                  <div className="mt-3 p-2 rounded-[4px] bg-overdue-light border border-overdue-border text-xs text-overdue flex items-center justify-between">
                    <span className="font-medium">Accrued daily fine:</span>
                    <span className="font-mono font-bold">
                      ${item.fine > 0 ? Number(item.fine).toFixed(2) : (item.daysOverdue * 1.0).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center border border-border bg-surface rounded-[6px]">
          <BookmarkCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="font-serif text-base font-semibold text-slate-800">
            {tab === 'active'
              ? 'No active loans currently charged to your account'
              : tab === 'overdue'
              ? 'No overdue returns. Your scholar account is in good standing.'
              : 'No completed return records logged.'}
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You can search the general stacks and borrow course reference literature anytime.
          </p>
        </div>
      )}
    </div>
  );
};
