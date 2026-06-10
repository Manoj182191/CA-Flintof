import pytest
from fastapi.testclient import TestClient

def test_list_integrations(client: TestClient, admin_token_headers):
    response = client.get("/api/gov/integrations/1", headers=admin_token_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_test_integration_not_found(client: TestClient, admin_token_headers):
    response = client.post("/api/gov/test/9999", headers=admin_token_headers)
    assert response.status_code == 404
