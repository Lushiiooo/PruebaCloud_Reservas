import axios from 'axios';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private readonly client: any;
  private readonly baseURL = '/api/reservas/';
  private readonly tokenKey = 'auth_token';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
      withCredentials: true,
    });

    // Agregar interceptor para incluir token en cada request
    this.client.interceptors.request.use((config: any) => {
      const token = localStorage.getItem(this.tokenKey);
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response: any) => response,
      (error: any) => this.handleError(error)
    );
  }

  private handleError(error: any): Promise<never> {
    let errorMessage = 'Error desconocido en la solicitud';
    let errorDetails: any = {};

    if (error.response) {
      errorDetails = error.response.data;
      errorMessage = error.response.data?.message || 
                    error.response.data?.detail ||
                    error.response.statusText || 
                    `Error ${error.response.status}`;
      // Si hay errores de validación (dict), incluirlos
      if (typeof error.response.data === 'object' && error.response.data !== null) {
        const keys = Object.keys(error.response.data);
        if (keys.length > 0 && typeof error.response.data[keys[0]] === 'string') {
          errorMessage = `${error.response.status}: ${keys.map(k => `${k}: ${error.response.data[k]}`).join(', ')}`;
        }
      }
    } else if (error.request) {
      errorMessage = 'Sin respuesta del servidor';
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('🔴 API Error:', { message: errorMessage, details: errorDetails, error });
    return Promise.reject(new Error(errorMessage));
  }

  // Guardar token en localStorage
  private setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  // Obtener token de localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Limpiar token
  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  async getMesas(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('mesas/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async getMesasDisponibles(fecha: string, hora: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('mesas/disponibles/', {
        params: { fecha, hora },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async getMesa(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get(`mesas/${id}/`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async createMesa(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post('mesas/', data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async updateMesa(id: number, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.patch(`mesas/${id}/`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async deleteMesa(id: number): Promise<ApiResponse<void>> {
    try {
      await this.client.delete(`mesas/${id}/`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  // Métodos para Horarios del Restaurante
  async getHorarios(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('horarios/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async getHorarioHoy(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('horarios/hoy/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async updateHorario(id: number, data: any): Promise<ApiResponse<any>> {
    try {
      console.log(`📨 PUT /horarios/${id}/ with data:`, data);
      const response = await this.client.patch(`horarios/${id}/`, data);
      console.log(`✅ PUT /horarios/${id}/ success:`, response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      let errorMessage = (error as Error).message;
      if (error?.response?.data) {
        console.error(`🔴 Server error response:`, error.response.data);
        // Convertir objeto de errores en string legible
        if (typeof error.response.data === 'object') {
          const errorObj = error.response.data;
          const errorLines = Object.entries(errorObj)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join(' | ');
          errorMessage = errorLines || JSON.stringify(error.response.data);
        } else {
          errorMessage = String(error.response.data);
        }
      }
      console.error(`❌ PUT /horarios/${id}/ failed:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async deleteHorario(id: number): Promise<ApiResponse<void>> {
    try {
      await this.client.delete(`horarios/${id}/`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async getReservas(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('reservas/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async getReserva(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get(`reservas/${id}/`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async createReserva(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post('reservas/', data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async updateReserva(id: number, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.patch(`reservas/${id}/`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async deleteReserva(id: number): Promise<ApiResponse<void>> {
    try {
      await this.client.delete(`reservas/${id}/`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  // Métodos para Menú
  async getMenu(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('menu/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async getMenuPorCategoria(categoria: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('menu/por_categoria/', {
        params: { categoria },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async createMenuItem(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post('menu/', data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async updateMenuItem(id: number, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.patch(`menu/${id}/`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async deleteMenuItem(id: number): Promise<ApiResponse<void>> {
    try {
      await this.client.delete(`menu/${id}/`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  // Métodos para Órdenes
  async getOrdenes(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('ordenes/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async getOrden(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get(`ordenes/${id}/`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async createOrden(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post('ordenes/', data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async agregarItemsOrden(ordenId: number, items: any[]): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post(`ordenes/${ordenId}/agregar_items/`, {
        items,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async cambiarEstadoOrden(id: number, estado: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post(`ordenes/${id}/cambiar_estado/`, {
        estado,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async updateOrden(id: number, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.patch(`ordenes/${id}/`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async deleteOrden(id: number): Promise<ApiResponse<void>> {
    try {
      await this.client.delete(`ordenes/${id}/`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  // ========== AUTENTICACIÓN ==========
  
  async login(username: string, password: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post('auth/login/', {
        username,
        password,
      });
      
      // Guardar token si viene en la respuesta
      if (response.data.token) {
        this.setToken(response.data.token);
        console.log('✅ Token guardado en localStorage');
      }
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      await this.client.get('auth/logout/');
      // Limpiar token
      this.clearToken();
      console.log('✅ Token eliminado de localStorage');
      return {
        success: true,
      };
    } catch (error) {
      // Limpiar token incluso si hay error
      this.clearToken();
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('auth/me/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

}

export const apiClient = new ApiClient();
