import { useState, useCallback } from 'react';
import { useFirestoreOperations } from './useFirestore';
import { createCapacitiesClient, defaultCapacitiesApiConfig, checkCapacitiesApiAvailability } from '../api/capacitiesApi';

/**
 * Capacities 智典 Hook - Capacities Knowledge Base Hook
 * 管理 Capacities 知識庫的訪問和集成
 */

export interface CapacitiesConfig {
  baseUrl: string;
  workspaceId: string;
  pageId?: string;
  apiKey?: string;
}

export interface CapacitiesEntry {
  id: string;
  title: string;
  content?: string;
  url: string;
  type: 'note' | 'object' | 'template';
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const useCapacities = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<CapacitiesEntry[]>([]);
  
  const { addDocument } = useFirestoreOperations('capacitiesEntries');

  // Capacities 配置 - 從 issue 中獲取的 URL
  const defaultConfig: CapacitiesConfig = {
    baseUrl: 'https://app.capacities.io',
    workspaceId: '48460089-fa48-4eb4-8910-bb35cdfabac4',
    pageId: '1f2e2aba-1228-41e8-a473-607614fb29f7'
  };

  /**
   * 獲取 Capacities 完整 URL
   */
  const getCapacitiesUrl = useCallback((config?: Partial<CapacitiesConfig>) => {
    const finalConfig = { ...defaultConfig, ...config };
    if (finalConfig.pageId) {
      return `${finalConfig.baseUrl}/${finalConfig.workspaceId}/${finalConfig.pageId}`;
    }
    return `${finalConfig.baseUrl}/${finalConfig.workspaceId}`;
  }, []);

  /**
   * 獲取嵌入式 URL (用於 iframe)
   */
  const getEmbedUrl = useCallback((config?: Partial<CapacitiesConfig>) => {
    const baseUrl = getCapacitiesUrl(config);
    // 添加嵌入模式參數 (如果 Capacities 支持)
    return `${baseUrl}?embed=true&hide_header=true`;
  }, [getCapacitiesUrl]);

  /**
   * 嘗試從 Capacities API 獲取數據 (如果有 API 支持)
   */
  const fetchCapacitiesData = useCallback(async (config?: Partial<CapacitiesConfig>) => {
    setLoading(true);
    setError(null);

    try {
      const finalConfig = { ...defaultConfig, ...config };
      
      // 檢查 API 是否可用
      const isApiAvailable = await checkCapacitiesApiAvailability({
        ...defaultCapacitiesApiConfig,
        apiKey: finalConfig.apiKey
      });

      if (isApiAvailable && finalConfig.apiKey) {
        // 使用 API 獲取數據
        const client = createCapacitiesClient({
          ...defaultCapacitiesApiConfig,
          apiKey: finalConfig.apiKey
        });
        
        const pagesResult = await client.getPages(10);
        if (pagesResult.success && pagesResult.data) {
          const apiEntries = (pagesResult.data as unknown[]).map((page: unknown) => {
            const pageData = page as Record<string, unknown>;
            return {
              id: pageData.id as string,
              title: (pageData.title as string) || '未命名筆記',
              content: pageData.content as string,
              url: getCapacitiesUrl({ pageId: pageData.id as string }),
              type: 'note' as const,
              tags: (pageData.tags as string[]) || ['capacities'],
              createdAt: new Date(pageData.createdAt as string),
              updatedAt: new Date(pageData.updatedAt as string)
            };
          });
          setEntries(apiEntries);
          
          // 保存到 Firebase
          for (const entry of apiEntries) {
            await addDocument(entry);
          }
          return;
        }
      }

      // 創建基本條目作為佔位符
      const basicEntry: CapacitiesEntry = {
        id: finalConfig.pageId || 'default',
        title: '萬能智典 - Capacities 知識庫',
        url: getCapacitiesUrl(finalConfig),
        type: 'note',
        tags: ['智典', '知識庫', 'capacities'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setEntries([basicEntry]);
      
      // 保存到 Firebase
      await addDocument(basicEntry);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取 Capacities 數據失敗');
    } finally {
      setLoading(false);
    }
  }, [getCapacitiesUrl, addDocument]);

  /**
   * 在新窗口中打開 Capacities
   */
  const openCapacitiesInNewTab = useCallback((config?: Partial<CapacitiesConfig>) => {
    const url = getCapacitiesUrl(config);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [getCapacitiesUrl]);

  /**
   * 檢查 Capacities 是否可訪問
   */
  const checkCapacitiesAccess = useCallback(async (config?: Partial<CapacitiesConfig>) => {
    try {
      const url = getCapacitiesUrl(config);
      await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      return true; // 如果沒有拋出異常，說明可以訪問
    } catch (error) {
      console.warn('Capacities access check failed:', error);
      return false;
    }
  }, [getCapacitiesUrl]);

  return {
    loading,
    error,
    entries,
    config: defaultConfig,
    getCapacitiesUrl,
    getEmbedUrl,
    fetchCapacitiesData,
    openCapacitiesInNewTab,
    checkCapacitiesAccess
  };
};