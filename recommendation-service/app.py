from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from models.collaborative_filtering import CollaborativeFilteringModel
from database import get_database_connection

# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Initialiser le modèle de recommandation
recommendation_model = CollaborativeFilteringModel()

@app.route('/health', methods=['GET'])
def health_check():
    """Vérifier que le service est en cours d'exécution"""
    return jsonify({
        'status': 'ok',
        'message': 'Le service de recommandation est opérationnel'
    })

@app.route('/train', methods=['POST'])
def train_model():
    """Entraîner le modèle de recommandation avec les données actuelles"""
    try:
        # Récupérer les données d'entraînement depuis la base de données
        db = get_database_connection()
        
        # Entraîner le modèle
        success = recommendation_model.train(db)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Modèle entraîné avec succès'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Erreur lors de l\'entraînement du modèle'
            }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erreur: {str(e)}'
        }), 500

@app.route('/recommend/user/<user_id>', methods=['GET'])
def get_recommendations_for_user(user_id):
    """Obtenir des recommandations pour un utilisateur spécifique"""
    try:
        limit = request.args.get('limit', default=5, type=int)
        
        # Obtenir les recommandations
        recommendations = recommendation_model.recommend_for_user(user_id, limit)
        
        return jsonify({
            'success': True,
            'data': recommendations
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erreur: {str(e)}'
        }), 500

@app.route('/recommend/similar/<product_id>', methods=['GET'])
def get_similar_products(product_id):
    """Obtenir des produits similaires à un produit spécifique"""
    try:
        limit = request.args.get('limit', default=5, type=int)
        
        # Obtenir les produits similaires
        similar_products = recommendation_model.find_similar_products(product_id, limit)
        
        return jsonify({
            'success': True,
            'data': similar_products
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erreur: {str(e)}'
        }), 500

@app.route('/record-interaction', methods=['POST'])
def record_interaction():
    """Enregistrer une nouvelle interaction utilisateur-produit"""
    try:
        data = request.json
        user_id = data.get('userId')
        product_id = data.get('productId')
        interaction_type = data.get('interactionType')
        
        if not user_id or not product_id or not interaction_type:
            return jsonify({
                'success': False,
                'message': 'Paramètres manquants'
            }), 400
            
        # Enregistrer l'interaction dans la base de données
        db = get_database_connection()
        
        # Mettre à jour le modèle avec la nouvelle interaction
        recommendation_model.update_with_interaction(user_id, product_id, interaction_type)
        
        return jsonify({
            'success': True,
            'message': 'Interaction enregistrée avec succès'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erreur: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Récupérer le port depuis les variables d'environnement ou utiliser 5001 par défaut
    port = int(os.environ.get('PORT', 5001))
    
    # Démarrer le serveur Flask
    app.run(host='0.0.0.0', port=port, debug=True)
