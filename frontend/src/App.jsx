import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BooksPage } from './pages/BooksPage';
import { IssuesPage } from './pages/IssuesPage';
import { StudentsPage } from './pages/StudentsPage';
import { LibrariansPage } from './pages/LibrariansPage';
import { MyBooksPage } from './pages/MyBooksPage';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated Protected Shell */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Index redirect to dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />

              {/* Common Routes */}
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="books" element={<BooksPage />} />

              {/* Librarian & Admin Routes */}
              <Route
                path="issues"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                    <IssuesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="students"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                    <StudentsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin-only Routes */}
              <Route
                path="librarians"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <LibrariansPage />
                  </ProtectedRoute>
                }
              />

              {/* Student-only Routes */}
              <Route
                path="my-books"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <MyBooksPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
