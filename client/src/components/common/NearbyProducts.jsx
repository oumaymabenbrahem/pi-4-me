import React, { useState, useEffect } from 'react';
import { getNearbyProducts } from '../../services/location-service';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { useToast } from "@/components/ui/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchProductDetails, setProductDetails } from "@/store/shop/products-slice";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { MapPin } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const NearbyProducts = ({ initialDistance = 25 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAddress, setHasAddress] = useState(true);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [maxDistance, setMaxDistance] = useState(initialDistance);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productDetails } = useSelector((state) => state.shopProducts);

  useEffect(() => {
    const fetchNearbyProducts = async () => {
      try {
        setLoading(true);
        setError(null); // Réinitialiser l'erreur à chaque nouvel essai

        console.log('Tentative de chargement des produits à proximité avec maxDistance =', maxDistance);
        const response = await getNearbyProducts({ maxDistance });
        
        if (response.success) {
          console.log('Produits à proximité chargés avec succès:', response.data.length);
          setProducts(response.data);
          setHasAddress(true);
        }
      } catch (error) {
        console.error('Erreur détaillée lors du chargement des produits à proximité:', error);
        
        // Vérifier les différents types d'erreurs possibles
        if (error.response) {
          console.log('Status de l\'erreur:', error.response.status);
          console.log('Données de l\'erreur:', error.response.data);
          
          // Gérer les erreurs liées à l'adresse
          if (error.response.status === 400) {
            const errorMessage = error.response.data.message || '';
            
            if (errorMessage.includes('introuvable')) {
              setHasAddress(false);
              setError('Vous devez définir votre adresse pour voir les produits à proximité.');
            }
            else if (errorMessage.includes('coordonnées')) {
              setHasAddress(false);
              setError('Vos coordonnées sont invalides. Veuillez mettre à jour votre adresse.');
            }
            else {
              setError(errorMessage || 'Erreur de requête. Veuillez réessayer.');
            }
          } else {
            setError('Impossible de charger les produits à proximité. Veuillez réessayer.');
          }
        } else if (error.request) {
          // La requête a été faite mais pas de réponse reçue
          setError('Aucune réponse du serveur. Vérifiez votre connexion internet.');
        } else {
          // Erreur lors de la configuration de la requête
          setError('Erreur lors de la préparation de la requête. Veuillez réessayer.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyProducts();
  }, [maxDistance]);

  // Effet pour ouvrir la boîte de dialogue quand les détails du produit sont récupérés
  useEffect(() => {
    if (productDetails !== null) {
      setOpenDetailsDialog(true);
    }
  }, [productDetails]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Check if product is close to expiration (within 3 days)
  const isCloseToExpiration = (product) => {
    if (!product?.expirationDate) return false;
    const expirationDate = new Date(product.expirationDate);
    const today = new Date();
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  // Fonction pour récupérer les détails du produit
  const handleGetProductDetails = (productId) => {
    dispatch(fetchProductDetails(productId));
  };

  // Fonction pour réserver un produit
  const handleReserveProduct = (productId, availableQuantity) => {
    let getCartItems = cartItems?.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === productId
      );
      if (indexOfCurrentItem > -1) {
        const getRequestedQuantity = getCartItems[indexOfCurrentItem].requestedQuantity;
        if (getRequestedQuantity + 1 > availableQuantity) {
          toast({
            title: `Il ne reste que ${availableQuantity} unités disponibles pour ce produit`,
            variant: "destructive",
          });

          return;
        }
      }
    }

    dispatch(
      addToCart({
        productId: productId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems());
        toast({
          title: "Produit réservé avec succès",
          variant: "success",
        });
      }
    });
  };

  const handleDistanceChange = (value) => {
    setMaxDistance(parseInt(value));
  };

  if (loading) {
    return (
      <div className="w-full p-4 text-center">
        <p className="text-gray-600">Chargement des produits à proximité...</p>
      </div>
    );
  }

  if (!hasAddress) {
    return (
      <div className="w-full p-4 bg-yellow-50 border border-yellow-300 rounded-md">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Définissez votre adresse
        </h3>
        <p className="text-yellow-700 mb-3">
          Pour voir les produits disponibles près de chez vous, vous devez d'abord définir votre adresse.
        </p>
        <Link 
          to="/profile/address" 
          className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
        >
          Définir mon adresse
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 border border-red-300 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-gray-700">
          Aucun produit disponible à proximité de votre adresse pour le moment.
        </p>
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <MapPin className="mr-2 text-primary" size={20} />
            <p className="text-sm font-medium">Rayon de recherche: {maxDistance} km</p>
          </div>
          <div className="w-full max-w-xs mx-auto mb-4">
            <Select 
              value={maxDistance.toString()} 
              onValueChange={handleDistanceChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner une distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="15">15 km</SelectItem>
                <SelectItem value="20">20 km</SelectItem>
                <SelectItem value="25">25 km</SelectItem>
                <SelectItem value="30">30 km</SelectItem>
                <SelectItem value="40">40 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
                <SelectItem value="75">75 km</SelectItem>
                <SelectItem value="100">100 km</SelectItem>
                <SelectItem value="150">150 km</SelectItem>
                <SelectItem value="180">180 km</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => setMaxDistance(maxDistance)}
          >
            Élargir ma recherche
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-center md:text-left mb-4 md:mb-0">Produits à proximité</h2>
        <div className="flex flex-col items-center md:items-end">
          <div className="flex items-center mb-2">
            <MapPin className="mr-2 text-primary" size={20} />
            <p className="text-sm font-medium">Rayon de recherche: {maxDistance} km</p>
          </div>
          <div className="w-full max-w-xs">
            <Select 
              value={maxDistance.toString()} 
              onValueChange={handleDistanceChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner une distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="15">15 km</SelectItem>
                <SelectItem value="20">20 km</SelectItem>
                <SelectItem value="25">25 km</SelectItem>
                <SelectItem value="30">30 km</SelectItem>
                <SelectItem value="40">40 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
                <SelectItem value="75">75 km</SelectItem>
                <SelectItem value="100">100 km</SelectItem>
                <SelectItem value="150">150 km</SelectItem>
                <SelectItem value="180">180 km</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product._id} className="w-full max-w-sm mx-auto overflow-hidden flex flex-col h-full shadow-md hover:shadow-lg transition-shadow">
            <div className="flex-1 flex flex-col">
              <div className="relative cursor-pointer" onClick={() => handleGetProductDetails(product._id)}>
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-[220px] object-cover"
                />
                {product.quantity === 0 ? (
                  <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                    Rupture de stock
                  </Badge>
                ) : product.quantity < 5 ? (
                  <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600">
                    {`Plus que ${product.quantity} ${product.unit}`}
                  </Badge>
                ) : isCloseToExpiration(product) ? (
                  <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                    Expire bientôt
                  </Badge>
                ) : null}

                {product.isCollected && (
                  <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
                    Collecté
                  </Badge>
                )}
                
                {product.distance && (
                  <Badge className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600">
                    {Math.round(product.distance * 10) / 10} km
                  </Badge>
                )}
              </div>
              <CardContent className="p-4 flex-1 cursor-pointer" onClick={() => handleGetProductDetails(product._id)}>
                <h2 className="text-lg font-semibold mb-2 truncate">{product.title}</h2>
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {categoryOptionsMap[product.category]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {brandOptionsMap[product.brand]}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>
                      Qté: {product.quantity} {product.unit}
                    </span>
                    <span>
                      Exp: {formatDate(product.expirationDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-md font-semibold text-green-600">Prix: {product.price || 0} DT</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">Magasin: {product.storeLocation}</p>
                </div>
              </CardContent>
            </div>
            <div className="border-t p-4">
              {product.quantity === 0 || product.isCollected ? (
                <div className="grid grid-cols-1 gap-2">
                  <Button className="w-full opacity-60 cursor-not-allowed">
                    {product.isCollected ? "Déjà collecté" : "Rupture de stock"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleGetProductDetails(product._id)}
                  >
                    Voir détails
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    onClick={() => handleReserveProduct(product._id, product.quantity)} 
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Réserver
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleGetProductDetails(product._id)}
                  >
                    Voir détails
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {productDetails && (
        <ProductDetailsDialog
          open={openDetailsDialog}
          handleOpenState={setOpenDetailsDialog}
          productDetails={productDetails}
        />
      )}
    </div>
  );
};

export default NearbyProducts; 