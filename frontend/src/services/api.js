const API_BASE_URL = '/api';

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new APIError(data.message || 'An error occurred', response.status, data);
    }

    return { data, status: response.status };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error occurred', 0, null);
  }
};

export const authAPI = {
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  verifyToken: () => apiRequest('/auth/verify'),
};

export const medicationAPI = {
  getAll: () => apiRequest('/medications'),
  
  create: (medication) =>
    apiRequest('/medications', {
      method: 'POST',
      body: JSON.stringify(medication),
    }),

  update: (id, medication) =>
    apiRequest(`/medications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medication),
    }),

  delete: (id) =>
    apiRequest(`/medications/${id}`, {
      method: 'DELETE',
    }),

  markAsTaken: (id, date) =>
    apiRequest(`/medications/${id}/taken`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    }),

  getAdherence: () => apiRequest('/medications/adherence'),
};

export const dashboardAPI = {
  getStats: () => apiRequest('/dashboard/stats'),
  getRecentActivity: () => apiRequest('/dashboard/activity'),
};