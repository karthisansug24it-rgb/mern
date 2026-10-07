import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'outline-danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon: Icon,
  iconRight: IconRight,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-[6px]';

  const variants = {
    primary:
      'bg-primary text-white border border-primary hover:bg-primary-hover shadow-sm',
    secondary:
      'bg-surface text-slate-800 border border-border hover:bg-surface-warm hover:border-border-dark shadow-sm',
    accent:
      'bg-accent text-white border border-accent hover:bg-accent-hover shadow-sm',
    ghost:
      'bg-transparent text-slate-600 border border-transparent hover:bg-surface-warm hover:text-slate-900',
    danger:
      'bg-overdue text-white border border-overdue hover:bg-overdue-hover shadow-sm',
    'outline-danger':
      'bg-surface text-overdue border border-overdue-border hover:bg-overdue-light',
  };

  const sizes = {
    sm: 'text-xs h-8 px-2.5 gap-1.5',
    md: 'text-sm h-9 px-3.5 gap-2',
    lg: 'text-sm font-semibold h-10 px-4 gap-2',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      ) : null}
      <span>{children}</span>
      {!loading && IconRight ? <IconRight className="w-3.5 h-3.5 flex-shrink-0" /> : null}
    </button>
  );
};
