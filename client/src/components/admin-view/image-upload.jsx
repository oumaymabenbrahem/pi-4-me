import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";
import { useDispatch } from "react-redux";
import { generateProductData } from "../../store/admin/products-slice";

function ProductImageUpload({
  imageFile,
  setImageFile,
  imageLoadingState,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoadingState,
  isEditMode,
  isCustomStyling = false,
  onDescriptionGenerated,
}) {
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  console.log(isEditMode, "isEditMode");

  function handleImageFileChange(event) {
    console.log(event.target.files, "event.target.files");
    const selectedFile = event.target.files?.[0];
    console.log(selectedFile);

    if (selectedFile) setImageFile(selectedFile);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) setImageFile(droppedFile);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setUploadedImageUrl(null);
    setGenerationStatus('');
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function uploadImageToCloudinary() {
    try {
      setImageLoadingState(true);
      const data = new FormData();
      data.append("my_file", imageFile);

      const response = await axios.post(
        "http://localhost:5000/api/admin/products/upload-image",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload response:", response);

      if (response?.data?.success) {
        const imageUrl = response.data.result.url;
        console.log("URL d'image reçue:", imageUrl);

        // Vérifier que l'URL est bien formée
        if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
          console.error("URL d'image invalide reçue du serveur:", imageUrl);
          setUploadedImageUrl(imageUrl);
          setImageLoadingState(false);
          setGenerationStatus('error');
          return;
        }

        setUploadedImageUrl(imageUrl);
        setImageLoadingState(false);

        // Générer les données du produit automatiquement après l'upload réussi
        if (onDescriptionGenerated && !isEditMode) {
          try {
            setIsGenerating(true);
            setGenerationStatus('pending');
            console.log("Lancement de la génération des données produit pour l'image:", imageUrl);

            const result = await dispatch(generateProductData(imageUrl)).unwrap();
            console.log("Résultat complet de la génération:", result);

            if (result?.success) {
              console.log("Données générées avec succès:", result.data);

              // Créer une copie des données pour s'assurer qu'elles sont bien passées
              const generatedData = { ...result.data };

              // S'assurer que tous les champs nécessaires sont présents
              if (!generatedData.title || !generatedData.description || !generatedData.category) {
                console.warn("Certains champs obligatoires sont manquants dans les données générées");
              }

              // Appeler le callback avec les données générées
              onDescriptionGenerated(generatedData);
              setGenerationStatus('success');
            } else {
              console.warn("La génération des données produit a échoué:", result);
              setGenerationStatus('error');
            }
          } catch (error) {
            console.error("Erreur lors de la génération des données produit:", error);
            setGenerationStatus('error');
            // Continuer sans données générées
          } finally {
            setIsGenerating(false);
          }
        }
      } else {
        throw new Error(response?.data?.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageLoadingState(false);
      setGenerationStatus('error');
      // You might want to show an error toast here
    }
  }

  useEffect(() => {
    if (imageFile !== null) uploadImageToCloudinary();
  }, [imageFile]);

  return (
    <div
      className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}
    >
      <Label className="text-lg font-semibold mb-2 block">Upload Image</Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`${
          isEditMode ? "opacity-60" : ""
        } border-2 border-dashed rounded-lg p-4`}
      >
        <Input
          id="image-upload"
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          disabled={isEditMode}
        />
        {!imageFile ? (
          <Label
            htmlFor="image-upload"
            className={`${
              isEditMode ? "cursor-not-allowed" : ""
            } flex flex-col items-center justify-center h-32 cursor-pointer`}
          >
            <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
            <span>Drag & drop or click to upload image</span>
            <span className="text-xs text-blue-500 mt-2">
              Les informations du produit seront générées automatiquement
            </span>
          </Label>
        ) : imageLoadingState ? (
          <Skeleton className="h-10 bg-gray-100" />
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileIcon className="w-8 text-primary mr-2 h-8" />
                {uploadedImageUrl && (
                  <img src={uploadedImageUrl} alt="Uploaded" className="w-16 h-16 object-cover ml-2" />
                )}
              </div>
              <p className="text-sm font-medium">{imageFile.name}</p>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={handleRemoveImage}
              >
                <XIcon className="w-4 h-4" />
                <span className="sr-only">Remove File</span>
              </Button>
            </div>

            {isGenerating && (
              <div className="mt-2 text-sm text-blue-500 animate-pulse">
                Génération des données du produit en cours...
              </div>
            )}

            {generationStatus === 'success' && !isGenerating && (
              <div className="mt-2 text-sm text-green-600">
                ✓ Les informations du produit ont été générées et remplies automatiquement
              </div>
            )}

            {generationStatus === 'error' && !isGenerating && (
              <div className="mt-2 text-sm text-red-500">
                ✗ Impossible de générer les informations du produit - veuillez les saisir manuellement
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
ProductImageUpload.propTypes = {
  imageFile: PropTypes.object,
  setImageFile: PropTypes.func.isRequired,
  imageLoadingState: PropTypes.bool.isRequired,
  uploadedImageUrl: PropTypes.string,
  setUploadedImageUrl: PropTypes.func.isRequired,
  setImageLoadingState: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  isCustomStyling: PropTypes.bool,
  onDescriptionGenerated: PropTypes.func,
};

export default ProductImageUpload;
