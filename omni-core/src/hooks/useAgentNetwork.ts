import { useState, useEffect } from 'react';
import { orderBy } from 'firebase/firestore';
import { useFirestore } from './useFirestore';
import * as agentAPI from '../api/agentApi';

/**
 * 代理網絡 Hook - Agent Network Hook
 * 管理智能代理網絡的狀態和操作
 */

export interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'processing' | 'error';
  lastActivity: Date;
  currentTask?: string;
}

export interface NetworkEvent {
  id: string;
  type: string;
  agentId: string;
  timestamp: Date;
  payload: any;
  status: 'pending' | 'completed' | 'failed';
}

export const useAgentNetwork = () => {
  const [networkStatus, setNetworkStatus] = useState<'connected' | 'disconnected' | 'syncing'>('disconnected');
  const [activeAgents, setActiveAgents] = useState<AgentStatus[]>([]);
  
  // 監聽代理狀態
  const { data: agentStatusData } = useFirestore('agentStatus');
  
  // 監聽網絡事件
  const { data: networkEvents } = useFirestore('networkEvents', [
    orderBy('timestamp', 'desc')
  ]);

  useEffect(() => {
    if (agentStatusData) {
      const agents = agentStatusData.map(agent => ({
        id: agent.id,
        name: agent.name,
        status: agent.status,
        lastActivity: agent.lastActivity?.toDate() || new Date(),
        currentTask: agent.currentTask
      }));
      setActiveAgents(agents);
      
      // 判斷網絡狀態
      const activeCount = agents.filter(agent => agent.status === 'active').length;
      setNetworkStatus(activeCount > 0 ? 'connected' : 'disconnected');
    }
  }, [agentStatusData]);

  /**
   * 激活創世編織者
   */
  const activateGenesisWeaver = async (blueprintName: string, initialData: any) => {
    try {
      setNetworkStatus('syncing');
      const result = await agentAPI.genesisWeaverAPI.createBlueprint(blueprintName, initialData);
      return result;
    } catch (error) {
      console.error('Failed to activate Genesis Weaver:', error);
      throw error;
    }
  };

  /**
   * 觸發混沌提純
   */
  const triggerChaosRefiner = async (rawData: any) => {
    try {
      const result = await agentAPI.chaosRefinerAPI.refineData(rawData);
      return result;
    } catch (error) {
      console.error('Failed to trigger Chaos Refiner:', error);
      throw error;
    }
  };

  /**
   * 創建事件卡
   */
  const createEventCard = async (eventType: string, payload: any) => {
    try {
      const result = await agentAPI.eternalEngraverAPI.createEventCard(eventType, payload);
      return result;
    } catch (error) {
      console.error('Failed to create event card:', error);
      throw error;
    }
  };

  /**
   * 智慧融合
   */
  const synthesizeWisdom = async (sources: string[]) => {
    try {
      const result = await agentAPI.wisdomSynthesizerAPI.synthesizeKnowledge(sources);
      return result;
    } catch (error) {
      console.error('Failed to synthesize wisdom:', error);
      throw error;
    }
  };

  /**
   * 獲取網絡統計
   */
  const getNetworkStats = () => {
    const totalAgents = activeAgents.length;
    const activeCount = activeAgents.filter(agent => agent.status === 'active').length;
    const processingCount = activeAgents.filter(agent => agent.status === 'processing').length;
    const errorCount = activeAgents.filter(agent => agent.status === 'error').length;

    return {
      totalAgents,
      activeCount,
      processingCount,
      errorCount,
      networkHealth: totalAgents > 0 ? (activeCount / totalAgents) * 100 : 0
    };
  };

  return {
    networkStatus,
    activeAgents,
    networkEvents: networkEvents || [],
    activateGenesisWeaver,
    triggerChaosRefiner,
    createEventCard,
    synthesizeWisdom,
    getNetworkStats
  };
};