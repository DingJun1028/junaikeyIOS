"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredEvents = exports.systemHealthMonitor = exports.dataQualityMonitor = exports.agentStatusTrigger = exports.cardTriggers = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
/**
 * 萬能觸發器系統 - Universal Trigger System
 * 處理各種 Firestore 事件的觸發器
 */
// 初始化 Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}
/**
 * 卡牌觸發器 - 監聽卡牌集合的變化
 */
exports.cardTriggers = functions.firestore
    .document('wisdomCards/{cardId}')
    .onWrite(async (change, context) => {
    const db = admin.firestore();
    try {
        const cardId = context.params.cardId;
        const before = change.before.exists ? change.before.data() : null;
        const after = change.after.exists ? change.after.data() : null;
        let eventType = '';
        let payload = {};
        if (!before && after) {
            // 新建智慧卡
            eventType = 'wisdom_card_created';
            payload = {
                cardId,
                title: after.title,
                categories: after.categories || [],
                quality: after.quality || 0
            };
        }
        else if (before && after) {
            // 智慧卡更新
            if (before.quality !== after.quality) {
                eventType = 'wisdom_card_quality_updated';
                payload = {
                    cardId,
                    title: after.title,
                    oldQuality: before.quality,
                    newQuality: after.quality
                };
            }
        }
        else if (before && !after) {
            // 智慧卡刪除
            eventType = 'wisdom_card_deleted';
            payload = {
                cardId,
                title: before.title
            };
        }
        if (eventType) {
            const eventCard = {
                type: eventType,
                agentId: 'cardTrigger',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                payload,
                status: 'auto-generated',
                metadata: {
                    triggeredBy: 'firestore_trigger',
                    source: 'wisdom_cards_collection'
                }
            };
            await db.collection('networkEvents').add(eventCard);
        }
    }
    catch (error) {
        console.error('Card Trigger Error:', error);
    }
});
/**
 * 代理狀態觸發器 - 監聽代理狀態變化
 */
exports.agentStatusTrigger = functions.firestore
    .document('agentStatus/{agentId}')
    .onWrite(async (change, context) => {
    const db = admin.firestore();
    try {
        const agentId = context.params.agentId;
        const before = change.before.exists ? change.before.data() : null;
        const after = change.after.exists ? change.after.data() : null;
        if (before && after && before.status !== after.status) {
            // 代理狀態變化
            const eventCard = {
                type: 'agent_status_changed',
                agentId: 'statusMonitor',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                payload: {
                    agentId,
                    agentName: after.name,
                    oldStatus: before.status,
                    newStatus: after.status,
                    currentTask: after.currentTask
                },
                status: 'auto-generated',
                metadata: {
                    triggeredBy: 'agent_status_trigger',
                    urgency: after.status === 'error' ? 'high' : 'low'
                }
            };
            await db.collection('networkEvents').add(eventCard);
            // 如果代理進入錯誤狀態，觸發自動恢復
            if (after.status === 'error') {
                await triggerAgentRecovery(agentId, after);
            }
        }
    }
    catch (error) {
        console.error('Agent Status Trigger Error:', error);
    }
});
/**
 * 數據品質監控觸發器
 */
exports.dataQualityMonitor = functions.firestore
    .document('dataRefinements/{refinementId}')
    .onCreate(async (snap, context) => {
    const db = admin.firestore();
    try {
        const refinementData = snap.data();
        const qualityScore = refinementData.qualityScore || 0;
        // 如果數據質量低於閾值，觸發警報
        if (qualityScore < 60) {
            const alertCard = {
                type: 'data_quality_alert',
                agentId: 'qualityMonitor',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                payload: {
                    refinementId: context.params.refinementId,
                    qualityScore,
                    threshold: 60,
                    recommendation: 'Review data source and refinement process'
                },
                status: 'alert',
                metadata: {
                    urgency: 'medium',
                    category: 'data_quality'
                }
            };
            await db.collection('networkEvents').add(alertCard);
        }
    }
    catch (error) {
        console.error('Data Quality Monitor Error:', error);
    }
});
/**
 * 系統健康監控觸發器
 */
