import { apiClient } from './apiClient';

export interface DocumentFolder {
  id: number;
  folder_name: string;
  parent_id: number | null;
}

export interface DocumentTag {
  id: number;
  tag_name: string;
  tag_color: string;
}

export interface Document {
  id: number;
  file_name: string;
  document_type: string;
  mime_type: string;
  uploaded_by: string;
  uploaded_on: string;
}

class DocumentService {
  async getFolders(companyId: number) {
    const response = await apiClient.get<DocumentFolder[]>(`/documents/folders/${companyId}`);
    return response.data;
  }

  async createFolder(data: any) {
    const response = await apiClient.post<DocumentFolder>('/documents/folders', data);
    return response.data;
  }

  async getTags(companyId: number) {
    const response = await apiClient.get<DocumentTag[]>(`/documents/tags/${companyId}`);
    return response.data;
  }

  async createTag(data: any) {
    const response = await apiClient.post<DocumentTag>('/documents/tags', data);
    return response.data;
  }

  async uploadDocument(companyId: number, documentType: string, file: File, onUploadProgress?: (progressEvent: any) => void) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<Document>(
      `/documents/upload?company_id=${companyId}&document_type=${documentType}`,
      formData,
      {
        onUploadProgress
      }
    );
    return response.data;
  }

  async getDocuments(companyId: number) {
    const response = await apiClient.get<Document[]>(`/documents/${companyId}`);
    return response.data;
  }

  async searchDocuments(companyId: number, query: string) {
    const response = await apiClient.get<Document[]>(`/documents/search/${companyId}?q=${query}`);
    return response.data;
  }

  async downloadDocument(documentId: number) {
    const response = await apiClient.get(`/documents/download/${documentId}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `document_${documentId}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async getOCRLogs(documentId: number) {
    const response = await apiClient.get(`/documents/ocr/logs/${documentId}`);
    return response.data;
  }

  async extractOCR(documentId: number, extractionType: string = 'invoice') {
    const response = await apiClient.post('/documents/ocr/extract', {
      document_id: documentId,
      extraction_type: extractionType,
      provider: 'local'
    });
    return response.data;
  }
}

export default new DocumentService();
