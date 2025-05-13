import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createNewOrder, capturePayment } from "@/store/shop/order-slice";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fetchCartItems, resetCart, clearCartItems } from "@/store/shop/cart-slice";
import { fetchAllAddresses } from "@/store/shop/address-slice";
import { ArrowRightIcon, CreditCard, Loader2 } from "lucide-react";
import StripeProvider from "@/components/payment/StripeProvider";
import StripePaymentForm from "@/components/payment/StripePaymentForm";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("stripe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { addressList } = useSelector((state) => state.shopAddress);

  // Fetch cart items and user addresses on component mount
  useEffect(() => {
    if (user?._id) {
      console.log('Fetching addresses for user:', user._id);
      dispatch(fetchCartItems(user._id));
      dispatch(fetchAllAddresses())
        .unwrap()
        .then(response => {
          console.log('Addresses fetched successfully:', response);
        })
        .catch(error => {
          console.error('Error fetching addresses:', error);
          toast({
            title: "Erreur",
            description: "Impossible de récupérer vos adresses",
            variant: "destructive",
          });
        });
    } else {
      console.log('No user ID available:', user);
    }
  }, [dispatch, user, toast]);

  useEffect(() => {
    console.log('Current addressList:', addressList);
  }, [addressList]);

  // Sélectionner la première adresse par défaut
  useEffect(() => {
    if (addressList && addressList.length > 0 && !selectedAddress) {
      setSelectedAddress(addressList[0]._id);
    }
  }, [addressList, selectedAddress]);

  // Guard against empty cart only if we're not in the middle of completing an order
  useEffect(() => {
    if (!cartItems?.items?.length && !isOrderComplete) {
      navigate("/shop/cart");
      toast({
        title: "Votre panier est vide",
        description: "Ajoutez des produits à votre panier pour commander",
        variant: "destructive",
      });
    }
  }, [cartItems, navigate, toast, isOrderComplete]);


  // Calcul du montant total de la commande
  const totalAmount =
    cartItems?.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) => sum + (currentItem?.price || 0) * currentItem?.requestedQuantity,
          0
        )
      : 0;

  const handleAddressSelect = (addressId) => {
    setSelectedAddress(addressId);
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPayment(method);
    setShowStripeForm(method === "stripe");
  };

  const createOrder = async () => {
    if (!selectedAddress) {
      toast({
        title: "Adresse manquante",
        description: "Veuillez sélectionner une adresse de livraison",
        variant: "destructive",
      });
      return null;
    }

    // Find the selected address details
    const addressInfo = addressList.find(addr => addr._id === selectedAddress);

    if (!addressInfo) {
      toast({
        title: "Adresse introuvable",
        description: "Veuillez sélectionner une autre adresse",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Create order
      const orderPayload = {
        userId: user._id,
        cartId: cartItems?._id || "",
        cartItems: cartItems?.items?.map(item => ({
          productId: item.productId || '',
          title: item.title || '',
          image: item.image || '',
          quantity: item.requestedQuantity || 0,
          unit: item.unit || '',
          price: item.price || 0,
          storeLocation: item.storeLocation || '',
          expirationDate: item.expirationDate ? new Date(item.expirationDate).toISOString() : null
        })) || [],
        addressInfo: {
          addressId: addressInfo._id || '',
          address: addressInfo.address || '',
          city: addressInfo.city || '',
          pincode: addressInfo.pincode || '',
          phone: addressInfo.phone || '',
          notes: addressInfo.notes || "",
        },
        paymentMethod: selectedPayment,
        totalAmount: parseFloat(totalAmount) || 0
      };

      console.log('Order payload:', orderPayload);

      const createOrderResponse = await dispatch(createNewOrder(orderPayload)).unwrap();

      console.log('Order response:', createOrderResponse);

      if (createOrderResponse?.success) {
        return {
          orderId: createOrderResponse.orderId,
          amount: totalAmount
        };
      } else {
        throw new Error(createOrderResponse?.message || "Erreur lors de la création de la commande");
      }
    } catch (error) {
      console.error("Checkout error:", error);

      // Extraction du message d'erreur de la réponse API si disponible
      let errorMessage = "Une erreur est survenue lors de la commande";

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }

        // Affichage des erreurs de validation si disponibles
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          const validationErrors = error.response.data.errors
            .map(err => `${err.field}: ${err.message}`)
            .join(', ');

          if (validationErrors) {
            errorMessage += ` (${validationErrors})`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erreur de commande",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      if (selectedPayment === "stripe") {
        // Pour Stripe, on crée d'abord la commande, puis on affiche le formulaire de paiement
        const orderData = await createOrder();

        if (orderData) {
          setOrderId(orderData.orderId);
          setShowStripeForm(true);
        } else {
          setIsProcessing(false);
        }
      } else if (selectedPayment === "cod") {
        // Pour le paiement à la livraison
        const orderData = await createOrder();

        if (orderData) {
          setOrderId(orderData.orderId);
          // Mettre à jour le statut de la commande pour la livraison
          await dispatch(capturePayment({
            orderId: orderData.orderId,
            paymentId: "COD_" + Date.now(),
            payerId: "COD_" + user._id
          })).unwrap();

          setIsPaymentComplete(true);
          setIsOrderComplete(true);

          // Rediriger d'abord, puis réinitialiser le panier
          navigate("/shop/order/success");
          // Réinitialiser le panier après la redirection
          setTimeout(() => {
            dispatch(clearCartItems()).then(() => {
              dispatch(resetCart());
            });
          }, 500);
        }
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);

      // Extraction du message d'erreur de la réponse API si disponible
      let errorMessage = "Une erreur est survenue lors de la commande";

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }

        // Affichage des erreurs de validation si disponibles
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          const validationErrors = error.response.data.errors
            .map(err => `${err.field}: ${err.message}`)
            .join(', ');

          if (validationErrors) {
            errorMessage += ` (${validationErrors})`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erreur de commande",
        description: errorMessage,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentComplete(true);
    setIsOrderComplete(true);

    // Rediriger d'abord, puis réinitialiser le panier
    navigate("/shop/payment/success");
    // Réinitialiser le panier après la redirection
    setTimeout(() => {
      dispatch(clearCartItems()).then(() => {
        dispatch(resetCart());
      });
    }, 500);

    setIsProcessing(false);

    toast({
      title: "Paiement réussi",
      description: "Votre paiement a été effectué avec succès"
    });
  };

  const handlePaymentError = (errorMessage) => {
    toast({
      title: "Erreur de paiement",
      description: errorMessage || "Une erreur est survenue lors du traitement du paiement",
      variant: "destructive",
    });
    setIsProcessing(false);
  };

  const handleGoToOrders = () => {
    navigate("/shop/orders");
  };

  if (approvalURL) {
    window.location.href = approvalURL;
  }

  if (isPaymentComplete) {
    return (
      <div className="container mx-auto py-16 px-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Merci pour votre commande!</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <p>Votre commande #{orderId} a été confirmée.</p>
              <p>Vous recevrez une confirmation par email.</p>
            </div>
            <Button onClick={handleGoToOrders} className="mt-4">
              Voir mes commandes <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Finaliser votre commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address Section */}
          <Card>
            <CardHeader>
              <CardTitle>Adresse de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              {addressList && addressList.length > 0 ? (
                <RadioGroup
                  value={selectedAddress}
                  onValueChange={handleAddressSelect}
                  className="space-y-4"
                >
                  {addressList.map((address) => (
                    <div key={address._id} className="flex items-start space-x-2">
                      <RadioGroupItem value={address._id} id={`address-${address._id}`} />
                      <div className="grid gap-1.5">
                        <Label htmlFor={`address-${address._id}`} className="font-medium">
                          {address.address}
                        </Label>
                        <p className="text-sm text-gray-500">
                          {address.city}, {address.pincode} <br />
                          Téléphone: {address.phone}
                          {address.notes && <><br />{address.notes}</>}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="text-center py-4">
                  <p className="mb-4">Vous n&apos;avez pas encore ajouté d&apos;adresse</p>
                  <Button onClick={() => navigate("/shop/address")}>
                    Ajouter une adresse
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method Section */}
          <Card>
            <CardHeader>
              <CardTitle>Méthode de paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                defaultValue="stripe"
                onValueChange={handlePaymentMethodSelect}
                className="space-y-4"
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="stripe" id="payment-stripe" />
                  <div className="grid gap-1.5 w-full">
                    <Label htmlFor="payment-stripe" className="font-medium flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" /> Paiement par carte
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="cod" id="payment-cod" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="payment-cod" className="font-medium">
                      Paiement à la livraison
                    </Label>
                    <p className="text-sm text-gray-500">
                      Payez en espèces à la livraison
                    </p>
                  </div>
                </div>
              </RadioGroup>

              {/* Formulaire Stripe de paiement */}
              {showStripeForm && orderId && (
                <div className="mt-6">
                  <StripeProvider>
                    <StripePaymentForm
                      amount={totalAmount}
                      orderId={orderId}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </StripeProvider>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items summary */}
              <div className="space-y-2">
                {cartItems?.items && Array.isArray(cartItems.items) && cartItems.items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>{item.title} × {item.requestedQuantity}</span>
                    <span>{(item.price * item.requestedQuantity).toFixed(2)} DT</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Nombre d'articles</span>
                    <span>{cartItems?.items?.reduce((sum, item) => sum + item.requestedQuantity, 0) || 0}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Livraison</span>
                    <span>Gratuite</span>
                  </div>
                  <div className="flex justify-between font-bold mt-2">
                    <span>Total</span>
                    <span>{totalAmount.toFixed(2)} DT</span>
                  </div>
                </div>
              </div>

              {!showStripeForm && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    "Confirmer la commande"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