exports.systemHealthMonitor = functions.pubsub
    .schedule('every 5 minutes')
    .onRun(async (context) => {
    const db = admin.firestore();
    try {
        // 檢查代理狀態
        const agentStatusSnapshot = await db.collection('agentStatus').get();
        const agents = agentStatusSnapshot.docs.map(doc => doc.data());
        const healthMetrics = {
            totalAgents: agents.length,
            activeAgents: agents.filter(agent => agent.status === 'active').length,
            errorAgents: agents.filter(agent => agent.status === 'error').length,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };
        // 計算系統健康度
        const healthScore = healthMetrics.totalAgents > 0
            ? (healthMetrics.activeAgents / healthMetrics.totalAgents) * 100
            : 0;
        await db.collection('systemHealth').add({
            ...healthMetrics,
            healthScore,
            status: healthScore > 80 ? 'healthy' : healthScore > 60 ? 'degraded' : 'critical'
        });
        // 如果系統健康度低，創建警報事件
        if (healthScore < 70) {
            const alertCard = {
                type: 'system_health_alert',
                agentId: 'healthMonitor',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                payload: {
                    healthScore,
                    totalAgents: healthMetrics.totalAgents,
                    activeAgents: healthMetrics.activeAgents,
                    errorAgents: healthMetrics.errorAgents
                },
                status: 'alert',
                metadata: {
                    urgency: healthScore < 50 ? 'critical' : 'high',
                    category: 'system_health'
                }
            };
            await db.collection('networkEvents').add(alertCard);
        }
    }
    catch (error) {
        console.error('System Health Monitor Error:', error);
    }
});
/**
 * 自動清理過期事件
 */
exports.cleanupExpiredEvents = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
    const db = admin.firestore();
    try {
        // 刪除30天前的事件
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const expiredEventsQuery = db.collection('networkEvents')
            .where('timestamp', '<', thirtyDaysAgo)
            .limit(500); // 每次處理500個
        const snapshot = await expiredEventsQuery.get();
        if (!snapshot.empty) {
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            // 記錄清理事件
            const cleanupCard = {
                type: 'cleanup_completed',
                agentId: 'cleanupService',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                payload: {
                    deletedCount: snapshot.docs.length,
                    cutoffDate: thirtyDaysAgo.toISOString()
                },
                status: 'completed',
                metadata: {
                    automated: true,
                    category: 'maintenance'
                }
            };
            await db.collection('networkEvents').add(cleanupCard);
        }
    }
    catch (error) {
        console.error('Cleanup Error:', error);
    }
});
/**
 * 觸發代理恢復
 */
async function triggerAgentRecovery(agentId, agentData) {
    const db = admin.firestore();
    try {
        // 記錄恢復嘗試
        const recoveryAttempt = {
            agentId,
            agentName: agentData.name,
            error: agentData.currentTask,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'attempting_recovery'
        };
        await db.collection('recoveryAttempts').add(recoveryAttempt);
        // 重置代理狀態為待命
        await db.collection('agentStatus').doc(agentId).update({
            status: 'inactive',
            currentTask: null,
            lastRecovery: admin.firestore.FieldValue.serverTimestamp()
        });
        // 創建恢復事件
        const recoveryCard = {
            type: 'agent_recovery_initiated',
            agentId: 'recoveryService',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            payload: {
                targetAgentId: agentId,
                targetAgentName: agentData.name,
                recoveryMethod: 'auto_reset'
            },
            status: 'completed',
            metadata: {
                automated: true,
                category: 'recovery'
            }
        };
        await db.collection('networkEvents').add(recoveryCard);
    }
    catch (error) {
        console.error('Agent Recovery Error:', error);
    }
}
//# sourceMappingURL=cardTriggers.js.map