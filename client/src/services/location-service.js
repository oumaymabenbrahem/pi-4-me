import axios from 'axios';
import { getUserToken } from './auth-service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Récupérer l'adresse de l'utilisateur actuel
 * @returns Les données d'adresse de l'utilisateur
 */
export const getUserAddress = async () => {
  try {
    const token = getUserToken();
    const response = await axios.get(`${API_URL}/location/address`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'adresse:', error);
    throw error;
  }
};

/**
 * Mettre à jour l'adresse de l'utilisateur
 * @param {Object} addressData Données d'adresse (address, city, pincode, phone, notes, coordinates)
 * @returns Les données d'adresse mises à jour
 */
export const updateUserAddress = async (addressData) => {
  try {
    const token = getUserToken();
    const response = await axios.post(`${API_URL}/location/address`, addressData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'adresse:', error);
    throw error;
  }
};

/**
 * Récupérer les produits à proximité de l'utilisateur
 * @param {Object} params Paramètres de filtre (maxDistance, category, brand)
 * @returns Liste de produits à proximité
 */
export const getNearbyProducts = async (params = {}) => {
  try {
    const token = getUserToken();
    const response = await axios.get(`${API_URL}/location/nearby-products`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits à proximité:', error);
    throw error;
  }
};

/**
 * Rechercher des produits à proximité d'une position donnée
 * @param {Array} coordinates Coordonnées [longitude, latitude]
 * @param {Object} options Options additionnelles (maxDistance, category, brand)
 * @returns Liste de produits à proximité
 */
export const searchProductsByLocation = async (coordinates, options = {}) => {
  try {
    const token = getUserToken();
    const response = await axios.post(
      `${API_URL}/location/search-products`, 
      { 
        coordinates,
        ...options
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche de produits par localisation:', error);
    throw error;
  }
}; 