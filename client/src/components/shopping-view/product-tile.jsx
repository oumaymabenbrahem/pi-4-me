import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { recordProductInteraction } from "@/services/recommendation-service";
import { useSelector } from "react-redux";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  const { user } = useSelector((state) => state.auth);
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Check if product is close to expiration (within 3 days)
  const isCloseToExpiration = () => {
    if (!product?.expirationDate) return false;
    const expirationDate = new Date(product.expirationDate);
    const today = new Date();
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden flex flex-col h-full shadow-md hover:shadow-lg transition-shadow">
      <div className="flex-1 flex flex-col">
        <div
          className="relative cursor-pointer"
          onClick={() => {
            // Enregistrer l'interaction de vue si l'utilisateur est connecté
            if (user) {
              try {
                recordProductInteraction(product?._id, "view");
              } catch (error) {
                console.error("Erreur lors de l'enregistrement de l'interaction:", error);
              }
            }
            handleGetProductDetails(product?._id);
          }}
        >
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[220px] object-cover"
          />
          {product?.quantity === 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Rupture de stock
            </Badge>
          ) : product?.quantity < 5 ? (
            <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600">
              {`Plus que ${product?.quantity} ${product?.unit}`}
            </Badge>
          ) : isCloseToExpiration() ? (
            <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
              Expire bientôt
            </Badge>
          ) : null}

          {product?.isCollected && (
            <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
              Collecté
            </Badge>
          )}
        </div>
        <CardContent
          className="p-4 flex-1 cursor-pointer"
          onClick={() => {
            // Enregistrer l'interaction de vue si l'utilisateur est connecté
            if (user) {
              try {
                recordProductInteraction(product?._id, "view");
              } catch (error) {
                console.error("Erreur lors de l'enregistrement de l'interaction:", error);
              }
            }
            handleGetProductDetails(product?._id);
          }}
        >
          <h2 className="text-lg font-semibold mb-2 truncate">{product?.title}</h2>
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {categoryOptionsMap[product?.category]}
              </span>
              <span className="text-xs text-muted-foreground">
                {brandOptionsMap[product?.brand]}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>
                Qté: {product?.quantity} {product?.unit}
              </span>
              <span>
                Exp: {formatDate(product?.expirationDate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-md font-semibold text-green-600">Prix: {product?.price || 0} DT</span>
            </div>
            <p className="text-xs text-gray-500 truncate">Magasin: {product?.storeLocation}</p>
          </div>
        </CardContent>
      </div>
      <div className="border-t p-4">
        {product?.quantity === 0 || product?.isCollected ? (
          <div className="grid grid-cols-1 gap-2">
            <Button className="w-full opacity-60 cursor-not-allowed">
              {product?.isCollected ? "Déjà collecté" : "Rupture de stock"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleGetProductDetails(product?._id)}
            >
              Voir détails
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={() => {
                // Enregistrer l'interaction d'ajout au panier si l'utilisateur est connecté
                if (user) {
                  try {
                    recordProductInteraction(product?._id, "cart");
                  } catch (error) {
                    console.error("Erreur lors de l'enregistrement de l'interaction:", error);
                  }
                }
                handleAddtoCart(product?._id, product?.quantity);
              }}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Réserver
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleGetProductDetails(product?._id)}
            >
              Voir détails
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

export default ShoppingProductTile;
