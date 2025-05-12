import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  Button,
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function EditUser() {
  const { userId, adminId } = useParams();
  const id = userId || adminId; // Utiliser userId ou adminId si disponible
  const isAdmin = !!adminId; // Vérifier si on édite un admin

  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [formData, setFormData] = useState({
    email: "",
    firstname: "",
    lastname: "",
    role: "",
    status: "active", // Add status field with default value
  });
  const [loading, setLoading] = useState(!user);
  const [saving, setSaving] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); // for error handling
  const navigate = useNavigate();

  // Définir les rôles disponibles selon le type d'utilisateur édité
  const availableRoles = isAdmin ? ["admin", "superadmin"] : ["user", "admin"];
  // Définir les statuts disponibles
  const availableStatuses = ["active", "inactive"];

  useEffect(() => {
    if (!user && id) {
      const fetchUser = async () => {
        const token = Cookies.get("authToken");
        try {
          // Déterminer l'endpoint à utiliser en fonction du type d'utilisateur
          const endpoint = isAdmin
            ? `http://localhost:5000/api/superadmin/admins/${id}`
            : `http://localhost:5000/api/user/${id}`;

          const { data } = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Adapter selon la structure de réponse
          const userData = isAdmin ? data.admin : data.user;

          setUser(userData);
          setFormData({
            email: userData.email,
            firstname: userData.firstname,
            lastname: userData.lastname,
            role: userData.role,
            status: userData.status || "active", // Use user's status or default to active
          });
        } catch (error) {
          console.error("Error fetching user:", error);
          setErrorMessage("Failed to fetch user details.");
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    } else if (!id) {
      setErrorMessage("No user ID provided.");
      setLoading(false);
    } else {
      setFormData({
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        status: user.status || "active", // Use user's status or default to active
      });
      setLoading(false);
    }
  }, [id, user, isAdmin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { email, firstname, lastname, role, status } = formData;
    return email && firstname && lastname && role && status;
  };

  const handleSave = async () => {
    const token = Cookies.get("authToken");

    if (!validateForm()) {
      setErrorMessage("All fields are required.");
      return;
    }

    setSaving(true);
    setErrorMessage(null); // Clear any previous errors before the request

    try {
      // Déterminer l'endpoint à utiliser en fonction du type d'utilisateur
      const endpoint = isAdmin
        ? `http://localhost:5000/api/superadmin/admins/${id}`
        : `http://localhost:5000/api/user/update-user/${id}`;

      const { data } = await axios.put(endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Response: ", data);
      setOpenSnackbar(true);

      // Rediriger vers la liste appropriée
      setTimeout(() => {
        if (isAdmin) {
          navigate("/admin-management");
        } else {
          navigate("/user-list");
        }
      }, 1500);
    } catch (error) {
      console.error("Error updating user:", error);
      setErrorMessage(error.response?.data?.message || "Failed to update user. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress style={{ display: "block", margin: "20px auto" }} />;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Edit {isAdmin ? "Admin" : "User"}
        </Typography>
        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="First Name"
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Last Name"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="role-select-label">Role</InputLabel>
          <Select
            labelId="role-select-label"
            id="role-select"
            name="role"
            value={formData.role}
            label="Role"
            onChange={handleChange}
          >
            {availableRoles.map((role) => (
              <MenuItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select the user&apos;s role</FormHelperText>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            id="status-select"
            name="status"
            value={formData.status}
            label="Status"
            onChange={handleChange}
          >
            {availableStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select the user&apos;s status</FormHelperText>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving}
          sx={{ mr: 2, mt: 2 }}
        >
          {saving ? <CircularProgress size={24} /> : "Save"}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => (isAdmin ? navigate("/admin-management") : navigate("/user-list"))}
          sx={{ mt: 2 }}
        >
          Cancel
        </Button>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity="success">
            {isAdmin ? "Admin" : "User"} updated successfully!
          </Alert>
        </Snackbar>

        {errorMessage && (
          <Snackbar
            open={Boolean(errorMessage)}
            autoHideDuration={3000}
            onClose={() => setErrorMessage(null)}
          >
            <Alert onClose={() => setErrorMessage(null)} severity="error">
              {errorMessage}
            </Alert>
          </Snackbar>
        )}
      </Container>
      <Footer />
    </DashboardLayout>
  );
}

export default EditUser;
