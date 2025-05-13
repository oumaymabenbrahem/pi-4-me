import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import PropTypes from 'prop-types';

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card className="w-full max-w-sm mx-auto h-[550px] flex flex-col">
      <div className="flex flex-col h-full">
        <div className="relative">
          <img
            src={product?.image || "https://placehold.co/600x400?text=No+Image"}
            alt={product?.title || "Product image"}
            className="w-full h-[250px] object-cover rounded-t-lg"
            onError={(e) => {
              e.target.src = "https://placehold.co/600x400?text=No+Image";
            }}
          />
        </div>
        <CardContent className="flex-grow flex flex-col h-[200px]">
          <h2 className="text-xl font-bold mb-2 mt-1 truncate">{product?.title || "Sans titre"}</h2>
          <div className="mb-2 h-[60px] overflow-hidden">
            <p className="text-sm text-gray-500 line-clamp-3">{product?.description || "Aucune description"}</p>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-md font-semibold truncate">Quantité: {product?.quantity || 0} {product?.unit || "pcs"}</span>
            <span className="text-md font-semibold text-green-600">Prix: {product?.price || 0} DT</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Expiration: {formatDate(product?.expirationDate)}</span>
            <span className={`text-sm ${product?.isCollected ? 'text-green-500' : 'text-red-500'}`}>
              {product?.isCollected ? 'Collecté' : 'Non collecté'}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">Magasin: {product?.storeLocation || "Non spécifié"}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center mt-auto">
          <Button
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(product?._id);
              setFormData(product);
            }}
          >
            Edit
          </Button>
          <Button onClick={() => handleDelete(product?._id)}>Delete</Button>
        </CardFooter>
      </div>
    </Card>
  );
}

AdminProductTile.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string,
    image: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    quantity: PropTypes.number,
    unit: PropTypes.string,
    price: PropTypes.number,
    expirationDate: PropTypes.string,
    isCollected: PropTypes.bool,
    storeLocation: PropTypes.string
  }),
  setFormData: PropTypes.func.isRequired,
  setOpenCreateProductsDialog: PropTypes.func.isRequired,
  setCurrentEditedId: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired
};

export default AdminProductTile;
