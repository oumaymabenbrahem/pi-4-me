import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // Import Cookies library
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import UserList from "pages/UserList"; // Import the UserList component
import AdminRequests from "pages/AdminRequests"; // Import the AdminRequests component
import SuperAdminDashboard from "pages/SuperAdminDashboard"; // Import the SuperAdminDashboard component
import AdminManagement from "pages/AdminManagement"; // Import the AdminManagement component
import axios from "axios";

import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

// @mui icons
import Icon from "@mui/material/Icon";

// Configuration d'Axios
axios.defaults.withCredentials = true;

// Fonction utilitaire pour obtenir le token de différentes sources
const getToken = () => {
  return (
    Cookies.get("authToken") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken")
  );
};

// Fonction utilitaire pour effacer toutes les traces du token
const clearAllTokens = () => {
  Cookies.remove("authToken");
  localStorage.removeItem("authToken");
  sessionStorage.removeItem("authToken");
  document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Appeler l'API de déconnexion avec le token
    const token = getToken();
    if (token) {
      axios
        .post(
          "http://localhost:5000/api/auth/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .catch((error) => console.error("Logout error:", error));
    }

    // Nettoyer tous les tokens
    clearAllTokens();

    // Rediriger vers le client
    window.location.href = `http://localhost:5173/auth/login`;
  }, [navigate]);

  return null;
};

const useRoutes = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = getToken();

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:5000/api/auth/check-auth", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setUserRole(response.data.user.role);

          // Si la réponse contient un nouveau token, le stocker
          if (response.data.token) {
            Cookies.set("authToken", response.data.token, {
              expires: 30,
              secure: false,
              sameSite: "Lax",
            });
            localStorage.setItem("authToken", response.data.token);
            sessionStorage.setItem("authToken", response.data.token);
          }
        } else {
          clearAllTokens();
          window.location.href = "http://localhost:5173/auth/login";
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        clearAllTokens();
        window.location.href = "http://localhost:5173/auth/login";
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();

    // Configurer une vérification périodique pour maintenir l'état d'authentification
    const interval = setInterval(fetchUserRole, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Common routes for both admin and superadmin
  const commonRoutes = [
    {
      type: "collapse",
      name: "Logout",
      key: "logout",
      icon: <Icon fontSize="small">logout</Icon>,
      route: "/logout",
      component: <Logout />,
    },
  ];

  // Admin specific routes
  const adminRoutes = [
    {
      type: "collapse",
      name: "Dashboard",
      key: "dashboard",
      icon: <Icon fontSize="small">dashboard</Icon>,
      route: "/dashboard",
      component: <Dashboard />,
    },
    {
      type: "collapse",
      name: "Liste des utilisateurs",
      key: "user-list",
      icon: <Icon fontSize="small">people</Icon>,
      route: "/user-list",
      component: <UserList />,
    },
    {
      type: "collapse",
      name: "Demande de Role Admin",
      key: "admin-requests",
      icon: <Icon fontSize="small">admin_panel_settings</Icon>,
      route: "/admin-requests",
      component: <AdminRequests />,
    },
  ];

  // Superadmin specific routes
  const superadminRoutes = [
    {
      type: "collapse",
      name: "Super Admin Dashboard",
      key: "superadmin-dashboard",
      icon: <Icon fontSize="small">dashboard</Icon>,
      route: "/dashboard",
      component: <SuperAdminDashboard />,
    },
    {
      type: "collapse",
      name: "Admin Management",
      key: "admin-management",
      icon: <Icon fontSize="small">admin_panel_settings</Icon>,
      route: "/admin-management",
      component: <AdminManagement />,
    },
    {
      type: "collapse",
      name: "Admin Verification Requests",
      key: "admin-requests",
      icon: <Icon fontSize="small">verified_user</Icon>,
      route: "/admin-requests",
      component: <AdminRequests />,
    },
    {
      type: "collapse",
      name: "User Management",
      key: "user-list",
      icon: <Icon fontSize="small">people</Icon>,
      route: "/user-list",
      component: <UserList />,
    },
  ];

  if (loading) {
    return [];
  }

  // Return routes based on user role
  if (userRole === "superadmin") {
    return [...superadminRoutes, ...commonRoutes];
  } else {
    return [...adminRoutes, ...commonRoutes];
  }
};

export default useRoutes;
