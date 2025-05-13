import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserComplaints, resetComplaintState } from "@/store/complaints-slice";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Plus, Clock, MessageSquare, Eye, Search, Filter, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Fonction pour obtenir la couleur du badge en fonction du statut
const getStatusBadgeColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500";
    case "in-progress":
      return "bg-blue-500";
    case "resolved":
      return "bg-green-500";
    case "rejected":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

// Fonction pour traduire le statut en français
const translateStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente";
    case "in-progress":
      return "En cours";
    case "resolved":
      return "Résolu";
    case "rejected":
      return "Rejeté";
    default:
      return status;
  }
};

// Fonction pour traduire la catégorie en français
const translateCategory = (category) => {
  switch (category) {
    case "product":
      return "Produit";
    case "delivery":
      return "Livraison";
    case "payment":
      return "Paiement";
    case "website":
      return "Site web";
    case "other":
      return "Autre";
    default:
      return category;
  }
};

export default function ShoppingComplaints() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userComplaints, isLoading, error } = useSelector((state) => state.complaints);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(getUserComplaints());

    // Nettoyage lors du démontage du composant
    return () => {
      dispatch(resetComplaintState());
    };
  }, [dispatch]);

  // Filtrer les réclamations en fonction de la recherche et du filtre de statut
  const filteredComplaints = userComplaints.filter((complaint) => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mes Réclamations</h1>
          <p className="text-gray-600">
            Consultez et gérez vos réclamations
          </p>
        </div>
        <Button
          onClick={() => navigate("/shop/complaints/new")}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          <Plus className="mr-2 h-4 w-4" /> Nouvelle Réclamation
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher une réclamation..."
                  className="w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    className="w-full pl-10 p-2 border rounded-md appearance-none bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="in-progress">En cours</option>
                    <option value="resolved">Résolu</option>
                    <option value="rejected">Rejeté</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune réclamation trouvée
          </h3>
          <p className="text-gray-600 mb-4">
            {userComplaints.length === 0
              ? "Vous n'avez pas encore soumis de réclamation."
              : "Aucune réclamation ne correspond à vos critères de recherche."}
          </p>
          <Button
            onClick={() => navigate("/shop/complaints/new")}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            Soumettre une réclamation
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((complaint) => (
            <Card
              key={complaint._id}
              className={`overflow-hidden border-l-4 hover:shadow-lg transition-all duration-200 ${
                complaint.status === "resolved"
                  ? "border-l-green-500"
                  : complaint.status === "rejected"
                  ? "border-l-red-500"
                  : complaint.status === "in-progress"
                  ? "border-l-blue-500"
                  : "border-l-yellow-500"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg line-clamp-1">{complaint.title}</CardTitle>
                    <CardDescription className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 opacity-70" />
                      {format(new Date(complaint.createdAt), "dd MMMM yyyy", { locale: fr })}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusBadgeColor(complaint.status)} shadow-sm`}>
                    {translateStatus(complaint.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center mb-2 bg-gray-50 px-2 py-1 rounded-md">
                  <span className="text-sm font-medium text-gray-500">Catégorie:</span>
                  <Badge variant="outline" className="ml-2 bg-white">
                    {translateCategory(complaint.category)}
                  </Badge>
                </div>
                <p className="text-gray-700 line-clamp-3 text-sm">{complaint.description}</p>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between bg-gray-50 bg-opacity-50">
                {complaint.adminResponse ? (
                  <Badge variant="outline" className="font-normal bg-blue-50 text-blue-700 border-blue-200">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Réponse disponible
                  </Badge>
                ) : (
                  <Badge variant="outline" className="font-normal bg-gray-50 text-gray-500">
                    En attente de réponse
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/shop/complaints/${complaint._id}`)}
                  className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                >
                  <Eye className="h-3 w-3 mr-1" /> Voir détails
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
