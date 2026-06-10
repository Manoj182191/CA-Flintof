import { apiClient } from './apiClient';

class ClientPortalService {
  async getDashboard(clientId: number) {
    const response = await apiClient.get(`/client-portal/dashboard/${clientId}`);
    return response.data;
  }

  async getDocuments(clientId: number) {
    const response = await apiClient.get(`/client-portal/documents/${clientId}`);
    return response.data;
  }

  async getMessages(clientId: number) {
    const response = await apiClient.get(`/client-portal/messages/${clientId}`);
    return response.data;
  }

  async sendMessage(data: any) {
    const response = await apiClient.post(`/client-portal/messages`, data);
    return response.data;
  }

  async getNotifications(clientId: number) {
    const response = await apiClient.get(`/client-portal/notifications/${clientId}`);
    return response.data;
  }
}

export default new ClientPortalService();
