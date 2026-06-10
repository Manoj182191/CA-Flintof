import sys
import os

# Add backend dir to pythonpath
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def run_e2e_tests():
    print("Initializing Live PostgreSQL E2E Workflow Tests...")
    
    # We do NOT override the DB dependency, so it hits the live PostgreSQL DB
    client = TestClient(app)
    
    # Track errors
    errors = []

    print("\n--- 1. Authentication Workflow ---")
    # Login as admin (which we seeded)
    res = client.post("/api/auth/login", json={
        "email": "admin@caerp.com",
        "password": "Admin@123!"
    })
    
    if res.status_code != 200:
        errors.append(f"Auth Login Failed: {res.text}")
        print("FAIL: Auth Login Failed")
        return errors # Can't continue without auth
    
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("SUCCESS: Auth Login Success")
    
    print("\n--- 2. Company & Profile Workflow ---")
    res = client.get("/api/auth/me", headers=headers)
    if res.status_code != 200:
        errors.append(f"Get Profile Failed: {res.text}")
        print("FAIL: Get Profile Failed")
    else:
        print("SUCCESS: Get Profile Success")
        
    res = client.get("/api/companies/", headers=headers)
    if res.status_code != 200:
        errors.append(f"List Companies Failed: {res.text}")
        print("FAIL: List Companies Failed")
    else:
        print("SUCCESS: List Companies Success")
        companies = res.json()
        if len(companies) == 0:
            errors.append("No companies found.")
        else:
            company_id = companies[0]["id"]
            # Set Active Company via headers
            headers["X-Company-ID"] = str(company_id)
            print(f"SUCCESS: Set Active Company ID: {company_id}")

    print("\n--- 3. Inventory Workflow ---")
    # Create Warehouse
    res = client.post("/api/inventory/warehouses", json={
        "name": "Main Warehouse E2E",
        "code": "WH-E2E"
    }, headers=headers)
    
    if res.status_code not in (200, 201):
        errors.append(f"Create Warehouse Failed: {res.text}")
        print(f"FAIL: Create Warehouse Failed: {res.status_code}")
    else:
        print("SUCCESS: Create Warehouse Success")

    # Create Stock Category
    res = client.post("/api/inventory/categories", json={
        "name": "Electronics E2E",
        "description": "Electronics"
    }, headers=headers)
    
    if res.status_code not in (200, 201):
        errors.append(f"Create Category Failed: {res.text}")
        print(f"FAIL: Create Category Failed: {res.status_code}")
        cat_id = None
    else:
        print("SUCCESS: Create Category Success")
        cat_id = res.json()["id"]

    print("\n--- 4. Payroll Workflow ---")
    # Create Employee
    res = client.post("/api/payroll/employees", json={
        "employee_code": "EMP-E2E-01",
        "first_name": "John",
        "last_name": "Doe",
        "email": "johndoe@e2e.com",
        "date_of_joining": "2026-01-01"
    }, headers=headers)
    
    if res.status_code not in (200, 201):
        errors.append(f"Create Employee Failed: {res.text}")
        print(f"FAIL: Create Employee Failed: {res.status_code}")
    else:
        print("SUCCESS: Create Employee Success")

    print("\n--- 5. Document Management Workflow ---")
    res = client.post("/api/documents/folders", json={
        "name": "E2E Test Folder",
        "description": "Folder created during E2E test"
    }, headers=headers)
    
    if res.status_code not in (200, 201):
        errors.append(f"Create Folder Failed: {res.text}")
        print(f"FAIL: Create Folder Failed: {res.status_code}")
    else:
        print("SUCCESS: Create Folder Success")
        
    print("\n===============================")
    if len(errors) == 0:
        print("ALL LIVE POSTGRESQL API E2E WORKFLOWS PASSED!")
    else:
        print(f"FOUND {len(errors)} ERRORS:")
        for err in errors:
            print(f"  - {err}")

    return errors

if __name__ == "__main__":
    run_e2e_tests()
