const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(BASE + path, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (name, email, password) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  me: () => request('/api/auth/me'),

  getTrips: () => request('/api/trips'),
  createTrip: (data) => request('/api/trips', { method: 'POST', body: JSON.stringify(data) }),
  getTrip: (id) => request(`/api/trips/${id}`),
  updateTrip: (id, data) => request(`/api/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTrip: (id) => request(`/api/trips/${id}`, { method: 'DELETE' }),
  getViewToken: (id) => request(`/api/trips/${id}/view-token`),
  regenerateToken: (id) => request(`/api/trips/${id}/regenerate-token`, { method: 'POST' }),

  getMembers: (tripId) => request(`/api/trips/${tripId}/members`),
  addMember: (tripId, name) => request(`/api/trips/${tripId}/members`, { method: 'POST', body: JSON.stringify({ name }) }),
  removeMember: (tripId, memberId) => request(`/api/trips/${tripId}/members/${memberId}`, { method: 'DELETE' }),

  getExpenses: (tripId) => request(`/api/expenses/trip/${tripId}`),
  addExpense: (data) => request('/api/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id, data) => request(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/api/expenses/${id}`, { method: 'DELETE' }),

  getSummary: (tripId) => request(`/api/expenses/trip/${tripId}/summary`),

  getSettlements: (tripId) => request(`/api/settlements/trip/${tripId}`),
  calculateSettlements: (tripId) => request(`/api/settlements/trip/${tripId}/calculate`, { method: 'POST' }),

  getPublicTrip: (token) => request(`/api/public/trips/${token}`),

  getAdminUsers: () => request('/api/admin/users'),
  deleteAdminUser: (userId) => request(`/api/admin/users/${userId}`, { method: 'DELETE' }),
  getAdminStats: () => request('/api/admin/stats'),
  getAdminTrips: () => request('/api/admin/trips'),
};
