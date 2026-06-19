const API_BASE_URL = 'http://127.0.0.1:8000/api';

const client = async (endpoint, { body, ...customConfig } = {}) => {
  const token = localStorage.getItem('admin_token');
  const isFormData = body instanceof FormData;

  const headers = { 
    'Accept': 'application/json'
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 401 Unauthorized (Stateless Sanctum token failure)
    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
      return Promise.reject({ message: 'Session expired. Please login again.' });
    }

    // Read response text first to handle potential non-JSON errors
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { message: text || 'An unexpected server error occurred.' };
    }

    if (response.ok) {
      return data;
    } else {
      return Promise.reject(data);
    }
  } catch (error) {
    console.error('API Network Error:', error);
    return Promise.reject(error);
  }
};

export default client;
