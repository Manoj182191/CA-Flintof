import pytest
from fastapi.testclient import TestClient

def test_list_document_folders(client: TestClient, admin_token_headers):
    # Depending on setup, assuming company_id 1 exists
    response = client.get("/api/documents/folders/1", headers=admin_token_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_list_document_tags(client: TestClient, admin_token_headers):
    response = client.get("/api/documents/tags/1", headers=admin_token_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_list_documents(client: TestClient, admin_token_headers):
    response = client.get("/api/documents/1", headers=admin_token_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_search_documents(client: TestClient, admin_token_headers):
    response = client.get("/api/documents/search/1?q=test", headers=admin_token_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
