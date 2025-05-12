import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from database import get_product_interactions, get_products, get_product_by_id
from bson.objectid import ObjectId

class CollaborativeFilteringModel:
    """
    Modèle de filtrage collaboratif pour les recommandations de produits
    
    Ce modèle utilise les interactions utilisateur-produit pour recommander des produits
    similaires ou des produits pour un utilisateur spécifique.
    """
    
    def __init__(self):
        """Initialiser le modèle de filtrage collaboratif"""
        self.user_item_matrix = None
        self.item_similarity_matrix = None
        self.user_similarity_matrix = None
        self.products_df = None
        self.interactions_df = None
        self.product_id_mapping = {}
        self.user_id_mapping = {}
        self.is_trained = False
    
    def train(self, db):
        """
        Entraîner le modèle avec les données de la base de données
        
        Args:
            db: Connexion à la base de données MongoDB
            
        Returns:
            bool: True si l'entraînement a réussi, False sinon
        """
        try:
            # Récupérer les interactions utilisateur-produit
            interactions = get_product_interactions(db)
            
            if not interactions:
                print("Aucune interaction trouvée dans la base de données")
                return False
            
            # Convertir les interactions en DataFrame
            interactions_data = []
            for interaction in interactions:
                user_id = str(interaction['userId'])
                product_id = str(interaction['productId'])
                interaction_type = interaction['interactionType']
                
                # Attribuer un poids à chaque type d'interaction
                weight = 1.0
                if interaction_type == 'view':
                    weight = 1.0
                elif interaction_type == 'cart':
                    weight = 3.0
                elif interaction_type == 'purchase':
                    weight = 5.0
                
                interactions_data.append({
                    'userId': user_id,
                    'productId': product_id,
                    'weight': weight
                })
            
            self.interactions_df = pd.DataFrame(interactions_data)
            
            # Créer des mappages d'ID pour les utilisateurs et les produits
            unique_users = self.interactions_df['userId'].unique()
            unique_products = self.interactions_df['productId'].unique()
            
            self.user_id_mapping = {user_id: idx for idx, user_id in enumerate(unique_users)}
            self.product_id_mapping = {product_id: idx for idx, product_id in enumerate(unique_products)}
            
            # Créer la matrice utilisateur-produit
            self.user_item_matrix = np.zeros((len(unique_users), len(unique_products)))
            
            for _, row in self.interactions_df.iterrows():
                user_idx = self.user_id_mapping[row['userId']]
                product_idx = self.product_id_mapping[row['productId']]
                self.user_item_matrix[user_idx, product_idx] = row['weight']
            
            # Calculer les matrices de similarité
            self.item_similarity_matrix = cosine_similarity(self.user_item_matrix.T)
            self.user_similarity_matrix = cosine_similarity(self.user_item_matrix)
            
            # Récupérer les produits
            products = get_products(db)
            products_data = []
            
            for product in products:
                product_id = str(product['_id'])
                products_data.append({
                    'productId': product_id,
                    'title': product.get('title', ''),
                    'image': product.get('image', ''),
                    'category': product.get('category', ''),
                    'price': product.get('price', 0),
                    'isCollected': product.get('isCollected', False)
                })
            
            self.products_df = pd.DataFrame(products_data)
            
            self.is_trained = True
            return True
        
        except Exception as e:
            print(f"Erreur lors de l'entraînement du modèle: {str(e)}")
            return False
    
    def recommend_for_user(self, user_id, limit=5):
        """
        Recommander des produits pour un utilisateur spécifique
        
        Args:
            user_id (str): ID de l'utilisateur
            limit (int): Nombre maximum de recommandations à retourner
            
        Returns:
            list: Liste des produits recommandés
        """
        if not self.is_trained:
            return []
        
        try:
            # Vérifier si l'utilisateur existe dans le modèle
            if user_id not in self.user_id_mapping:
                return []
            
            user_idx = self.user_id_mapping[user_id]
            
            # Obtenir les scores de prédiction pour tous les produits
            user_ratings = self.user_item_matrix[user_idx]
            similar_users = self.user_similarity_matrix[user_idx]
            
            # Exclure les produits déjà interagis
            interacted_products = np.where(user_ratings > 0)[0]
            
            # Calculer les scores de prédiction
            prediction_scores = np.zeros(self.user_item_matrix.shape[1])
            
            for product_idx in range(self.user_item_matrix.shape[1]):
                if product_idx in interacted_products:
                    continue
                
                # Calculer le score de prédiction basé sur les utilisateurs similaires
                weighted_sum = 0
                similarity_sum = 0
                
                for other_user_idx in range(self.user_item_matrix.shape[0]):
                    if other_user_idx == user_idx:
                        continue
                    
                    similarity = similar_users[other_user_idx]
                    rating = self.user_item_matrix[other_user_idx, product_idx]
                    
                    if rating > 0 and similarity > 0:
                        weighted_sum += similarity * rating
                        similarity_sum += similarity
                
                if similarity_sum > 0:
                    prediction_scores[product_idx] = weighted_sum / similarity_sum
            
            # Obtenir les indices des produits avec les scores les plus élevés
            recommended_indices = np.argsort(prediction_scores)[::-1][:limit]
            
            # Convertir les indices en IDs de produits
            reverse_mapping = {idx: product_id for product_id, idx in self.product_id_mapping.items()}
            recommended_product_ids = [reverse_mapping[idx] for idx in recommended_indices if prediction_scores[idx] > 0]
            
            # Récupérer les détails des produits recommandés
            recommended_products = []
            for product_id in recommended_product_ids:
                product = self.products_df[self.products_df['productId'] == product_id]
                if not product.empty and not product.iloc[0]['isCollected']:
                    recommended_products.append({
                        '_id': product_id,
                        'title': product.iloc[0]['title'],
                        'image': product.iloc[0]['image'],
                        'category': product.iloc[0]['category'],
                        'price': product.iloc[0]['price']
                    })
            
            return recommended_products
        
        except Exception as e:
            print(f"Erreur lors de la recommandation pour l'utilisateur: {str(e)}")
            return []
    
    def find_similar_products(self, product_id, limit=5):
        """
        Trouver des produits similaires à un produit spécifique
        
        Args:
            product_id (str): ID du produit
            limit (int): Nombre maximum de produits similaires à retourner
            
        Returns:
            list: Liste des produits similaires
        """
        if not self.is_trained:
            return []
        
        try:
            # Vérifier si le produit existe dans le modèle
            if product_id not in self.product_id_mapping:
                return []
            
            product_idx = self.product_id_mapping[product_id]
            
            # Obtenir les scores de similarité pour tous les produits
            similarity_scores = self.item_similarity_matrix[product_idx]
            
            # Obtenir les indices des produits les plus similaires (exclure le produit lui-même)
            similar_indices = np.argsort(similarity_scores)[::-1][1:limit+1]
            
            # Convertir les indices en IDs de produits
            reverse_mapping = {idx: product_id for product_id, idx in self.product_id_mapping.items()}
            similar_product_ids = [reverse_mapping[idx] for idx in similar_indices]
            
            # Récupérer les détails des produits similaires
            similar_products = []
            for product_id in similar_product_ids:
                product = self.products_df[self.products_df['productId'] == product_id]
                if not product.empty and not product.iloc[0]['isCollected']:
                    similar_products.append({
                        '_id': product_id,
                        'title': product.iloc[0]['title'],
                        'image': product.iloc[0]['image'],
                        'category': product.iloc[0]['category'],
                        'price': product.iloc[0]['price']
                    })
            
            return similar_products
        
        except Exception as e:
            print(f"Erreur lors de la recherche de produits similaires: {str(e)}")
            return []
    
    def update_with_interaction(self, user_id, product_id, interaction_type):
        """
        Mettre à jour le modèle avec une nouvelle interaction
        
        Args:
            user_id (str): ID de l'utilisateur
            product_id (str): ID du produit
            interaction_type (str): Type d'interaction ('view', 'cart', 'purchase')
            
        Returns:
            bool: True si la mise à jour a réussi, False sinon
        """
        # Cette méthode est simplifiée - dans un système de production,
        # vous voudriez probablement réentraîner le modèle périodiquement
        # plutôt que de le mettre à jour à chaque interaction
        return True
