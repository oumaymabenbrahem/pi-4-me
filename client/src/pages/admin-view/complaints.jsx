import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllComplaints, resetComplaintState } from "@/store/complaints-slice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2, Search, Filter, Eye, MessageSquare, Clock, CheckCircle, AlertTriangle, X,
  FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

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

export default function AdminComplaints() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allComplaints, isLoading, error, pagination } = useSelector((state) => state.complaints);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: ""
  });

  // Convertir les valeurs vides en "all" pour l'affichage dans les sélecteurs
  const displayFilters = {
    status: filters.status || "all",
    category: filters.category || "all",
    priority: filters.priority || "all"
  };
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Récupérer les réclamations avec les filtres actuels
    dispatch(getAllComplaints({
      page: currentPage,
      limit: 10,
      ...filters
    }));

    // Nettoyage lors du démontage du composant
    return () => {
      dispatch(resetComplaintState());
    };
  }, [dispatch, currentPage, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Réinitialiser la pagination lors du changement de filtre
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // La recherche est effectuée côté client car l'API ne prend pas en charge la recherche
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
    }
  };

  // Filtrer les réclamations en fonction du terme de recherche
  const filteredComplaints = allComplaints.filter(complaint =>
    complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (complaint.description && complaint.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (complaint.userId && complaint.userId.username && complaint.userId.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (complaint.userId && complaint.userId.email && complaint.userId.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Réclamations</h1>
        <p className="text-gray-600 mt-1">
          Consultez et gérez les réclamations des utilisateurs
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Total</p>
              <h3 className="text-2xl font-bold text-blue-700">{pagination.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-600">En attente</p>
              <h3 className="text-2xl font-bold text-yellow-700">
                {allComplaints.filter(c => c.status === "pending").length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600">Résolues</p>
              <h3 className="text-2xl font-bold text-green-700">
                {allComplaints.filter(c => c.status === "resolved").length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-red-100 p-3 mr-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600">Priorité haute</p>
              <h3 className="text-2xl font-bold text-red-700">
                {allComplaints.filter(c => c.priority === "high").length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 border-b pb-4">
          <CardTitle className="text-xl text-gray-800">Liste des réclamations</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white">
              Page {pagination.page} sur {pagination.pages}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <Alert variant="destructive" className="m-6">
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="p-4 border-b">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Rechercher par titre, description ou utilisateur..."
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Rechercher
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({
                      status: "",
                      category: "",
                      priority: ""
                    });
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </form>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-5 w-5 text-gray-500" />
                <h3 className="font-medium text-gray-700">Filtres avancés</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <Select
                    value={displayFilters.status}
                    onValueChange={(value) => handleFilterChange("status", value === "all" ? "" : value)}
                  >
                    <SelectTrigger className="w-full border-gray-300 bg-white">
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending" className="text-yellow-600">En attente</SelectItem>
                      <SelectItem value="in-progress" className="text-blue-600">En cours</SelectItem>
                      <SelectItem value="resolved" className="text-green-600">Résolu</SelectItem>
                      <SelectItem value="rejected" className="text-red-600">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <Select
                    value={displayFilters.category}
                    onValueChange={(value) => handleFilterChange("category", value === "all" ? "" : value)}
                  >
                    <SelectTrigger className="w-full border-gray-300 bg-white">
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      <SelectItem value="product">Produit</SelectItem>
                      <SelectItem value="delivery">Livraison</SelectItem>
                      <SelectItem value="payment">Paiement</SelectItem>
                      <SelectItem value="website">Site web</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <Select
                    value={displayFilters.priority}
                    onValueChange={(value) => handleFilterChange("priority", value === "all" ? "" : value)}
                  >
                    <SelectTrigger className="w-full border-gray-300 bg-white">
                      <SelectValue placeholder="Toutes les priorités" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les priorités</SelectItem>
                      <SelectItem value="low" className="text-gray-600">Basse</SelectItem>
                      <SelectItem value="medium" className="text-orange-600">Moyenne</SelectItem>
                      <SelectItem value="high" className="text-red-600">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(filters.status || filters.category || filters.priority) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {filters.status && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer" onClick={() => handleFilterChange("status", "")}>
                      Statut: {translateStatus(filters.status)} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {filters.category && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer" onClick={() => handleFilterChange("category", "")}>
                      Catégorie: {translateCategory(filters.category)} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {filters.priority && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer" onClick={() => handleFilterChange("priority", "")}>
                      Priorité: {translatePriority(filters.priority)} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune réclamation trouvée
              </h3>
              <p className="text-gray-600">
                Aucune réclamation ne correspond à vos critères de recherche.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="border-collapse">
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComplaints.map((complaint, index) => (
                      <TableRow
                        key={complaint._id}
                        className={`
                          border-b border-gray-200 hover:bg-gray-50 transition-colors
                          ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50 bg-opacity-50'}
                          ${complaint.priority === 'high' ? 'bg-red-50 hover:bg-red-100' : ''}
                        `}
                        onClick={() => navigate(`/admin/complaints/${complaint._id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <TableCell className="py-4 px-4 font-mono text-xs text-gray-500">
                          {complaint._id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="py-4 px-4 font-medium text-gray-900 max-w-[200px]">
                          <div className="flex items-start">
                            <div className="truncate">
                              {complaint.title}
                              <p className="text-xs text-gray-500 mt-1 truncate">{complaint.description.substring(0, 60)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          {complaint.userId ? (
                            <div className="flex flex-col">
                              <span className="font-medium">{complaint.userId.username}</span>
                              <span className="text-xs text-gray-500">{complaint.userId.email}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">Utilisateur inconnu</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <Badge variant="outline" className="bg-white">
                            {translateCategory(complaint.category)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <Badge className={`${getPriorityBadgeColor(complaint.priority)} font-normal`}>
                            {complaint.priority === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {translatePriority(complaint.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <Badge className={`${getStatusBadgeColor(complaint.status)} font-normal`}>
                            {translateStatus(complaint.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-sm text-gray-500">
                          <div className="flex flex-col">
                            <span>{format(new Date(complaint.createdAt), "dd/MM/yyyy", { locale: fr })}</span>
                            <span className="text-xs">{format(new Date(complaint.createdAt), "HH:mm", { locale: fr })}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/complaints/${complaint._id}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
                <div className="text-sm text-gray-500 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-400" />
                  Affichage de <span className="font-medium mx-1">{filteredComplaints.length}</span>
                  sur <span className="font-medium mx-1">{pagination.total}</span> réclamations
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 rounded-none border-r hover:bg-gray-100"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 rounded-none border-r hover:bg-gray-100"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="px-3 py-1 flex items-center text-sm">
                      <span className="font-medium">{pagination.page}</span>
                      <span className="mx-1">/</span>
                      <span>{pagination.pages}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 rounded-none border-l hover:bg-gray-100"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.pages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 rounded-none border-l hover:bg-gray-100"
                      onClick={() => handlePageChange(pagination.pages)}
                      disabled={currentPage === pagination.pages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <Select
                    value={pagination.limit.toString()}
                    onValueChange={(value) => {
                      dispatch(getAllComplaints({
                        ...filters,
                        page: 1,
                        limit: parseInt(value)
                      }));
                    }}
                  >
                    <SelectTrigger className="w-[100px] h-8">
                      <SelectValue placeholder="10 par page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 par page</SelectItem>
                      <SelectItem value="10">10 par page</SelectItem>
                      <SelectItem value="20">20 par page</SelectItem>
                      <SelectItem value="50">50 par page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
