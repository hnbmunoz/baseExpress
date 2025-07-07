# eKonsulta API

API Gateway for the eKonsulta application.

## Technologies Used

### Backend Framework
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework for Node.js
- **TypeScript** - Typed superset of JavaScript

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling for Node.js

### Authentication & Security
- **JSON Web Tokens (JWT)** - For secure authentication
- **bcryptjs** - For password hashing
- **CORS** - Cross-Origin Resource Sharing support

### Documentation
- **Swagger/OpenAPI** - API documentation and testing interface

### Development Tools
- **nodemon** - Development server with auto-restart
- **ts-node** - TypeScript execution environment for Node.js
- **dotenv** - Environment variable management

## Project Structure

```
baseExpress/
├── src/                      # Source code
│   ├── config/               # Configuration files
│   │   ├── db.ts             # Database connection
│   │   └── swagger.ts        # Swagger/OpenAPI configuration
│   ├── controllers/          # Request handlers
│   │   ├── auth.ts           # Authentication controllers
│   │   └── users.ts          # User management controllers
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts           # Authentication middleware
│   │   └── error.ts          # Error handling middleware
│   ├── models/               # Database models
│   │   └── User.ts           # User model definition
│   ├── routes/               # API routes
│   │   ├── auth.ts           # Authentication routes
│   │   └── users.ts          # User management routes
│   ├── seeder/               # Database seeders
│   │   └── adminSeeder.ts    # Admin user seeder
│   ├── types/                # TypeScript type definitions
│   │   ├── environment.d.ts  # Environment variable types
│   │   ├── index.ts          # Common type exports
│   │   └── jsonwebtoken.d.ts # JWT type extensions
│   ├── utils/                # Utility functions
│   └── server.ts             # Application entry point
├── package.json              # Project dependencies and scripts
├── package-lock.json         # Locked dependencies
├── tsconfig.json             # TypeScript configuration
└── .gitignore                # Git ignore file
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login with email/username and password
- `GET /api/v1/auth/me` - Get current user profile
- `GET /api/v1/auth/logout` - Logout current user

### Users
- User management endpoints (CRUD operations)

### Documentation
- `GET /api-docs` - Swagger UI for API documentation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB instance (local or Atlas)

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=5050
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
```

### Installation
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run in production mode
npm start

# Seed admin user
npm run seed:admin
```

### API Documentation
Once the server is running, you can access the Swagger documentation at:
```
http://localhost:5050/api-docs
```

## User Roles
The application supports three user roles:
- **Administrator** - Full system access
- **Employee** - Staff access
- **Client** - Regular user access