import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import PropTypes from "prop-types";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  // Function to handle superadmin redirect with redirect tracking
  const redirectSuperAdminToBackoffice = () => {
    // Check if we've already redirected in this session
    const hasRedirected = sessionStorage.getItem("redirectedToBackoffice");
    
    // Only redirect if we haven't done so in this session
    if (!hasRedirected && user?.role === "superadmin") {
      // Set a flag in sessionStorage to prevent infinite redirects
      sessionStorage.setItem("redirectedToBackoffice", "true");
      
      // Get the token from localStorage
      const token = localStorage.getItem("authToken");
      
      // Stocker dans tous les mécanismes de stockage pour maximiser la compatibilité
      sessionStorage.setItem("authToken", token);
      document.cookie = `authToken=${token}; path=/; max-age=${60*60*24*30}; sameSite=Lax`;
      
      // Log pour le débogage
      console.log("Redirecting to backoffice with token:", token);
      
      // Redirect to backoffice app with token as query parameter
      window.location.href = `http://localhost:3000?token=${token}`;
      return true;
    }
    return false;
  };

  // Clear the redirect flag when component unmounts or on logout
  useEffect(() => {
    // If user is not authenticated, clear the redirect flag
    if (!isAuthenticated) {
      sessionStorage.removeItem("redirectedToBackoffice");
      sessionStorage.removeItem("authToken");
    }
  }, [isAuthenticated]);

  // Si l'utilisateur est authentifié et est sur la page de login, rediriger vers le dashboard approprié
  if (isAuthenticated && (location.pathname === "/auth/login" || location.pathname === "/login")) {
    if (user?.role === "superadmin") {
      if (redirectSuperAdminToBackoffice()) return null;
    } else if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/shop/home" replace />;
    }
  }

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
  if (!isAuthenticated && 
      !location.pathname.includes("/login") && 
      !location.pathname.includes("/register") &&
      !location.pathname.includes("/forgot-password")) {
    return <Navigate to="/auth/login" replace />;
  }

  // Si l'utilisateur est authentifié mais n'a pas les droits d'accès
  if (isAuthenticated && 
      user?.role !== "admin" && 
      user?.role !== "superadmin" && 
      location.pathname.includes("admin")) {
    return <Navigate to="/unauth-page" replace />;
  }

  // Si l'utilisateur est admin mais essaie d'accéder à la partie shop
  if (isAuthenticated && 
      user?.role === "admin" && 
      location.pathname.includes("shop")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Si l'utilisateur est superadmin, gérer la redirection vers le backoffice
  if (isAuthenticated && 
      user?.role === "superadmin" && 
      !sessionStorage.getItem("redirectedToBackoffice")) {
    if (redirectSuperAdminToBackoffice()) return null;
  }

  return <>{children}</>;
}

CheckAuth.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    role: PropTypes.string
  }),
  children: PropTypes.node.isRequired
};

export default CheckAuth;
