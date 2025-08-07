/**
 * Capacities API 工具 - Capacities API Utilities  
 * 處理與 Capacities 服務的 API 集成
 */

export interface CapacitiesApiConfig {
  apiKey?: string;
  workspaceId: string;
  baseUrl: string;
}

export interface CapacitiesApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Capacities API 客戶端
 */
export class CapacitiesApiClient {
  private config: CapacitiesApiConfig;

  constructor(config: CapacitiesApiConfig) {
    this.config = config;
  }

  /**
   * 基礎 API 調用方法
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<CapacitiesApiResponse<T>> {
    try {
      const url = `${this.config.baseUrl}/api/${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {})
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤'
      };
    }
  }

  /**
   * 獲取工作空間資訊 (假設的 API 端點)
   */
  async getWorkspaceInfo(): Promise<CapacitiesApiResponse> {
    return this.makeRequest(`workspaces/${this.config.workspaceId}`);
  }

  /**
   * 獲取所有頁面/筆記 (假設的 API 端點)
   */
  async getPages(limit = 50, offset = 0): Promise<CapacitiesApiResponse> {
    return this.makeRequest(`workspaces/${this.config.workspaceId}/pages?limit=${limit}&offset=${offset}`);
  }

  /**
   * 獲取特定頁面內容 (假設的 API 端點)
   */
  async getPage(pageId: string): Promise<CapacitiesApiResponse> {
    return this.makeRequest(`workspaces/${this.config.workspaceId}/pages/${pageId}`);
  }

  /**
   * 搜尋內容 (假設的 API 端點)
   */
  async searchContent(query: string, limit = 20): Promise<CapacitiesApiResponse> {
    return this.makeRequest(
      `workspaces/${this.config.workspaceId}/search`,
      {
        method: 'POST',
        body: JSON.stringify({ query, limit })
      }
    );
  }

  /**
   * 創建新筆記 (假設的 API 端點)
   */
  async createNote(title: string, content: string, tags?: string[]): Promise<CapacitiesApiResponse> {
    return this.makeRequest(
      `workspaces/${this.config.workspaceId}/pages`,
      {
        method: 'POST',
        body: JSON.stringify({ title, content, tags })
      }
    );
  }

  /**
   * 更新筆記 (假設的 API 端點)
   */
  async updateNote(pageId: string, updates: Partial<{title: string, content: string, tags: string[]}>): Promise<CapacitiesApiResponse> {
    return this.makeRequest(
      `workspaces/${this.config.workspaceId}/pages/${pageId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates)
      }
    );
  }
}

/**
 * 創建 Capacities API 客戶端實例
 */
export const createCapacitiesClient = (config: CapacitiesApiConfig): CapacitiesApiClient => {
  return new CapacitiesApiClient(config);
};

/**
 * 默認的 Capacities API 配置
 */
export const defaultCapacitiesApiConfig: CapacitiesApiConfig = {
  baseUrl: 'https://app.capacities.io',
  workspaceId: '48460089-fa48-4eb4-8910-bb35cdfabac4'
};

/**
 * 檢查 Capacities API 可用性
 */
export const checkCapacitiesApiAvailability = async (config = defaultCapacitiesApiConfig): Promise<boolean> => {
  try {
    const client = createCapacitiesClient(config);
    const result = await client.getWorkspaceInfo();
    return result.success;
  } catch (error) {
    console.warn('Capacities API 不可用:', error);
    return false;
  }
};