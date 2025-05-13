import React, { useState, useEffect } from 'react';
import { getSimilarProducts } from '../../services/recommendation-service';
import { useToast } from "@/components/ui/use-toast";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/shop/cart-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { formatDate } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

/**
 * Composant pour afficher les produits similaires à un produit spécifique
 */
function ProductRecommendations({ productId, title = "Les clients ayant consulté ce produit ont aussi consulté..." }) {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!productId) return;

      setIsLoading(true);
      try {
        console.log("Récupération des produits similaires pour:", productId);
        const response = await getSimilarProducts(productId, 4);
        console.log("Réponse des produits similaires:", response);
        if (response.success) {
          setSimilarProducts(response.data);
          console.log("Produits similaires récupérés:", response.data.length);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des produits similaires:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [productId]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ productId: product._id, quantity: 1 }))
      .unwrap()
      .then(() => {
        toast({
          title: "Produit ajouté au panier",
          description: `${product.title} a été ajouté à votre panier.`,
        });
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter le produit au panier.",
        });
      });
  };

  const handleViewDetails = (productId) => {
    dispatch(fetchProductDetails(productId));
  };

  // Afficher un indicateur de chargement
  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // Afficher un message s'il n'y a pas de produits similaires
  if (similarProducts.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-600">Aucun produit similaire trouvé.</p>
          <p className="text-gray-500 text-sm mt-2">Continuez à explorer notre catalogue pour découvrir d'autres produits.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {similarProducts.map((product) => (
          <Card key={product._id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary">
                    {categoryOptionsMap[product.category] || product.category}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold truncate">{product.title}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold">{product.price} €</span>
                  <span className="text-sm">
                    Exp: {formatDate(product.expirationDate)}
                  </span>
                </div>
                <div className="mt-2">
                  <Badge variant="outline">
                    {brandOptionsMap[product.brand] || product.brand}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(product._id)}
              >
                Détails
              </Button>
              <Button
                size="sm"
                onClick={() => handleAddToCart(product)}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProductRecommendations;
