import requests
import json

def test_health_check():
    """Tester l'endpoint de vérification de santé"""
    response = requests.get('http://localhost:5001/health')
    print("Health Check Response:", response.status_code)
    if response.status_code == 200:
        print(response.json())
    else:
        print("Erreur:", response.text)

def test_train_model():
    """Tester l'entraînement du modèle"""
    response = requests.post('http://localhost:5001/train')
    print("Train Model Response:", response.status_code)
    if response.status_code == 200:
        print(response.json())
    else:
        print("Erreur:", response.text)

def test_recommend_for_user(user_id):
    """Tester les recommandations pour un utilisateur"""
    response = requests.get(f'http://localhost:5001/recommend/user/{user_id}')
    print(f"Recommendations for User {user_id} Response:", response.status_code)
    if response.status_code == 200:
        print(json.dumps(response.json(), indent=2))
    else:
        print("Erreur:", response.text)

def test_similar_products(product_id):
    """Tester les produits similaires"""
    response = requests.get(f'http://localhost:5001/recommend/similar/{product_id}')
    print(f"Similar Products to {product_id} Response:", response.status_code)
    if response.status_code == 200:
        print(json.dumps(response.json(), indent=2))
    else:
        print("Erreur:", response.text)

def test_record_interaction(user_id, product_id, interaction_type):
    """Tester l'enregistrement d'une interaction"""
    data = {
        'userId': user_id,
        'productId': product_id,
        'interactionType': interaction_type
    }
    response = requests.post('http://localhost:5001/record-interaction', json=data)
    print("Record Interaction Response:", response.status_code)
    if response.status_code == 200:
        print(response.json())
    else:
        print("Erreur:", response.text)

if __name__ == '__main__':
    print("=== Testing Recommendation Service ===")
    
    # Tester l'endpoint de vérification de santé
    print("\n1. Testing Health Check:")
    test_health_check()
    
    # Tester l'entraînement du modèle
    print("\n2. Testing Model Training:")
    test_train_model()
    
    # Tester les recommandations pour un utilisateur (remplacer par un ID valide)
    print("\n3. Testing User Recommendations:")
    test_recommend_for_user("64f8a3a5e9b7c8a9d8b4567")
    
    # Tester les produits similaires (remplacer par un ID valide)
    print("\n4. Testing Similar Products:")
    test_similar_products("64f8a3a5e9b7c8a9d8b4568")
    
    # Tester l'enregistrement d'une interaction
    print("\n5. Testing Record Interaction:")
    test_record_interaction("64f8a3a5e9b7c8a9d8b4567", "64f8a3a5e9b7c8a9d8b4568", "view")
    
    print("\n=== Testing Complete ===")
