import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export const LibrarianModal = ({ isOpen, onClose, librarian, onSave }) => {
  const isEditing = Boolean(librarian);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Circulation & Reference',
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (librarian) {
      setFormData({
        name: librarian.name || '',
        email: librarian.email || '',
        department: librarian.department || 'Circulation & Reference',
        phone: librarian.phone || '',
        password: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        department: 'Circulation & Reference',
        phone: '',
        password: 'lib123',
      });
    }
    setErrors({});
  }, [librarian, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full staff name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = 'Valid institutional email is required';
    }
    if (!isEditing && (!formData.password || formData.password.length < 4)) {
      errs.password = 'Passcode must contain at least 4 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Staff Credentials' : 'Appoint New Librarian'}
      subtitle={isEditing ? 'Modify library officer profile or contact records.' : 'Authorize a new staff member to manage circulation desk.'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="p-3 text-xs rounded-[4px] bg-overdue-light text-overdue border border-overdue-border font-medium">
            {errors.submit}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
            Full Staff Name <span className="text-overdue">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Dr. Savitri Venkataraman"
            className={`w-full px-3 py-1.5 text-xs rounded-[4px] border ${
              errors.name ? 'border-overdue' : 'border-border'
            } bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.name && <p className="text-xs text-overdue mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
            Institutional Email <span className="text-overdue">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="librarian@library.com"
            className={`w-full px-3 py-1.5 text-xs rounded-[4px] border ${
              errors.email ? 'border-overdue' : 'border-border'
            } bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.email && <p className="text-xs text-overdue mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
            Library Section / Unit
          </label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="Circulation & Reference"
            className="w-full px-3 py-1.5 text-xs rounded-[4px] border border-border bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
            Official Phone
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98450 11223"
            className="w-full px-3 py-1.5 text-xs rounded-[4px] border border-border bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
            {isEditing ? 'New Passcode (Optional)' : 'Staff Passcode'} {!isEditing && <span className="text-overdue">*</span>}
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={isEditing ? 'Leave blank to preserve' : '••••••••'}
            className={`w-full px-3 py-1.5 text-xs rounded-[4px] border ${
              errors.password ? 'border-overdue' : 'border-border'
            } bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.password && <p className="text-xs text-overdue mt-1">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {isEditing ? 'Update Credentials' : 'Appoint Staff Officer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
