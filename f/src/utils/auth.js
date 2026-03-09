const safeGetItem = (key) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key, value) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    console.warn('Failed to set sessionStorage:', key);
  }
};

const safeRemoveItem = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch {
    console.warn('Failed to remove sessionStorage:', key);
  }
};

export const setAuthData = (token, user) => {
  safeSetItem('token', token);
  safeSetItem('user', JSON.stringify(user));
};

export const getAuthData = () => {
  const token = safeGetItem('token');
  const userStr = safeGetItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
};

export const clearAuthData = () => {
  safeRemoveItem('token');
  safeRemoveItem('user');
};

export const isAuthenticated = () => {
  const { token } = getAuthData();
  return !!token;
};

export const isAdmin = () => {
  const { user } = getAuthData();
  return user?.role === 'admin';
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    // Parse JWT payload (token structure: header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;
    
    if (!exp) return false; // No expiry, assume valid
    
    // Check if expired (exp is in seconds, current time is in ms)
    return exp * 1000 < Date.now();
  } catch (e) {
    // If decode fails, assume token is invalid
    return true;
  }
};
