import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertCircle, CheckCircle2, ArrowLeftRight } from 'lucide-react';

export const ReturnModal = ({ isOpen, onClose, issue, onConfirmReturn }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!issue) return null;

  const isOverdue = Boolean(issue.isOverdue || (new Date() > new Date(issue.dueDate)));
  const daysOverdue = issue.daysOverdue || 0;
  const estimatedFine = isOverdue ? Math.max(1, daysOverdue) * 1.0 : 0.0;

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      await onConfirmReturn(issue.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to register volume check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Book Check-In"
      subtitle="Discharge circulation loan and restore volume to library stack."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-[4px] bg-overdue-light text-overdue border border-overdue-border font-medium">
            {error}
          </div>
        )}

        {/* Volume & Scholar Summary */}
        <div className="p-3.5 rounded-[4px] bg-surface-warm border border-border text-xs space-y-2">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Catalog Volume</span>
            <p className="font-serif text-sm font-semibold text-slate-900 mt-0.5">{issue.bookTitle}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Scholar</span>
              <p className="font-medium text-slate-800">{issue.studentName}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Loan Date</span>
              <p className="font-mono text-slate-700">{issue.issueDate}</p>
            </div>
          </div>
        </div>

        {/* Overdue Warning or Compliant Notice */}
        {isOverdue ? (
          <div className="p-3.5 rounded-[4px] bg-overdue-light border border-overdue-border text-overdue text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>LOAN IS OVERDUE</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              This volume was scheduled for return on <strong className="font-mono">{issue.dueDate}</strong> and is currently{' '}
              <strong className="underline text-overdue">{daysOverdue > 0 ? `${daysOverdue} days` : 'past deadline'}</strong>.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-overdue-border/60 text-xs font-semibold text-overdue">
              <span>Standard Late Fee Assessment ($1.00/day):</span>
              <span className="font-mono text-sm">${estimatedFine.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-[4px] bg-primary-light border border-primary/25 text-primary text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <div>
              <p className="font-semibold">Compliant Schedule</p>
              <p className="text-slate-600">Volume scheduled for {issue.dueDate}. No late penalties apply.</p>
            </div>
          </div>
        )}

        <p className="text-[11px] text-slate-500 italic">
          Check-in verification will increment available copies in the general stack catalog.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant={isOverdue ? 'danger' : 'primary'}
            loading={submitting}
            onClick={handleConfirm}
            icon={ArrowLeftRight}
          >
            Confirm Check-in
          </Button>
        </div>
      </div>
    </Modal>
  );
};
