import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No matching catalog entries found.',
  emptySubtext = 'Adjust filters or enter a different search keyword.',
  stickyHeader = true,
  rowActions,
  pagination,
  onRowClick,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="border border-border bg-surface rounded-[6px] shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto relative">
        <table className="w-full text-left border-collapse text-sm">
          {/* Table Header */}
          <thead
            className={`${
              stickyHeader ? 'sticky top-0 z-10' : ''
            } bg-surface-warm border-b border-border text-xs text-slate-600 uppercase tracking-wider select-none`}
          >
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`py-2.5 px-3.5 font-medium whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.className || ''}`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
              {rowActions && (
                <th className="py-2.5 px-3.5 text-right font-medium w-16">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-border-subtle bg-surface">
            {loading ? (
              // Skeleton Loader Rows
              Array.from({ length: 6 }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={`skel-col-${cIdx}`} className="py-3 px-3.5">
                      <div className="h-4 bg-surface-warm rounded-[3px] w-3/4" />
                    </td>
                  ))}
                  {rowActions && (
                    <td className="py-3 px-3.5 text-right">
                      <div className="h-4 bg-surface-warm rounded-[3px] w-6 ml-auto" />
                    </td>
                  )}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } hover:bg-surface-warm/75`}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      className={`py-2.5 px-3.5 text-slate-800 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key] ?? '—'}
                    </td>
                  ))}

                  {/* Row Actions Menu */}
                  {rowActions && (
                    <td
                      className="py-2 px-3 text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(() => {
                        const actions = typeof rowActions === 'function' ? rowActions(row) : null;
                        if (!actions || actions.length === 0) return null;

                        const isOpen = openMenuId === (row.id || rowIdx);

                        return (
                          <div className="relative inline-block text-left" ref={isOpen ? menuRef : null}>
                            <button
                              type="button"
                              onClick={() => setOpenMenuId(isOpen ? null : (row.id || rowIdx))}
                              className="p-1 rounded-[4px] text-slate-500 hover:text-slate-800 hover:bg-surface-warm transition-colors"
                              aria-label="Row actions"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {isOpen && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-border rounded-[6px] shadow-md z-20 py-1 text-xs animate-in fade-in duration-100">
                                {actions.map((act, aIdx) => {
                                  const Icon = act.icon;
                                  return (
                                    <button
                                      key={aIdx}
                                      type="button"
                                      disabled={act.disabled}
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        act.onClick(row);
                                      }}
                                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                        act.danger
                                          ? 'text-overdue hover:bg-overdue-light'
                                          : 'text-slate-700 hover:bg-surface-warm hover:text-slate-900'
                                      }`}
                                    >
                                      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                                      <span>{act.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              // Empty State
              <tr>
                <td
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="py-12 px-4 text-center"
                >
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="w-10 h-10 rounded-[6px] bg-surface-warm border border-border flex items-center justify-center text-slate-400 mb-3">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <p className="font-serif text-base font-medium text-slate-800">
                      {emptyMessage}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {emptySubtext}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="border-t border-border bg-surface-warm px-4 py-2.5 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing{' '}
            <span className="font-medium text-slate-900">
              {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-slate-900">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-medium text-slate-900">{pagination.total}</span> items
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1 rounded-[4px] border border-border text-slate-600 bg-surface hover:bg-surface-warm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-medium text-slate-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1 rounded-[4px] border border-border text-slate-600 bg-surface hover:bg-surface-warm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
