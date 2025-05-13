// Authentication service utilities

/**
 * Get the user's authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export const getUserToken = () => {
  return localStorage.getItem('token');
};

/**
 * Set the user's authentication token in localStorage
 * @param {string} token - The authentication token to store
 */
export const setUserToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Remove the user's authentication token from localStorage
 */
export const removeUserToken = () => {
  localStorage.removeItem('token');
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user has a valid token
 */
export const isAuthenticated = () => {
  return !!getUserToken();
};

/**
 * Get the user's role from localStorage
 * @returns {string|null} The user's role or null if not found
 */
export const getUserRole = () => {
  return localStorage.getItem('userRole');
};

/**
 * Set the user's role in localStorage
 * @param {string} role - The user's role to store
 */
export const setUserRole = (role) => {
  localStorage.setItem('userRole', role);
};

/**
 * Remove the user's role from localStorage
 */
export const removeUserRole = () => {
  localStorage.removeItem('userRole');
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  removeUserToken();
  removeUserRole();
}; 