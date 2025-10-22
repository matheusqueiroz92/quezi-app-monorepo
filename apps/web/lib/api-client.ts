import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import Cookies from "js-cookie";

/**
 * Cliente HTTP configurado com interceptors e tratamento de erros
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api/v1";

// Criar instância do Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de Request - Adicionar token de autenticação
apiClient.interceptors.request.use(
  (config) => {
    // Pegar token do cookie
    const token = Cookies.get("auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response - Tratamento de erros
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Tratamento de erros específicos
    if (error.response) {
      const status = error.response.status;

      // 401 - Não autenticado
      if (status === 401) {
        Cookies.remove("auth_token");

        // Redirecionar para login apenas se não estiver em páginas públicas
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login")
        ) {
          window.location.href = "/login";
        }
      }

      // 403 - Sem permissão
      if (status === 403) {
        console.error("Acesso negado");
      }

      // 500 - Erro do servidor
      if (status >= 500) {
        console.error("Erro no servidor");
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Interface para respostas paginadas
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Interface para erros da API
 */
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

/**
 * Helper para fazer requisições GET
 */
export const get = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.get<T>(url, config);
  return response.data;
};

/**
 * Helper para fazer requisições POST
 */
export const post = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
};

/**
 * Helper para fazer requisições PUT
 */
export const put = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
};

/**
 * Helper para fazer requisições PATCH
 */
export const patch = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
};

/**
 * Helper para fazer requisições DELETE
 */
export const del = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
};

/**
 * Helper para extrair mensagem de erro da API
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    return apiError?.message || error.message || "Erro desconhecido";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro desconhecido";
};

/**
 * Helper para fazer upload de arquivos
 */
export const uploadFile = async (
  url: string,
  file: File,
  fieldName: string = "file",
  onProgress?: (progress: number) => void
): Promise<any> => {
  const formData = new FormData();
  formData.append(fieldName, file);

  const response = await apiClient.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(progress);
      }
    },
  });

  return response.data;
};

export default apiClient;
