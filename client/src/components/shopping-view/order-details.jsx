import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Non défini";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">ID de commande</p>
            <Label>{orderDetails?._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Date de commande</p>
            <Label>{orderDetails?.orderDate ? formatDate(orderDetails.orderDate) : ""}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Montant total</p>
            <Label>{orderDetails?.totalAmount?.toFixed(2)} €</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Méthode de paiement</p>
            <Label>{orderDetails?.paymentMethod === "en_personne" ? "En personne" : orderDetails?.paymentMethod}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Statut de paiement</p>
            <Label>{orderDetails?.paymentStatus === "pending" ? "En attente" : orderDetails?.paymentStatus}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Statut de commande</p>
            <Label>
              {(() => {
                // Déterminer la classe et le texte en fonction du statut
                let badgeClass = "";
                let statusText = orderDetails?.orderStatus || "pending";
                
                switch(statusText) {
                  case "pending":
                    badgeClass = "bg-yellow-100 text-yellow-800";
                    statusText = "En attente";
                    break;
                  case "processing":
                    badgeClass = "bg-blue-100 text-blue-800";
                    statusText = "En traitement";
                    break;
                  case "shipped":
                    badgeClass = "bg-purple-100 text-purple-800";
                    statusText = "Expédié";
                    break;
                  case "delivered":
                    badgeClass = "bg-green-100 text-green-800";
                    statusText = "Livré";
                    break;
                  case "cancelled":
                    badgeClass = "bg-red-100 text-red-800";
                    statusText = "Annulé";
                    break;
                  default:
                    badgeClass = "bg-gray-100 text-gray-800";
                    statusText = "Inconnu";
                }
                
                return (
                  <Badge variant="outline" className={badgeClass}>
                    {statusText}
                  </Badge>
                );
              })()}
            </Label>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Détails des produits</div>
            <ul className="grid gap-3">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                ? orderDetails?.cartItems.map((item, index) => (
                    <li key={item._id || index} className="flex flex-col gap-1 border-b pb-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{item.title}</span>
                        <span>{item.quantity} {item.unit || 'pcs'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Magasin: {item.storeLocation || 'Non spécifié'}</span>
                        <span>Expire: {item.expirationDate ? formatDate(item.expirationDate) : 'Non spécifié'}</span>
                      </div>
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Informations de livraison</div>
            <div className="grid gap-0.5 text-muted-foreground">
              <span>{user?.username}</span>
              <span>{orderDetails?.addressInfo?.address}</span>
              <span>{orderDetails?.addressInfo?.city}</span>
              <span>{orderDetails?.addressInfo?.pincode}</span>
              <span>{orderDetails?.addressInfo?.phone}</span>
              <span>{orderDetails?.addressInfo?.notes}</span>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
