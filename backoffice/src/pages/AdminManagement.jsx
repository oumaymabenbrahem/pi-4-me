import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import { CircularProgress, Alert, Snackbar } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";

function AdminManagement() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("authToken");
      const response = await axios.get("http://localhost:5000/api/superadmin/admins", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setAdmins(response.data.admins);
      } else {
        setError("Failed to load admin users");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      setError("An error occurred while fetching admin users");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (adminId) => {
    navigate(`/edit-admin/${adminId}`);
  };

  const handleDelete = (admin) => {
    setAdminToDelete(admin);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const token = Cookies.get("authToken");
      const response = await axios.delete(
        `http://localhost:5000/api/superadmin/admins/${adminToDelete._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Admin removed successfully",
          severity: "success",
        });
        // Refetch the admin list
        fetchAdmins();
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || "Failed to remove admin",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      setSnackbar({
        open: true,
        message: "An error occurred while removing the admin",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setAdminToDelete(null);
    }
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Administrator Management
                </MDTypography>
                <MDButton
                  variant="contained"
                  color="success"
                  onClick={() => navigate("/create-admin")}
                >
                  Add New Admin
                </MDButton>
              </MDBox>
              <MDBox p={3}>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" my={5}>
                    <CircularProgress color="info" />
                  </MDBox>
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : (
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="administrators table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Username</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Created At</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {admins.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <MDTypography variant="body2">No administrators found</MDTypography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          admins.map((admin) => (
                            <TableRow key={admin._id}>
                              <TableCell>{admin.username}</TableCell>
                              <TableCell>{admin.email}</TableCell>
                              <TableCell>
                                {admin.firstname} {admin.lastname}
                              </TableCell>
                              <TableCell>
                                {new Date(admin.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  aria-label="edit"
                                  color="info"
                                  onClick={() => handleEdit(admin._id)}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  aria-label="delete"
                                  color="error"
                                  onClick={() => handleDelete(admin)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Remove Administrator</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove administrator {adminToDelete?.username}? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDeleteDialogOpen(false)} color="info">
            Cancel
          </MDButton>
          <MDButton onClick={confirmDelete} color="error" autoFocus>
            Remove
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default AdminManagement;
