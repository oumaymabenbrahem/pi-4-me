import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Correction pour les icônes de marqueur Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fixer le problème d'icône par défaut de Leaflet
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Composant gérant les événements de la carte
function MapEvents({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      // Inverser longitude et latitude pour le format MongoDB [lng, lat]
      onLocationSelect([lng, lat]);
    }
  });
  return null;
}

// Composant qui récupère l'instance de la carte
function MapController({ setMap }) {
  const map = useMap();
  
  useEffect(() => {
    setMap(map);
  }, [map, setMap]);
  
  return null;
}

const MapSelector = ({ onLocationSelect, initialLocation, onAddressFound }) => {
  const [position, setPosition] = useState(null);
  const [map, setMap] = useState(null);
  const markerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Centre de la carte par défaut (France)
  const defaultCenter = [44.5, 2.0];
  const zoom = 5;

  // Si une position initiale est fournie, l'utiliser
  useEffect(() => {
    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      setPosition([initialLocation.lat, initialLocation.lng]);
    }
  }, [initialLocation]);

  // Fonction pour faire du reverse geocoding (obtenir l'adresse à partir des coordonnées)
  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (onAddressFound) {
        onAddressFound({
          address: data.address.road || data.display_name || "",
          city: data.address.city || data.address.town || data.address.village || "",
          pincode: data.address.postcode || ""
        }, [lng, lat]);
      }
    } catch (error) {
      console.error("Erreur lors du reverse geocoding:", error);
    }
  };

  // Gérer la sélection de position sur la carte
  const handleLocationSelect = useCallback((coordinates) => {
    // Convertir du format MongoDB [lng, lat] au format Leaflet [lat, lng]
    setPosition([coordinates[1], coordinates[0]]);
    if (onLocationSelect) {
      onLocationSelect(coordinates);
    }
    
    // Obtenir l'adresse à partir des coordonnées
    fetchAddressFromCoords(coordinates[1], coordinates[0]);
  }, [onLocationSelect, onAddressFound]);

  // Utiliser la géolocalisation du navigateur pour obtenir la position actuelle
  const getUserCurrentLocation = useCallback(() => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Mettre à jour la position sur la carte
          setPosition([lat, lng]);
          if (map) {
            map.flyTo([lat, lng], 13);
          }
          
          // Notifier le parent avec les coordonnées au format MongoDB [lng, lat]
          if (onLocationSelect) {
            onLocationSelect([lng, lat]);
          }
          
          // Obtenir l'adresse à partir des coordonnées
          fetchAddressFromCoords(lat, lng);
          
          setIsLoading(false);
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          setIsLoading(false);
        }
      );
    } else {
      console.error("La géolocalisation n'est pas prise en charge par ce navigateur");
      setIsLoading(false);
    }
  }, [map, onLocationSelect, onAddressFound]);

  return (
    <div className="relative w-full h-[400px]">
      <MapContainer 
        center={position || defaultCenter} 
        zoom={position ? 13 : zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapController setMap={setMap} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {position && (
          <Marker 
            position={position}
            ref={markerRef}
          />
        )}
        
        <MapEvents onLocationSelect={handleLocationSelect} />
      </MapContainer>
      
      <div className="absolute top-2 right-2 z-[1000]">
        <button
          type="button"
          onClick={getUserCurrentLocation}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
        >
          {isLoading ? "Chargement..." : "Ma position"}
        </button>
      </div>
    </div>
  );
};

export default MapSelector; 