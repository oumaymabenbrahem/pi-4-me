# Configuration du Chatbot OpenAI

Ce projet intègre un chatbot intelligent basé sur l'API OpenAI qui permet aux utilisateurs de poser des questions et d'obtenir des réponses en temps réel.

## Configuration requise

1. Vous devez obtenir une clé API OpenAI sur [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Ajoutez votre clé API dans le fichier `.env` à la racine du répertoire serveur:

```
OPENAI_API_KEY=votre_clé_api_openai
```

## Fonctionnalités du chatbot

- Interface utilisateur intuitive avec une bulle de chat en bas à droite de l'écran
- Conversations contextuelles avec historique des messages
- Personnalisation du comportement du chatbot via les messages système
- Gestion des erreurs et messages de secours

## Personnalisation

### Modifier le comportement du chatbot

Vous pouvez modifier le comportement par défaut du chatbot en éditant le message système dans le fichier `server/services/chatbot.js`:

```javascript
const messages = [
  { role: 'system', content: 'Vous êtes un assistant utile et amical pour une boutique en ligne. Aidez les clients avec leurs questions sur les produits, commandes, expéditions et toute autre demande.' },
  ...context,
  { role: 'user', content: message }
];
```

### Personnaliser l'apparence

Pour modifier l'apparence du chatbot, vous pouvez éditer le composant React dans `client/src/components/Chatbot/Chatbot.jsx`. Les styles utilisent Tailwind CSS et peuvent être facilement modifiés.

## Limitations

- Le chatbot utilise le modèle gpt-3.5-turbo par défaut, vous pouvez passer à un modèle plus performant en modifiant le paramètre `model` dans `server/services/chatbot.js`
- L'utilisation de l'API OpenAI entraîne des coûts basés sur le nombre de jetons utilisés

## Dépannage

Si le chatbot ne fonctionne pas correctement, vérifiez les points suivants:

1. Assurez-vous que votre clé API OpenAI est valide et correctement configurée dans le fichier .env
2. Vérifiez les logs du serveur pour les éventuelles erreurs d'API
3. Assurez-vous que les routes API sont correctement configurées et accessibles 