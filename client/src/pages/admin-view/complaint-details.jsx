import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  getComplaintDetails,
  updateComplaintStatus,
  respondToComplaint,
  deleteComplaint,
  resetComplaintState
} from "@/store/complaints-slice";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Loader2,
  ArrowLeft,
  Clock,
  User,
  MessageSquare,
  Trash2,
  AlertTriangle
} from "lucide-react";
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

// Fonction pour obtenir la couleur du badge de priorité
const getPriorityBadgeColor = (priority) => {
  switch (priority) {
    case "low":
      return "bg-gray-500";
    case "medium":
      return "bg-orange-500";
    case "high":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export default function AdminComplaintDetails() {
  const { complaintId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentComplaint, isLoading, error, success } = useSelector((state) => state.complaints);

  const [responseText, setResponseText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (complaintId) {
      dispatch(getComplaintDetails(complaintId));
    }

    // Nettoyage lors du démontage du composant
    return () => {
      dispatch(resetComplaintState());
    };
  }, [complaintId, dispatch]);

  useEffect(() => {
    if (currentComplaint) {
      setSelectedStatus(currentComplaint.status);
      setSelectedPriority(currentComplaint.priority);
      setResponseText(currentComplaint.adminResponse || "");
    }
  }, [currentComplaint]);

  useEffect(() => {
    if (success) {
      // Réinitialiser les erreurs de formulaire après une action réussie
      setFormErrors({});
    }
  }, [success]);

  const validateResponseForm = () => {
    const errors = {};
    if (!responseText.trim()) {
      errors.response = "La réponse est obligatoire";
    } else if (responseText.length < 10) {
      errors.response = "La réponse doit contenir au moins 10 caractères";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStatusChange = async (status) => {
    setSelectedStatus(status);
    await dispatch(updateComplaintStatus({
      complaintId,
      statusData: { status }
    }));
  };

  const handlePriorityChange = async (priority) => {
    setSelectedPriority(priority);
    await dispatch(updateComplaintStatus({
      complaintId,
      statusData: { priority }
    }));
  };

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    if (validateResponseForm()) {
      await dispatch(respondToComplaint({
        complaintId,
        responseData: {
          adminResponse: responseText,
          status: selectedStatus
        }
      }));
    }
  };

  const handleDeleteComplaint = async () => {
    await dispatch(deleteComplaint(complaintId));
    setIsDeleteDialogOpen(false);
    navigate("/admin/complaints");
  };

  if (isLoading && !currentComplaint) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error && !currentComplaint) {
    return (
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/admin/complaints")}
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
          onClick={() => navigate("/admin/complaints")}
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
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/complaints")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux réclamations
        </Button>
        
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-500">
                <AlertTriangle className="mr-2 h-5 w-5" /> Confirmer la suppression
              </DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer cette réclamation ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDeleteComplaint}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Supprimer"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-500">
          <AlertTitle className="text-green-700">Succès</AlertTitle>
          <AlertDescription className="text-green-600">
            La réclamation a été mise à jour avec succès
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{currentComplaint.title}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    Soumise le {format(new Date(currentComplaint.createdAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
                  </CardDescription>
                </div>
                <Badge className={getStatusBadgeColor(currentComplaint.status)}>
                  {translateStatus(currentComplaint.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <h3 className="font-medium">Utilisateur</h3>
                  {currentComplaint.userId ? (
                    <div>
                      <p>{currentComplaint.userId.username}</p>
                      <p className="text-sm text-gray-500">{currentComplaint.userId.email}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Utilisateur inconnu</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="font-medium text-gray-700 mb-1">Catégorie</h3>
                  <p>{translateCategory(currentComplaint.category)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="font-medium text-gray-700 mb-1">Priorité</h3>
                  <Badge className={getPriorityBadgeColor(currentComplaint.priority)}>
                    {translatePriority(currentComplaint.priority)}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                <div className="bg-gray-50 p-4 rounded-md whitespace-pre-line">
                  {currentComplaint.description}
                </div>
              </div>

              {currentComplaint.adminResponse && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Réponse précédente
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 mr-1 text-blue-500" />
                      <span className="text-sm text-blue-700">
                        {currentComplaint.adminId ? 
                          `${currentComplaint.adminId.firstname} ${currentComplaint.adminId.lastname}` : 
                          "Administrateur"}
                      </span>
                      {currentComplaint.updatedAt && (
                        <span className="text-sm text-gray-500 ml-2">
                          - {format(new Date(currentComplaint.updatedAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
                        </span>
                      )}
                    </div>
                    <p className="whitespace-pre-line">{currentComplaint.adminResponse}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Gestion de la réclamation</CardTitle>
              <CardDescription>
                Mettez à jour le statut et répondez à cette réclamation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select value={selectedStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="in-progress">En cours</SelectItem>
                    <SelectItem value="resolved">Résolu</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <Select value={selectedPriority} onValueChange={handlePriorityChange}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Sélectionner une priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <form onSubmit={handleResponseSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="response">Réponse</Label>
                  <Textarea
                    id="response"
                    placeholder="Votre réponse à l'utilisateur..."
                    rows={6}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className={formErrors.response ? "border-red-500" : ""}
                  />
                  {formErrors.response && (
                    <p className="text-red-500 text-sm">{formErrors.response}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer la réponse"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
