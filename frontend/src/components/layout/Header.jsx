import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { statsApi } from '../../services/api';
import { Badge } from '../common/Badge';

export const Header = ({ onMenuClick }) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [overdueCount, setOverdueCount] = useState(0);
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    async function checkOverdue() {
      try {
        const data = await statsApi.getSummary();
        if (role === 'student' && data.studentStats) {
          setOverdueCount(data.studentStats.myOverdueCount || 0);
        } else {
          setOverdueCount(data.summary?.totalOverdue || 0);
        }
      } catch {
        // Silent catch
      }
    }
    checkOverdue();
  }, [role]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/books?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const roleVariant =
    role === 'admin'
      ? 'role-admin'
      : role === 'librarian'
      ? 'role-librarian'
      : 'role-student';

  const roleDisplayTitle =
    role === 'admin'
      ? 'Administrator'
      : role === 'librarian'
      ? 'Circulation Librarian'
      : 'Registered Scholar';

  return (
    <header className="sticky top-0 z-30 h-14 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-[4px] text-slate-600 hover:bg-surface-warm transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Global Catalog Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search library catalog by title, author, or ISBN..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-warm/80 rounded-[4px] border border-border focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-slate-800 placeholder-slate-400"
          />
        </form>
      </div>

      {/* Right: Overdue Notice & User Role Badge */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Overdue alert indicator */}
        {overdueCount > 0 && (
          <button
            onClick={() => navigate(role === 'student' ? '/my-books' : '/issues?status=overdue')}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-[4px] bg-overdue-light text-overdue border border-overdue-border font-medium hover:bg-overdue-light/80 transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{overdueCount} Overdue Item{overdueCount > 1 ? 's' : ''}</span>
          </button>
        )}

        {/* User Role Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 hidden md:inline">
            {user?.name}
          </span>
          <Badge variant={roleVariant}>
            {roleDisplayTitle}
          </Badge>
        </div>
      </div>
    </header>
  );
};
