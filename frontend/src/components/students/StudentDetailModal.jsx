import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { studentsApi } from '../../services/api';
import { Mail, Phone, Loader2 } from 'lucide-react';

export const StudentDetailModal = ({ isOpen, onClose, studentId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && studentId) {
      loadStudent();
    } else {
      setData(null);
    }
  }, [isOpen, studentId]);

  const loadStudent = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await studentsApi.getById(studentId);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to retrieve scholar details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scholar Profile & Circulation Dossier"
      subtitle="Complete borrowing history and active loans register."
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Consulting university scholar archives...</span>
        </div>
      ) : error ? (
        <div className="p-3 rounded-[4px] bg-overdue-light text-overdue text-xs border border-overdue-border">
          {error}
        </div>
      ) : data?.student ? (
        <div className="space-y-5">
          {/* Profile Card */}
          <div className="p-4 rounded-[4px] bg-surface-warm border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[4px] bg-primary text-white font-serif text-sm font-semibold flex items-center justify-center">
                {data.student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold text-slate-900">{data.student.name}</h4>
                <div className="flex items-center gap-1.5 text-slate-600 mt-0.5">
                  <span className="font-mono font-medium">{data.student.studentId}</span>
                  <span>•</span>
                  <span>{data.student.department}</span>
                </div>
              </div>
            </div>

            <div className="space-y-0.5 text-slate-600">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{data.student.email}</span>
              </div>
              {data.student.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{data.student.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Borrowing Records */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Recorded Loans ({data.issues?.length || 0})
              </h5>
            </div>

            {data.issues && data.issues.length > 0 ? (
              <div className="border border-border rounded-[4px] divide-y divide-border-subtle max-h-64 overflow-y-auto">
                {data.issues.map((issue) => {
                  const isReturned = issue.status === 'returned';
                  const isOverdue = !isReturned && new Date() > new Date(issue.dueDate);

                  return (
                    <div
                      key={issue.id}
                      className={`p-3 text-xs flex items-center justify-between gap-3 ${
                        isOverdue
                          ? 'bg-overdue-light/60 text-overdue'
                          : isReturned
                          ? 'bg-surface text-slate-700'
                          : 'bg-surface text-slate-900'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{issue.bookTitle}</p>
                        <p className="text-[11px] text-slate-500 truncate">{issue.bookAuthor} • {issue.bookDepartment}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                          <span>Loaned: {issue.issueDate}</span>
                          <span>•</span>
                          <span className={isOverdue ? 'text-overdue font-bold' : ''}>
                            Due: {issue.dueDate}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        {isOverdue ? (
                          <Badge variant="overdue" dot>
                            Overdue
                          </Badge>
                        ) : isReturned ? (
                          <Badge variant="neutral">Returned</Badge>
                        ) : (
                          <Badge variant="available" dot>Active Loan</Badge>
                        )}
                        {issue.fine > 0 && (
                          <p className="text-[10px] font-mono font-bold text-overdue mt-0.5">
                            Fine: ${issue.fine.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic bg-surface-warm p-4 rounded-[4px] text-center border border-border">
                No borrowing history on record for this scholar.
              </p>
            )}
          </div>

          <div className="flex justify-end pt-3 border-t border-border-subtle">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
