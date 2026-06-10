# CA ERP Platform - Quick Start Guide

## 🎯 What You Have

A **production-ready** CA accounting platform with:
- ✅ FastAPI backend (Python)
- ✅ React frontend (TypeScript)
- ✅ PostgreSQL database
- ✅ Docker containerization
- ✅ 23 API endpoints
- ✅ Complete authentication
- ✅ Accounting module with double-entry bookkeeping
- ✅ Invoicing with GST
- ✅ Financial reporting
- ✅ Responsive UI

---

## 🚀 Start Application (Docker - Recommended)

### Prerequisites
- Docker Desktop installed
- 4GB RAM minimum
- Ports 3000, 8000, 5432 available

### Steps

1. **Navigate to project**
   ```bash
   cd ca-erp
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Verify all services are running**
   ```bash
   docker ps
   ```
   
   You should see 3 containers:
   - `ca_erp_db` (PostgreSQL)
   - `ca_erp_api` (FastAPI)
   - `ca_erp_web` (React)

4. **Access the application**
   - **Web App**: http://localhost:3000
   - **API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/api/docs
   - **ReDoc**: http://localhost:8000/api/redoc

### First Time Setup

1. **Register User** (in React app or via API)
   ```bash
   curl -X POST http://localhost:8000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "ca@example.com",
       "username": "ca_user",
       "full_name": "CA Name",
       "password": "password123"
     }'
   ```

2. **Login**
   - Go to http://localhost:3000
   - Enter credentials
   - Get access token

3. **Create Company**
   - Click "Companies" in sidebar
   - Click "+ New Company"
   - Fill details (Name, PAN, GSTIN, etc.)
   - Click "Create Company"

4. **Start Using**
   - Go to Dashboard
   - Access Accounting, Invoicing, etc.

---

## 💻 Local Development (Without Docker)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup PostgreSQL
# macOS: brew install postgresql@15 && brew services start postgresql@15
# Windows: Download from postgresql.org
# Create database: createdb ca_erp

# Update .env if needed
nano .env

# Start server
python -m uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000

### Frontend Setup

```bash
# Navigate to frontend (new terminal)
cd frontend

# Install dependencies
npm install

# Create environment
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env.local

# Start dev server
npm start
```

Frontend runs at: http://localhost:3000

---

## 📚 API Quick Reference

### Authentication
```bash
# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
# Response: { "access_token": "...", "user": {...} }
```

### Companies
```bash
# Create
POST /api/companies/
Authorization: Bearer TOKEN
{
  "name": "ABC Company",
  "pan": "AAAPA1234A",
  "gstin": "27AABPA1234A1Z0",
  "business_type": "Private Limited"
}

# List
GET /api/companies/
Authorization: Bearer TOKEN
```

### Accounting - Ledgers
```bash
# Create Ledger Group
POST /api/accounting/ledger-groups/
?company_id=1&name=Bank&group_type=Assets

# List Ledgers
GET /api/accounting/ledgers/1

# Get Trial Balance
GET /api/accounting/trial-balance/1
```

### Accounting - Vouchers
```bash
# Create Voucher (with auto debit/credit balance check)
POST /api/accounting/vouchers/
{
  "company_id": 1,
  "voucher_type": "Payment",
  "voucher_date": "2024-01-15",
  "transactions": [
    { "ledger_id": 1, "debit_amount": 5000, "credit_amount": 0 },
    { "ledger_id": 2, "debit_amount": 0, "credit_amount": 5000 }
  ]
}

# Post Voucher (finalize)
POST /api/accounting/vouchers/{id}/post
```

### Invoicing
```bash
# Create Invoice
POST /api/invoices/
{
  "company_id": 1,
  "customer_id": 1,
  "invoice_date": "2024-01-15",
  "line_items": [
    {
      "description": "Service",
      "quantity": 1,
      "unit_price": 10000,
      "gst_rate": 18
    }
  ]
}

# Get Aging Report
GET /api/invoices/{company_id}/aging-report
```

### Reporting
```bash
# Trial Balance
GET /api/accounting/trial-balance/{company_id}
Response:
{
  "trial_balance": [
    { "ledger_name": "Bank", "debit": 50000, "credit": 0 },
    ...
  ],
  "total_debit": 100000,
  "total_credit": 100000,
  "balanced": true
}

