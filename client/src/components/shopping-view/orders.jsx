import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetails(getId));
  }

  useEffect(() => {
    console.log("User in ShoppingOrders:", user);
    if (user?._id) {
      console.log("Fetching orders for user in ShoppingOrders component:", user._id);
      dispatch(getAllOrdersByUserId(user._id));
    } else {
      console.log("No user ID found in ShoppingOrders component");
    }
  }, [dispatch, user]);

  // Log orderList whenever it changes
  useEffect(() => {
    console.log("OrderList in ShoppingOrders:", orderList);
  }, [orderList]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  console.log(orderDetails, "orderDetails");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Order Price</TableHead>
              <TableHead>
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderList && orderList.length > 0 ? (
              orderList.map((orderItem) => (
                <TableRow key={orderItem?._id}>
                  <TableCell>{orderItem?._id?.substring(0, 8)}</TableCell>
                  <TableCell>
                    {orderItem?.orderDate
                      ? new Date(orderItem.orderDate).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      // Déterminer la classe et le texte en fonction du statut
                      let badgeClass = "";
                      let statusText = orderItem?.orderStatus || "pending";

                      switch (statusText) {
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
                  </TableCell>
                  <TableCell>{orderItem?.totalAmount?.toFixed(2)} DT</TableCell>
                  <TableCell>
                    <Dialog
                      open={openDetailsDialog}
                      onOpenChange={() => {
                        setOpenDetailsDialog(false);
                        dispatch(resetOrderDetails());
                      }}
                    >
                      <Button
                        onClick={() =>
                          handleFetchOrderDetails(orderItem?._id)
                        }
                      >
                        View Details
                      </Button>
                      <ShoppingOrderDetailsView orderDetails={orderDetails} />
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-gray-500">Aucune commande trouvée</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default ShoppingOrders;
