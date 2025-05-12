import axios from 'axios';

// Fonction pour récupérer toutes les marques
export const fetchAllBrands = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/brands');
    return response.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};

// Fonction pour ajouter une nouvelle marque
export const addBrand = async (brandData) => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/brands',
      brandData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding brand:', error);
    throw error;
  }
};
