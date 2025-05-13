import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { auth, provider, signInWithPopup, fbProvider } from "@/firebase";
import axios from 'axios';
import { fetchAllBrands } from "@/services/brand-service";
import { motion } from "framer-motion";

const initialState = {
  username: "",
  email: "",
  password: "",
  firstname: "",
  lastname: "",
  image: "",
  imageVerif: "",
  address: "",
  phone: "",
  brand: "none",
  customBrand: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dynamicFormControls, setDynamicFormControls] = useState(registerFormControls);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Charger les marques depuis le serveur
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setIsLoadingBrands(true);
        const response = await fetchAllBrands();

        if (response.success && response.brands) {
          // Créer une copie des contrôles de formulaire
          const updatedControls = [...registerFormControls];

          // Trouver l'index du contrôle de marque
          const brandControlIndex = updatedControls.findIndex(control => control.name === 'brand');

          if (brandControlIndex !== -1) {
            // Créer les options de marque à partir des données du serveur
            const brandOptions = response.brands
              .filter(brand => brand.id !== 'other') // Exclure "other" car nous l'ajouterons à la fin
              .map(brand => ({
                id: brand.id,
                label: brand.label
              }));

            // Ajouter l'option "Autres" à la fin
            brandOptions.push({ id: "other", label: "Autres" });

            // Mettre à jour les options de marque
            updatedControls[brandControlIndex] = {
              ...updatedControls[brandControlIndex],
              options: brandOptions
            };

            // Mettre à jour les contrôles de formulaire
            setDynamicFormControls(updatedControls);
          }
        }
      } catch (error) {
        console.error('Error loading brands:', error);
        toast({
          title: "Erreur lors du chargement des marques",
          variant: "destructive",
        });
      } finally {
        setIsLoadingBrands(false);
      }
    };

    loadBrands();
  }, [toast]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await axios.post("http://localhost:5000/api/auth/google", {
        email: user.email,
        username: user.displayName,
        image: user.photoURL,
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast({
          title: response.data.message,
        });
        dispatch({
          type: 'auth/setUser',
          payload: {
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false
          }
        });

        if (response.data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/shop/home");
        }
      }
    } catch (error) {
      console.error("Google login failed:", error);
      toast({
        title: error.response?.data?.message || "Failed to login with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, fbProvider);
      const user = result.user;

      const response = await axios.post("http://localhost:5000/api/auth/facebook", {
        email: user.email,
        username: user.displayName,
        image: user.photoURL,
      });

      if (response.data.success) {
        toast({
          title: response.data.message,
        });
        dispatch({
          type: 'auth/setUser',
          payload: {
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false
          }
        });

        if (response.data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/shop/home");
        }
      }
    } catch (error) {
      console.error("Facebook login failed:", error);
      toast({
        title: "Failed to login with Facebook. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (file, type) => {
    try {
      if (!file) {
        console.log(`No ${type} image file provided`);
        return "";
      }

      console.log(`Uploading ${type} image:`, file.name);

      const formData = new FormData();
      formData.append('my_file', file);

      const response = await axios.post(
        "http://localhost:5000/api/auth/upload-image",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        console.log(`${type} image uploaded successfully:`, response.data.result.url);
        return response.data.result.url;
      }

      console.error(`${type} image upload failed:`, response.data);
      throw new Error('Failed to upload image: ' + (response.data.message || 'Unknown error'));
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error);
      toast({
        title: `Error uploading ${type} image: ${error.message}`,
        variant: "destructive",
      });

      // Return empty string instead of throwing to allow registration to continue
      return "";
    }
  };

  async function onSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Vérifier que tous les champs requis sont remplis
      const requiredFields = {
        username: "Username",
        email: "Email",
        password: "Password",
        firstname: "First Name",
        lastname: "Last Name",
        address: "Address",
        phone: "Phone",
        image: "Profile Image"
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([field]) => !formData[field])
        .map(([, label]) => label);

      if (missingFields.length > 0) {
        toast({
          title: `Please fill in all required fields: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      // Valider le format de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }

      // Valider la longueur du mot de passe
      if (formData.password.length < 6) {
        toast({
          title: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return;
      }

      // Valider le format du numéro de téléphone
      const phoneRegex = /^[0-9+\-\s()]*$/;
      if (!phoneRegex.test(formData.phone)) {
        toast({
          title: "Please enter a valid phone number",
          variant: "destructive",
        });
        return;
      }

      // Upload images if they are files
      let imageUrl = formData.image;
      let imageVerifUrl = formData.imageVerif || "";

      if (formData.image instanceof File) {
        imageUrl = await handleImageUpload(formData.image, 'profile');
      }
      if (formData.imageVerif instanceof File) {
        imageVerifUrl = await handleImageUpload(formData.imageVerif, 'verification');
      }

      // Ensure all fields are properly formatted
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        // Si l'utilisateur a sélectionné "Autres" et a saisi une marque personnalisée, utiliser cette valeur
        brand: formData.brand === "other" && formData.customBrand.trim()
               ? formData.customBrand.trim()
               : formData.brand,
        image: imageUrl,
        imageVerif: imageVerifUrl || ""
      };

      console.log('Submitting form data:', userData);

      try {
        const result = await dispatch(registerUser(userData));

        if (result?.payload?.success) {
          toast({
            title: result?.payload?.message,
          });
          navigate("/auth/login");
        } else {
          console.error('Registration error payload:', result?.payload);
          toast({
            title: result?.payload?.message || "Registration failed. Please try again.",
            variant: "destructive",
          });
        }
      } catch (regError) {
        console.error('Registration dispatch error:', regError);
        toast({
          title: "Registration failed with error. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      className="mx-auto w-full max-w-md space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center">
        <motion.h1
          className="text-3xl font-bold tracking-tight text-gray-900"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Create Your Account
        </motion.h1>
        <motion.p
          className="mt-2 text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Already have an account?{" "}
          <Link
            className="font-medium text-green-600 hover:text-green-500"
            to="/auth/login"
          >
            Sign in
          </Link>
        </motion.p>
      </div>

      <motion.div
        className="space-y-4 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          <FcGoogle size={20} />
          <span>Continue with Google</span>
        </button>

        <button
          onClick={handleFacebookLogin}
          className="w-full flex items-center justify-center gap-2 bg-[#1877F2] text-white rounded-lg px-4 py-3 font-medium hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:ring-offset-2 transition-colors"
        >
          <FaFacebook size={20} />
          <span>Continue with Facebook</span>
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <CommonForm
          formControls={dynamicFormControls}
          buttonText={isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </div>
          ) : "Create account"}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          isBtnDisabled={isSubmitting || isLoadingBrands}
        />
      </motion.div>
    </motion.div>
  );
}

export default AuthRegister;