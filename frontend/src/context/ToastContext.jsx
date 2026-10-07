import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-2">
        {toasts.map((toast) => {
          let containerStyle = 'bg-surface text-slate-800 border-border';
          let iconColor = 'text-primary';
          let Icon = Info;

          if (toast.type === 'success') {
            containerStyle = 'bg-primary-light text-primary border-primary/30';
            iconColor = 'text-primary';
            Icon = CheckCircle2;
          } else if (toast.type === 'error') {
            containerStyle = 'bg-overdue-light text-overdue border-overdue-border';
            iconColor = 'text-overdue';
            Icon = AlertCircle;
          } else if (toast.type === 'warning') {
            containerStyle = 'bg-accent-light text-accent border-accent/40';
            iconColor = 'text-accent';
            Icon = AlertCircle;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-[6px] shadow-sm border text-xs font-medium leading-relaxed transition-all duration-150 transform translate-y-0 ${containerStyle}`}
              role="alert"
            >
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-xs">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded-[2px] -mr-0.5"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
