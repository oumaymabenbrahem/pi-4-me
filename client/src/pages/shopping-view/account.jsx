import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddressForm from '@/components/common/AddressForm';
import ShoppingOrders from '@/components/shopping-view/orders';
import { Button } from "@/components/ui/button";
import { Camera, User, Mail, Phone, MapPin, EyeOff, Eye } from 'lucide-react';
import axios from 'axios';
import { checkAuth } from '@/store/auth-slice';

function Account() {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("profile");
  const dispatch = useDispatch();
  
  // État pour le mode édition
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    username: '',
    phone: '',
    address: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Initialiser les données utilisateur
  useEffect(() => {
    if (user) {
      setUserData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
        address: user.address || '',
        password: ''
      });
      setPreviewImage(user.image);
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 5Mo');
        return;
      }
      setNewProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (userData.firstname) formData.append('firstname', userData.firstname);
      if (userData.lastname) formData.append('lastname', userData.lastname);
      if (userData.email) formData.append('email', userData.email);
      if (userData.phone) formData.append('phone', userData.phone);
      if (userData.address) formData.append('address', userData.address);
      if (userData.password) formData.append('password', userData.password);
      if (newProfileImage) formData.append('image', newProfileImage);

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

      if (response.data.success) {
        setSuccess(true);
        setIsEditing(false);
        dispatch(checkAuth()); // Mettre à jour les données utilisateur
        
        // Réinitialiser les états
        setNewProfileImage(null);
        userData.password = '';
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setError(err.response?.data?.message || 'Échec de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mon compte</h1>
      
      <Tabs defaultValue="profile" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="address">Adresse</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Informations personnelles</CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                  Modifier mon profil
                </Button>
              ) : (
                <Button onClick={() => setIsEditing(false)} className="bg-gray-500 hover:bg-gray-600">
                  Annuler
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  Profil mis à jour avec succès !
                </div>
              )}
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img
                    src={previewImage || "https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-2 border-blue-500 object-cover"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50"
                    >
                      <Camera size={20} className="text-gray-600" />
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
              
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nom d'utilisateur</label>
                    <p className="text-lg">{user?.username || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg">{user?.email || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Prénom</label>
                    <p className="text-lg">{user?.firstname || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nom</label>
                    <p className="text-lg">{user?.lastname || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Téléphone</label>
                    <p className="text-lg">{user?.phone || 'Non renseigné'}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      name="firstname"
                      value={userData.firstname}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      name="lastname"
                      value={userData.lastname}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={userData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <div className="md:col-span-2 mt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="address">
          <AddressForm />
        </TabsContent>
        
        <TabsContent value="orders">
          <ShoppingOrders />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Account;
