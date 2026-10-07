import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { statsApi, issuesApi } from '../services/api';
import { PageHeader } from '../components/common/PageHeader';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { IssueBookModal } from '../components/issues/IssueBookModal';
import { ReturnModal } from '../components/issues/ReturnModal';
import { BookModal } from '../components/books/BookModal';
import {
  BookOpen,
  ArrowLeftRight,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
  Calendar,
  CheckCircle2,
  Users,
  Building2,
  Loader2
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [returnIssueData, setReturnIssueData] = useState(null);

  useEffect(() => {
    loadStats();
  }, [role]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await statsApi.getSummary();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      showToast('Could not retrieve circulation records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueBook = async (issueData) => {
    await issuesApi.issueBook(issueData);
    showToast('Circulation loan record created.', 'success');
    loadStats();
  };

  const handleConfirmReturn = async (issueId) => {
    await issuesApi.returnBook(issueId);
    showToast('Book return registered successfully.', 'success');
    loadStats();
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-2 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-xs uppercase tracking-wider font-medium">Opening Circulation Ledger...</p>
      </div>
    );
  }

  const summary = stats?.summary || {};
  const studentStats = stats?.studentStats || {};
  const dueThisWeek = stats?.dueThisWeek || [];
  const criticalOverdue = stats?.criticalOverdue || [];
  const recentActivity = stats?.recentActivity || [];

  const isStaff = role === 'admin' || role === 'librarian';

  return (
    <div className="space-y-8">
      {/* Editorial Page Header */}
      <PageHeader
        eyebrow="Academic Term 2026 • University Library"
        title={
          role === 'admin'
            ? 'Executive Library Operations'
            : role === 'librarian'
            ? 'Circulation Desk & Reading Rooms'
            : `Scholar Reading Desk: ${user?.name}`
        }
        description={
          role === 'student'
            ? `Enrolled in ${user?.department || 'University Studies'} • Student ID: ${user?.studentId || 'N/A'}`
            : 'Archival holdings, active scholar circulations, and compliance schedules.'
        }
        actions={
          isStaff ? (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => setIsBookModalOpen(true)}
              >
                Catalog New Book
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={ArrowLeftRight}
                onClick={() => setIsIssueModalOpen(true)}
              >
                Issue Circulation
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={BookOpen}
              onClick={() => navigate('/books')}
            >
              Search Catalog
            </Button>
          )
        }
      />

      {/* OVERDUE NOTICE (Editorial Banner) */}
      {((isStaff && summary.totalOverdue > 0) ||
        (role === 'student' && studentStats.myOverdueCount > 0)) && (
        <div className="p-4 rounded-[6px] bg-overdue-light border border-overdue-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-overdue">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-overdue" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider">
                {role === 'student'
                  ? `Overdue Return Notice: ${studentStats.myOverdueCount} Volume(s)`
                  : `Overdue Circulations Notice: ${summary.totalOverdue} Item(s) Past Schedule`}
              </p>
              <p className="text-xs text-slate-700 mt-0.5">
                {role === 'student'
                  ? 'Please return past-due volumes to the front desk to avoid accumulated late penalties.'
                  : 'Borrowers have exceeded standard loan duration. Daily penalties are accruing.'}
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => navigate(role === 'student' ? '/my-books' : '/issues?status=overdue')}
          >
            Review Overdue Items
          </Button>
        </div>
      )}

      {/* KEY FIGURES LEDGER (Not 4 identical generic SaaS cards) */}
      {isStaff ? (
        <div className="bg-surface border border-border rounded-[6px] p-5 shadow-sm">
          <div className="text-[11px] font-medium uppercase tracking-widest text-slate-500 mb-4 pb-2 border-b border-border-subtle flex items-center justify-between">
            <span>Holdings & Circulation Ledger</span>
            <span className="font-mono text-slate-400">Current Semester</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Figure 1: Total Volumes */}
            <div className="py-2 md:py-0 md:px-4 first:pl-0">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Catalog Volumes</p>
              <p className="font-serif text-2xl font-bold text-slate-900 mt-1">
                {summary.totalBooks || 0}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                across <span className="font-medium">{summary.uniqueTitles || 0}</span> registered titles
              </p>
            </div>

            {/* Figure 2: Circulating */}
            <div className="py-2 md:py-0 md:px-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Active Circulations</p>
              <p className="font-serif text-2xl font-bold text-slate-900 mt-1">
                {summary.totalIssued || 0}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                <span className="text-primary font-medium">{summary.totalAvailable || 0}</span> available in stacks
              </p>
            </div>

            {/* Figure 3: Overdue (Quiet Brick Red Indicator) */}
            <div className="py-2 md:py-0 md:px-4">
              <p className="text-xs text-overdue uppercase tracking-wider font-medium">Overdue Returns</p>
              <p className="font-serif text-2xl font-bold text-overdue mt-1">
                {summary.totalOverdue || 0}
              </p>
              <p className="text-xs text-overdue/80 mt-1">
                requiring recall notification
              </p>
            </div>

            {/* Figure 4: Scholars */}
            <div className="py-2 md:py-0 md:px-4 last:pr-0">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Registered Scholars</p>
              <p className="font-serif text-2xl font-bold text-slate-900 mt-1">
                {summary.totalStudents || 0}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {role === 'admin'
                  ? `${summary.totalLibrarians || 0} library staff members`
                  : 'active borrowers registered'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Scholar / Student Key Figures */
        <div className="bg-surface border border-border rounded-[6px] p-5 shadow-sm">
          <div className="text-[11px] font-medium uppercase tracking-widest text-slate-500 mb-4 pb-2 border-b border-border-subtle">
            Scholar Loan Account Summary
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
            <div className="py-2 sm:py-0 sm:px-4 first:pl-0">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Volumes Borrowed</p>
              <p className="font-serif text-2xl font-bold text-slate-900 mt-1">
                {studentStats.myIssuedCount || 0}
              </p>
              <p className="text-xs text-slate-600 mt-1">in your possession</p>
            </div>
            <div className="py-2 sm:py-0 sm:px-4">
              <p className="text-xs text-overdue uppercase tracking-wider font-medium">Overdue Returns</p>
              <p className="font-serif text-2xl font-bold text-overdue mt-1">
                {studentStats.myOverdueCount || 0}
              </p>
              <p className="text-xs text-overdue/80 mt-1">past due schedule</p>
            </div>
            <div className="py-2 sm:py-0 sm:px-4 last:pr-0">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Completed Returns</p>
              <p className="font-serif text-2xl font-bold text-slate-900 mt-1">
                {studentStats.myReturnedCount || 0}
              </p>
              <p className="text-xs text-slate-600 mt-1">historical completed loans</p>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT ACTIVE LOANS LEDGER */}
      {role === 'student' && (
        <div className="border border-border bg-surface rounded-[6px] shadow-sm overflow-hidden">
          <div className="p-4 bg-surface-warm border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-serif text-base font-semibold text-slate-900">
                Active Books & Scheduled Deadlines
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Volumes currently charged to your university scholar card.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              iconRight={ArrowRight}
              onClick={() => navigate('/my-books')}
            >
              Full Borrowing History
            </Button>
          </div>

          {studentStats.myActiveIssues && studentStats.myActiveIssues.length > 0 ? (
            <div className="divide-y divide-border-subtle">
              {studentStats.myActiveIssues.map((issue) => {
                const isOverdue = Boolean(issue.isOverdue);
                return (
                  <div
                    key={issue.id}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isOverdue ? 'bg-overdue-light/60' : 'hover:bg-surface-warm/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="department">{issue.bookDepartment}</Badge>
                        {isOverdue ? (
                          <Badge variant="overdue" dot>
                            Overdue ({issue.daysOverdue} days past schedule)
                          </Badge>
                        ) : (
                          <Badge variant="issued" dot>
                            {issue.daysRemaining === 0 ? 'Due Today' : `Due in ${issue.daysRemaining} days`}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {issue.bookTitle}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Author: {issue.bookAuthor}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-slate-600 font-mono">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-sans uppercase">Issued</span>
                        <span>{issue.issueDate}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-sans uppercase">Due Date</span>
                        <span className={isOverdue ? 'text-overdue font-bold' : 'font-medium text-slate-900'}>
                          {issue.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 px-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2 opacity-80" />
              <p className="font-serif text-sm font-semibold text-slate-800">
                No active borrowings charged to your account
              </p>
              <p className="text-xs text-slate-500 mt-1">
                You can search and borrow catalog volumes from any faculty shelf.
              </p>
            </div>
          )}
        </div>
      )}

      {/* STAFF DASHBOARD: DUE THIS WEEK & OVERDUE LISTS (Editorial Layout) */}
      {isStaff && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Due This Week Section */}
          <div className="border border-border bg-surface rounded-[6px] shadow-sm flex flex-col">
            <div className="p-4 bg-surface-warm border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-serif text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <span>Due This Week</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Volumes scheduled for check-in within the next seven days.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 bg-surface px-2 py-0.5 rounded-[4px] border border-border">
                {dueThisWeek.length} items
              </span>
            </div>

            <div className="divide-y divide-border-subtle flex-1 overflow-y-auto max-h-80">
              {dueThisWeek.length > 0 ? (
                dueThisWeek.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-warm/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {item.bookTitle}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        Borrower: <span className="text-slate-800 font-medium">{item.studentName}</span> ({item.studentRegNo}) • {item.studentDept}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-mono text-slate-700 block">
                          {item.dueDate}
                        </span>
                        <span className="text-[10px] text-accent font-medium">
                          {item.daysRemaining === 0 ? 'Due Today' : `in ${item.daysRemaining}d`}
                        </span>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setReturnIssueData(item)}
                      >
                        Return
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 px-4 text-center text-xs text-slate-500">
                  No active loans scheduled for return this week.
                </div>
              )}
            </div>
          </div>

          {/* Overdue Attention Feed */}
          <div className="border border-border bg-surface rounded-[6px] shadow-sm flex flex-col">
            <div className="p-4 bg-surface-warm border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-serif text-base font-semibold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-overdue" />
                  <span>Past Due Deadlines</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Borrowers exceeding standard lending agreements.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                iconRight={ArrowRight}
                onClick={() => navigate('/issues?status=overdue')}
              >
                View All
              </Button>
            </div>

            <div className="divide-y divide-border-subtle flex-1 overflow-y-auto max-h-80">
              {criticalOverdue.length > 0 ? (
                criticalOverdue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-overdue-light/40 hover:bg-overdue-light/70 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Badge variant="overdue" dot>
                          {item.daysOverdue} days past due
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {item.bookTitle}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                        Borrower: <strong>{item.studentName}</strong> ({item.studentRegNo}) • {item.studentEmail}
                      </p>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setReturnIssueData({ ...item, isOverdue: true })}
                    >
                      Process Return
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-12 px-4 text-center text-xs text-slate-500">
                  Zero overdue items. All loans are in compliant status.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RECENT CIRCULATION ACTIVITY LEDGER (Dense, Subtle Dividers) */}
      {isStaff && recentActivity.length > 0 && (
        <div className="border border-border bg-surface rounded-[6px] shadow-sm overflow-hidden">
          <div className="p-4 bg-surface-warm border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-serif text-base font-semibold text-slate-900">
                Recent Circulation Ledger
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sequential chronological record of circulation desk check-outs and check-ins.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              iconRight={ArrowRight}
              onClick={() => navigate('/issues')}
            >
              Full Circulation History
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-warm/60 border-b border-border text-slate-600 uppercase tracking-wider font-medium">
                <tr>
                  <th className="py-2.5 px-3.5">Catalog Volume</th>
                  <th className="py-2.5 px-3.5">Borrower Scholar</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Loan Date</th>
                  <th className="py-2.5 px-3.5">Scheduled Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle bg-surface">
                {recentActivity.map((act) => (
                  <tr key={act.id} className="hover:bg-surface-warm/50 transition-colors">
                    <td className="py-2.5 px-3.5 font-medium text-slate-900">
                      {act.bookTitle}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700">
                      {act.studentName} <span className="font-mono text-slate-400">({act.studentRegNo})</span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      {act.status === 'returned' ? (
                        <Badge variant="neutral">Returned</Badge>
                      ) : act.isOverdue ? (
                        <Badge variant="overdue" dot>Overdue</Badge>
                      ) : (
                        <Badge variant="available" dot>Active</Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-600">{act.issueDate}</td>
                    <td className="py-2.5 px-3.5 font-mono">
                      <span className={act.isOverdue ? 'text-overdue font-bold' : 'text-slate-700'}>
                        {act.dueDate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEPARTMENT STACK ALLOCATION (Dense Text Breakdown) */}
      {isStaff && stats?.departmentDistribution && (
        <div className="bg-surface border border-border rounded-[6px] p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-subtle">
            <h3 className="font-serif text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span>Departmental Stack Distribution</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total: {summary.totalBooks || 0} volumes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {stats.departmentDistribution.map((dept) => {
              const totalCopies = summary.totalBooks || 1;
              const percentage = Math.round((dept.totalCopies / totalCopies) * 100);
              return (
                <div key={dept.department} className="p-3 rounded-[4px] bg-surface-warm/70 border border-border-subtle">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 truncate">{dept.department}</span>
                    <span className="font-mono text-slate-600 ml-2">{dept.totalCopies} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <IssueBookModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onIssued={handleIssueBook}
      />

      <BookModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSave={async (bookData) => {
          await booksApi.create(bookData);
          showToast('Book added to catalog archive.', 'success');
          loadStats();
        }}
      />

      <ReturnModal
        isOpen={Boolean(returnIssueData)}
        onClose={() => setReturnIssueData(null)}
        issue={returnIssueData}
        onConfirmReturn={handleConfirmReturn}
      />
    </div>
  );
};
