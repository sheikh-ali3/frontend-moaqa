import apiClient from './apiClient';

// Function to set the auth token in localStorage
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('sessionPersist', 'true'); // Add session persistence flag
    return true;
  }
  
  // If token is null/undefined, clear token
  localStorage.removeItem('token');
  localStorage.removeItem('sessionPersist'); // Clear session persistence flag
  return false;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  // Check for session persistence first
  if (localStorage.getItem('sessionPersist')) {
    return true;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }
  
  try {
    // Decode the JWT token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Check if token is expired
    const expirationTime = payload.exp * 1000; // exp is in seconds, convert to milliseconds
    const currentTime = Date.now();
    
    if (expirationTime < currentTime) {
      // Token is expired, clear it
      setAuthToken(null);
      return false;
    }
    
    // Token is valid, set session persistence
    localStorage.setItem('sessionPersist', 'true');
    return true;
  } catch (error) {
    console.error('Error parsing token:', error);
    setAuthToken(null);
    return false;
  }
};

// Get user information from token
export const getUserInfo = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }
  
  try {
    // Decode the JWT token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

// Login user
export const login = async (email, password) => {
  try {
    console.log('Attempting login with:', { email, url: '/api/auth/login' });
    const response = await apiClient.post('/api/auth/login', { email, password });
    setAuthToken(response.data.token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to login. Please check your credentials and try again.'
    };
  }
};

// Login superadmin
export const loginSuperAdmin = async (email, password) => {
  try {
    console.log('Attempting superadmin login with:', email);
    const response = await apiClient.post(`/superadmin/login`, { 
      email, 
      password 
    });
    setAuthToken(response.data.token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Superadmin login error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to login. Please check your credentials and try again.'
    };
  }
};

// Logout user
export const logout = () => {
  setAuthToken(null);
  return true;
};

// Initialize authentication - call this at app startup
export const initAuth = () => {
  const token = localStorage.getItem('token');
  return !!token;
}; 