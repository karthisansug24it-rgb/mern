import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import {
  Library,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  BookOpen
} from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('admin@library.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const demoAccounts = [
    {
      role: 'admin',
      label: 'Admin',
      name: 'Prof. Rajeshwari Sen',
      email: 'admin@library.com',
      password: 'admin123',
      dept: 'Library Director',
    },
    {
      role: 'librarian',
      label: 'Librarian',
      name: 'Dr. Savitri Venkataraman',
      email: 'savitri.librarian@library.com',
      password: 'lib123',
      dept: 'Chief Librarian',
    },
    {
      role: 'student',
      label: 'Scholar',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@university.edu',
      password: 'student123',
      dept: 'Computer Science',
    },
    {
      role: 'student',
      label: 'Scholar',
      name: 'Priya Patel',
      email: 'priya.patel@university.edu',
      password: 'student123',
      dept: 'Electrical & Electronics',
    },
  ];

  const handleSelectDemo = (account) => {
    setRole(account.role);
    setEmail(account.email);
    setPassword(account.password);
    setErrors({});
  };

  const handleRoleTabClick = (newRole) => {
    setRole(newRole);
    const matching = demoAccounts.find((d) => d.role === newRole);
    if (matching) {
      setEmail(matching.email);
      setPassword(matching.password);
    }
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Institutional email is required.';
    } else if (!email.includes('@')) {
      errs.email = 'Please provide a valid institutional email format.';
    }
    if (!password) {
      errs.password = 'Passcode is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const user = await login({ email, password, role });
      showToast(`Welcome, ${user.name}.`, 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || 'Authentication failed. Please verify credentials.';
      setErrors({ form: msg });
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-library-bg flex flex-col md:flex-row font-sans">
      {/* Branded Editorial Side Panel */}
      <div className="md:w-5/12 bg-[#1F4D3A] text-[#FAF8F4] p-8 md:p-14 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#183D2E]">
        <div>
          {/* Crest & Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-[4px] border border-[#B8893B]/50 bg-[#183D2E] flex items-center justify-center text-[#B8893B]">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif text-base font-semibold tracking-wide text-[#FAF8F4]">
                University Library
              </p>
              <p className="text-[11px] font-sans text-[#EAF0EC]/70 uppercase tracking-widest">
                Archives & Circulation
              </p>
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            <h2 className="font-serif text-2xl md:text-3xl font-normal leading-tight text-[#FAF8F4]">
              The central repository of scholarship and archival manuscripts.
            </h2>
            <div className="w-12 h-[2px] bg-[#B8893B]" />
            <p className="text-xs text-[#EAF0EC]/80 leading-relaxed font-sans pt-2">
              Access over seventy thousand catalogued volumes, monograph collections, thesis archives, and research circulations across academic departments.
            </p>
          </div>
        </div>

        {/* Editorial Quote */}
        <div className="pt-12 md:pt-0">
          <blockquote className="border-l-2 border-[#B8893B]/60 pl-4 text-xs italic text-[#EAF0EC]/80 leading-relaxed">
            "A library is an institution where the collective memory of human scholarship resides in perpetual quietude."
          </blockquote>
          <p className="text-[11px] text-[#B8893B] mt-2 pl-4 uppercase tracking-wider font-medium">
            Bodleian Library Inscription
          </p>
        </div>
      </div>

      {/* Login Form Panel */}
      <div className="flex-1 p-6 md:p-14 flex items-center justify-center bg-library-bg">
        <div className="w-full max-w-md bg-surface p-6 sm:p-8 rounded-[6px] border border-border shadow-sm">
          {/* Header */}
          <div className="mb-6">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">
              Portal Access
            </p>
            <h3 className="font-serif text-2xl font-semibold text-slate-900 tracking-tight">
              Member Sign In
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Select your university role and provide registered credentials.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="mb-5">
            <div className="flex border border-border rounded-[4px] p-0.5 bg-surface-warm text-xs">
              {[
                { id: 'admin', label: 'Admin', icon: ShieldCheck },
                { id: 'librarian', label: 'Librarian', icon: UserCheck },
                { id: 'student', label: 'Scholar', icon: GraduationCap },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = role === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleRoleTabClick(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[3px] font-medium transition-colors ${
                      isActive
                        ? 'bg-surface text-slate-900 shadow-sm border border-border/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Global Form Error */}
          {errors.form && (
            <div className="mb-4 p-3 rounded-[4px] bg-overdue-light border border-overdue-border text-overdue text-xs leading-relaxed font-medium">
              {errors.form}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scholar@university.edu"
                  className={`w-full pl-8 pr-3 py-2 text-sm bg-surface rounded-[4px] border ${
                    errors.email ? 'border-overdue focus:ring-overdue' : 'border-border focus:ring-primary'
                  } focus:outline-none focus:ring-1 transition-colors text-slate-900`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-overdue mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
                Passcode / Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-8 pr-3 py-2 text-sm bg-surface rounded-[4px] border ${
                    errors.password ? 'border-overdue focus:ring-overdue' : 'border-border focus:ring-primary'
                  } focus:outline-none focus:ring-1 transition-colors text-slate-900`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-overdue mt-1 font-medium">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
              iconRight={ArrowRight}
            >
              Sign In to Library Portal
            </Button>
          </form>

          {/* Quick Demo Accounts Switcher */}
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">
              Demonstration Accounts
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {demoAccounts.map((account) => {
                const isSelected = role === account.role && email === account.email;
                return (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleSelectDemo(account)}
                    className={`flex items-center justify-between p-2 rounded-[4px] border text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-primary-light border-primary/40 text-primary font-medium'
                        : 'bg-surface-warm border-border hover:bg-surface-sand text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-semibold">{account.name}</span>
                      <span className="text-[11px] text-slate-500 ml-1.5 font-sans">
                        ({account.dept})
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {account.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
