import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Configuration d'Axios pour inclure les credentials par défaut
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";

// Get stored auth data from localStorage for initial state
const storedIsAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

const initialState = {
  isAuthenticated: storedIsAuthenticated || false,
  isLoading: true,
  user: storedUser || null,
  requires2FA: false,
  tempToken: null,
};

// Fonction utilitaire pour stocker le token dans tous les emplacements
const storeToken = (token) => {
  if (!token) return;
  
  // Stocker dans localStorage et sessionStorage
  localStorage.setItem("authToken", token);
  sessionStorage.setItem("authToken", token);
  
  // Stocker dans un cookie (pour partage entre domaines)
  document.cookie = `authToken=${token}; path=/; max-age=${60*60*24*30}; sameSite=Lax`;
  
  console.log("Token stored in all locations:", token);
};

// Fonction utilitaire pour effacer le token de tous les emplacements
const clearToken = () => {
  localStorage.removeItem("authToken");
  sessionStorage.removeItem("authToken");
  document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      console.log('Sending registration data to server:', formData);
      
      // Ensure all fields are properly formatted
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'string') {
          formData[key] = formData[key].trim();
        }
      });
      
      // Ensure imageVerif is never undefined
      if (!formData.imageVerif) {
        formData.imageVerif = "";
      }
      
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData,
        {
          withCredentials: true,
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      console.error('Error response:', error.response?.data);
      return rejectWithValue(error.response?.data || { success: false, message: "Network error" });
    }
  }
);

export const loginUser = createAsyncThunk(
  "/auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.data.success && response.data.token) {
        storeToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      // Capture le message d'erreur du serveur et le renvoie
      if (error.response) {
        console.log('Server error response:', error.response.status, error.response.data);
        return rejectWithValue({
          success: false,
          message: error.response.data.message || "Erreur d'authentification",
          status: error.response.status
        });
      }
      return rejectWithValue({
        success: false,
        message: error.message || "Erreur de connexion au serveur"
      });
    }
  }
);

export const verify2FALogin = createAsyncThunk(
  "/auth/login/verify-2fa",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login/verify-2fa",
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.data.success && response.data.token) {
        storeToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error('2FA verification error:', error);
      // Capture le message d'erreur du serveur et le renvoie
      if (error.response) {
        console.log('Server error response:', error.response.status, error.response.data);
        return rejectWithValue({
          success: false,
          message: error.response.data.message || "Erreur de vérification",
          status: error.response.status
        });
      }
      return rejectWithValue({
        success: false,
        message: error.message || "Erreur de connexion au serveur"
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "/auth/logout",

  async () => {
    const response = await axios.post(
      "http://localhost:5000/api/auth/logout",
      {},
      {
        withCredentials: true,
      }
    );

    clearToken();
    sessionStorage.removeItem("redirectedToBackoffice");
    
    return response.data;
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async () => {
    try {
      // Try to get token from different sources
      let token = null;
      
      // Check localStorage first
      token = localStorage.getItem("authToken");
      
      // If not in localStorage, check sessionStorage
      if (!token) {
        token = sessionStorage.getItem("authToken");
      }
      
      // If not in sessionStorage, try to get from cookies
      if (!token) {
        const tokenCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('authToken='));
        
        if (tokenCookie) {
          token = tokenCookie.split('=')[1];
        }
      }
      
      // If we have a token, use it
      const config = token ? {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      } : { withCredentials: true };
      
      const response = await axios.get(
        "http://localhost:5000/api/auth/check-auth",
        config
      );
      
      // If the response contains a token, store it
      if (response.data.success && response.data.token) {
        storeToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error("Auth check error:", error);
      // If unauthorized or any other error, clear tokens
      clearToken();
      return { success: false, user: null, isAuthenticated: false };
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.isLoading = action.payload.isLoading;
    },
    reset2FA: (state) => {
      state.requires2FA = false;
      state.tempToken = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success && action.payload.require2FA) {
          state.requires2FA = true;
          state.tempToken = action.payload.tempToken;
          state.user = null;
          state.isAuthenticated = false;
        } else {
          state.requires2FA = false;
          state.tempToken = null;
          state.user = action.payload.success ? action.payload.user : null;
          state.isAuthenticated = action.payload.success;
          if (action.payload.success) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify(action.payload.user));
          }
        }
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(verify2FALogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verify2FALogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requires2FA = false;
        state.tempToken = null;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
        if (action.payload.success) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      })
      .addCase(verify2FALogin.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
        if (action.payload.success) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        } else {
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('user');
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        clearToken();
      });
  },
});

export const { setUser, reset2FA } = authSlice.actions;
export default authSlice.reducer;
