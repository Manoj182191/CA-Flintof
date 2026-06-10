# CA ERP Platform - Development Setup Guide

## Prerequisites

- **Docker & Docker Compose** - For containerized development
- **Python 3.11+** - For backend development
- **Node.js 18+** - For frontend development
- **PostgreSQL 15** - Database (included in docker-compose)
- **Git** - Version control

## Quick Start with Docker

### 1. Navigate to project root
```bash
cd ca-erp
```

### 2. Create environment files
```bash
# Backend .env already exists, but verify it has correct database URL
cat backend/.env
```

### 3. Start all services
```bash
docker-compose up -d
```

### 4. Verify all services are running
```bash
docker ps
```

You should see:
- `ca_erp_db` - PostgreSQL database
- `ca_erp_api` - FastAPI backend
- `ca_erp_web` - React frontend

### 5. Access the application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/api/docs
- **API ReDoc**: http://localhost:8000/api/redoc

### 6. Initial Setup

#### Create a test user via API

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "full_name": "Test User",
    "password": "password123"
  }'
```

#### Login and get token

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Copy the `access_token` from the response.

#### Create a company

```bash
curl -X POST http://localhost:8000/api/companies/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "ABC Company",
    "legal_name": "ABC Pvt Ltd",
    "pan": "AAAPA1234A",
    "gstin": "27AABPA1234A1Z0",
    "business_type": "Private Limited",
    "currency": "INR"
  }'
```

---

## Local Development (Without Docker)

### Backend Setup

#### 1. Create and activate virtual environment
```bash
cd backend
python -m venv venv

# On macOS/Linux
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

#### 2. Install dependencies
```bash
pip install -r requirements.txt
```

#### 3. Set up PostgreSQL
```bash
# On macOS (using Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb ca_erp

# On Windows, install PostgreSQL from https://www.postgresql.org/download/windows/
```

#### 4. Configure environment
```bash
# Copy and edit .env file
cp .env .env.local
# Update DATABASE_URL if needed
```

#### 5. Run the backend
```bash
python -m uvicorn app.main:app --reload
```

Backend will be available at http://localhost:8000

### Frontend Setup

#### 1. Install dependencies
```bash
cd frontend
npm install
```

#### 2. Create environment file
```bash
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env.local
```

#### 3. Start development server
```bash
npm start
```

Frontend will be available at http://localhost:3000

---

## Common Commands

### Docker Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Stop all services
docker-compose down

# Rebuild images
docker-compose build

# Remove everything including volumes
docker-compose down -v
```

### Backend Commands

```bash
# Install new package
pip install package-name

# Freeze requirements
pip freeze > requirements.txt

# Run tests
pytest

# Format code
black app/

# Lint code
flake8 app/
```

### Frontend Commands

```bash
# Install new package
npm install package-name

# Build for production
npm run build

# Run tests
npm test

# Format code
npm run format
```

---

## Database Migrations

Currently using SQLAlchemy models for schema. Models are auto-created on app startup.

To manually create tables:

```bash
python
>>> from app.database.base import Base, engine
>>> from app.models.models import *
>>> Base.metadata.create_all(bind=engine)
```

For future Alembic migrations:
```bash
alembic init migrations
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

---

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env matches your setup
- Verify database `ca_erp` exists

### Frontend can't connect to API
- Ensure backend is running on port 8000
- Check REACT_APP_API_URL in .env.local
- Check browser console for CORS errors

### Port Already in Use
```bash
# On macOS/Linux
lsof -i :8000
kill -9 <PID>

# On Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Module Not Found Errors (Python)
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again
- Check Python version is 3.11+

### Node Module Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. **Create test data** - Add companies, ledgers, invoices via API
2. **Build UI components** - Create reusable form/table components
3. **Implement features** - Start with accounting module
4. **Add tests** - Unit and integration tests
5. **API documentation** - Improve API docs and examples

---

## Architecture Overview

### Backend Architecture
```
FastAPI
├── Routes (HTTP Endpoints)
├── Services (Business Logic)
├── Models (Database ORM)
├── Schemas (Request/Response Validation)
└── Database (PostgreSQL)
```

### Frontend Architecture
```
React
├── Pages (Full page views)
├── Components (Reusable UI)
├── Services (API calls)
├── Hooks (Custom React hooks)
├── Context (Global state)
└── Utils (Helper functions)
```

---

## Contributing

Before making changes:
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test locally
4. Commit with clear messages
5. Push and create a Pull Request

---

For more details, see README.md
