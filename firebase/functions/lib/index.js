"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemStatus = exports.initializeSystem = exports.cleanupExpiredEvents = exports.systemHealthMonitor = exports.dataQualityMonitor = exports.agentStatusTrigger = exports.cardTriggers = exports.eventCardTrigger = exports.wisdomSynthesizer = exports.eternalEngraver = exports.chaosRefiner = exports.genesisWeaver = void 0;
const admin = require("firebase-admin");
// 導入所有代理
const genesisWeaver_1 = require("./agents/genesisWeaver");
Object.defineProperty(exports, "genesisWeaver", { enumerable: true, get: function () { return genesisWeaver_1.genesisWeaver; } });
const chaosRefiner_1 = require("./agents/chaosRefiner");
Object.defineProperty(exports, "chaosRefiner", { enumerable: true, get: function () { return chaosRefiner_1.chaosRefiner; } });
const eternalEngraver_1 = require("./agents/eternalEngraver");
Object.defineProperty(exports, "eternalEngraver", { enumerable: true, get: function () { return eternalEngraver_1.eternalEngraver; } });
Object.defineProperty(exports, "eventCardTrigger", { enumerable: true, get: function () { return eternalEngraver_1.eventCardTrigger; } });
const wisdomSynthesizer_1 = require("./agents/wisdomSynthesizer");
Object.defineProperty(exports, "wisdomSynthesizer", { enumerable: true, get: function () { return wisdomSynthesizer_1.wisdomSynthesizer; } });
// 導入所有觸發器
const cardTriggers_1 = require("./triggers/cardTriggers");
Object.defineProperty(exports, "cardTriggers", { enumerable: true, get: function () { return cardTriggers_1.cardTriggers; } });
Object.defineProperty(exports, "agentStatusTrigger", { enumerable: true, get: function () { return cardTriggers_1.agentStatusTrigger; } });
Object.defineProperty(exports, "dataQualityMonitor", { enumerable: true, get: function () { return cardTriggers_1.dataQualityMonitor; } });
Object.defineProperty(exports, "systemHealthMonitor", { enumerable: true, get: function () { return cardTriggers_1.systemHealthMonitor; } });
Object.defineProperty(exports, "cleanupExpiredEvents", { enumerable: true, get: function () { return cardTriggers_1.cleanupExpiredEvents; } });
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
/**
 * 系統初始化函數
 * 用於初始化代理網絡和基礎數據
 */
exports.initializeSystem = admin.firestore().collection('system').doc('init').onWrite(async (change, context) => {
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
        }
        catch (error) {
            console.error('System Initialization Error:', error);
        }
    }
});
/**
 * 系統狀態報告函數
 * 提供系統整體狀態的快照
 */
exports.getSystemStatus = admin.https().onCall(async (data, context) => {
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
    }
    catch (error) {
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
function calculateSystemHealth(agents) {
    if (agents.length === 0)
        return { score: 0, status: 'unknown' };
    const activeCount = agents.filter(agent => agent.status === 'active').length;
    const errorCount = agents.filter(agent => agent.status === 'error').length;
    const healthScore = ((activeCount - errorCount) / agents.length) * 100;
    let status = 'healthy';
    if (healthScore < 50)
        status = 'critical';
    else if (healthScore < 80)
        status = 'degraded';
    return {
        score: Math.max(0, healthScore),
        status,
        activeAgents: activeCount,
        totalAgents: agents.length,
        errorAgents: errorCount
    };
}
//# sourceMappingURL=index.js.map