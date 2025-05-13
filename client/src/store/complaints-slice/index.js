import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  userComplaints: [],
  allComplaints: [],
  currentComplaint: null,
  error: null,
  success: false,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  }
};

// Créer une nouvelle réclamation
export const createComplaint = createAsyncThunk(
  "complaints/create",
  async (complaintData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/complaints/create",
        complaintData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Récupérer les réclamations de l'utilisateur connecté
export const getUserComplaints = createAsyncThunk(
  "complaints/getUserComplaints",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/complaints/user"
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Récupérer les détails d'une réclamation
export const getComplaintDetails = createAsyncThunk(
  "complaints/getDetails",
  async (complaintId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/complaints/details/${complaintId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Récupérer toutes les réclamations (pour les administrateurs)
export const getAllComplaints = createAsyncThunk(
  "complaints/getAll",
  async (queryParams, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, status, category, priority } = queryParams || {};
      let url = `http://localhost:5000/api/complaints/all?page=${page}&limit=${limit}`;
      
      if (status) url += `&status=${status}`;
      if (category) url += `&category=${category}`;
      if (priority) url += `&priority=${priority}`;
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Mettre à jour le statut d'une réclamation (pour les administrateurs)
export const updateComplaintStatus = createAsyncThunk(
  "complaints/updateStatus",
  async ({ complaintId, statusData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/complaints/status/${complaintId}`,
        statusData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Répondre à une réclamation (pour les administrateurs)
export const respondToComplaint = createAsyncThunk(
  "complaints/respond",
  async ({ complaintId, responseData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/complaints/respond/${complaintId}`,
        responseData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Supprimer une réclamation (pour les administrateurs)
export const deleteComplaint = createAsyncThunk(
  "complaints/delete",
  async (complaintId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/complaints/${complaintId}`
      );
      return { ...response.data, complaintId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const complaintsSlice = createSlice({
  name: "complaints",
  initialState,
  reducers: {
    resetComplaintState: (state) => {
      state.error = null;
      state.success = false;
    },
    clearCurrentComplaint: (state) => {
      state.currentComplaint = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Créer une réclamation
      .addCase(createComplaint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.userComplaints.unshift(action.payload.complaint);
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Une erreur est survenue";
      })
      
      // Récupérer les réclamations de l'utilisateur
      .addCase(getUserComplaints.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserComplaints.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userComplaints = action.payload.complaints;
      })
      .addCase(getUserComplaints.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Une erreur est survenue";
      })
      
      // Récupérer les détails d'une réclamation
      .addCase(getComplaintDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getComplaintDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentComplaint = action.payload.complaint;
      })
      .addCase(getComplaintDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Une erreur est survenue";
      })
      
      // Récupérer toutes les réclamations (admin)
      .addCase(getAllComplaints.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllComplaints.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allComplaints = action.payload.complaints;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllComplaints.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Une erreur est survenue";
      })
      
      // Mettre à jour le statut d'une réclamation
      .addCase(updateComplaintStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateComplaintStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.currentComplaint = action.payload.complaint;
        
        // Mettre à jour la réclamation dans les listes
        const updatedComplaint = action.payload.complaint;
        state.allComplaints = state.allComplaints.map(complaint => 
          complaint._id === updatedComplaint._id ? updatedComplaint : complaint
        );
        state.userComplaints = state.userComplaints.map(complaint => 
          complaint._id === updatedComplaint._id ? updatedComplaint : complaint
        );
      })
      .addCase(updateComplaintStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Une erreur est survenue";
      })
      
      // Répondre à une réclamation
      .addCase(respondToComplaint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(respondToComplaint.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.currentComplaint = action.payload.complaint;
        
        // Mettre à jour la réclamation dans les listes
        const updatedComplaint = action.payload.complaint;
        state.allComplaints = state.allComplaints.map(complaint => 
          complaint._id === updatedComplaint._id ? updatedComplaint : complaint
        );
        state.userComplaints = state.userComplaints.map(complaint => 
          complaint._id === updatedComplaint._id ? updatedComplaint : complaint
        );
      })
      .addCase(respondToComplaint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Une erreur est survenue";
      })
      
      // Supprimer une réclamation
      .addCase(deleteComplaint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteComplaint.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.allComplaints = state.allComplaints.filter(
          complaint => complaint._id !== action.payload.complaintId
        );
        state.userComplaints = state.userComplaints.filter(
          complaint => complaint._id !== action.payload.complaintId
        );
        if (state.currentComplaint && state.currentComplaint._id === action.payload.complaintId) {
          state.currentComplaint = null;
        }
      })
      .addCase(deleteComplaint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Une erreur est survenue";
      });
  },
});

export const { resetComplaintState, clearCurrentComplaint } = complaintsSlice.actions;
export default complaintsSlice.reducer;
