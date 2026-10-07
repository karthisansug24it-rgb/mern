import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

const DEPARTMENTS = [
  'Computer Science',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Economics & Management',
  'Mathematics & Computing',
  'Literature & Philosophy',
  'General Studies',
];

export const StudentModal = ({ isOpen, onClose, student, onSave }) => {
  const isEditing = Boolean(student);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Computer Science',
    studentId: '',
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        department: student.department || 'Computer Science',
        studentId: student.studentId || '',
        phone: student.phone || '',
        password: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        department: 'Computer Science',
        studentId: `STU-2024-${Math.floor(100 + Math.random() * 900)}`,
        phone: '',
        password: 'student123',
      });
    }
    setErrors({});
  }, [student, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full scholar name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = 'Valid institutional email is required';
    }
    if (!formData.department.trim()) errs.department = 'Academic department is required';
    if (!formData.studentId.trim()) errs.studentId = 'Scholar registration ID is required';
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
      title={isEditing ? 'Edit Scholar Record' : 'Enroll New Scholar'}
      subtitle={isEditing ? 'Update student department or contact records.' : 'Register student borrower credentials in library register.'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="p-3 text-xs rounded-[4px] bg-overdue-light text-overdue border border-overdue-border font-medium">
            {errors.submit}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
            Full Scholar Name <span className="text-overdue">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Aarav Sharma"
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
            placeholder="scholar@university.edu"
            className={`w-full px-3 py-1.5 text-xs rounded-[4px] border ${
              errors.email ? 'border-overdue' : 'border-border'
            } bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.email && <p className="text-xs text-overdue mt-1">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
              Academic Department <span className="text-overdue">*</span>
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-[4px] border border-border bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
              Scholar ID / Reg No <span className="text-overdue">*</span>
            </label>
            <input
              type="text"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              placeholder="STU-2024-001"
              className={`w-full px-3 py-1.5 text-xs rounded-[4px] border ${
                errors.studentId ? 'border-overdue' : 'border-border'
              } bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary font-mono`}
            />
            {errors.studentId && <p className="text-xs text-overdue mt-1">{errors.studentId}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
              Contact Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98200 11001"
              className="w-full px-3 py-1.5 text-xs rounded-[4px] border border-border bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
              {isEditing ? 'New Passcode (Optional)' : 'Passcode'} {!isEditing && <span className="text-overdue">*</span>}
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
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {isEditing ? 'Save Changes' : 'Enroll Scholar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
