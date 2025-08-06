import { callAgent } from './firebaseRuneSystem';

/**
 * 代理網絡 API - Agent Network API
 * 統一管理所有智能代理的接口
 */

export interface AgentResponse {
  status: 'success' | 'error';
  message: string;
  data?: any;
}

/**
 * 創世編織者 - Genesis Weaver
 */
export const genesisWeaverAPI = {
  createBlueprint: async (name: string, data: any): Promise<AgentResponse> => {
    return await callAgent('genesisWeaver', { blueprintName: name, initialData: data }) as AgentResponse;
  },
  
  activateBlueprint: async (blueprintId: string): Promise<AgentResponse> => {
    return await callAgent('genesisWeaver', { action: 'activate', blueprintId }) as AgentResponse;
  }
};

/**
 * 混沌提純師 - Chaos Refiner
 */
export const chaosRefinerAPI = {
  refineData: async (rawData: any): Promise<AgentResponse> => {
    return await callAgent('chaosRefiner', { rawData }) as AgentResponse;
  },
  
  purifyErrors: async (errorLog: string): Promise<AgentResponse> => {
    return await callAgent('chaosRefiner', { action: 'purify', errorLog }) as AgentResponse;
  }
};

/**
 * 永恆刻印師 - Eternal Engraver
 */
export const eternalEngraverAPI = {
  createEventCard: async (eventType: string, payload: any): Promise<AgentResponse> => {
    return await callAgent('eternalEngraver', { eventType, payload }) as AgentResponse;
  },
  
  archiveEvent: async (eventId: string): Promise<AgentResponse> => {
    return await callAgent('eternalEngraver', { action: 'archive', eventId }) as AgentResponse;
  }
};

/**
 * 智慧融合器 - Wisdom Synthesizer
 */
export const wisdomSynthesizerAPI = {
  synthesizeKnowledge: async (sources: string[]): Promise<AgentResponse> => {
    return await callAgent('wisdomSynthesizer', { sources }) as AgentResponse;
  },
  
  generateInsights: async (data: any): Promise<AgentResponse> => {
    return await callAgent('wisdomSynthesizer', { action: 'insights', data }) as AgentResponse;
  }
};