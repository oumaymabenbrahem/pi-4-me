# PI-4-ME E-commerce Platform

A full-stack e-commerce application with product management, user authentication, shopping cart functionality, payment processing, and AI-powered features.

## Project Overview

This project is a comprehensive e-commerce platform with the following components:

- **Client**: React-based frontend with shopping and admin interfaces
- **Server**: Node.js/Express backend API
- **Recommendation Service**: Python-based microservice for product recommendations
- **Database**: MongoDB for data storage
- **AI Integration**: Chatbot functionality and product description generation

## Features

### User Features
- User authentication (login, register, password reset)
- Product browsing and searching
- Shopping cart management
- Checkout and payment processing
- Order history and tracking
- User profile and address management
- AI-powered chatbot assistance

### Admin Features
- Product management (add, edit, delete)
- Order management and processing
- User management
- Dashboard with analytics

### Technical Features
- Responsive UI built with React and Tailwind CSS
- RESTful API architecture
- JWT-based authentication
- Cloudinary integration for image uploads
- AI-powered product recommendations
- Geolocation support for store locations
- Payment gateway integration

## Project Structure

```
pi-4-me/
├── client/                 # React frontend
├── server/                 # Node.js/Express backend
├── recommendation-service/ # Python recommendation microservice
├── backoffice/             # Admin dashboard
└── docker-compose.yml      # Docker configuration
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Python 3.9+ (for recommendation service)
- Docker and Docker Compose (optional, for containerized deployment)

## Installation and Setup

### Environment Variables

#### Server (.env file in server directory)
```
# Configuration serveur et base de données
PORT=5000
MONGO_URI=mongodb://localhost:27017/your_database_name

# Configuration JWT
JWT_SECRET=your_jwt_secret

# Configuration Cloudinary pour l'upload d'images
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Configuration du service de recommandation IA
RECOMMENDATION_SERVICE_URL=http://localhost:5001
```

#### Recommendation Service (.env file in recommendation-service directory)
```
# Configuration du serveur Flask
PORT=5001

# Configuration de la base de données MongoDB
MONGO_URI=mongodb://localhost:27017/your_database_name
```

### Client Setup

```bash
cd client
npm install
npm run dev
```

### Server Setup

```bash
cd server
npm install
npm run dev
```

### Recommendation Service Setup

```bash
cd recommendation-service
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

## Docker Deployment

You can use Docker to run the entire application stack:

```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27018
- Node.js server on port 5001
- React client on port 5024
- Recommendation service on port 5001

## Development

### Client

The client is built with:
- React + Vite
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Shadcn UI components

```bash
# Run development server
cd client
npm run dev

# Build for production
npm run build
```

### Server

The server is built with:
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Various middleware for security and functionality

```bash
# Run development server
cd server
npm run dev

# Start production server
npm start
```

### Web Scraping

The project includes web scraping functionality for product data:

```bash
# Test scraping functionality
cd server
npm run test-scraping

# Test Python scraping
npm run test-python-scraping
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
