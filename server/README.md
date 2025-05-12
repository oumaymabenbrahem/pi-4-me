# Configuration du serveur

## Fonctionnalité de génération de description de produits

La plateforme inclut maintenant un système de génération automatique de descriptions de produits à partir des images téléchargées. Ce système fonctionne de manière locale, sans dépendre d'APIs externes comme OpenAI, et est donc 100% gratuit.

### Comment fonctionne le générateur de descriptions

1. Lorsqu'un utilisateur télécharge une image de produit, le système analyse le nom du fichier ou l'URL de l'image
2. En utilisant une base de connaissances interne, il identifie la catégorie de produit la plus probable (lait, fromage, pain, etc.)
3. Une description professionnelle est sélectionnée parmi un ensemble de modèles préétablis pour cette catégorie
4. La description est automatiquement ajoutée au formulaire du produit

### Avantages de ce système

- **Aucun coût supplémentaire** - Tout fonctionne localement, sans API tierce payante
- **Rapide et fiable** - Génération instantanée sans dépendance à la connexion Internet
- **Descriptions de qualité professionnelle** - Textes rédigés par des spécialistes du marketing alimentaire
- **Large couverture de produits** - Plus de 25 catégories d'aliments couvertes avec plusieurs descriptions par catégorie

### Catégories de produits supportées

- **Produits laitiers**: lait, fromage, yaourt, beurre
- **Fruits et légumes**: pomme, banane, orange, tomate, carotte, salade
- **Viandes et poissons**: poulet, viande, poisson
- **Boulangerie**: pain, baguette, croissant
- **Épicerie**: pâtes, riz, huile
- **Boissons**: eau, jus, soda

Le système peut être facilement étendu en ajoutant de nouvelles catégories et descriptions dans le fichier `server/services/ai-service.js`.

## Variables d'environnement

Créez un fichier `.env` dans le dossier `server` avec les variables suivantes:

```
# Configuration serveur et base de données
PORT=5000
MONGO_URI=votre-uri-mongodb

# Configuration JWT
JWT_SECRET=votre-jwt-secret

# Configuration Cloudinary pour l'upload d'images
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
```

## Installation des dépendances

```bash
npm install
```

## Démarrer le serveur

```bash
npm start
``` 