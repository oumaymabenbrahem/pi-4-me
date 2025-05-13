import React, { useState, useEffect, useMemo } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import useRoutes from "routes";
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";
import Cookies from "js-cookie";
import UserList from "pages/UserList";
import EditUser from "pages/EditUser";
import AdminManagement from "pages/AdminManagement";
import SuperAdminDashboard from "pages/SuperAdminDashboard";
import CreateAdmin from "pages/CreateAdmin";
import { CircularProgress } from "@mui/material";
import axios from "axios";

// Configuration d'Axios pour inclure les credentials par défaut
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";

function App() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const rtlCache = useMemo(() => {
    if (direction === "rtl") {
      return createCache({
        key: "rtl",
        stylisPlugins: [rtlPlugin],
      });
    }
    return null;
  }, [direction]);
  const { pathname } = useLocation();
  const routes = useRoutes();

  // Gérer le token reçu en paramètre d'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(search);
    const token = urlParams.get("token");

    if (token) {
      // Stocker le token dans cookies et sessionStorage
      Cookies.set("authToken", token, { expires: 30, secure: false, sameSite: "Lax" });
      localStorage.setItem("authToken", token);
      sessionStorage.setItem("authToken", token);
      console.log("Token saved:", token);

      // Supprimer le paramètre token de l'URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [search]);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Essayer les différentes sources de token
        let storedToken = Cookies.get("authToken");

        if (!storedToken) {
          storedToken = localStorage.getItem("authToken");
        }

        if (!storedToken) {
          storedToken = sessionStorage.getItem("authToken");
        }

        if (!storedToken) {
          setIsAuthenticated(false);
          setIsLoading(false);
          window.location.href = "http://localhost:5173/auth/login";
          return;
        }

        // Configuration des headers avec le token
        const config = {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        };

        // Vérifier l'authentification
        const response = await axios.get("http://localhost:5000/api/auth/check-auth", config);

        console.log("Auth response:", response.data);

        if (response.data.success) {
          const role = response.data.user.role;

          // Sauvegarder les informations d'authentification
          setUserRole(role);
          setIsAuthenticated(true);

          // Vérifier que l'utilisateur a le rôle approprié
          if (role !== "admin" && role !== "superadmin") {
            setIsAuthenticated(false);
            Cookies.remove("authToken");
            localStorage.removeItem("authToken");
            sessionStorage.removeItem("authToken");
            window.location.href = "http://localhost:5173";
            return;
          }

          // Rediriger vers le dashboard si on est à la racine
          if (window.location.pathname === "/") {
            navigate("/dashboard");
          }
        } else {
          // Échoue silencieusement - supprimer les tokens
          setIsAuthenticated(false);
          Cookies.remove("authToken");
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          window.location.href = "http://localhost:5173/auth/login";
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        Cookies.remove("authToken");
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        window.location.href = "http://localhost:5173/auth/login";
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Configurer un intervalle pour vérifier l'authentification régulièrement
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isLoading && isAuthenticated) {
        try {
          const storedToken =
            Cookies.get("authToken") ||
            localStorage.getItem("authToken") ||
            sessionStorage.getItem("authToken");

          if (!storedToken) return;

          const response = await axios.get("http://localhost:5000/api/auth/check-auth", {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          if (!response.data.success) {
            setIsAuthenticated(false);
            window.location.href = "http://localhost:5173/auth/login";
          }
        } catch (error) {
          console.log("Auth refresh error:", error);
        }
      }
    }, 300000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [isLoading, isAuthenticated]);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  if (isLoading) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress color="info" />
      </MDBox>
    );
  }

  // Si pas authentifié, ne pas rendre l'application
  if (!isAuthenticated && !isLoading) {
    window.location.href = "http://localhost:5173/auth/login";
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress color="info" />
      </MDBox>
    );
  }

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }
      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }
      return null;
    });

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName={userRole === "superadmin" ? "Super Admin Panel" : "Admin Panel"}
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            {configsButton}
          </>
        )}
        {layout === "vr" && <Configurator />}
        <Routes>
          {getRoutes(routes)}
          <Route path="/user-list" element={<UserList />} />
          <Route path="/edit-user/:userId" element={<EditUser />} />
          <Route path="/admin-management" element={<AdminManagement />} />
          <Route path="/edit-admin/:adminId" element={<EditUser />} />
          <Route path="/create-admin" element={<CreateAdmin />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            brandName={userRole === "superadmin" ? "Super Admin Panel" : "Admin Panel"}
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
          {configsButton}
        </>
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        {getRoutes(routes)}
        <Route path="/user-list" element={<UserList />} />
        <Route path="/edit-user/:userId" element={<EditUser />} />
        <Route path="/admin-management" element={<AdminManagement />} />
        <Route path="/edit-admin/:adminId" element={<EditUser />} />
        <Route path="/create-admin" element={<CreateAdmin />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
