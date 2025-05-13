import { Outlet, useNavigate } from "react-router-dom";
import ShoppingHeader from "./header";
import Chatbot from "../Chatbot";
import { Button } from "../ui/button";
import { MessageSquare } from "lucide-react";
import { useSelector } from "react-redux";

function ShoppingLayout() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* common header */}
      <ShoppingHeader />
      <main className="flex flex-col w-full">
        <Outlet />
      </main>

      {/* Chatbot */}
      <Chatbot />

      {/* Bouton flottant pour les réclamations */}
      {user && (
        <Button
          onClick={() => navigate("/shop/complaints")}
          className="fixed bottom-24 right-6 bg-emerald-500 hover:bg-emerald-600 rounded-full p-4 shadow-lg z-50"
          size="icon"
          title="Mes réclamations"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="sr-only">Mes réclamations</span>
        </Button>
      )}
    </div>
  );
}

export default ShoppingLayout;
