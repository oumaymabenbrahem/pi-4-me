import { useToast } from "@/components/ui/use-toast";
import { loginUser, verify2FALogin } from "@/store/auth-slice/index";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { auth, provider, signInWithPopup, fbProvider } from "@/firebase";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const initialState = {
  email: "",
  password: "",
  twoFactorCode: "",
  rememberMe: false,
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
      // Appel de l'action loginUser avec rememberMe
      const loginData = {
        ...formData,
        rememberMe: formData.rememberMe
      };
      const action = await dispatch(loginUser(loginData));

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
    <motion.div
      className="mx-auto w-full max-w-md space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {error && (
        <motion.div
          className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}

      {!requires2FA ? (
        <>
          <div className="text-center">
            <motion.h1
              className="text-3xl font-bold tracking-tight text-gray-900"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p
              className="mt-2 text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Sign in to your account to continue
            </motion.p>
          </div>

          <motion.form
            onSubmit={handleLogin}
            className="space-y-5 mt-8"
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-green-600 hover:text-green-500"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, rememberMe: checked })
                }
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Remember me for 30 days
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg py-2"
              >
                <FcGoogle size={18} />
                <span>Google</span>
              </Button>

              <Button
                type="button"
                onClick={handleFacebookLogin}
                className="flex items-center justify-center gap-2 bg-[#1877F2] text-white hover:bg-[#166FE5] rounded-lg py-2"
              >
                <FaFacebook size={18} />
                <span>Facebook</span>
              </Button>
            </div>
          </motion.form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/auth/register"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="text-center">
            <motion.h1
              className="text-3xl font-bold tracking-tight text-gray-900"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Two-Factor Authentication
            </motion.h1>
            <motion.p
              className="mt-2 text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Enter the verification code from your authenticator app
            </motion.p>
          </div>

          <motion.form
            onSubmit={handle2FAVerification}
            className="space-y-5 mt-8"
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="space-y-2">
              <Label htmlFor="twoFactorCode" className="text-sm font-medium text-gray-700">
                Verification Code
              </Label>
              <Input
                id="twoFactorCode"
                type="text"
                value={formData.twoFactorCode}
                onChange={(e) => setFormData({ ...formData, twoFactorCode: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-center text-xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                "Verify"
              )}
            </Button>
          </motion.form>
        </>
      )}
    </motion.div>
  );
}

export default AuthLogin;
