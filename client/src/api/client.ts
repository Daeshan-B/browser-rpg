import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = '/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth interceptor
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Load token from storage
    this.loadToken();
  }

  private loadToken(): void {
    const stored = localStorage.getItem('token');
    if (stored) {
      this.token = stored;
    }
  }

  private saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Auth endpoints
  async register(username: string, email: string, password: string) {
    const response = await this.client.post('/auth/register', {
      username,
      email,
      password
    });
    
    if (response.data.token) {
      this.saveToken(response.data.token);
    }
    
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password
    });
    
    if (response.data.token) {
      this.saveToken(response.data.token);
    }
    
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // World endpoints
  async getWorldInfo() {
    const response = await this.client.get('/world/info');
    return response.data;
  }

  async getChunk(x: number, y: number) {
    const response = await this.client.get('/world/chunk', {
      params: { x, y }
    });
    return response.data;
  }

  async getTile(x: number, y: number) {
    const response = await this.client.get('/world/tile', {
      params: { x, y }
    });
    return response.data;
  }

  async getSpawnZones() {
    const response = await this.client.get('/world/spawn-zones');
    return response.data;
  }

  // Nation endpoints
  async createNation(name: string, color: string, spawnX: number, spawnY: number) {
    const response = await this.client.post('/nation/', {
      name,
      color,
      spawnX,
      spawnY
    });
    return response.data;
  }

  async getMyNations() {
    const response = await this.client.get('/nation/my-nations');
    return response.data;
  }

  async getNation(id: string) {
    const response = await this.client.get(`/nation/${id}`);
    return response.data;
  }

  // Action endpoints
  async queueAction(type: string, targetX: number, targetY: number, data?: any) {
    const response = await this.client.post('/actions/queue', {
      type,
      targetX,
      targetY,
      data
    });
    return response.data;
  }

  async getActionQueue() {
    const response = await this.client.get('/actions/queue');
    return response.data;
  }

  async cancelAction(id: string) {
    const response = await this.client.delete(`/actions/queue/${id}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;