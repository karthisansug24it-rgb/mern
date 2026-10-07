import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you wish to proceed with this operation? This record will be permanently altered or removed.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="py-1">
        <div className="flex items-start gap-3 mb-5">
          <div
            className={`w-9 h-9 rounded-[4px] flex items-center justify-center flex-shrink-0 ${
              isDanger
                ? 'bg-overdue-light text-overdue border border-overdue-border'
                : 'bg-accent-light text-accent border border-accent/30'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-sm text-slate-700 leading-relaxed pt-0.5">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
