import { useState, useRef, useEffect } from 'react';
import { User, Mail, Camera, Eye, EyeOff, X, Upload, MapPin, Phone, Image, Settings, Shield } from 'lucide-react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVerifImage, setPreviewVerifImage] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const verifFileInputRef = useRef(null);
  const [newPassword, setNewPassword] = useState('');
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [newVerifImage, setNewVerifImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // États pour la gestion 2FA
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Making request to check-auth...');
        const response = await axios.get('http://localhost:5000/api/auth/check-auth', {
          withCredentials: true
        });

        if (response.data.success) {
          const userData = {
            _id: response.data.user._id,
            firstname: response.data.user.firstname || '',
            lastname: response.data.user.lastname || '',
            email: response.data.user.email || '',
            username: response.data.user.username || '',
            address: response.data.user.address || '',
            phone: response.data.user.phone || '',
            image: response.data.user.image || null,
            imageVerif: response.data.user.imageVerif || null
          };
          setUser(userData);
          
          if (userData.image) {
            setPreviewImage(userData.image);
          }
          if (userData.imageVerif) {
            setPreviewVerifImage(userData.imageVerif);
          }

          // Vérifier le statut 2FA de l'utilisateur
          check2FAStatus();
        } else {
          setError(response.data.message);
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Please login to view your profile');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  // Fonction pour vérifier le statut 2FA
  const check2FAStatus = async () => {
    try {
      setIs2FALoading(true);
      const response = await axios.get('http://localhost:5000/api/auth/2fa/status', {
        withCredentials: true
      });
      
      if (response.data.success) {
        setIs2FAEnabled(response.data.isEnabled);
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    } finally {
      setIs2FALoading(false);
    }
  };

  // Fonction pour générer le QR code et le secret 2FA
  const generate2FASecret = async () => {
    try {
      setIs2FALoading(true);
      setTwoFactorError(null);
      
      const response = await axios.post('http://localhost:5000/api/auth/2fa/generate', {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setQrCodeUrl(response.data.qrCode);
        setSecretKey(response.data.secret);
        setIs2FASetupOpen(true);
      }
    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      setTwoFactorError('Erreur lors de la génération du code QR 2FA');
    } finally {
      setIs2FALoading(false);
    }
  };

  // Fonction pour vérifier le code et activer la 2FA
  const verify2FAToken = async (e) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setTwoFactorError('Veuillez entrer le code de vérification');
      return;
    }
    
    try {
      setIs2FALoading(true);
      setTwoFactorError(null);
      
      const response = await axios.post('http://localhost:5000/api/auth/2fa/verify', {
        token: verificationCode
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setIs2FAEnabled(true);
        setIs2FASetupOpen(false);
        setVerificationCode('');
        setQrCodeUrl('');
        setSecretKey('');
      }
    } catch (error) {
      console.error('Error verifying 2FA token:', error);
      setTwoFactorError(error.response?.data?.message || 'Erreur lors de la vérification du code 2FA');
    } finally {
      setIs2FALoading(false);
    }
  };

  // Fonction pour désactiver la 2FA
  const disable2FA = async () => {
    try {
      setIs2FALoading(true);
      setTwoFactorError(null);
      
      const response = await axios.post('http://localhost:5000/api/auth/2fa/disable', {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setIs2FAEnabled(false);
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      setTwoFactorError(error.response?.data?.message || 'Erreur lors de la désactivation de la 2FA');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setNewProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleVerifImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setNewVerifImage(file);
      setPreviewVerifImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    if (!user || !user._id) {
      setError('User information is not available');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      if (user.firstname) formData.append('firstname', user.firstname);
      if (user.lastname) formData.append('lastname', user.lastname);
      if (user.email) formData.append('email', user.email);
      if (user.address) formData.append('address', user.address);
      if (user.phone) formData.append('phone', user.phone);
      if (newPassword) formData.append('password', newPassword);
      if (newProfileImage) formData.append('image', newProfileImage);
      if (newVerifImage) formData.append('imageVerif', newVerifImage);

      const response = await axios.put(
        `http://localhost:5000/api/auth/update/${user._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );
      
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        if (response.data.user.image) {
          setPreviewImage(response.data.user.image);
        }
        if (response.data.user.imageVerif) {
          setPreviewVerifImage(response.data.user.imageVerif);
        }
        setNewProfileImage(null);
        setNewVerifImage(null);
        setIsEditing(false);
        setNewPassword('');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-emerald-400 to-teal-600">
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <img
                src={previewImage || "https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg"}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50"
              >
                <Camera size={20} className="text-gray-600" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>

        <div className="pt-20 px-8 pb-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Section 2FA */}
          <div className="mb-6 border-b pb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Shield className="text-emerald-500" size={20} />
              Authentification à deux facteurs (2FA)
            </h3>
            
            {twoFactorError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {twoFactorError}
              </div>
            )}
            
            {is2FASetupOpen ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Configuration de l'authentification à deux facteurs</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Scannez le code QR ci-dessous avec votre application d'authentification 
                  (comme Google Authenticator, Authy ou Microsoft Authenticator).
                </p>
                
                <div className="flex flex-col items-center mb-4">
                  {qrCodeUrl && (
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code for 2FA" 
                      className="mb-4 border p-2 rounded-lg"
                    />
                  )}
                  
                  <div className="text-sm bg-gray-100 p-2 rounded-lg mb-4 w-full max-w-md">
                    <p className="font-medium mb-1">Clé secrète (si vous ne pouvez pas scanner le QR code):</p>
                    <code className="bg-white p-1 rounded border block overflow-x-auto">{secretKey}</code>
                  </div>
                </div>
                
                <form onSubmit={verify2FAToken}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code de vérification
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Entrez le code à 6 chiffres"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIs2FASetupOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      disabled={is2FALoading}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                      disabled={is2FALoading}
                    >
                      {is2FALoading ? 'Vérification...' : 'Vérifier et activer'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {is2FAEnabled 
                      ? 'L\'authentification à deux facteurs est actuellement activée pour votre compte.' 
                      : 'L\'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {is2FAEnabled 
                      ? 'Vous devrez entrer un code généré par votre application d\'authentification à chaque connexion.' 
                      : 'Nous vous recommandons de l\'activer pour une meilleure sécurité.'}
                  </p>
                </div>
                <div>
                  {is2FAEnabled ? (
                    <button
                      onClick={disable2FA}
                      disabled={is2FALoading}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      {is2FALoading ? 'Désactivation...' : 'Désactiver la 2FA'}
                    </button>
                  ) : (
                    <button
                      onClick={generate2FASecret}
                      disabled={is2FALoading}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {is2FALoading ? 'Chargement...' : 'Activer la 2FA'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {!isEditing ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.firstname} {user.lastname}
                  </h1>
                  <p className="text-gray-600">@{user.username}</p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <Settings size={20} />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <User size={20} className="text-emerald-500" />
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-medium">{user.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail size={20} className="text-emerald-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <User size={20} className="text-emerald-500" />
                    <div>
                      <p className="text-sm text-gray-500">First Name</p>
                      <p className="font-medium">{user.firstname}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <User size={20} className="text-emerald-500" />
                    <div>
                      <p className="text-sm text-gray-500">Last Name</p>
                      <p className="font-medium">{user.lastname}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <MapPin size={20} className="text-emerald-500" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{user.address || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone size={20} className="text-emerald-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{user.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Image size={20} className="text-emerald-500" />
                  <div>
                    <p className="text-sm text-gray-500">Verification Image</p>
                    {previewVerifImage ? (
                      <img src={previewVerifImage} alt="Verification" className="w-24 h-24 rounded-lg object-cover mt-2" />
                    ) : (
                      <p className="font-medium text-gray-400">No verification image uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={user.firstname}
                    onChange={(e) => setUser({ ...user, firstname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={user.lastname}
                    onChange={(e) => setUser({ ...user, lastname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={user.phone}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={user.address}
                    onChange={(e) => setUser({ ...user, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verification Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      ref={verifFileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleVerifImageChange}
                    />
                    {!previewVerifImage ? (
                      <button
                        type="button"
                        onClick={() => verifFileInputRef.current.click()}
                        className="w-full flex flex-col items-center justify-center gap-2 text-gray-500"
                      >
                        <Upload size={24} />
                        <span>Click to upload verification image</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between">
                        <img src={previewVerifImage} alt="Verification" className="w-24 h-24 rounded-lg object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewVerifImage(null);
                            setNewVerifImage(null);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile; 