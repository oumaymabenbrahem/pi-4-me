import { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import axios from "axios";
import PropTypes from "prop-types";

const cardStyle = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: "inherit",
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#a0aec0"
      }
    },
    invalid: {
      color: "#e53e3e",
      iconColor: "#e53e3e"
    }
  }
};

export default function StripePaymentForm({ amount, orderId, onSuccess, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    // Créer l'intention de paiement
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(
          "http://localhost:5000/api/shop/payment/create-payment-intent",
          { amount, orderId },
          { withCredentials: true }
        );

        if (response.data.success) {
          setClientSecret(response.data.clientSecret);
          setPaymentIntentId(response.data.paymentIntentId);
        } else {
          setErrorMessage("Erreur lors de la création du paiement");
        }
      } catch (error) {
        console.error("Erreur:", error);
        setErrorMessage(
          error.response?.data?.message ||
          "Une erreur est survenue lors du traitement du paiement"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (amount && orderId) {
      createPaymentIntent();
    }
  }, [amount, orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Confirmer le paiement
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: "Nom du client"
          }
        }
      });

      if (result.error) {
        setErrorMessage(result.error.message);
        onError && onError(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        // Informer le serveur que le paiement a réussi
        const confirmResponse = await axios.post(
          "http://localhost:5000/api/shop/payment/confirm-payment",
          {
            orderId,
            paymentIntentId
          },
          { withCredentials: true }
        );

        if (confirmResponse.data.success) {
          // Appeler le callback de succès pour permettre la navigation
          onSuccess && onSuccess(confirmResponse.data.order);
        } else {
          throw new Error("Erreur lors de la confirmation du paiement");
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      setErrorMessage(
        error.response?.data?.message ||
        "Une erreur est survenue lors du traitement du paiement"
      );
      onError && onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paiement sécurisé</CardTitle>
        <CardDescription>
          Veuillez saisir les informations de votre carte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="p-3 border rounded-md bg-card">
              <CardElement options={cardStyle} />
            </div>

            {errorMessage && (
              <div className="text-sm text-red-500 mt-2">
                {errorMessage}
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          disabled={isLoading || !stripe}
          className="w-full"
          onClick={handleSubmit}
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement en cours...
            </div>
          ) : (
            `Payer ${amount} DT`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

StripePaymentForm.propTypes = {
  amount: PropTypes.number.isRequired,
  orderId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onError: PropTypes.func
};