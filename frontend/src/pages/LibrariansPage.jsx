import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { librariansApi } from '../services/api';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { DataTable } from '../components/common/DataTable';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { LibrarianModal } from '../components/librarians/LibrarianModal';
import {
  UserCheck,
  Search,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';

export const LibrariansPage = () => {
  const { role } = useAuth();
  const { showToast } = useToast();

  const [librarians, setLibrarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLibrarian, setEditingLibrarian] = useState(null);
  const [deletingLibrarian, setDeletingLibrarian] = useState(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const fetchLibrarians = useCallback(async () => {
    setLoading(true);
    try {
      const data = await librariansApi.getAll({ search });
      setLibrarians(data.librarians || []);
    } catch (err) {
      console.error('Error fetching librarians:', err);
      showToast('Could not load library personnel directory', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, showToast]);

  useEffect(() => {
    fetchLibrarians();
  }, [fetchLibrarians]);

  const handleCreateOrUpdate = async (formData) => {
    if (editingLibrarian) {
      await librariansApi.update(editingLibrarian.id, formData);
      showToast(`Personnel record for ${formData.name} updated.`, 'success');
      setEditingLibrarian(null);
    } else {
      await librariansApi.create(formData);
      showToast(`Staff account for ${formData.name} established.`, 'success');
      setIsAddOpen(false);
    }
    fetchLibrarians();
  };

  const handleDelete = async () => {
    if (!deletingLibrarian) return;
    setIsDeletingLoading(true);
    try {
      await librariansApi.delete(deletingLibrarian.id);
      showToast(`Staff credentials for ${deletingLibrarian.name} revoked.`, 'success');
      setDeletingLibrarian(null);
      fetchLibrarians();
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.message || 'Could not remove staff account', 'error');
    } finally {
      setIsDeletingLoading(false);
    }
  };

  // Columns
  const columns = [
    {
      key: 'name',
      label: 'Staff Member',
      render: (val, lib) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[4px] bg-accent-light border border-accent/40 flex items-center justify-center font-serif text-xs font-semibold text-accent">
            {lib.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{lib.name}</p>
            <span className="text-xs text-slate-500 font-mono">{lib.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Library Section',
      render: (dept) => (
        <span className="text-xs font-medium text-slate-700 bg-surface-warm px-2 py-0.5 rounded-[4px] border border-border">
          {dept || 'Circulation & Reference'}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Official Phone',
      render: (phone) => <span className="text-xs text-slate-600 font-mono">{phone || '—'}</span>,
    },
    {
      key: 'role',
      label: 'System Access Tier',
      render: () => <Badge variant="role-librarian">Circulation Desk Staff</Badge>,
    },
  ];

  // Actions
  const rowActions = (lib) => [
    {
      label: 'Edit Staff Details',
      icon: Edit2,
      onClick: () => setEditingLibrarian(lib),
    },
    {
      label: 'Revoke Credentials',
      icon: Trash2,
      danger: true,
      onClick: () => setDeletingLibrarian(lib),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administrative Oversight"
        title="Library Personnel & Circulation Staff"
        description="Authorized library officers with administrative privileges to manage catalog acquisitions and scholar circulation."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddOpen(true)}
          >
            Appoint New Librarian
          </Button>
        }
      />

      {/* Search */}
      <div className="bg-surface p-4 rounded-[6px] border border-border shadow-sm flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff directory by name or email..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-warm/60 rounded-[4px] border border-border focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-800"
          />
        </div>
      </div>

      {/* Dense DataTable */}
      <DataTable
        columns={columns}
        data={librarians}
        loading={loading}
        emptyMessage="No library staff members found"
        emptySubtext="Use the button above to register a new circulation officer."
        rowActions={rowActions}
      />

      {/* Modals */}
      <LibrarianModal
        isOpen={isAddOpen || Boolean(editingLibrarian)}
        onClose={() => {
          setIsAddOpen(false);
          setEditingLibrarian(null);
        }}
        librarian={editingLibrarian}
        onSave={handleCreateOrUpdate}
      />

      <ConfirmModal
        isOpen={Boolean(deletingLibrarian)}
        onClose={() => setDeletingLibrarian(null)}
        onConfirm={handleDelete}
        title="Revoke Staff Credentials"
        message={`Are you sure you wish to revoke circulation privileges for "${deletingLibrarian?.name}"?`}
        confirmText="Revoke Privileges"
        isLoading={isDeletingLoading}
      />
    </div>
  );
};
