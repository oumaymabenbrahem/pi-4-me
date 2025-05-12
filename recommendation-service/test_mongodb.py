from pymongo import MongoClient

def test_mongodb_connection():
    """Tester la connexion à MongoDB"""
    try:
        # Connexion à MongoDB
        client = MongoClient('mongodb://localhost:27017/')
        
        # Vérifier la connexion
        server_info = client.server_info()
        print("Connexion à MongoDB réussie!")
        print("Version de MongoDB:", server_info.get('version', 'Inconnue'))
        
        # Lister les bases de données
        databases = client.list_database_names()
        print("\nBases de données disponibles:")
        for db in databases:
            print(f"- {db}")
        
        # Sélectionner la base de données oussamradwh
        db = client['oussamradwh']
        
        # Lister les collections
        collections = db.list_collection_names()
        print("\nCollections dans la base de données 'oussamradwh':")
        for collection in collections:
            print(f"- {collection}")
        
        # Compter les documents dans chaque collection
        print("\nNombre de documents dans chaque collection:")
        for collection in collections:
            count = db[collection].count_documents({})
            print(f"- {collection}: {count} documents")
        
        return True
    
    except Exception as e:
        print(f"Erreur de connexion à MongoDB: {str(e)}")
        return False

if __name__ == '__main__':
    print("=== Test de connexion à MongoDB ===")
    test_mongodb_connection()
    print("=== Test terminé ===")
