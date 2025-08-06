import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * 創世編織者 - Genesis Weaver Agent
 * 負責創建和激活專案藍圖的核心代理
 */

// 初始化 Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

interface GenesisWeaverRequest {
  blueprintName?: string;
  initialData?: any;
  action?: string;
  blueprintId?: string;
}

export const genesisWeaver = functions.https.onCall(async (data: GenesisWeaverRequest, context) => {
  const { blueprintName, initialData, action, blueprintId } = data;
  const db = admin.firestore();

  try {
    if (action === 'activate') {
      // 激活現有藍圖
      if (!blueprintId) {
        throw new Error('Blueprint ID is required for activation');
      }
      
      await db.collection('blueprints').doc(blueprintId).update({
        status: 'active',
        activatedAt: admin.firestore.FieldValue.serverTimestamp(),
        activatedBy: context.auth?.uid || 'system'
      });

      // 創建激活事件卡
      const eventCard = {
        type: 'blueprint_activated',
        agentId: 'genesisWeaver',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        payload: { blueprintId },
        status: 'completed'
      };
      await db.collection('networkEvents').add(eventCard);

      return { 
        status: 'success', 
        message: 'Blueprint activated successfully.',
        blueprintId 
      };
    } else {
      // 創建新藍圖
      if (!blueprintName) {
        throw new Error('Blueprint name is required');
      }

      const blueprintData = {
        name: blueprintName,
        ...initialData,
        status: 'draft',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: context.auth?.uid || 'system',
        version: '1.0',
        agentSignature: 'genesisWeaver'
      };

      const docRef = await db.collection('blueprints').add(blueprintData);

      // 觸發永恆刻印事件卡
      const eventCard = {
        type: 'blueprint_created',
        agentId: 'genesisWeaver',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        payload: { 
          blueprintId: docRef.id,
          blueprintName,
          creator: context.auth?.uid || 'system'
        },
        status: 'completed'
      };
      await db.collection('networkEvents').add(eventCard);

      // 更新代理狀態
      await updateAgentStatus('genesisWeaver', 'active', `Created blueprint: ${blueprintName}`);

      return { 
        status: 'success', 
        message: 'Blueprint created successfully.',
        blueprintId: docRef.id 
      };
    }
  } catch (error) {
    console.error('Genesis Weaver Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // 觸發混沌提純事件卡
    const errorCard = {
      type: 'chaos_detected',
      agentId: 'genesisWeaver',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      payload: { 
        error: errorMessage,
        blueprintName,
        action: action || 'create'
      },
      status: 'failed'
    };
    await db.collection('networkEvents').add(errorCard);

    await updateAgentStatus('genesisWeaver', 'error', `Error: ${errorMessage}`);

    return { 
      status: 'error', 
      message: 'Failed to process blueprint.',
      error: errorMessage 
    };
  }
});

/**
 * 更新代理狀態的輔助函數
 */
async function updateAgentStatus(agentId: string, status: string, currentTask?: string) {
  const db = admin.firestore();
  
  await db.collection('agentStatus').doc(agentId).set({
    id: agentId,
    name: getAgentName(agentId),
    status,
    lastActivity: admin.firestore.FieldValue.serverTimestamp(),
    currentTask: currentTask || null
  }, { merge: true });
}

/**
 * 獲取代理名稱的輔助函數
 */
function getAgentName(agentId: string): string {
  const agentNames: { [key: string]: string } = {
    'genesisWeaver': '創世編織者',
    'chaosRefiner': '混沌提純師',
    'eternalEngraver': '永恆刻印師',
    'wisdomSynthesizer': '智慧融合器'
  };
  
  return agentNames[agentId] || agentId;
}