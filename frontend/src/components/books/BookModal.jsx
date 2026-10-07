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
  'General Works',
];

export const BookModal = ({ isOpen, onClose, book, onSave }) => {
  const isEditing = Boolean(book);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    department: 'Computer Science',
    price: '',
    totalCopies: 1,
    isbn: '',
    shelfLocation: '',
    publishedYear: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        department: book.department || 'Computer Science',
        price: book.price !== undefined ? String(book.price) : '',
        totalCopies: book.totalCopies !== undefined ? book.totalCopies : 1,
        isbn: book.isbn || '',
        shelfLocation: book.shelfLocation || '',
        publishedYear: book.publishedYear ? String(book.publishedYear) : '',
        description: book.description || '',
      });
    } else {
      setFormData({
        title: '',
        author: '',
        department: 'Computer Science',
        price: '',
        totalCopies: 1,
        isbn: '',
        shelfLocation: '',
        publishedYear: new Date().getFullYear().toString(),
        description: '',
      });
    }
    setErrors({});
  }, [book, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title of volume is required';
    if (!formData.author.trim()) errs.author = 'Author name is required';
    if (!formData.department.trim()) errs.department = 'Department is required';
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) < 0) {
      errs.price = 'Valid non-negative reference price required';
    }
    if (!formData.totalCopies || isNaN(formData.totalCopies) || parseInt(formData.totalCopies, 10) < 1) {
      errs.totalCopies = 'At least 1 copy required for shelf inventory';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        price: parseFloat(formData.price),
        totalCopies: parseInt(formData.totalCopies, 10),
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear, 10) : null,
      });
      onClose();
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Catalog Record' : 'Accession New Volume to Catalog'}
      subtitle={isEditing ? 'Update shelf classification or catalog metadata.' : 'Record a new book into university stack holdings.'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="p-3 text-xs rounded-[4px] bg-overdue-light text-overdue border border-overdue-border font-medium">
            {errors.submit}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
            Volume Title <span className="text-overdue">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Introduction to Algorithms (4th Edition)"
            className={`w-full px-3 py-1.5 text-xs rounded-[4px] border ${
              errors.title ? 'border-overdue' : 'border-border'
            } bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.title && <p className="text-xs text-overdue mt-1">{errors.title}</p>}
        </div>

        {/* Author & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
              Author(s) <span className="text-overdue">*</span>
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="e.g. Thomas H. Cormen"
              className={`w-full px-3 py-1.5 text-xs rounded-[4px] border ${
                errors.author ? 'border-overdue' : 'border-border'
              } bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary`}
            />
            {errors.author && <p className="text-xs text-overdue mt-1">{errors.author}</p>}
          </div>

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
        </div>

        {/* Price & Copies & Shelf */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
              Ref. Price ($) <span className="text-overdue">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="75.00"
              className={`w-full px-3 py-1.5 text-xs rounded-[4px] border ${
                errors.price ? 'border-overdue' : 'border-border'
              } bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary`}
            />
            {errors.price && <p className="text-xs text-overdue mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
              Total Copies <span className="text-overdue">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.totalCopies}
              onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
              placeholder="3"
              className={`w-full px-3 py-1.5 text-xs rounded-[4px] border ${
                errors.totalCopies ? 'border-overdue' : 'border-border'
              } bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary`}
            />
            {errors.totalCopies && <p className="text-xs text-overdue mt-1">{errors.totalCopies}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
              Shelf Stack Location
            </label>
            <input
              type="text"
              value={formData.shelfLocation}
              onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
              placeholder="Stack CS-01-A"
              className="w-full px-3 py-1.5 text-xs rounded-[4px] border border-border bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>
        </div>

        {/* ISBN & Published Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
              ISBN Number
            </label>
            <input
              type="text"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder="978-0262046305"
              className="w-full px-3 py-1.5 text-xs rounded-[4px] border border-border bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
              Publication Year
            </label>
            <input
              type="number"
              value={formData.publishedYear}
              onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
              placeholder="2022"
              className="w-full px-3 py-1.5 text-xs rounded-[4px] border border-border bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
            Monograph Description / Notes
          </label>
          <textarea
            rows="2"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Syllabus references, edition annotations, or special collections notes..."
            className="w-full px-3 py-1.5 text-xs rounded-[4px] border border-border bg-surface text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Record into Catalog'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
