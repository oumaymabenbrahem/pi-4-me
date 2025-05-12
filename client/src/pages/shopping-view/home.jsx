import { Button } from "@/components/ui/button";
import {
  Apple,
  ChevronLeftIcon,
  ChevronRightIcon,
  Lollipop,
  Pizza,
  Refrigerator,
  Store,
  Wine,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { getFeatureImages } from "@/store/common-slice";
import NearbyProducts from "@/components/common/NearbyProducts";
import UserRecommendations from "@/components/shopping-view/user-recommendations";
import { recordProductInteraction } from "@/services/recommendation-service";

const categoriesWithIcon = [
  { id: "fruits_legumes", label: "Fruits & Légumes", icon: Apple },
  { id: "produits_frais", label: "Produits frais", icon: Refrigerator },
  { id: "epicerie_salee", label: "Épicerie salée", icon: Pizza },
  { id: "epicerie_sucree", label: "Épicerie sucrée", icon: Lollipop },
  { id: "boissons", label: "Boissons", icon: Wine },
];

const brandsWithIcon = [
  { id: "aziza", label: "Aziza", icon: Store },
  { id: "mg", label: "MG", icon: Store },
  { id: "geant", label: "Geant", icon: Store },
  { id: "monoprix", label: "Monoprix", icon: Store },
  { id: "carrefour", label: "Carrefour", icon: Store },
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    // Enregistrer l'interaction de vue
    try {
      recordProductInteraction(getCurrentProductId, "view");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'interaction:", error);
    }

    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId) {
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



  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
    }, 15000);

    return () => clearInterval(timer);
  }, [featureImageList]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "expiration-soonest",
      })
    );
  }, [dispatch]);

  console.log(productList, "productList");

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full h-[600px] overflow-hidden">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((slide, index) => (
              <img
                src={slide?.image}
                key={index}
                className={`${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                } absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000`}
              />
            ))
          : null}
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) =>
                (prevSlide - 1 + featureImageList.length) %
                featureImageList.length
            )
          }
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) => (prevSlide + 1) % featureImageList.length
            )
          }
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Section des produits à proximité - Visible seulement si l'utilisateur est connecté */}
      {user && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <NearbyProducts maxDistance={15} />
          </div>
        </section>
      )}

      {/* Section des recommandations personnalisées - Visible seulement si l'utilisateur est connecté */}
      {user && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <UserRecommendations title="Recommandé pour vous" />
          </div>
        </section>
      )}

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Nos catégories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoriesWithIcon.map((categoryItem) => (
              <Card
                key={categoryItem.id}
                onClick={() =>
                  handleNavigateToListingPage(categoryItem, "category")
                }
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <categoryItem.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold">{categoryItem.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Nos magasins</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {brandsWithIcon.map((brandItem) => (
              <Card
                key={brandItem.id}
                onClick={() => handleNavigateToListingPage(brandItem, "brand")}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <brandItem.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold">{brandItem.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Produits à consommer rapidement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList && productList.length > 0
              ? productList.map((product, index) => {
                  return (
                    <ShoppingProductTile
                      key={index}
                      product={product}
                      handleGetProductDetails={handleGetProductDetails}
                      handleAddtoCart={handleAddtoCart}
                      variant="grid"
                    />
                  );
                })
              : null}
          </div>
        </div>
      </section>

      {productDetails && (
        <ProductDetailsDialog
          open={openDetailsDialog}
          handleOpenState={setOpenDetailsDialog}
          productDetails={productDetails}
        />
      )}
    </div>
  );
}

export default ShoppingHome;
