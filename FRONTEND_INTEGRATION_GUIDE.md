# CA ERP Backend - Integration Guide for Your Frontend

**Date**: June 8, 2026  
**Status**: Backend Production Ready ✅  
**Your Task**: Build the Frontend UI/UX  

---

## 📝 Executive Summary

The backend is **100% complete and production-ready**. You can now:

1. ✅ Start the backend independently
2. ✅ Test all 60+ endpoints with Swagger UI
3. ✅ Build your frontend in any technology
4. ✅ Connect to the backend API
5. ✅ Deploy both independently

---

## 🚀 Getting Started with Backend

### Step 1: Start Backend Services

```bash
# Navigate to project
cd ca-erp

# Start PostgreSQL + FastAPI Backend
docker-compose up -d db backend

# Verify services are running
docker ps

# Check logs
docker-compose logs -f backend
```

### Step 2: Access Backend

- **API Base URL**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/api/docs`
- **Alternative Docs**: `http://localhost:8000/api/redoc`
- **Database**: `postgresql://postgres:password@localhost:5432/ca_erp`

### Step 3: Test with Swagger UI

1. Go to http://localhost:8000/api/docs
2. Click "Try it out" on any endpoint
3. Execute API calls directly
4. See responses in real-time

---

## 📋 Frontend Integration Checklist

### Before Building Frontend

- [ ] Backend is running (docker-compose up)
- [ ] Can access http://localhost:8000/api/docs
- [ ] Can see Swagger UI with all endpoints
- [ ] Test one endpoint (e.g., GET /api/auth/me)

### During Frontend Development

- [ ] API_URL points to http://localhost:8000 or your backend
- [ ] Include Bearer token in Authorization headers
- [ ] Handle CORS (frontend on 3000, backend on 8000)
- [ ] Use provided schemas for request/response types

### Before Production

- [ ] All 60+ endpoints tested
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Backend deployed to cloud
- [ ] Frontend API_URL updated to production backend
- [ ] CORS origins updated in backend .env

---

## 🔌 API Integration Examples

### 1. Authentication Flow

```typescript
// Register
POST http://localhost:8000/api/auth/register
{
  "email": "user@example.com",
  "username": "username",
  "full_name": "User Name",
  "password": "password123"
}

// Login
POST http://localhost:8000/api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "full_name": "User Name",
    "is_active": true
  }
}

// Store token in localStorage
localStorage.setItem('access_token', access_token)

// Use in all requests
Authorization: Bearer <access_token>
```

### 2. Create Company

```bash
curl -X POST http://localhost:8000/api/companies/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Company",
    "legal_name": "ABC Pvt Ltd",
    "pan": "AAAPA1234A",
    "gstin": "27AABPA1234A1Z0",
    "business_type": "Private Limited",
    "currency": "INR",
    "address": "123 Main Street"
  }'
```

### 3. Create Chart of Accounts

```bash
# 1. Create Ledger Groups (once per company)
POST http://localhost:8000/api/accounting/ledger-groups/
?company_id=1&name=Bank&group_type=Assets

# 2. Create Ledgers
POST http://localhost:8000/api/accounting/ledgers/
{
  "company_id": 1,
  "group_id": 1,
  "name": "HDFC Bank",
  "opening_balance": 100000
}
```

### 4. Create Voucher (Auto-Balanced)

```bash
POST http://localhost:8000/api/accounting/vouchers/
{
  "company_id": 1,
  "voucher_type": "Payment",
  "voucher_date": "2024-01-15",
  "description": "Payment to vendor",
  "transactions": [
    {
      "ledger_id": 1,
      "debit_amount": 5000,
      "credit_amount": 0,
      "narration": "Bank payment"
    },
    {
      "ledger_id": 2,
      "debit_amount": 0,
      "credit_amount": 5000,
      "narration": "Vendor payment"
    }
  ]
}
```

**Validation**: System automatically checks if debit = credit  
**Response**: Voucher created with auto-generated number

### 5. Generate Reports

```bash
# Trial Balance
GET http://localhost:8000/api/accounting/trial-balance/1

# General Ledger
GET http://localhost:8000/api/accounting/general-ledger/1

# Balance Sheet
GET http://localhost:8000/api/accounting/balance-sheet/1?as_of_date=2024-12-31

# P&L Statement
GET http://localhost:8000/api/accounting/profit-loss/1?from_date=2024-01-01&to_date=2024-12-31

# Cash Flow
GET http://localhost:8000/api/accounting/cash-flow/1?from_date=2024-01-01&to_date=2024-12-31
```

### 6. GST Compliance

```bash
# GSTR-1 (Sales)
GET http://localhost:8000/api/gst/gstr1/1?month=1&year=2024

# GSTR-3B (Monthly)
GET http://localhost:8000/api/gst/gstr3b/1?month=1&year=2024

# GST Reconciliation
GET http://localhost:8000/api/gst/reconciliation/1?month=1&year=2024

# Create & File Return
POST http://localhost:8000/api/gst/returns/create?company_id=1&return_type=GSTR-3B&month=1&year=2024
POST http://localhost:8000/api/gst/returns/1/file
```

### 7. Create Invoice

