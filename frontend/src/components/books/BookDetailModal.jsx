import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { MapPin, Calendar, Tag, Bookmark, Clock, ArrowLeftRight } from 'lucide-react';

export const BookDetailModal = ({ isOpen, onClose, book, onIssueClick, userRole }) => {
  if (!book) return null;

  const isAvailable = book.availableCopies > 0;
  const isStaff = userRole === 'librarian' || userRole === 'admin';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catalog Holding Record"
      subtitle={`Accession ID #${book.id} • University Stacks`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Main Title & Department */}
        <div className="p-4 rounded-[4px] bg-surface-warm border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="department">{book.department}</Badge>
            {isAvailable ? (
              <Badge variant="available" dot>
                {book.availableCopies} of {book.totalCopies} Available in Stacks
              </Badge>
            ) : (
              <Badge variant="overdue" dot>
                All Copies Circulating (0 Available)
              </Badge>
            )}
          </div>
          <h2 className="font-serif text-xl font-semibold text-slate-900 tracking-tight">
            {book.title}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Author(s): <strong className="text-slate-800">{book.author}</strong>
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-[4px] bg-surface-warm/60 border border-border">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
              Shelf Stack
            </span>
            <span className="font-mono font-medium text-slate-800 mt-0.5 block">
              {book.shelfLocation || 'General Stacks'}
            </span>
          </div>

          <div className="p-2.5 rounded-[4px] bg-surface-warm/60 border border-border">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
              ISBN Identifier
            </span>
            <span className="font-mono text-slate-800 mt-0.5 block truncate">
              {book.isbn || 'N/A'}
            </span>
          </div>

          <div className="p-2.5 rounded-[4px] bg-surface-warm/60 border border-border">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
              Published Year
            </span>
            <span className="font-mono text-slate-800 mt-0.5 block">
              {book.publishedYear || '—'}
            </span>
          </div>

          <div className="p-2.5 rounded-[4px] bg-surface-warm/60 border border-border">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
              Valuation
            </span>
            <span className="font-mono text-slate-800 mt-0.5 block">
              ${Number(book.price).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Description / Monograph abstract */}
        {book.description && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1">
              Annotation & Scope
            </p>
            <p className="text-xs text-slate-700 leading-relaxed bg-surface-warm/40 p-3 rounded-[4px] border border-border-subtle">
              {book.description}
            </p>
          </div>
        )}

        {/* Expected Return Schedule if circulating */}
        {book.nextDueDate && (
          <div className="p-3 rounded-[4px] bg-accent-light border border-accent/40 flex items-center gap-2.5 text-xs text-accent">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>
              Next scheduled check-in expected on <strong className="font-mono">{book.nextDueDate}</strong>
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {isStaff && isAvailable && onIssueClick && (
            <Button
              variant="primary"
              icon={ArrowLeftRight}
              onClick={() => {
                onClose();
                onIssueClick(book);
              }}
            >
              Issue Circulation
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
