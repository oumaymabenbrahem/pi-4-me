import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Edit, Delete, Search } from "lucide-react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import {
  TextField,
  InputAdornment,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Grid,
  Card,
} from "@mui/material";

function UserList() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = Cookies.get("authToken");
      try {
        const response = await axios.get("http://localhost:5000/api/user/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...users];

    if (searchTerm) {
      result = result.filter(
        (user) =>
          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.firstname && user.firstname.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.lastname && user.lastname.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter]);

  const handleEdit = (user) => {
    navigate(`/edit-user/${user._id}`, { state: { user } });
  };

  const openDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialog(false);
    setUserToDelete(null);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    const token = Cookies.get("authToken");
    try {
      await axios.delete(`http://localhost:5000/api/user/users/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user._id !== userToDelete._id));
      closeDeleteDialog();
    } catch (error) {
      console.error("Error deleting user:", error);
      closeDeleteDialog();
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={6} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={10}>
            <Card sx={{ borderRadius: "10px", boxShadow: "0 8px 16px 0 rgba(0,0,0,0.1)" }}>
              <MDBox p={3}>
                <MDTypography variant="h4" fontWeight="bold" mb={3}>
                  User Management
                </MDTypography>
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search size={20} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Role Filter</InputLabel>
                      <Select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        label="Role Filter"
                      >
                        <MenuItem value="all"></MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ maxHeight: "600px", overflow: "auto" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 2,
                      borderBottom: "2px solid rgba(0, 0, 0, 0.1)",
                      backgroundColor: alpha(theme.palette.info.main, 0.03),
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    <Box sx={{ minWidth: "200px" }}>
                      <MDTypography variant="subtitle2" color="info" fontWeight="medium">
                        Name
                      </MDTypography>
                    </Box>
                    <Box sx={{ flex: 1, px: 2 }}>
                      <MDTypography variant="subtitle2" color="info" fontWeight="medium">
                        Email
                      </MDTypography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: "200px" }}>
                      <MDTypography
                        variant="subtitle2"
                        color="info"
                        fontWeight="medium"
                        sx={{ minWidth: "90px" }}
                      >
                        Rôle
                      </MDTypography>
                      <MDTypography
                        variant="subtitle2"
                        color="info"
                        fontWeight="medium"
                        sx={{ minWidth: "80px" }}
                      >
                        Statut
                      </MDTypography>
                    </Box>
                    <Box sx={{ width: "100px", textAlign: "center" }}>
                      <MDTypography variant="subtitle2" color="info" fontWeight="medium">
                        Actions
                      </MDTypography>
                    </Box>
                  </Box>

                  {filteredUsers.map((user) => (
                    <Box
                      key={user._id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 2,
                        borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                        <Box sx={{ minWidth: "200px" }}>
                          <MDTypography variant="subtitle2" fontWeight="medium">
                            {user.firstname} {user.lastname}
                          </MDTypography>
                        </Box>
                        <Box sx={{ flex: 1, px: 2 }}>
                          <Tooltip title={user.email} placement="top">
                            <MDTypography
                              variant="body2"
                              color="text"
                              sx={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "300px",
                              }}
                            >
                              {user.email}
                            </MDTypography>
                          </Tooltip>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: "200px" }}
                        >
                          <Chip
                            label={user.role}
                            color={
                              user.role === "admin"
                                ? "error"
                                : user.role === "superadmin"
                                ? "default"
                                : "info"
                            }
                            size="small"
                            sx={{
                              minWidth: "90px",
                              backgroundColor:
                                user.role === "superadmin" ? "rgba(0, 0, 0, 0.08)" : undefined,
                              color: user.role === "superadmin" ? "rgba(0, 0, 0, 0.7)" : undefined,
                            }}
                          />
                          <Chip
                            label={user.status || "active"}
                            color={user.status === "active" ? "success" : "warning"}
                            size="small"
                            sx={{ minWidth: "80px" }}
                          />
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          ml: 2,
                          width: "100px",
                          justifyContent: "center",
                        }}
                      >
                        <Tooltip title="Edit user">
                          <IconButton onClick={() => handleEdit(user)} color="info" size="small">
                            <Edit size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete user">
                          <IconButton
                            onClick={() => openDeleteDialog(user)}
                            color="error"
                            size="small"
                          >
                            <Delete size={18} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Dialog
                  open={deleteDialog}
                  onClose={closeDeleteDialog}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <DialogTitle>Confirm deletion</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Are you sure you want to delete this user?{" "}
                      {userToDelete && (
                        <Box sx={{ mt: 1, fontWeight: "bold" }}>
                          {userToDelete.firstname} {userToDelete.lastname}
                          <br />
                          {userToDelete.email}
                        </Box>
                      )}
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={closeDeleteDialog}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                      Remove
                    </Button>
                  </DialogActions>
                </Dialog>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UserList;
