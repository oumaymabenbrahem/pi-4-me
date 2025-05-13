import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import PropTypes from "prop-types";

export default function StripeProvider({ children }) {
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    // Récupérer la clé publique Stripe du serveur
    const getStripeConfig = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/shop/payment/config",
          { withCredentials: true }
        );
        if (response.data.success) {
          const publishableKey = response.data.publishableKey;
          setStripePromise(loadStripe(publishableKey));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la configuration Stripe:", error);
      }
    };

    getStripeConfig();
  }, []);

  if (!stripePromise) {
    return <div>Chargement du système de paiement...</div>;
  }

  return <Elements stripe={stripePromise}>{children}</Elements>;
}

StripeProvider.propTypes = {
  children: PropTypes.node.isRequired
}; 