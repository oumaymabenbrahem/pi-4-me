import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

export default function ShoppingCart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchCartItems());
    }
  }, [dispatch, user]);

  const totalItems = cartItems?.items?.reduce(
    (sum, item) => sum + (item.requestedQuantity || 0),
    0
  ) || 0;

  const handleCheckout = () => {
    navigate("/shop/checkout");
  };

  if (!cartItems?.items?.length) {
    return (
      <div className="container mx-auto py-8">
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle className="text-2xl">Votre panier est vide</CardTitle>
          </CardHeader>
          <CardContent>
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              Ajoutez des produits à votre panier pour commencer vos achats
            </p>
            <Button onClick={() => navigate("/shop/listing")}>
              Parcourir les produits
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Mon Panier ({totalItems} articles)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {cartItems?.items?.map((item) => (
              <UserCartItemsContent key={item.productId} cartItem={item} />
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleCheckout} size="lg">
              Passer à la caisse
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 