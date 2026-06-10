import pytest
from fastapi.testclient import TestClient

def test_client_portal_dashboard_not_found(client: TestClient, admin_token_headers):
    # Testing an invalid CA Client ID should return 404
    response = client.get("/api/client-portal/dashboard/9999", headers=admin_token_headers)
    assert response.status_code == 404

def test_list_client_documents(client: TestClient, admin_token_headers):
    # CA client 1 documents
    response = client.get("/api/client-portal/documents/1", headers=admin_token_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_list_client_messages(client: TestClient, admin_token_headers):
    response = client.get("/api/client-portal/messages/1", headers=admin_token_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
