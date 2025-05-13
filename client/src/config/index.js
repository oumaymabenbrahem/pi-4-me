export const registerFormControls = [
  {
    name: "username",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "firstname",
    label: "First Name",
    placeholder: "Enter your first name",
    componentType: "input",
    type: "text",
  },
  {
    name: "lastname",
    label: "Last Name",
    placeholder: "Enter your last name",
    componentType: "input",
    type: "text",
  },

  {
    name: "address",
    label: "Address",
    placeholder: "Enter your address",
    componentType: "input",
    type: "text",
  },
  {
    name: "phone",
    label: "Phone Number",
    placeholder: "Enter your phone number",
    componentType: "input",
    type: "text",
  },
  {
    name: "brand",
    label: "Brand (for admins only)",
    placeholder: "Select your brand",
    componentType: "select",
    options: [
      { id: "none", label: "None" },
      { id: "aziza", label: "Aziza" },
      { id: "mg", label: "MG" },
      { id: "geant", label: "Geant" },
      { id: "monoprix", label: "Monoprix" },
      { id: "carrefour", label: "Carrefour" },
      { id: "other", label: "Autres" },
    ],
    required: false,
  },
  {
    name: "customBrand",
    label: "Votre marque",
    placeholder: "Entrez le nom de votre marque",
    componentType: "input",
    type: "text",
    required: false,
    showWhen: { field: "brand", value: "other" },
  },
   {
    name: "image",
    label: "Profile Image",
    placeholder: "Upload your profile image",
    componentType: "file", // Changed to "file" for file input
    type: "file",
  },
  {
    name: "imageVerif",
    label: "Verification Image (Optional)",
    placeholder: "Upload your verification image (optional)",
    componentType: "file", // Changed to "file" for file input
    type: "file",
    required: false
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  }
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const addProductFormElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
      { id: "fruits_legumes", label: "Fruits & Légumes" },
      { id: "produits_frais", label: "Produits frais (yaourts, viande, fromage…)" },
      { id: "epicerie_salee", label: "Épicerie salée (pâtes, riz, conserves…)" },
      { id: "epicerie_sucree", label: "Épicerie sucrée (biscuits, céréales, confitures…)" },
      { id: "boissons", label: "Boissons (eau, jus, lait, soda…)" },
      { id: "pains_viennoiseries", label: "Pains & Viennoiseries" },
      { id: "surgeles", label: "Surgelés" },
      { id: "plats_prepares", label: "Plats préparés (prêts-à-manger, traiteur…)" },
      { id: "condiments_sauces", label: "Condiments & Sauces (huile, ketchup, vinaigre…)" },
    ],
  },
  {
    label: "Expiration Date",
    name: "expirationDate",
    componentType: "input",
    type: "date",
    placeholder: "Enter expiration date",
  },
  {
    label: "Quantity",
    name: "quantity",
    componentType: "input",
    type: "number",
    placeholder: "Enter quantity available",
  },
  {
    label: "Unit",
    name: "unit",
    componentType: "select",
    options: [
      { id: "kg", label: "Kilogram (kg)" },
      { id: "L", label: "Liter (L)" },
      { id: "pcs", label: "Pieces (pcs)" },
    ],
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter product price",
  },
  {
    label: "Store Location",
    name: "storeLocation",
    componentType: "custom",
    customComponent: "StoreLocationSelector",
  },
  {
    label: "Is Collected",
    name: "isCollected",
    componentType: "checkbox",
    type: "checkbox",
  },
];

export const shoppingViewHeaderMenuItems = [
  {
    id: "home",
    label: "Accueil",
    path: "/shop/home",
  },
  {
    id: "products",
    label: "Tous les produits",
    path: "/shop/listing",
  },
  {
    id: "fruits_legumes",
    label: "Fruits & Légumes",
    path: "/shop/listing",
  },
  {
    id: "produits_frais",
    label: "Produits frais",
    path: "/shop/listing",
  },
  {
    id: "epicerie_salee",
    label: "Épicerie salée",
    path: "/shop/listing",
  },
  {
    id: "epicerie_sucree",
    label: "Épicerie sucrée",
    path: "/shop/listing",
  },
  {
    id: "boissons",
    label: "Boissons",
    path: "/shop/listing",
  },
  {
    id: "complaints",
    label: "Réclamations",
    path: "/shop/complaints",
  },
];

export const categoryOptionsMap = {
  fruits_legumes: "Fruits & Légumes",
  produits_frais: "Produits frais",
  epicerie_salee: "Épicerie salée",
  epicerie_sucree: "Épicerie sucrée",
  boissons: "Boissons",
  pains_viennoiseries: "Pains & Viennoiseries",
  surgeles: "Surgelés",
  plats_prepares: "Plats préparés",
  condiments_sauces: "Condiments & Sauces",
};

export const brandOptionsMap = {
  aziza: "Aziza",
  mg: "MG",
  geant: "Geant",
  monoprix: "Monoprix",
  carrefour: "Carrefour",
  other: "Autres",
};

export const filterOptions = {
  category: [
    { id: "fruits_legumes", label: "Fruits & Légumes" },
    { id: "produits_frais", label: "Produits frais" },
    { id: "epicerie_salee", label: "Épicerie salée" },
    { id: "epicerie_sucree", label: "Épicerie sucrée" },
    { id: "boissons", label: "Boissons" },
    { id: "pains_viennoiseries", label: "Pains & Viennoiseries" },
    { id: "surgeles", label: "Surgelés" },
    { id: "plats_prepares", label: "Plats préparés" },
    { id: "condiments_sauces", label: "Condiments & Sauces" },
  ],
  brand: [
    { id: "aziza", label: "Aziza" },
    { id: "mg", label: "MG" },
    { id: "geant", label: "Geant" },
    { id: "monoprix", label: "Monoprix" },
    { id: "carrefour", label: "Carrefour" },
    { id: "other", label: "Autres" },
  ],
};

export const sortOptions = [
  { id: "expiration-soonest", label: "Expiration: Plus proche" },
  { id: "expiration-latest", label: "Expiration: Plus lointaine" },
  { id: "quantity-lowtohigh", label: "Quantité: Croissante" },
  { id: "quantity-hightolow", label: "Quantité: Décroissante" },
  { id: "title-atoz", label: "Titre: A à Z" },
  { id: "title-ztoa", label: "Titre: Z à A" },
];

export const addressFormControls = [
  {
    label: "Adresse",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Entrez votre adresse",
  },
  {
    label: "Ville",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Entrez votre ville",
  },
  {
    label: "Code postal",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Entrez votre code postal",
  },
  {
    label: "Téléphone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Entrez votre numéro de téléphone",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Entrez des notes supplémentaires",
  },
];
