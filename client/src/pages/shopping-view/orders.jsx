import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getAllOrdersByUserId, getOrderDetails } from "@/store/shop/order-slice";
import { Package, ShoppingBag } from "lucide-react";

function OrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { orderList, isLoading } = useSelector((state) => state.shoppingOrder);

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllOrdersByUserId(user.id));
    }
  }, [dispatch, user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">En traitement</Badge>;
      case "shipped":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Expédié</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Livré</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Payé</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Échoué</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const handleViewOrderDetails = (orderId) => {
    dispatch(getOrderDetails(orderId));
    navigate(`/shop/order/${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Mes commandes</h1>
        <Button onClick={() => navigate("/shop/products")}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Continuer mes achats
        </Button>
      </div>

      {orderList && orderList.length > 0 ? (
        <div className="space-y-6">
          {orderList.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      Commande #{order._id.substring(0, 8)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.orderDate ?
                        format(new Date(order.orderDate), "PPP à HH:mm", { locale: fr }) :
                        "Date inconnue"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(order.orderStatus)}
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Produits</h3>
                    <div className="space-y-2">
                      {order.cartItems.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="h-14 w-14 flex-shrink-0 rounded-md border overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantité: {item.quantity} {item.unit}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Adresse de livraison</h3>
                    <div className="text-sm">
                      <p>{order.addressInfo.address}</p>
                      <p>{order.addressInfo.city}, {order.addressInfo.pincode}</p>
                      <p>Téléphone: {order.addressInfo.phone}</p>
                      {order.addressInfo.notes && <p>Notes: {order.addressInfo.notes}</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Résumé</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Méthode de paiement:</span>
                        <span className="font-medium">
                          {order.paymentMethod === "stripe"
                            ? "Carte bancaire"
                            : "Paiement à la livraison"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total:</span>
                        <span className="font-medium">{order.totalAmount.toFixed(2)} DT</span>
                      </div>

                      <div className="pt-4 mt-4 border-t">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleViewOrderDetails(order._id)}
                        >
                          <Package className="mr-2 h-4 w-4" /> Voir les détails
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Aucune commande</h2>
          <p className="text-muted-foreground mb-6">Vous n&apos;avez pas encore passé de commande</p>
          <Button onClick={() => navigate("/shop/products")}>
            Découvrir nos produits
          </Button>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;