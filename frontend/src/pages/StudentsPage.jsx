import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { studentsApi } from '../services/api';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { DataTable } from '../components/common/DataTable';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { StudentModal } from '../components/students/StudentModal';
import { StudentDetailModal } from '../components/students/StudentDetailModal';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone
} from 'lucide-react';

const DEPARTMENTS = [
  'All',
  'Computer Science',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Economics & Management',
  'Mathematics & Computing',
  'Literature & Philosophy',
];

export const StudentsPage = () => {
  const { role } = useAuth();
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [viewingStudentId, setViewingStudentId] = useState(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentsApi.getAll({
        search,
        department: deptFilter === 'All' ? '' : deptFilter,
      });
      setStudents(data.students || []);
    } catch (err) {
      console.error('Error fetching scholars:', err);
      showToast('Could not load student scholars register', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, deptFilter, showToast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleCreateOrUpdate = async (formData) => {
    if (editingStudent) {
      await studentsApi.update(editingStudent.id, formData);
      showToast(`Scholar record for ${formData.name} updated.`, 'success');
      setEditingStudent(null);
    } else {
      await studentsApi.create(formData);
      showToast(`Scholar ${formData.name} registered successfully.`, 'success');
      setIsAddOpen(false);
    }
    fetchStudents();
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    setIsDeletingLoading(true);
    try {
      await studentsApi.delete(deletingStudent.id);
      showToast(`Scholar ${deletingStudent.name} de-registered from library.`, 'success');
      setDeletingStudent(null);
      fetchStudents();
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.message || 'Could not remove scholar record', 'error');
    } finally {
      setIsDeletingLoading(false);
    }
  };

  // Columns
  const columns = [
    {
      key: 'name',
      label: 'Scholar Profile',
      render: (val, student) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[4px] bg-surface-warm border border-border flex items-center justify-center font-serif text-xs font-semibold text-primary">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <button
              type="button"
              onClick={() => setViewingStudentId(student.id)}
              className="font-semibold text-slate-900 hover:text-primary transition-colors text-left block"
            >
              {student.name}
            </button>
            <span className="text-xs text-slate-500 font-mono">{student.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'studentId',
      label: 'Registration ID',
      render: (id) => <span className="font-mono text-xs font-medium text-slate-700">{id || '—'}</span>,
    },
    {
      key: 'department',
      label: 'Academic Department',
      render: (dept) => <Badge variant="department">{dept}</Badge>,
    },
    {
      key: 'phone',
      label: 'Contact',
      render: (phone) => (
        <span className="text-xs text-slate-600 font-mono">
          {phone || '—'}
        </span>
      ),
    },
    {
      key: 'activeIssuedCount',
      label: 'Circulation Status',
      render: (count, student) => {
        const hasOverdue = student.overdueCount > 0;
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-800 font-medium">
              {count || 0} active volume{count === 1 ? '' : 's'}
            </span>
            {hasOverdue && (
              <Badge variant="overdue" dot>
                {student.overdueCount} Overdue
              </Badge>
            )}
          </div>
        );
      },
    },
  ];

  // Actions
  const rowActions = (student) => [
    {
      label: 'Inspect Borrowing Log',
      icon: Eye,
      onClick: () => setViewingStudentId(student.id),
    },
    {
      label: 'Edit Scholar Profile',
      icon: Edit2,
      onClick: () => setEditingStudent(student),
    },
    {
      label: 'De-register Scholar',
      icon: Trash2,
      danger: true,
      onClick: () => setDeletingStudent(student),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Academic Registry & Membership"
        title="Student Scholars Register"
        description="Directory of registered university scholars, departments, and active library circulation privileges."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddOpen(true)}
          >
            Enroll New Scholar
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 rounded-[6px] border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scholar by name, email, or registration ID..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-warm/60 rounded-[4px] border border-border focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-800"
          />
        </div>

        {/* Dept dropdown */}
        <div className="w-full sm:w-64">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-[4px] border border-border bg-surface text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All Academic Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dense DataTable */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        emptyMessage="No scholar accounts found"
        emptySubtext="Adjust the search term or select another academic department."
        rowActions={rowActions}
        onRowClick={(student) => setViewingStudentId(student.id)}
      />

      {/* Modals */}
      <StudentModal
        isOpen={isAddOpen || Boolean(editingStudent)}
        onClose={() => {
          setIsAddOpen(false);
          setEditingStudent(null);
        }}
        student={editingStudent}
        onSave={handleCreateOrUpdate}
      />

      <StudentDetailModal
        isOpen={Boolean(viewingStudentId)}
        onClose={() => setViewingStudentId(null)}
        studentId={viewingStudentId}
      />

      <ConfirmModal
        isOpen={Boolean(deletingStudent)}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleDelete}
        title="De-register Scholar"
        message={`Are you sure you wish to remove scholar record "${deletingStudent?.name}" (${deletingStudent?.studentId}) from the university library register?`}
        confirmText="Remove Record"
        isLoading={isDeletingLoading}
      />
    </div>
  );
};
