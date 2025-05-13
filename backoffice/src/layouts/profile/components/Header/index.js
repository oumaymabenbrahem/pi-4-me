import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// @mui/material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { makeStyles } from "@mui/styles";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";

// Icons
import { Eye, EyeOff, Settings } from "lucide-react";

// Images
import defaultAvatar from "assets/images/bruce-mars.jpg";
import backgroundImage from "assets/images/bg-profile.jpeg";

const useStyles = makeStyles(() => ({
  card: {
    position: "relative",
    marginTop: "-64px", // theme.spacing(-8)
    marginLeft: "24px", // theme.spacing(3)
    marginRight: "24px", // theme.spacing(3)
    paddingTop: "16px", // theme.spacing(2)
    paddingBottom: "16px", // theme.spacing(2)
    paddingLeft: "16px", // theme.spacing(2)
    paddingRight: "16px", // theme.spacing(2)
  },
  avatar: {
    width: "96px", // theme.spacing(12)
    height: "96px", // theme.spacing(12)
    boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.16)", // theme.shadows[3]
  },
  button: {
    marginTop: "16px", // theme.spacing(2)
  },
  input: {
    marginBottom: "16px", // theme.spacing(2)
  },
}));

function Header({ children }) {
  const classes = useStyles();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [previewImage, setPreviewImage] = useState(defaultAvatar);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = Cookies.get("authToken");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5000/api/user/userdetails", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data.user) {
          setUser(data.user);
          setPreviewImage(data.user.image ? data.user.image : defaultAvatar);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const token = Cookies.get("authToken");

    try {
      const formData = new FormData();
      formData.append("firstname", user.firstname);
      formData.append("lastname", user.lastname);
      formData.append("email", user.email);
      formData.append("address", user.address);
      formData.append("phone", user.phone);

      if (newPassword) formData.append("password", newPassword);

      const userId = user._id; // Extract userId from user object

      const response = await axios.put(
        `http://localhost:5000/api/user/update/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data.user);
      setIsEditing(false);
      setNewPassword("");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile.");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6)
            )}, url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        }}
      />
      <Card className={classes.card}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <MDAvatar src={previewImage} alt="profile-image" className={classes.avatar} />
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              <MDTypography variant="h5" fontWeight="medium">
                {user ? `${user.firstname} ${user.lastname}` : "Loading..."}
              </MDTypography>
              <MDTypography variant="button" color="text" fontWeight="regular">
                {user ? user.email : ""}
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
        <MDBox display="flex" justifyContent="flex-end" mt={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Settings size={20} />}
            onClick={() => setIsEditing(true)}
            className={classes.button}
          >
            Modify Profile
          </Button>
        </MDBox>
        {isEditing && (
          <form onSubmit={handleSubmit}>
            <TextField
              label="First Name"
              value={user.firstname}
              onChange={(e) => setUser({ ...user, firstname: e.target.value })}
              fullWidth
              className={classes.input}
            />
            <TextField
              label="Last Name"
              value={user.lastname}
              onChange={(e) => setUser({ ...user, lastname: e.target.value })}
              fullWidth
              className={classes.input}
            />
            <TextField
              label="Email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              fullWidth
              className={classes.input}
            />
            <TextField
              label="Address"
              value={user.address}
              onChange={(e) => setUser({ ...user, address: e.target.value })}
              fullWidth
              className={classes.input}
            />
            <TextField
              label="Phone"
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
              fullWidth
              className={classes.input}
            />
            <TextField
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              className={classes.input}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <MDBox display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setIsEditing(false)}
                className={classes.button}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.button}
                sx={{ ml: 2 }}
              >
                Save Changes
              </Button>
            </MDBox>
          </form>
        )}
      </Card>
    </MDBox>
  );
}

// Default props
Header.defaultProps = {
  children: "",
};

// Typechecking props for the Header
Header.propTypes = {
  children: PropTypes.node,
};

export default Header;
