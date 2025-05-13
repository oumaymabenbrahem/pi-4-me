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



  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full h-[600px] overflow-hidden">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((slide, index) => (
              <div
                key={index}
                className={`${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                } absolute top-0 left-0 w-full h-full transition-opacity duration-1000`}
              >
                <img
                  src={slide?.image}
                  alt="Feature image"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">
                    SUSTAINAFOOD
                  </h1>
                  <p className="text-xl md:text-2xl max-w-2xl drop-shadow-md">
                    Réduisez le gaspillage alimentaire en réservant des produits à prix réduits
                  </p>
                </div>
              </div>
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
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 hover:bg-primary hover:text-white transition-colors"
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
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 hover:bg-primary hover:text-white transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {featureImageList.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-primary" : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Section des produits à proximité - Visible seulement si l'utilisateur est connecté */}
      {user && (
        <section className="section-padding bg-gradient-to-b from-gray-50 to-white">
          <div className="container-custom">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Produits près de chez vous</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Découvrez les produits disponibles à proximité de votre localisation</p>
            </div>
            <NearbyProducts maxDistance={15} />
          </div>
        </section>
      )}

      {/* Section des recommandations personnalisées - Visible seulement si l'utilisateur est connecté */}
      {user && (
        <section className="section-padding bg-gradient-to-b from-white to-gray-50">
          <div className="container-custom">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Recommandé pour vous</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Basé sur vos préférences et votre historique d'achats</p>
            </div>
            <UserRecommendations />
          </div>
        </section>
      )}

      <section className="section-padding bg-gradient-to-b from-white to-gray-50">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Nos catégories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Découvrez notre sélection de produits par catégorie pour réduire le gaspillage alimentaire</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categoriesWithIcon.map((categoryItem) => (
              <Card
                key={categoryItem.id}
                onClick={() =>
                  handleNavigateToListingPage(categoryItem, "category")
                }
                className="cursor-pointer card-hover overflow-hidden border-none bg-white"
              >
                <CardContent className="flex flex-col items-center justify-center p-6 relative">
                  <div className="absolute inset-0 bg-primary/5 -z-10"></div>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <categoryItem.icon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="font-bold text-lg">{categoryItem.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Nos magasins partenaires</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Trouvez des produits à prix réduits dans vos magasins préférés</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {brandsWithIcon.map((brandItem) => (
              <Card
                key={brandItem.id}
                onClick={() => handleNavigateToListingPage(brandItem, "brand")}
                className="cursor-pointer card-hover overflow-hidden border-none bg-white"
              >
                <CardContent className="flex flex-col items-center justify-center p-6 relative">
                  <div className="absolute inset-0 bg-secondary/5 -z-10"></div>
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                    <brandItem.icon className="w-8 h-8 text-secondary" />
                  </div>
                  <span className="font-bold text-lg">{brandItem.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-b from-white to-gray-50">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Produits à consommer rapidement</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Ces produits approchent de leur date d'expiration et sont disponibles à prix réduits</p>
          </div>

          {productList && productList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productList.map((product) => (
                <ShoppingProductTile
                  key={product._id}
                  product={product}
                  handleGetProductDetails={handleGetProductDetails}
                  handleAddtoCart={handleAddtoCart}
                  variant="grid"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">Aucun produit disponible pour le moment</p>
            </div>
          )}

          <div className="mt-10 text-center">
            <Button
              onClick={() => navigate('/shop/listing')}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md"
            >
              Voir tous les produits
            </Button>
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
