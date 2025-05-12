# Service de Recommandation de Produits

Ce microservice fournit des recommandations de produits personnalisées basées sur un modèle de filtrage collaboratif.

## Fonctionnalités

- Recommandations de produits pour un utilisateur spécifique
- Recherche de produits similaires à un produit donné
- Enregistrement des interactions utilisateur-produit
- Entraînement du modèle avec les données existantes

## Installation

1. Créez un environnement virtuel Python:

```bash
python -m venv venv
```

2. Activez l'environnement virtuel:

```bash
# Sur Windows
venv\Scripts\activate

# Sur macOS/Linux
source venv/bin/activate
```

3. Installez les dépendances:

```bash
pip install -r requirements.txt
```

4. Créez un fichier `.env` basé sur `.env.example` et configurez les variables d'environnement:

```bash
cp .env.example .env
```

## Utilisation

1. Démarrez le serveur Flask:

```bash
python app.py
```

2. Le serveur sera accessible à l'adresse `http://localhost:5001`

## API Endpoints

### Vérification de l'état du service

```
GET /health
```

### Entraînement du modèle

```
POST /train
```

### Recommandations pour un utilisateur

```
GET /recommend/user/<user_id>?limit=5
```

### Produits similaires

```
GET /recommend/similar/<product_id>?limit=5
```

### Enregistrement d'une interaction

```
POST /record-interaction
```

Exemple de corps de requête:
```json
{
  "userId": "user_id",
  "productId": "product_id",
  "interactionType": "view" // ou "cart" ou "purchase"
}
```

## Intégration avec l'application principale

Ce microservice est conçu pour être utilisé avec l'application principale via des requêtes HTTP. Vous pouvez l'intégrer en ajoutant des appels API dans votre application Node.js.
