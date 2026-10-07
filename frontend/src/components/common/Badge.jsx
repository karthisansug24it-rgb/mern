import React from 'react';

export const Badge = ({
  variant = 'neutral', // 'available' | 'issued' | 'overdue' | 'department' | 'role-admin' | 'role-librarian' | 'role-student' | 'neutral'
  children,
  className = '',
  dot = false,
}) => {
  const variants = {
    available:
      'bg-primary-light text-primary border border-primary/25',
    issued:
      'bg-accent-light text-accent hover:border-accent border border-accent/30',
    overdue:
      'bg-overdue-light text-overdue border border-overdue-border font-medium',
    department:
      'bg-surface-warm text-slate-700 border border-border font-normal',
    'role-admin':
      'bg-primary text-white border border-primary font-medium tracking-wide',
    'role-librarian':
      'bg-accent text-white border border-accent font-medium tracking-wide',
    'role-student':
      'bg-surface text-slate-700 border border-border font-medium tracking-wide',
    neutral:
      'bg-surface-warm text-slate-600 border border-border',
  };

  const dotColors = {
    available: 'bg-primary',
    issued: 'bg-accent',
    overdue: 'bg-overdue',
    department: 'bg-slate-400',
    'role-admin': 'bg-white',
    'role-librarian': 'bg-white',
    'role-student': 'bg-primary',
    neutral: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-[4px] transition-colors leading-none ${
        variants[variant] || variants.neutral
      } ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            dotColors[variant] || 'bg-slate-400'
          }`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};
