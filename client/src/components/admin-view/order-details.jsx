import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Non défini";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  console.log(orderDetails, "orderDetailsorderDetails");

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      }
    });
  }

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
            <p className="font-medium">Produits réservés</p>
            <Label>{orderDetails?.totalAmount} produits</Label>
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
              <Badge
                className={`py-1 px-3 ${
                  orderDetails?.orderStatus === "confirmed"
                    ? "bg-green-500"
                    : orderDetails?.orderStatus === "rejected"
                    ? "bg-red-600"
                    : "bg-black"
                }`}
              >
                {orderDetails?.orderStatus === "pending" 
                  ? "En attente" 
                  : orderDetails?.orderStatus === "confirmed"
                  ? "Confirmée"
                  : orderDetails?.orderStatus === "collected"
                  ? "Collectée"
                  : "Rejetée"}
              </Badge>
            </Label>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Détails des produits</div>
            <ul className="grid gap-3">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                ? orderDetails?.cartItems.map((item) => (
                    <li className="flex flex-col gap-1 border-b pb-2">
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
              <span>{user.username}</span>
              <span>{orderDetails?.addressInfo?.address}</span>
              <span>{orderDetails?.addressInfo?.city}</span>
              <span>{orderDetails?.addressInfo?.pincode}</span>
              <span>{orderDetails?.addressInfo?.phone}</span>
              <span>{orderDetails?.addressInfo?.notes}</span>
            </div>
          </div>
        </div>

        <div>
          <CommonForm
            formControls={[
              {
                label: "Statut de commande",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "En attente" },
                  { id: "confirmed", label: "Confirmée" },
                  { id: "collected", label: "Collectée" },
                  { id: "rejected", label: "Rejetée" },
                ],
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={"Mettre à jour le statut"}
            onSubmit={handleUpdateStatus}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
