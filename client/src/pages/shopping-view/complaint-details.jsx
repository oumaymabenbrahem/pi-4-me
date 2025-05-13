import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getComplaintDetails, resetComplaintState } from "@/store/complaints-slice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Clock, User, MessageSquare, FileText, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

// Fonction pour traduire la priorité en français
const translatePriority = (priority) => {
  switch (priority) {
    case "low":
      return "Basse";
    case "medium":
      return "Moyenne";
    case "high":
      return "Haute";
    default:
      return priority;
  }
};

export default function ComplaintDetails() {
  const { complaintId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentComplaint, isLoading, error } = useSelector((state) => state.complaints);

  useEffect(() => {
    if (complaintId) {
      dispatch(getComplaintDetails(complaintId));
    }

    // Nettoyage lors du démontage du composant
    return () => {
      dispatch(resetComplaintState());
    };
  }, [complaintId, dispatch]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/shop/complaints")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux réclamations
        </Button>
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentComplaint) {
    return (
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/shop/complaints")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux réclamations
        </Button>
        <Alert>
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>Réclamation non trouvée</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate("/shop/complaints")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux réclamations
      </Button>

      <div className="max-w-4xl mx-auto">
        <Card className={`border-t-8 ${
          currentComplaint.status === "resolved"
            ? "border-t-green-500"
            : currentComplaint.status === "rejected"
            ? "border-t-red-500"
            : currentComplaint.status === "in-progress"
            ? "border-t-blue-500"
            : "border-t-yellow-500"
        } shadow-md`}>
          <CardHeader className="pb-4 border-b">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`${getStatusBadgeColor(currentComplaint.status)} px-3 py-1`}>
                    {translateStatus(currentComplaint.status)}
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    {translateCategory(currentComplaint.category)}
                  </Badge>
                  <Badge variant="outline" className={`bg-white ${
                    currentComplaint.priority === "high"
                      ? "text-red-500 border-red-200"
                      : currentComplaint.priority === "medium"
                      ? "text-orange-500 border-orange-200"
                      : "text-gray-500 border-gray-200"
                  }`}>
                    Priorité: {translatePriority(currentComplaint.priority)}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{currentComplaint.title}</CardTitle>
                <CardDescription className="flex items-center mt-1 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  Soumise le {format(new Date(currentComplaint.createdAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate("/shop/complaints")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Retour
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
              <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-500" />
                Description de la réclamation
              </h3>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {currentComplaint.description}
              </div>
            </div>

            {currentComplaint.adminResponse ? (
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500 shadow-sm">
                <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Réponse de l'administrateur
                </h3>
                <div className="flex items-center mb-3 pb-3 border-b border-blue-100">
                  <User className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium text-blue-700">
                    {currentComplaint.adminId ?
                      `${currentComplaint.adminId.firstname} ${currentComplaint.adminId.lastname}` :
                      "Administrateur"}
                  </span>
                  {currentComplaint.updatedAt && (
                    <span className="text-sm text-blue-600 opacity-75 ml-3">
                      {format(new Date(currentComplaint.updatedAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
                    </span>
                  )}
                </div>
                <div className="whitespace-pre-line text-blue-900 leading-relaxed">
                  {currentComplaint.adminResponse}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-100 text-center">
                <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <h3 className="font-medium text-yellow-800 mb-1">En attente de réponse</h3>
                <p className="text-yellow-700 text-sm">
                  Votre réclamation a été enregistrée et est en cours de traitement.
                  Un administrateur vous répondra dans les plus brefs délais.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-4 text-sm text-gray-500">
            <div>
              {currentComplaint.updatedAt && currentComplaint.updatedAt !== currentComplaint.createdAt && (
                <div className="flex items-center">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Dernière mise à jour: {format(new Date(currentComplaint.updatedAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
                </div>
              )}
            </div>
            <div>
              ID: <span className="font-mono">{currentComplaint._id.substring(0, 8)}...</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
