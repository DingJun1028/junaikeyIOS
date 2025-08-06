import * as admin from 'firebase-admin';

// 導入所有代理
import { genesisWeaver } from './agents/genesisWeaver';
import { chaosRefiner } from './agents/chaosRefiner';
import { eternalEngraver, eventCardTrigger } from './agents/eternalEngraver';
import { wisdomSynthesizer } from './agents/wisdomSynthesizer';

// 導入所有觸發器
import { 
  cardTriggers, 
  agentStatusTrigger, 
  dataQualityMonitor,
  systemHealthMonitor,
  cleanupExpiredEvents
} from './triggers/cardTriggers';

/**
 * 萬能智典 Firebase Cloud Functions
 * Universal Wisdom System Firebase Cloud Functions
 * 
 * 這是萬能智典系統的 Firebase Cloud Functions 入口點
 * 包含所有智能代理和觸發器的完整實現
 */

// 初始化 Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// 導出所有代理函數
export {
  // 智能代理網絡
  genesisWeaver,        // 創世編織者
  chaosRefiner,         // 混沌提純師  
  eternalEngraver,      // 永恆刻印師
  wisdomSynthesizer,    // 智慧融合器
  
  // 事件觸發器
  eventCardTrigger,     // 藍圖事件觸發器
  cardTriggers,         // 卡牌觸發器
  agentStatusTrigger,   // 代理狀態觸發器
  dataQualityMonitor,   // 數據質量監控
  systemHealthMonitor,  // 系統健康監控
  cleanupExpiredEvents  // 自動清理服務
};

/**
 * 系統初始化函數
 * 用於初始化代理網絡和基礎數據
 */
export const initializeSystem = admin.firestore().collection('system').doc('init').onWrite(async (change, context) => {
  const db = admin.firestore();
  
  if (!change.before.exists && change.after.exists) {
    try {
      // 初始化代理狀態
      const agents = [
        { id: 'genesisWeaver', name: '創世編織者', status: 'inactive' },
        { id: 'chaosRefiner', name: '混沌提純師', status: 'inactive' },
        { id: 'eternalEngraver', name: '永恆刻印師', status: 'inactive' },
        { id: 'wisdomSynthesizer', name: '智慧融合器', status: 'inactive' }
      ];

      const batch = db.batch();
      
      agents.forEach(agent => {
        const ref = db.collection('agentStatus').doc(agent.id);
        batch.set(ref, {
          ...agent,
          lastActivity: admin.firestore.FieldValue.serverTimestamp(),
          currentTask: null
        });
      });

      await batch.commit();

      // 創建系統啟動事件
      const startupEvent = {
        type: 'system_initialized',
        agentId: 'system',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        payload: {
          agentCount: agents.length,
          version: '4.0',
          initializationType: 'auto'
        },
        status: 'completed',
        metadata: {
          category: 'system',
          importance: 'high'
        }
      };

      await db.collection('networkEvents').add(startupEvent);

      console.log('萬能智典系統初始化完成 - Universal Wisdom System Initialized');
    } catch (error) {
      console.error('System Initialization Error:', error);
    }
  }
});

/**
 * 系統狀態報告函數
 * 提供系統整體狀態的快照
 */
export const getSystemStatus = admin.https().onCall(async (data, context) => {
  const db = admin.firestore();
  
  try {
    // 獲取代理狀態
    const agentStatusSnapshot = await db.collection('agentStatus').get();
    const agents = agentStatusSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 獲取最近事件
    const recentEventsSnapshot = await db.collection('networkEvents')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    const recentEvents = recentEventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 獲取藍圖統計
    const blueprintsSnapshot = await db.collection('blueprints').get();
    const blueprintStats = {
      total: blueprintsSnapshot.size,
      active: blueprintsSnapshot.docs.filter(doc => doc.data().status === 'active').length,
      draft: blueprintsSnapshot.docs.filter(doc => doc.data().status === 'draft').length
    };

    // 獲取智慧卡統計
    const wisdomSnapshot = await db.collection('wisdomCards').get();
    const wisdomStats = {
      total: wisdomSnapshot.size,
      averageQuality: wisdomSnapshot.docs.reduce((sum, doc) => sum + (doc.data().quality || 0), 0) / wisdomSnapshot.size || 0
    };

    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      agents,
      recentEvents,
      blueprintStats,
      wisdomStats,
      systemHealth: calculateSystemHealth(agents)
    };
  } catch (error) {
    console.error('Get System Status Error:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
});

/**
 * 計算系統健康度
 */
function calculateSystemHealth(agents: any[]) {
  if (agents.length === 0) return { score: 0, status: 'unknown' };
  
  const activeCount = agents.filter(agent => agent.status === 'active').length;
  const errorCount = agents.filter(agent => agent.status === 'error').length;
  
  const healthScore = ((activeCount - errorCount) / agents.length) * 100;
  
  let status = 'healthy';
  if (healthScore < 50) status = 'critical';
  else if (healthScore < 80) status = 'degraded';
  
  return {
    score: Math.max(0, healthScore),
    status,
    activeAgents: activeCount,
    totalAgents: agents.length,
    errorAgents: errorCount
  };
}