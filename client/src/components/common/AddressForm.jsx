import React, { useState, useEffect } from 'react';
import { getUserAddress, updateUserAddress } from '../../services/location-service';
import MapSelector from './MapSelector';

const AddressForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    pincode: '',
    phone: '',
    notes: '',
    coordinates: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [autoAddress, setAutoAddress] = useState(null);

  // Charger l'adresse actuelle de l'utilisateur
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        setLoading(true);
        const response = await getUserAddress();
        if (response.success && response.data) {
          const { address, city, pincode, phone, notes, location } = response.data;
          setFormData({
            address: address || '',
            city: city || '',
            pincode: pincode || '',
            phone: phone || '',
            notes: notes || '',
            coordinates: location?.coordinates || null
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'adresse:', error);
        setError('Impossible de charger votre adresse. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAddress();
  }, []);

  // Mettre à jour les champs du formulaire quand une adresse est trouvée automatiquement
  useEffect(() => {
    if (autoAddress) {
      setFormData(prev => ({
        ...prev,
        address: autoAddress.address || prev.address,
        city: autoAddress.city || prev.city,
        pincode: autoAddress.pincode || prev.pincode
      }));
    }
  }, [autoAddress]);

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gérer la sélection de position sur la carte
  const handleLocationSelect = (coordinates) => {
    setFormData(prev => ({
      ...prev,
      coordinates
    }));
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.address || !formData.city || !formData.pincode || !formData.coordinates) {
      setError('Veuillez remplir tous les champs obligatoires et sélectionner une position sur la carte.');
      return;
    }

    try {
      setLoading(true);
      const response = await updateUserAddress(formData);
      if (response.success) {
        setSuccess(true);
        setError(null);
        if (onSave) {
          onSave(response.data);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'adresse:', error);
      setError('Impossible d\'enregistrer l\'adresse. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Convertir les coordonnées pour l'affichage sur la carte
  const getMapInitialLocation = () => {
    if (formData.coordinates && formData.coordinates.length === 2) {
      // Convertir du format MongoDB [lng, lat] à {lat, lng}
      return {
        lat: formData.coordinates[1],
        lng: formData.coordinates[0]
      };
    }
    return null;
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Mon adresse de livraison</h2>
      
      {loading && <p className="text-center py-4">Chargement...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Adresse enregistrée avec succès!
        </div>
      )}
      
      {!loading && (
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h3 className="font-medium mb-2">Sélectionnez votre position sur la carte</h3>
            <MapSelector 
              onLocationSelect={handleLocationSelect} 
              initialLocation={getMapInitialLocation()}
              onAddressFound={setAutoAddress}
            />
            {!formData.coordinates && (
              <p className="text-red-500 text-sm mt-1">
                Veuillez sélectionner votre position sur la carte
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse*
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville*
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code postal*
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes supplémentaires
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddressForm; 