import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Modal,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
} from "@mui/material";
import Footer from "examples/Footer";

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const fetchAdminRequests = async () => {
      const token = Cookies.get("authToken");
      if (!token) {
        console.error("No token found. Please log in.");
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/superadmin/admin-requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && Array.isArray(response.data.users)) {
          setRequests(response.data.users);
        } else {
          console.error("La structure des données est incorrecte");
        }
      } catch (error) {
        console.error("There was an error fetching the admin requests!", error);
        setErrorMessage("Failed to fetch requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminRequests();
  }, []);

  const handleApprove = (userId) => {
    const token = Cookies.get("authToken");
    axios
      .post(
        `http://localhost:5000/api/superadmin/admin-requests/${userId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setRequests((prevRequests) => prevRequests.filter((request) => request._id !== userId));
        setSnackbarMessage("User approved as admin successfully!");
        setOpenSnackbar(true);
      })
      .catch((error) => {
        console.error("There was an error approving the request!", error);
        setErrorMessage("Failed to approve request.");
      });
  };

  const handleReject = (userId) => {
    const token = Cookies.get("authToken");
    axios
      .post(
        `http://localhost:5000/api/superadmin/admin-requests/${userId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setRequests((prevRequests) => prevRequests.filter((request) => request._id !== userId));
        setSnackbarMessage("Request rejected successfully!");
        setOpenSnackbar(true);
      })
      .catch((error) => {
        console.error("There was an error rejecting the request!", error);
        setErrorMessage("Failed to reject request.");
      });
  };

  const handleOpenModal = (image) => {
    setSelectedImage(image);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedImage("");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Verification Requests
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <Alert severity="info">No pending verification requests.</Alert>
        ) : (
          <Grid container spacing={3}>
            {requests.map((request) => (
              <Grid item xs={12} sm={6} md={4} key={request._id}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {request.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {request.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Registered: {new Date(request.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  {request.imageVerif && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={request.imageVerif}
                      alt="Verification Image"
                      sx={{ objectFit: "cover", cursor: "pointer" }}
                      onClick={() => handleOpenModal(request.imageVerif)}
                    />
                  )}
                  <CardActions>
                    <Button size="small" color="primary" onClick={() => handleApprove(request._id)}>
                      Approve as Admin
                    </Button>
                    <Button
                      size="small"
                      color="secondary"
                      onClick={() => handleReject(request._id)}
                    >
                      Reject
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity="success">
            {snackbarMessage}
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
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              maxWidth: "90%",
              maxHeight: "90%",
            }}
          >
            <img
              src={selectedImage}
              alt="Enlarged Verification"
              style={{ width: "100%", height: "auto", maxHeight: "80vh" }}
            />
          </Box>
        </Modal>
      </Container>
      <Footer />
    </DashboardLayout>
  );
};

export default AdminRequests;
