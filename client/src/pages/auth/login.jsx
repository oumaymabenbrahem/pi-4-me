import { useToast } from "@/components/ui/use-toast";
import { loginUser, verify2FALogin } from "@/store/auth-slice/index";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { auth, provider, signInWithPopup, fbProvider } from "@/firebase";

const initialState = {
  email: "",
  password: "",
  twoFactorCode: "",
};

function AuthLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requires2FA, tempToken } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    console.log("requires2FA state changed:", requires2FA);
  }, [requires2FA]);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Appel de l'action loginUser
      const action = await dispatch(loginUser({
        email: user.email,
        password: 'google_auth_'
      }));

      console.log("Google login action result:", action);

      setIsSubmitting(false);

      // Si l'action a été rejetée, on traite l'erreur
      if (action.type === 'auth/login/rejected') {
        const errorMessage = action.payload?.message || action.error?.message || "Échec de connexion avec Google";
        console.log("Google login error message:", errorMessage);

        // Vérification si c'est un compte bloqué
        if (errorMessage === "Votre compte est bloqué. Veuillez contacter l'administration." ||
            errorMessage.toLowerCase().includes("compte est bloqué") ||
            errorMessage.toLowerCase().includes("compte bloqué") ||
            errorMessage.toLowerCase().includes("deactivated") ||
            errorMessage.toLowerCase().includes("désactivé") ||
            errorMessage.toLowerCase().includes("inactive") ||
            errorMessage.toLowerCase().includes("inactif") ||
            errorMessage.toLowerCase().includes("bloqu")) {

          setError("Votre compte est bloqué. Veuillez contacter l'administration.");
          toast({
            title: "Compte Bloqué",
            description: "Votre compte est bloqué. Veuillez contacter l'administration.",
            variant: "destructive",
          });
        } else {
          setError(errorMessage);
          toast({
            title: "Échec de connexion",
            description: errorMessage,
            variant: "destructive",
          });
        }
        return;
      }

      // Si l'action est réussie, on continue avec le résultat
      const responseData = action.payload;

      if (responseData.success) {
        if (responseData.require2FA) {
          console.log("2FA required for Google login, setting state...");
          dispatch(verify2FALogin({
            tempToken: responseData.tempToken,
            token: responseData.twoFactorCode
          }));
          toast({
            title: responseData.message,
          });
        } else {
          toast({
            title: responseData.message,
          });
          navigate('/shop/home');
        }
      } else {
        const errorMessage = responseData.message || "Échec de connexion avec Google";

        // Vérification si c'est un compte bloqué
        if (errorMessage === "Votre compte est bloqué. Veuillez contacter l'administration." ||
            errorMessage.toLowerCase().includes("compte est bloqué") ||
            errorMessage.toLowerCase().includes("compte bloqué") ||
            errorMessage.toLowerCase().includes("deactivated") ||
            errorMessage.toLowerCase().includes("désactivé") ||
            errorMessage.toLowerCase().includes("inactive") ||
            errorMessage.toLowerCase().includes("inactif") ||
            errorMessage.toLowerCase().includes("bloqu")) {

          setError("Votre compte est bloqué. Veuillez contacter l'administration.");
          toast({
            title: "Compte Bloqué",
            description: "Votre compte est bloqué. Veuillez contacter l'administration.",
            variant: "destructive",
          });
        } else {
          setError(errorMessage);
          toast({
            title: "Échec de connexion",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("Google login failed:", error);
      setError(error?.message || "Échec de connexion avec Google");
      toast({
        title: "Échec de connexion",
        description: "La connexion avec Google a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleFacebookLogin = async () => {
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, fbProvider);
      const user = result.user;

      // Appel de l'action loginUser
      const action = await dispatch(loginUser({
        email: user.email,
        password: 'facebook_auth_'
      }));

      console.log("Facebook login action result:", action);

      setIsSubmitting(false);

      // Si l'action a été rejetée, on traite l'erreur
      if (action.type === 'auth/login/rejected') {
        const errorMessage = action.payload?.message || action.error?.message || "Échec de connexion avec Facebook";
        console.log("Facebook login error message:", errorMessage);

        // Vérification si c'est un compte bloqué
        if (errorMessage === "Votre compte est bloqué. Veuillez contacter l'administration." ||
            errorMessage.toLowerCase().includes("compte est bloqué") ||
            errorMessage.toLowerCase().includes("compte bloqué") ||
            errorMessage.toLowerCase().includes("deactivated") ||
            errorMessage.toLowerCase().includes("désactivé") ||
            errorMessage.toLowerCase().includes("inactive") ||
            errorMessage.toLowerCase().includes("inactif") ||
            errorMessage.toLowerCase().includes("bloqu")) {

          setError("Votre compte est bloqué. Veuillez contacter l'administration.");
          toast({
            title: "Compte Bloqué",
            description: "Votre compte est bloqué. Veuillez contacter l'administration.",
            variant: "destructive",
          });
        } else {
          setError(errorMessage);
          toast({
            title: "Échec de connexion",
            description: errorMessage,
            variant: "destructive",
          });
        }
        return;
      }

      // Si l'action est réussie, on continue avec le résultat
      const responseData = action.payload;

      if (responseData.success) {
        if (responseData.require2FA) {
          console.log("2FA required for Facebook login, setting state...");
          dispatch(verify2FALogin({
            tempToken: responseData.tempToken,
            token: responseData.twoFactorCode
          }));
          toast({
            title: responseData.message,
          });
        } else {
          toast({
            title: responseData.message,
          });
          navigate('/shop/home');
        }
      } else {
        const errorMessage = responseData.message || "Échec de connexion avec Facebook";

        // Vérification si c'est un compte bloqué
        if (errorMessage === "Votre compte est bloqué. Veuillez contacter l'administration." ||
            errorMessage.toLowerCase().includes("compte est bloqué") ||
            errorMessage.toLowerCase().includes("compte bloqué") ||
            errorMessage.toLowerCase().includes("deactivated") ||
            errorMessage.toLowerCase().includes("désactivé") ||
            errorMessage.toLowerCase().includes("inactive") ||
            errorMessage.toLowerCase().includes("inactif") ||
            errorMessage.toLowerCase().includes("bloqu")) {

          setError("Votre compte est bloqué. Veuillez contacter l'administration.");
          toast({
            title: "Compte Bloqué",
            description: "Votre compte est bloqué. Veuillez contacter l'administration.",
            variant: "destructive",
          });
        } else {
          setError(errorMessage);
          toast({
            title: "Échec de connexion",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("Facebook login failed:", error);
      setError(error?.message || "Échec de connexion avec Facebook");
      toast({
        title: "Échec de connexion",
        description: "La connexion avec Facebook a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Validation manuelle des champs
    if (!formData.email || !formData.password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsSubmitting(true);

    try {
      // Appel de l'action loginUser
      const action = await dispatch(loginUser(formData));

      console.log("Login action result:", action);

      // Si l'action a été rejetée, on traite l'erreur
      if (action.type === 'auth/login/rejected') {
        setIsSubmitting(false);

        // Récupération du message d'erreur depuis le payload
        const errorMessage = action.payload?.message || action.error?.message || "Échec de connexion";
        console.log("Error message:", errorMessage);

        // Vérification si c'est un compte bloqué
        if (errorMessage === "Votre compte est bloqué. Veuillez contacter l'administration." ||
            errorMessage.toLowerCase().includes("compte est bloqué") ||
            errorMessage.toLowerCase().includes("compte bloqué") ||
            errorMessage.toLowerCase().includes("deactivated") ||
            errorMessage.toLowerCase().includes("désactivé") ||
            errorMessage.toLowerCase().includes("inactive") ||
            errorMessage.toLowerCase().includes("inactif") ||
            errorMessage.toLowerCase().includes("bloqu")) {

          setError("Votre compte est bloqué. Veuillez contacter l'administration.");
          toast({
            title: "Compte Bloqué",
            description: "Votre compte est bloqué. Veuillez contacter l'administration.",
            variant: "destructive",
          });
        } else {
          setError(errorMessage);
          toast({
            title: "Échec de connexion",
            description: errorMessage,
            variant: "destructive",
          });
        }
        return;
      }

      // Si l'action est réussie, on continue avec le résultat
      const result = action.payload;
      setIsSubmitting(false);
      console.log("Login result:", result);

      if (result.success && result.require2FA) {
        console.log("2FA required, showing input...");
      } else if (result.success) {
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        } else {
          navigate("/shop/home");
        }
      } else {
        const errorMessage = result.message || "Identifiants invalides";

        // Vérifier si le message concerne un compte bloqué
        if (errorMessage === "Votre compte est bloqué. Veuillez contacter l'administration." ||
            errorMessage.toLowerCase().includes("compte est bloqué") ||
            errorMessage.toLowerCase().includes("compte bloqué") ||
            errorMessage.toLowerCase().includes("deactivated") ||
            errorMessage.toLowerCase().includes("désactivé") ||
            errorMessage.toLowerCase().includes("inactive") ||
            errorMessage.toLowerCase().includes("inactif") ||
            errorMessage.toLowerCase().includes("bloqu")) {

          setError("Votre compte est bloqué. Veuillez contacter l'administration.");
          toast({
            title: "Compte Bloqué",
            description: "Votre compte est bloqué. Veuillez contacter l'administration.",
            variant: "destructive",
          });
        } else {
          setError(errorMessage);
          toast({
            title: "Échec de connexion",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error("Login error:", err);

      const errorMessage = err.message || "Une erreur est survenue lors de la connexion";
      setError(errorMessage);
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handle2FAVerification = async (e) => {
    e.preventDefault();
    setError("");

    // Validation manuelle du code 2FA
    if (!formData.twoFactorCode) {
      setError("Veuillez entrer le code de vérification");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await dispatch(verify2FALogin({
        tempToken,
        token: formData.twoFactorCode
      })).unwrap();
      setIsSubmitting(false);

      if (result.success) {
        navigate("/shop/home");
      } else {
        setError(result.message || "Invalid 2FA code");
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error("2FA verification error:", err);

      if (err.name === 'AxiosError') {
        const errorMessage = err.response?.data?.message || "Invalid verification code";
        setError(errorMessage);

        // Si le token est expiré, réinitialiser l'état pour revenir à l'écran de connexion
        if (err.response?.status === 401 || errorMessage.includes("expiré") || errorMessage.includes("expired")) {
          setRequires2FA(false);
          setTempToken(null);
          toast({
            title: "Session expirée",
            description: "Votre session de vérification a expiré. Veuillez vous reconnecter.",
            variant: "destructive",
          });
        } else {
          toast({
            title: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        setError(err.message || "An error occurred during verification");
        toast({
          title: "Verification failed",
          description: err.message || "Please try again with a valid code",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {!requires2FA ? (
        <>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Sign In
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium leading-none">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium leading-none">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <FcGoogle size={20} />
                <span>Google</span>
              </button>

              <button
                onClick={handleFacebookLogin}
                className="w-full flex items-center justify-center gap-2 bg-[#1877F2] text-white rounded-lg px-4 py-3 font-medium hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:ring-offset-2"
              >
                <FaFacebook size={20} />
                <span>Facebook</span>
              </button>
            </div>
          </form>

          <div className="text-sm text-center space-y-2">
            <Link
              to="/auth/register"
              className="font-medium text-primary hover:text-primary/90"
            >
              Create an account
            </Link>
            <div>
              <Link
                to="/forgot-password"
                className="font-medium text-primary hover:text-primary/90"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Two-Factor Authentication
            </h1>
          </div>

          <form onSubmit={handle2FAVerification} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="twoFactorCode" className="block text-sm font-medium leading-none">
                Verification Code
              </label>
              <input
                id="twoFactorCode"
                type="text"
                value={formData.twoFactorCode}
                onChange={(e) => setFormData({ ...formData, twoFactorCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter 6-digit code"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default AuthLogin;
