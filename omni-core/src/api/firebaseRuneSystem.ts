import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * 萬能符文系統 - Universal Rune System
 * 與 Firebase Cloud Functions 溝通的核心橋樑
 */
export const callAgent = async (agentName: string, payload: any) => {
  const functions = getFunctions();
  const callable = httpsCallable(functions, agentName);
  const result = await callable(payload);
  return result.data;
};

/**
 * 創世編織者代理 - Genesis Weaver Agent
 */
export const callGenesisWeaver = async (blueprintName: string, initialData: any) => {
  return await callAgent('genesisWeaver', { blueprintName, initialData });
};

/**
 * 事件卡觸發器 - Event Card Trigger
 */
export const triggerEventCard = async (eventType: string, payload: any) => {
  return await callAgent('eventCardTrigger', { eventType, payload });
};

/**
 * 萬能查詢代理 - Universal Query Agent
 */
export const queryUniversalData = async (queryType: string, filters: any) => {
  return await callAgent('universalQuery', { queryType, filters });
};