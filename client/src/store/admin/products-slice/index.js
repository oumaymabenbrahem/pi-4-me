import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
  generatedProductData: null,
  isGeneratingProductData: false,
  isImportingExcel: false,
};

export const addNewProduct = createAsyncThunk(
  "/products/addnewproduct",
  async (formData) => {
    const result = await axios.post(
      "http://localhost:5000/api/admin/products/add-product",
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return result?.data;
  }
);

export const fetchAllProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async () => {
    const result = await axios.get(
      "http://localhost:5000/api/admin/products/all-products"
    );

    return result?.data;
  }
);

export const generateProductData = createAsyncThunk(
  "/products/generateProductData",
  async (imageUrl) => {
    try {
      const result = await axios.post(
        "http://localhost:5000/api/admin/products/generate-product-data",
        { imageUrl },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return result?.data;
    } catch (error) {
      console.error("Error generating product data:", error);
      throw error;
    }
  }
);

export const editProduct = createAsyncThunk(
  "/products/editProduct",
  async ({ id, formData }) => {
    try {
      console.log("Editing product with data:", { id, formData });

      // Ensure all required fields are present and properly formatted
      const formattedData = {
        ...formData,
        quantity: Number(formData.quantity),
        expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : undefined,
        isCollected: Boolean(formData.isCollected),
      };

      console.log("Formatted data being sent:", formattedData);

      const result = await axios.put(
        `http://localhost:5000/api/admin/products/edit-product/${id}`,
        formattedData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return result?.data;
    } catch (error) {
      console.error("Error editing product:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      throw error;
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "/products/deleteProduct",
  async (id) => {
    const result = await axios.delete(
      `http://localhost:5000/api/admin/products/${id}`
    );

    return result?.data;
  }
);

export const importProductsFromExcel = createAsyncThunk(
  "/products/importProductsFromExcel",
  async (formData) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken");

      const result = await axios.post(
        "http://localhost:5000/api/admin/products/import-excel",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          },
        }
      );

      return result?.data;
    } catch (error) {
      console.error("Error importing products from Excel:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }
);

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    clearGeneratedProductData: (state) => {
      state.generatedProductData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
      })
      .addCase(fetchAllProducts.rejected, (state) => {
        state.isLoading = false;
        state.productList = [];
      })
      .addCase(generateProductData.pending, (state) => {
        state.isGeneratingProductData = true;
      })
      .addCase(generateProductData.fulfilled, (state, action) => {
        state.isGeneratingProductData = false;
        state.generatedProductData = action.payload.data;
      })
      .addCase(generateProductData.rejected, (state) => {
        state.isGeneratingProductData = false;
        state.generatedProductData = null;
      })
      .addCase(importProductsFromExcel.pending, (state) => {
        state.isImportingExcel = true;
      })
      .addCase(importProductsFromExcel.fulfilled, (state) => {
        state.isImportingExcel = false;
      })
      .addCase(importProductsFromExcel.rejected, (state) => {
        state.isImportingExcel = false;
      });
  },
});

export const { clearGeneratedProductData } = AdminProductsSlice.actions;
export default AdminProductsSlice.reducer;
