# Configuration du Chatbot avec Google Gemini

Ce projet utilise maintenant l'API Google Gemini pour le chatbot intelligent, remplaçant l'ancienne implémentation locale.

## Obtenir une clé API Gemini

1. Rendez-vous sur la [console Google AI Studio](https://makersuite.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Créez une nouvelle clé API (ou utilisez une clé existante)
4. Copiez cette clé API

## Configuration du serveur

1. Dans le répertoire `server`, créez un fichier `.env` (s'il n'existe pas déjà)
2. Ajoutez votre clé API Gemini dans ce fichier:

```
GEMINI_API_KEY=votre_cle_api_gemini_ici
```

3. Assurez-vous que les autres variables d'environnement nécessaires sont également configurées:

```
PORT=5000
NODE_ENV=development
MONGO_URI=votre_uri_mongodb
```

## Caractéristiques du chatbot Gemini

- Interface utilisateur intuitive pour discuter avec l'IA
- Conversations contextuelles avec un historique des messages
- Capacités de compréhension naturelle du langage avancées
- Réponses précises et pertinentes

## Limites et considérations

- L'API Gemini a une limite de requêtes par minute et par jour dans sa version gratuite
- Pour une utilisation intensive, envisagez de passer à un niveau payant
- L'API nécessite une connexion internet pour fonctionner

## Dépannage

Si le chatbot ne fonctionne pas correctement:

1. Vérifiez que votre clé API Gemini est valide et correctement configurée dans le fichier `.env`
2. Assurez-vous que vous avez installé le package avec `npm install @google/generative-ai`
3. Consultez les logs du serveur pour les éventuelles erreurs d'API
4. Vérifiez votre quota d'utilisation sur la console Google AI Studio 