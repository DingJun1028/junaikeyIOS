import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * 永恆刻印師 - Eternal Engraver Agent
 * 負責創建和管理事件卡的智能代理
 */

export const eternalEngraver = functions.https.onCall(async (data, context) => {
  const { eventType, payload, action, eventId } = data;
  const db = admin.firestore();

  try {
    if (action === 'archive') {
      // 歸檔事件
      await db.collection('networkEvents').doc(eventId).update({
        status: 'archived',
        archivedAt: admin.firestore.FieldValue.serverTimestamp(),
        archivedBy: context.auth?.uid || 'system'
      });

      await updateAgentStatus('eternalEngraver', 'active', `Archived event: ${eventId}`);

      return { 
        status: 'success', 
        message: 'Event archived successfully.',
        eventId 
      };
    } else {
      // 創建新事件卡
      const eventCard = {
        type: eventType,
        agentId: 'eternalEngraver',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        payload: {
          ...payload,
          creator: context.auth?.uid || 'system',
          urgency: calculateEventUrgency(eventType),
          impact: calculateEventImpact(eventType, payload)
        },
        status: 'pending',
        metadata: {
          createdBy: 'eternalEngraver',
          version: '1.0',
          tags: generateEventTags(eventType, payload)
        }
      };

      const docRef = await db.collection('networkEvents').add(eventCard);

      // 如果是高優先級事件，觸發即時通知
      if (eventCard.payload.urgency === 'high') {
        await triggerUrgentNotification(docRef.id, eventCard);
      }

      // 更新事件統計
      await updateEventStatistics(eventType);

      await updateAgentStatus('eternalEngraver', 'active', `Created ${eventType} event`);

      return { 
        status: 'success', 
        message: 'Event card created successfully.',
        eventId: docRef.id,
        eventCard
      };
    }
  } catch (error) {
    console.error('Eternal Engraver Error:', error);
    
    const errorCard = {
      type: 'engraver_error',
      agentId: 'eternalEngraver',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      payload: { 
        error: error.message,
        eventType,
        action: action || 'create'
      },
      status: 'failed'
    };
    await db.collection('networkEvents').add(errorCard);

    await updateAgentStatus('eternalEngraver', 'error', `Error: ${error.message}`);

    return { 
      status: 'error', 
      message: 'Failed to process event.',
      error: error.message 
    };
  }
});

/**
 * 事件卡觸發器 - 監聽特定集合的變化
 */
export const eventCardTrigger = functions.firestore
  .document('blueprints/{blueprintId}')
  .onWrite(async (change, context) => {
    const db = admin.firestore();
    
    try {
      const blueprintId = context.params.blueprintId;
      const before = change.before.exists ? change.before.data() : null;
      const after = change.after.exists ? change.after.data() : null;

      let eventType = '';
      let payload = {};

      if (!before && after) {
        // 新建藍圖
        eventType = 'blueprint_created';
        payload = {
          blueprintId,
          blueprintName: after.name,
          creator: after.createdBy || 'unknown'
        };
      } else if (before && after) {
        // 藍圖更新
        if (before.status !== after.status) {
          eventType = 'blueprint_status_changed';
          payload = {
            blueprintId,
            blueprintName: after.name,
            oldStatus: before.status,
            newStatus: after.status
          };
        }
      } else if (before && !after) {
        // 藍圖刪除
        eventType = 'blueprint_deleted';
        payload = {
          blueprintId,
          blueprintName: before.name,
          deletedBy: 'unknown'
        };
      }

      if (eventType) {
        const eventCard = {
          type: eventType,
          agentId: 'eternalEngraver-trigger',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          payload,
          status: 'auto-generated',
          metadata: {
            triggeredBy: 'firestore_trigger',
            source: 'blueprints_collection'
          }
        };

        await db.collection('networkEvents').add(eventCard);
      }
    } catch (error) {
      console.error('Event Card Trigger Error:', error);
    }
  });

/**
 * 計算事件緊急度
 */
function calculateEventUrgency(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
  const urgencyMap: { [key: string]: 'low' | 'medium' | 'high' | 'critical' } = {
    'system_error': 'critical',
    'security_breach': 'critical',
    'data_corruption': 'high',
    'blueprint_failed': 'high',
    'agent_offline': 'medium',
    'blueprint_created': 'low',
    'user_action': 'low',
    'data_sync': 'low'
  };

  return urgencyMap[eventType] || 'medium';
}

/**
 * 計算事件影響度
 */
function calculateEventImpact(eventType: string, payload: any): 'minimal' | 'moderate' | 'significant' | 'critical' {
  // 基於事件類型和載荷計算影響度
  if (eventType.includes('error') || eventType.includes('failed')) {
    return 'significant';
  }
  
  if (eventType.includes('created') || eventType.includes('updated')) {
    return 'moderate';
  }
  
  return 'minimal';
}

/**
 * 生成事件標籤
 */
function generateEventTags(eventType: string, payload: any): string[] {
  const tags: string[] = [];
  
  // 基於事件類型添加標籤
  if (eventType.includes('blueprint')) tags.push('blueprint');
  if (eventType.includes('agent')) tags.push('agent');
  if (eventType.includes('error')) tags.push('error');
  if (eventType.includes('system')) tags.push('system');
  if (eventType.includes('user')) tags.push('user');
  
  // 基於載荷添加標籤
  if (payload.creator) tags.push('user-generated');
  if (payload.automated) tags.push('automated');
  
  return tags;
}

/**
 * 觸發緊急通知
 */
async function triggerUrgentNotification(eventId: string, eventCard: any) {
  const db = admin.firestore();
  
  const notification = {
    eventId,
    type: 'urgent',
    title: `緊急事件: ${eventCard.type}`,
    message: `事件 ${eventId} 需要立即處理`,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    status: 'pending',
    priority: 'high'
  };
  
  await db.collection('notifications').add(notification);
}

/**
 * 更新事件統計
 */
async function updateEventStatistics(eventType: string) {
  const db = admin.firestore();
  
  const statsRef = db.collection('eventStatistics').doc('summary');
  
  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(statsRef);
    
    if (!doc.exists) {
      transaction.set(statsRef, {
        totalEvents: 1,
        eventsByType: { [eventType]: 1 },
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      const data = doc.data();
      const totalEvents = (data?.totalEvents || 0) + 1;
      const eventsByType = { ...(data?.eventsByType || {}) };
      eventsByType[eventType] = (eventsByType[eventType] || 0) + 1;
      
      transaction.update(statsRef, {
        totalEvents,
        eventsByType,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });
}

/**
 * 更新代理狀態
 */
async function updateAgentStatus(agentId: string, status: string, currentTask?: string) {
  const db = admin.firestore();
  
  await db.collection('agentStatus').doc(agentId).set({
    id: agentId,
    name: '永恆刻印師',
    status,
    lastActivity: admin.firestore.FieldValue.serverTimestamp(),
    currentTask: currentTask || null
  }, { merge: true });
}