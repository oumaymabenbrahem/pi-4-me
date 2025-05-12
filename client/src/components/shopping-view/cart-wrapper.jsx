import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();

  const totalItems =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) => sum + currentItem?.requestedQuantity,
          0
        )
      : 0;

  return (
    <SheetContent className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Vos réservations</SheetTitle>
      </SheetHeader>
      <div className="mt-8 space-y-4">
        {cartItems && cartItems.length > 0
          ? cartItems.map((item) => (
              <UserCartItemsContent key={item.productId} cartItem={item} />
            ))
          : null}
      </div>
      <div className="mt-8 space-y-4">
        <div className="flex justify-between">
          <span className="font-bold">Total produits</span>
          <span className="font-bold">{totalItems} produits</span>
        </div>
      </div>
      <Button
        onClick={() => {
          navigate("/shop/cart");
          setOpenCartSheet(false);
        }}
        className="w-full mt-6"
      >
        Voir mon panier
      </Button>
    </SheetContent>
  );
}

export default UserCartWrapper;
