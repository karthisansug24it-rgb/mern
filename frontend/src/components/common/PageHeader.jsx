import React from 'react';

export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  className = '',
}) => {
  return (
    <div className={`border-b border-border pb-5 mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-1">
              {eyebrow}
            </p>
          )}
          <h1 className="font-serif text-2xl font-semibold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
