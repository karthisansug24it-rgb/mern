import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  ArrowLeftRight,
  Users,
  UserCheck,
  BookmarkCheck,
  LogOut,
  Library,
  Compass
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, closeMobileSidebar }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'librarian', 'student'],
    },
    {
      label: 'Books Catalog',
      path: '/books',
      icon: BookOpen,
      roles: ['admin', 'librarian', 'student'],
    },
    {
      label: 'Circulation Desk',
      path: '/issues',
      icon: ArrowLeftRight,
      roles: ['admin', 'librarian'],
    },
    {
      label: 'Student Register',
      path: '/students',
      icon: Users,
      roles: ['admin', 'librarian'],
    },
    {
      label: 'Library Staff',
      path: '/librarians',
      icon: UserCheck,
      roles: ['admin'],
    },
    {
      label: 'My Borrowed Books',
      path: '/my-books',
      icon: BookmarkCheck,
      roles: ['student'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Slim Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-[#1F4D3A] text-[#FAF8F4] border-r border-[#183D2E] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Editorial University Header */}
        <div className="h-16 flex items-center px-5 gap-3 border-b border-[#2A654D]/70 bg-[#1A4232]">
          <div className="w-8 h-8 rounded-[4px] border border-[#B8893B]/40 bg-[#183D2E] flex items-center justify-center text-[#B8893B]">
            <Library className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-sm font-semibold tracking-wide text-[#FAF8F4] truncate">
              University Library
            </h1>
            <p className="text-[11px] font-sans text-[#EAF0EC]/70 uppercase tracking-widest truncate">
              Circulation & Archives
            </p>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-5 pt-5 pb-2 text-[10px] font-medium tracking-widest text-[#B8893B] uppercase">
          Portal Navigation
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#183D2E] text-[#FAF8F4] border-l-2 border-[#B8893B]'
                      : 'text-[#EAF0EC]/80 hover:text-white hover:bg-[#255C46]'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0 opacity-80" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#2A654D]/70 bg-[#183D2E]/80 text-xs">
          <div className="mb-3">
            <p className="font-medium text-[#FAF8F4] truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-[11px] text-[#EAF0EC]/60 truncate font-mono mt-0.5">
              {user?.department || user?.email || ''}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[4px] text-xs font-medium text-[#FAF8F4]/80 bg-[#1F4D3A] hover:bg-[#255C46] border border-[#2A654D] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 opacity-70" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
