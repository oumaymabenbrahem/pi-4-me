import React, { useState, useEffect } from 'react';
import MapSelector from '../common/MapSelector';

const StoreLocationSelector = ({ value, onChange }) => {
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  
  // Si une valeur initiale est fournie, l'utiliser
  useEffect(() => {
    if (value && value.storeLocation) {
      setLocation(value.storeLocation);
    }
    if (value && value.storeGeoLocation && value.storeGeoLocation.coordinates) {
      setCoordinates(value.storeGeoLocation.coordinates);
    }
  }, [value]);
  
  // Gérer le changement d'adresse textuelle
  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    
    // Notifier le parent
    if (onChange) {
      onChange({
        storeLocation: newLocation,
        storeGeoLocation: coordinates ? { 
          type: 'Point',
          coordinates 
        } : undefined
      });
    }
  };
  
  // Gérer la sélection de position sur la carte
  const handleMapLocationSelect = (coords) => {
    setCoordinates(coords);
    
    // Notifier le parent
    if (onChange) {
      // Si l'adresse est vide, utiliser un texte par défaut pour éviter la validation bloquée
      const storeLocationText = location || "Position sélectionnée sur la carte";
      
      onChange({
        storeLocation: storeLocationText,
        storeGeoLocation: { 
          type: 'Point',
          coordinates: coords 
        }
      });
    }
  };
  
  // Gérer l'adresse trouvée automatiquement à partir des coordonnées
  const handleAddressFound = (addressData, clickedCoords) => {
    // Construire une adresse complète à partir des données reçues
    let fullAddress = '';
    
    if (addressData.address) {
      fullAddress += addressData.address;
    }
    
    if (addressData.city) {
      fullAddress += fullAddress ? ', ' + addressData.city : addressData.city;
    }
    
    if (addressData.pincode) {
      fullAddress += fullAddress ? ' ' + addressData.pincode : addressData.pincode;
    }
    
    // Mettre à jour l'état local
    setLocation(fullAddress);
    
    // Utiliser les coordonnées qui viennent d'être cliquées
    // Pour s'assurer qu'elles sont bien définies
    const coordsToUse = clickedCoords || coordinates;
    
    if (onChange && coordsToUse) {
      // Notifier le parent avec la nouvelle adresse et les coordonnées
      onChange({
        storeLocation: fullAddress,
        storeGeoLocation: { 
          type: 'Point',
          coordinates: coordsToUse 
        }
      });
    }
  };
  
  // Convertir les coordonnées pour l'affichage sur la carte
  const getMapInitialLocation = () => {
    if (coordinates && coordinates.length === 2) {
      // Convertir du format MongoDB [lng, lat] à {lat, lng}
      return {
        lat: coordinates[1],
        lng: coordinates[0]
      };
    }
    return null;
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresse du magasin*
        </label>
        <input
          type="text"
          value={location}
          onChange={handleLocationChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Entrez l'adresse du magasin"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Position sur la carte
        </label>
        <div className="border border-gray-300 rounded-md overflow-hidden">
          <MapSelector
            onLocationSelect={handleMapLocationSelect}
            initialLocation={getMapInitialLocation()}
            onAddressFound={handleAddressFound}
          />
        </div>
        {!coordinates && (
          <p className="text-amber-600 text-sm mt-1">
            Sélectionnez la position du magasin sur la carte pour permettre la recherche par proximité
          </p>
        )}
      </div>
    </div>
  );
};

export default StoreLocationSelector; 