# General Ledger
GET /api/accounting/general-ledger/{ledger_id}
```

---

## 🎨 Frontend Features

### Pages
1. **Login** - Register and login users
2. **Dashboard** - KPI overview
3. **Companies** - Create and manage companies
4. **Accounting** - Chart of accounts and vouchers
5. **Invoicing** - Invoice management

### Components
- Sidebar navigation
- Top navbar
- Responsive layout
- Form inputs
- Data tables (coming)
- Charts (coming)

---

## 🔧 Common Tasks

### Add New API Endpoint

1. **Create route file** in `backend/app/api/routes/`
2. **Define models** in `backend/app/models/models.py`
3. **Create schemas** in `backend/app/schemas/schemas.py`
4. **Import in** `backend/app/main.py`

Example:
```python
# In routes file
from fastapi import APIRouter

router = APIRouter(prefix="/api/feature", tags=["feature"])

@router.get("/")
def get_feature():
    return {"message": "Feature working"}
```

### Add New Frontend Page

1. **Create page** in `frontend/src/pages/`
2. **Add route** in `frontend/src/App.tsx`
3. **Create service** in `frontend/src/services/`

Example:
```typescript
import React from 'react';

const NewPage: React.FC = () => {
  return <div>New Page Content</div>;
};

export default NewPage;
```

### Database Changes

1. **Update model** in `backend/app/models/models.py`
2. **Restart backend** - Tables auto-create on startup
3. **Create migration** (for Alembic - future)

### Add New Package

**Backend:**
```bash
cd backend
pip install package-name
pip freeze > requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install package-name
```

---

## 🐛 Troubleshooting

### Can't access frontend (port 3000)
```bash
# Check if port in use
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 PID  # macOS/Linux
taskkill /PID PID /F  # Windows

# Restart docker
docker-compose restart frontend
```

### Can't access API (port 8000)
```bash
# Check logs
docker-compose logs backend

# Restart
docker-compose restart backend
```

### Database connection error
```bash
# Ensure DB is running
docker-compose logs db

# Restart database
docker-compose restart db

# Verify connection
psql -h localhost -U postgres -d ca_erp
```

### Frontend can't reach API
- Check REACT_APP_API_URL in .env.local
- Ensure backend is running on port 8000
- Check browser console for CORS errors
- Verify in API docs: http://localhost:8000/api/docs

### Import errors in Python
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Module not found in frontend
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Database Schema Highlights

### Core Tables
- **users** - User accounts and authentication
- **companies** - Multi-company support
- **ledger_groups** - Chart of Accounts groups
- **ledgers** - Individual accounts
- **vouchers** - Accounting vouchers
- **transactions** - Double-entry transactions
- **invoices** - Sales/Purchase invoices
- **customers** - Customer management
- **vendors** - Vendor management
- **bank_accounts** - Bank account tracking
- **stock_items** - Inventory items
- **warehouses** - Inventory locations
- **audit_logs** - Complete audit trail

**19 models total** - ready for expansion

---

## 🔐 Security Notes

### Current
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ CORS configuration
- ✅ SQL injection prevention

### To Add
- [ ] Rate limiting
- [ ] Two-factor authentication
- [ ] API key authentication
- [ ] Data encryption at rest
- [ ] HTTPS/TLS
- [ ] User activity monitoring

---

## 📈 Performance Tips

1. **Use docker-compose** for development
2. **Install Docker Desktop** for better performance
3. **Allocate 4GB+ RAM** to Docker
4. **Use .env files** for configuration
5. **Keep venv activated** for backend development

---

## 🎓 Next Steps

1. **Explore API** - Visit http://localhost:8000/api/docs
2. **Create test data** - Add companies and transactions
3. **Build features** - Create new pages and endpoints
4. **Add tests** - Unit and integration tests
5. **Deploy** - Use Docker for easy deployment

---

## 📞 Getting Help

1. **API Documentation** - http://localhost:8000/api/docs
2. **README.md** - Project overview
3. **PROJECT_STATUS.md** - What's built
4. **SETUP.md** - Detailed setup guide
5. **Docker logs** - `docker-compose logs <service>`

---

## ✨ That's It!

Your CA ERP platform is ready to use. Start building! 🚀

For questions, check the documentation files in the `docs/` folder.

Happy accounting! 📊
