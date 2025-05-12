import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

def get_database_connection():
    """
    Établit une connexion à la base de données MongoDB
    
    Returns:
        pymongo.database.Database: Instance de la base de données MongoDB
    """
    try:
        # Récupérer l'URI de connexion depuis les variables d'environnement
        mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/oussamradwh')
        
        # Créer un client MongoDB
        client = MongoClient(mongo_uri)
        
        # Récupérer la base de données
        db_name = mongo_uri.split('/')[-1]
        db = client[db_name]
        
        return db
    except Exception as e:
        print(f"Erreur de connexion à la base de données: {str(e)}")
        raise e

def get_product_interactions(db):
    """
    Récupère toutes les interactions utilisateur-produit depuis la base de données
    
    Args:
        db (pymongo.database.Database): Instance de la base de données MongoDB
        
    Returns:
        list: Liste des interactions utilisateur-produit
    """
    try:
        # Récupérer la collection des interactions
        interactions = list(db.productinteractions.find())
        return interactions
    except Exception as e:
        print(f"Erreur lors de la récupération des interactions: {str(e)}")
        return []

def get_products(db):
    """
    Récupère tous les produits depuis la base de données
    
    Args:
        db (pymongo.database.Database): Instance de la base de données MongoDB
        
    Returns:
        list: Liste des produits
    """
    try:
        # Récupérer la collection des produits
        products = list(db.productstree.find())
        return products
    except Exception as e:
        print(f"Erreur lors de la récupération des produits: {str(e)}")
        return []

def get_users(db):
    """
    Récupère tous les utilisateurs depuis la base de données
    
    Args:
        db (pymongo.database.Database): Instance de la base de données MongoDB
        
    Returns:
        list: Liste des utilisateurs
    """
    try:
        # Récupérer la collection des utilisateurs
        users = list(db.users.find())
        return users
    except Exception as e:
        print(f"Erreur lors de la récupération des utilisateurs: {str(e)}")
        return []

def get_product_by_id(db, product_id):
    """
    Récupère un produit par son ID
    
    Args:
        db (pymongo.database.Database): Instance de la base de données MongoDB
        product_id (str): ID du produit
        
    Returns:
        dict: Données du produit
    """
    try:
        from bson.objectid import ObjectId
        product = db.productstree.find_one({"_id": ObjectId(product_id)})
        return product
    except Exception as e:
        print(f"Erreur lors de la récupération du produit: {str(e)}")
        return None
