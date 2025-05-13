import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getOrderDetails } from "@/store/shop/order-slice";
import { ArrowLeft, CalendarIcon, CreditCard, MapPin, Package, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

function OrderDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderDetails, isLoading } = useSelector((state) => state.shoppingOrder);

  useEffect(() => {
    if (id) {
      dispatch(getOrderDetails(id));
    }
  }, [dispatch, id]);

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

  if (isLoading || !orderDetails) {
    return (
      <div className="container mx-auto py-16 px-4 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/shop/orders")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux commandes
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <h1 className="text-3xl font-bold">
            Commande #{orderDetails._id.substring(0, 8)}
          </h1>
          <div className="flex gap-2 mt-2 md:mt-0">
            {getStatusBadge(orderDetails.orderStatus)}
            {getPaymentStatusBadge(orderDetails.paymentStatus)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Produits commandés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderDetails.cartItems.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-4 py-4 border-b last:border-0">
                    <div className="h-24 w-24 flex-shrink-0 rounded-md border overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Quantité: {item.quantity} {item.unit}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Provenance: {item.storeLocation}
                      </p>
                      {item.expirationDate && (
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          Date d&apos;expiration: {format(new Date(item.expirationDate), "PPP", { locale: fr })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Adresse de livraison</h3>
                    <p className="text-muted-foreground">{orderDetails.addressInfo.address}</p>
                    <p className="text-muted-foreground">{orderDetails.addressInfo.city}, {orderDetails.addressInfo.pincode}</p>
                    <p className="text-muted-foreground">Téléphone: {orderDetails.addressInfo.phone}</p>
                    {orderDetails.addressInfo.notes && (
                      <p className="text-sm mt-2 p-2 bg-muted rounded-md">
                        <span className="font-medium">Notes:</span> {orderDetails.addressInfo.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm py-2">
                  <span className="text-muted-foreground">Date de commande</span>
                  <span className="font-medium">
                    {orderDetails.orderDate ?
                      format(new Date(orderDetails.orderDate), "PPP", { locale: fr }) :
                      "Date inconnue"}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-2">
                  <span className="text-muted-foreground">Statut</span>
                  <span>{getStatusBadge(orderDetails.orderStatus)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm py-2">
                  <span className="text-muted-foreground">Nombre d&apos;articles</span>
                  <span className="font-medium">{orderDetails.cartItems.length}</span>
                </div>
                <div className="flex justify-between text-sm py-2">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="font-medium">Gratuite</span>
                </div>
                <div className="flex justify-between font-medium text-lg py-2">
                  <span>Total</span>
                  <span>{orderDetails.totalAmount.toFixed(2)} DT</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Paiement
              </CardTitle>
              <CardDescription>
                Informations de paiement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm py-2">
                <span className="text-muted-foreground">Méthode</span>
                <span className="font-medium">
                  {orderDetails.paymentMethod === "virtual"
                    ? "Carte bancaire"
                    : "Paiement à la livraison"}
                </span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-muted-foreground">Statut</span>
                <span>{getPaymentStatusBadge(orderDetails.paymentStatus)}</span>
              </div>
              {orderDetails.paymentId && (
                <div className="flex justify-between text-sm py-2">
                  <span className="text-muted-foreground">ID de paiement</span>
                  <span className="font-medium">{orderDetails.paymentId.substring(0, 16)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/shop/products")}
          >
            Continuer mes achats
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsPage;