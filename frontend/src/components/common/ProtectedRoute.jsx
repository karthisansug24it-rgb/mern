import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';
import { ShieldAlert, Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-library-bg gap-2 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-xs uppercase tracking-wider font-medium">Verifying Academic Credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 rounded-[4px] bg-overdue-light border border-overdue-border text-overdue flex items-center justify-center mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-xl font-semibold text-slate-900">Privileges Restricted</h2>
        <p className="text-xs text-slate-600 max-w-sm mt-1 leading-relaxed">
          Your current scholar access tier (<strong className="font-mono text-slate-800">{role}</strong>) does not have authorization to view this library section.
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => window.location.href = '/dashboard'}
          className="mt-5"
        >
          Return to Library Desk
        </Button>
      </div>
    );
  }

  return children;
};
