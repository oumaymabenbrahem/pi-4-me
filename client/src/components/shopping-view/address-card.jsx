import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";

function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) {
  return (
    <Card
      onClick={
        setCurrentSelectedAddress
          ? () => setCurrentSelectedAddress(addressInfo)
          : null
      }
      className={`cursor-pointer ${
        selectedId?._id === addressInfo?._id
          ? "border-primary border-2"
          : "border"
      }`}
    >
      <CardContent className="grid p-4 gap-3">
        <Label className="font-medium">Adresse: {addressInfo?.address}</Label>
        <Label>Ville: {addressInfo?.city}</Label>
        <Label>Code postal: {addressInfo?.pincode}</Label>
        <Label>Téléphone: {addressInfo?.phone}</Label>
        {addressInfo?.notes && <Label>Notes: {addressInfo?.notes}</Label>}
      </CardContent>
      <CardFooter className="p-3 flex justify-between">
        <Button variant="outline" onClick={(e) => {
          e.stopPropagation();
          handleEditAddress(addressInfo);
        }}>Modifier</Button>
        <Button variant="destructive" onClick={(e) => {
          e.stopPropagation();
          handleDeleteAddress(addressInfo);
        }}>Supprimer</Button>
      </CardFooter>
    </Card>
  );
}

export default AddressCard;
