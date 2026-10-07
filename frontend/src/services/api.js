const API_BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('bibliotech_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.status === 401) {
      // If unauthorized on protected route, clear stale token
      // Avoid redirecting if already on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('bibliotech_token');
        localStorage.removeItem('bibliotech_user');
      }
    }
    throw error;
  }
}

export const authApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  me: () => request('/auth/me'),
  getDemoAccounts: () => request('/auth/demo-accounts'),
};

export const statsApi = {
  getSummary: () => request('/stats/summary'),
};

export const booksApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department) query.append('department', params.department);
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    return request(`/books?${query.toString()}`);
  },
  getDepartments: () => request('/books/departments'),
  getById: (id) => request(`/books/${id}`),
  create: (bookData) => request('/books', { method: 'POST', body: JSON.stringify(bookData) }),
  update: (id, bookData) => request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(bookData) }),
  delete: (id) => request(`/books/${id}`, { method: 'DELETE' }),
};

export const issuesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.studentId) query.append('studentId', params.studentId);
    return request(`/issues?${query.toString()}`);
  },
  issueBook: (data) => request('/issues', { method: 'POST', body: JSON.stringify(data) }),
  returnBook: (issueId) => request(`/issues/${issueId}/return`, { method: 'POST' }),
};

export const studentsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department) query.append('department', params.department);
    return request(`/students?${query.toString()}`);
  },
  getById: (id) => request(`/students/${id}`),
  create: (data) => request('/students', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/students/${id}`, { method: 'DELETE' }),
};

export const librariansApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    return request(`/librarians?${query.toString()}`);
  },
  create: (data) => request('/librarians', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/librarians/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/librarians/${id}`, { method: 'DELETE' }),
};