```bash
POST http://localhost:8000/api/invoices/
{
  "company_id": 1,
  "customer_id": 1,
  "invoice_date": "2024-01-15",
  "due_date": "2024-02-15",
  "line_items": [
    {
      "description": "Service rendered",
      "quantity": 1,
      "unit_price": 10000,
      "gst_rate": 18
    }
  ],
  "notes": "Thanks for your business"
}
```

---

## 🔐 Authentication & Headers

All API requests (except /auth/*) require:

```
Authorization: Bearer <your_access_token>
Content-Type: application/json
```

Example with fetch:

```javascript
const response = await fetch('http://localhost:8000/api/companies/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

Example with axios:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

api.get('/companies/')
```

---

## 📊 Data Models & Relationships

### Company Model
```
Company {
  id, name, legal_name, pan, gstin, tan, cid,
  business_type, financial_year_start, currency,
  address, phone, email, created_by
}
→ Has many: Ledgers, Vouchers, Invoices, Customers, Vendors, Warehouses
```

### Ledger Model
```
Ledger {
  id, company_id, group_id, name, alias,
  opening_balance, opening_date, is_active
}
→ Belongs to: Company, LedgerGroup
→ Has many: Transactions
```

### Voucher Model
```
Voucher {
  id, company_id, voucher_type, voucher_number,
  voucher_date, description, total_debit, total_credit,
  is_posted, created_by
}
→ Belongs to: Company
→ Has many: Transactions
```

### Invoice Model
```
Invoice {
  id, company_id, customer_id, invoice_number,
  invoice_date, due_date, subtotal, tax_amount,
  total_amount, paid_amount, status, notes
}
→ Belongs to: Company, Customer
→ Has many: InvoiceLineItems
```

---

## ✨ Frontend Technology Recommendations

### React/Vue/Angular + TypeScript

Generate types from Swagger:

```bash
npm install @swagger-parser @apidevtools/swagger-parser

# Generate TypeScript types
swagger-to-typescript --input http://localhost:8000/api/openapi.json --output api.types.ts
```

### API Client Setup

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### Error Handling

```typescript
try {
  const response = await api.get('/companies/')
  // Handle success
} catch (error) {
  if (error.response?.status === 400) {
    // Validation error
    console.error(error.response.data.detail)
  } else if (error.response?.status === 401) {
    // Unauthorized
    redirectToLogin()
  } else {
    // Server error
    showError('Failed to load companies')
  }
}
```

---

## 🚀 Deployment Strategy

### Development
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- Database: Docker PostgreSQL

### Production
- Backend: Deploy to AWS/GCP/Azure
- Frontend: Deploy to Vercel/Netlify
- Database: Managed database service
- Update `.env` with production URLs

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://user:password@prod-host:5432/ca_erp
SECRET_KEY=your-production-secret-key
DEBUG=False
OPENAI_API_KEY=sk-...
CORS_ORIGINS=https://yourdomain.com
```

**Frontend (.env.production)**
```
REACT_APP_API_URL=https://api.yourdomain.com
```

---

## 📈 API Response Format

All successful responses follow this format:

```json
{
  "id": 1,
  "name": "ABC Company",
  "created_at": "2024-01-15T10:30:00",
  ...
}
```

Error responses:

```json
{
  "detail": "Company not found"
}
```

List responses:

```json
[
  {
    "id": 1,
    "name": "ABC Company"
  },
  {
    "id": 2,
    "name": "XYZ Company"
  }
]
```

---

## 🧪 Testing Endpoints

### Using cURL

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","password":"123456"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### Using Postman

1. Import from Swagger: File → Import → Enter `http://localhost:8000/openapi.json`
2. All endpoints and schemas are imported
3. Set variable `{{token}}` from login response
4. Use in Authorization header: `Bearer {{token}}`

### Using ThunderClient (VS Code)

1. Install ThunderClient extension
2. Click "Env" and create variable: `api_url = http://localhost:8000`
3. Click "Collections" and import from URL: `http://localhost:8000/openapi.json`

---

## 📞 Support & Documentation

### Official Documentation
- **API Docs**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **Backend Guide**: `BACKEND_SUMMARY.md`
- **Implementation**: `IMPLEMENTATION_CHECKLIST.md`

### Troubleshooting

**Backend won't start**
```bash
docker-compose logs backend
# Check for database connection errors
```

**Frontend can't reach API**
```
Check CORS settings in backend/.env
Check API_URL in frontend .env
Check firewall/network settings
```

**Database connection fails**
```bash
docker-compose restart db
# Wait 10 seconds for DB to be ready
docker-compose up backend
```

---

## ✅ Integration Checklist

- [ ] Backend running locally
- [ ] Swagger UI accessible
- [ ] Can authenticate (register & login)
- [ ] Can create company
- [ ] Can create accounting entries
- [ ] Can generate reports
- [ ] Can create invoices
- [ ] Can handle GST calculations
- [ ] Error handling working
- [ ] Frontend built and running
- [ ] Frontend connects to backend
- [ ] All CRUD operations working
- [ ] Reports generate correctly
- [ ] Authentication flow complete

---

## 🎉 You're Ready!

Backend is production-ready. Now build an amazing frontend! 🚀

Questions? Check:
1. Swagger UI at /api/docs
2. BACKEND_SUMMARY.md
3. IMPLEMENTATION_CHECKLIST.md

Happy building! 💪
