import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { useEffect } from "react";
import { recordProductInteraction } from "@/services/recommendation-service";
import ProductRecommendations from "./product-recommendations";

function ProductDetailsDialog({ open, handleOpenState }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productDetails } = useSelector((state) => state.shopProducts);
  const { toast } = useToast();

  // Enregistrer l'interaction de vue lorsque le dialogue s'ouvre
  useEffect(() => {
    if (open && productDetails && user) {
      try {
        recordProductInteraction(productDetails._id, "view");
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'interaction:", error);
      }
    }
  }, [open, productDetails, user]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Non défini";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Check if product is close to expiration (within 3 days)
  const isCloseToExpiration = () => {
    if (!productDetails?.expirationDate) return false;
    const expirationDate = new Date(productDetails.expirationDate);
    const today = new Date();
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  function handleAddToCart(getCurrentProductId, getAvailableQuantity) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getRequestedQuantity = getCartItems[indexOfCurrentItem].requestedQuantity;
        if (getRequestedQuantity + 1 > getAvailableQuantity) {
          toast({
            title: `Il ne reste que ${getAvailableQuantity} ${productDetails?.unit} disponibles pour ce produit`,
            variant: "destructive",
          });

          return;
        }
      }
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        // Enregistrer l'interaction d'ajout au panier
        try {
          recordProductInteraction(getCurrentProductId, "cart");
        } catch (error) {
          console.error("Erreur lors de l'enregistrement de l'interaction:", error);
        }

        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Produit réservé avec succès",
        });
      }
    });
  }

  function handleDialogClose() {
    handleOpenState(false);
    dispatch(setProductDetails());
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw]">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={productDetails?.image}
            alt={productDetails?.title}
            width={600}
            height={600}
            className="aspect-square w-full object-cover"
          />
        </div>
        <div className="">
          <div>
            <h1 className="text-3xl font-extrabold">{productDetails?.title}</h1>
            <p className="text-muted-foreground text-2xl mb-5 mt-4">
              {productDetails?.description}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 my-4">
            <div>
              <h3 className="font-semibold text-gray-600">Quantité disponible:</h3>
              <p className="text-xl">{productDetails?.quantity} {productDetails?.unit}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-600">Date d'expiration:</h3>
              <p className={`text-xl ${isCloseToExpiration() ? 'text-orange-500 font-bold' : ''}`}>
                {formatDate(productDetails?.expirationDate)}
                {isCloseToExpiration() && ' (Bientôt expiré!)'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 my-4">
            <div>
              <h3 className="font-semibold text-gray-600">Marque:</h3>
              <p className="text-xl">{productDetails?.brand}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-600">Catégorie:</h3>
              <p className="text-xl">{productDetails?.category}</p>
            </div>
          </div>
          <div className="my-4">
            <h3 className="font-semibold text-gray-600">Emplacement du magasin:</h3>
            <p className="text-xl">{productDetails?.storeLocation}</p>
          </div>
          <div className="my-4">
            <h3 className="font-semibold text-gray-600">Prix:</h3>
            <p className="text-xl font-semibold text-green-600">{productDetails?.price || 0} DT</p>
          </div>
          <div className="my-4">
            <h3 className="font-semibold text-gray-600">Statut:</h3>
            <p className={`text-xl font-semibold ${productDetails?.isCollected ? 'text-green-500' : 'text-blue-500'}`}>
              {productDetails?.isCollected ? 'Déjà collecté' : 'Disponible pour réservation'}
            </p>
          </div>
          <div className="mt-5 mb-5">
            {productDetails?.quantity === 0 || productDetails?.isCollected ? (
              <Button className="w-full opacity-60 cursor-not-allowed">
                {productDetails?.isCollected ? 'Déjà collecté' : 'Rupture de stock'}
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleAddToCart(productDetails._id, productDetails.quantity)}
              >
                Réserver
              </Button>
            )}
          </div>
          <Separator />
        </div>
      </DialogContent>

      {/* Afficher les recommandations à l'intérieur du dialogue */}
      {productDetails && (
        <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t shadow-lg z-50 overflow-auto max-h-[300px]">
          <ProductRecommendations productId={productDetails._id} />
        </div>
      )}
    </Dialog>
  );
}

export default ProductDetailsDialog;
