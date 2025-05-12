import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
  clearGeneratedProductData,
  importProductsFromExcel,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  expirationDate: "",
  quantity: "",
  unit: "pcs",
  price: "",
  storeLocation: "",
  storeGeoLocation: null,
  isCollected: false,
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const fileInputRef = useRef(null);

  const { productList, isGeneratingProductData, isImportingExcel } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();

    const dataToSubmit = {
      ...formData,
      image: uploadedImageUrl || formData.image,
    };

    if (dataToSubmit.storeGeoLocation && dataToSubmit.storeGeoLocation.coordinates) {
      // Create a new object instead of modifying the existing one
      dataToSubmit.storeGeoLocation = {
        type: 'Point',
        coordinates: dataToSubmit.storeGeoLocation.coordinates.map(Number)
      };
    }

    currentEditedId !== null
      ? dispatch(
          editProduct({
            id: currentEditedId,
            formData: dataToSubmit,
          })
        ).then((data) => {
          console.log(data, "edit");

          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setFormData(initialFormData);
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
          }
        })
      : dispatch(
          addNewProduct(dataToSubmit)
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setOpenCreateProductsDialog(false);
            setImageFile(null);
            setFormData(initialFormData);
            toast({
              title: "Product add successfully",
            });
          }
        });
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
      }
    });
  }

  function isFormValid() {
    const hasImage = uploadedImageUrl || formData.image;

    // Vérifier si tous les champs requis sont remplis
    // Note: storeLocation est maintenant rempli automatiquement par la carte
    return formData.title !== "" &&
           formData.description !== "" &&
           formData.category !== "" &&
           formData.expirationDate !== "" &&
           formData.quantity !== "" &&
           formData.price !== "" &&
           formData.storeLocation !== "" &&
           hasImage;
  }

  const handleDescriptionGenerated = (productData) => {
    console.log("Données produit générées:", productData);

    if (!productData) {
      console.error("Données produit vides ou invalides");
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer les données du produit à partir de cette image.",
        variant: "destructive",
      });
      return;
    }

    // S'assurer que les données générées sont bien prises en compte
    const updatedData = {
      ...formData,
      ...productData
    };

    console.log("Formulaire mis à jour:", updatedData);
    setFormData(updatedData);

    // Liste des champs qui ont été remplis automatiquement avec leurs valeurs
    const fieldsInfo = Object.entries(productData)
      .map(([key, value]) => `${key}: ${value.toString().substring(0, 20)}${value.toString().length > 20 ? '...' : ''}`)
      .join('\n');

    console.log("Champs remplis automatiquement:\n", fieldsInfo);

    toast({
      title: "Données du produit générées automatiquement",
      description: `${Object.keys(productData).length} champs ont été remplis automatiquement.`,
    });
  };

  const handleExcelImport = (event) => {
    event.preventDefault();
    const file = fileInputRef.current.files[0];

    if (!file) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier Excel",
        variant: "destructive",
      });
      return;
    }

    const fileType = file.type;
    if (
      fileType !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      fileType !== "application/vnd.ms-excel" &&
      fileType !== "text/csv" &&
      !file.name.endsWith('.csv')
    ) {
      toast({
        title: "Type de fichier non valide",
        description: "Veuillez sélectionner un fichier Excel (.xlsx, .xls) ou CSV (.csv)",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("excelFile", file);

    dispatch(importProductsFromExcel(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Importation réussie",
          description: data?.payload?.message || `Produits importés avec succès`,
        });

        setOpenImportDialog(false);

        dispatch(fetchAllProducts());

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        toast({
          title: "Erreur d'importation",
          description: data?.error?.message || "Une erreur s'est produite lors de l'importation",
          variant: "destructive",
        });
      }
    }).catch((error) => {
      toast({
        title: "Erreur d'importation",
        description: error.message || "Une erreur s'est produite lors de l'importation",
        variant: "destructive",
      });
    });
  };

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  useEffect(() => {
    if (!openCreateProductsDialog) {
      dispatch(clearGeneratedProductData());
    }
  }, [openCreateProductsDialog, dispatch]);

  console.log(formData, "productList");

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-between">
        <div>
          <Button
            variant="outline"
            onClick={() => setOpenImportDialog(true)}
            className="mr-4"
          >
            Importer depuis Excel
          </Button>
        </div>
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Add New Product
        </Button>
      </div>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTile
                key={productItem._id}
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDelete}
              />
            ))
          : <div className="col-span-4 text-center py-10 text-gray-500">Aucun produit trouvé</div>}
      </div>

      <Sheet
        open={openImportDialog}
        onOpenChange={setOpenImportDialog}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>Importer des produits via Excel</SheetTitle>
          </SheetHeader>
          <div className="py-6">
            <p className="text-sm text-gray-500 mb-4">
              Téléchargez un fichier Excel contenant vos produits. Le fichier doit contenir les colonnes suivantes: title, description, category, expirationDate, quantity, unit, price, storeLocation.
            </p>

            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <h4 className="font-semibold text-blue-700 mb-2">Comment inclure des images:</h4>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                <li>Ajoutez une colonne <strong>image</strong> dans votre fichier Excel</li>
                <li>Pour chaque produit, vous pouvez insérer:
                  <ul className="list-circle pl-5 mt-1 space-y-1">
                    <li>Une URL d&apos;image (commençant par http:// ou https://)</li>
                    <li>Une chaîne base64 (avec ou sans préfixe data:image)</li>
                  </ul>
                </li>
                <li>Les images seront automatiquement téléchargées vers le serveur</li>
                <li>Laissez la cellule vide si vous ne souhaitez pas d&apos;image</li>
              </ul>
            </div>

            <form onSubmit={handleExcelImport}>
              <div className="mb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>

              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    // Créer un lien de téléchargement pour un fichier CSV modèle
                    const csvContent = `title,description,category,expirationDate,quantity,unit,price,storeLocation,storeGeoLongitude,storeGeoLatitude,image,isCollected
Jus de fruit,Jus de fruit frais,Boissons,2025-07-01,120,L,3.75,Magasin E,2.3522,48.8566,https://example.com/image.jpg,false
Pâtes,Pâtes italiennes,Épicerie,2025-09-01,220,kg,1.8,Magasin C,2.2945,48.8584,https://example.com/pasta.jpg,false
Yaourt,Yaourt nature,Produits laitiers,2025-05-01,90,pcs,0.65,Magasin N,10.7564,36.4587,https://example.com/yogurt.jpg,false`;

                    // Créer un objet Blob avec le contenu CSV
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

                    // Créer un URL pour le Blob
                    const url = URL.createObjectURL(blob);

                    // Créer un élément a temporaire pour le téléchargement
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'modele_import_produits.csv');

                    // Ajouter l'élément au DOM, cliquer dessus, puis le supprimer
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    toast({
                      title: "Modèle téléchargé",
                      description: "Un modèle CSV a été téléchargé. Vous pouvez l'ouvrir avec Excel et l'utiliser comme base pour votre import.",
                    });
                  }}
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  <span className="mr-1">📥</span> Télécharger un modèle CSV
                </button>
              </div>

              <Button
                type="submit"
                disabled={isImportingExcel}
                className="w-full"
              >
                {isImportingExcel ? "Importation en cours..." : "Importer"}
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
            {currentEditedId !== null && formData.brand && (
              <div className="text-sm text-gray-500 mt-1">
                Brand: {formData.brand}
              </div>
            )}
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
            onDescriptionGenerated={handleDescriptionGenerated}
          />
          {isGeneratingProductData && (
            <div className="py-2 text-sm text-blue-500">
              Génération des données produit en cours...
            </div>
          )}
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
