"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wisdomSynthesizer = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
/**
 * 智慧融合器 - Wisdom Synthesizer Agent
 * 負責知識融合和智慧生成的智能代理
 */
exports.wisdomSynthesizer = functions.https.onCall(async (data, context) => {
    const { sources, action, data: analysisData } = data;
    const db = admin.firestore();
    try {
        if (action === 'insights') {
            // 生成洞察
            const insights = await generateInsights(analysisData);
            const insightRecord = {
                sourceData: analysisData,
                insights,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                generatedBy: 'wisdomSynthesizer',
                confidence: calculateConfidenceScore(insights),
                categories: categorizeInsights(insights)
            };
            const docRef = await db.collection('wisdomInsights').add(insightRecord);
            // 創建事件卡
            const eventCard = {
                type: 'wisdom_insights_generated',
                agentId: 'wisdomSynthesizer',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                payload: {
                    insightId: docRef.id,
                    insightCount: insights.length,
                    confidence: insightRecord.confidence
                },
                status: 'completed'
            };
            await db.collection('networkEvents').add(eventCard);
            await updateAgentStatus('wisdomSynthesizer', 'active', 'Generating insights');
            return {
                status: 'success',
                message: 'Insights generated successfully.',
                insights,
                insightId: docRef.id
            };
        }
        else {
            // 融合知識源
            const synthesizedWisdom = await synthesizeKnowledge(sources);
            const wisdomCard = {
                title: synthesizedWisdom.title,
                summary: synthesizedWisdom.summary,
                content: synthesizedWisdom.content,
                sources: sources,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                synthesizedBy: 'wisdomSynthesizer',
                quality: synthesizedWisdom.quality,
                categories: synthesizedWisdom.categories,
                metadata: {
                    sourceCount: sources.length,
                    synthesisMethod: 'neural_fusion',
                    confidence: synthesizedWisdom.confidence
                }
            };
            const docRef = await db.collection('wisdomCards').add(wisdomCard);
            // 創建事件卡
            const eventCard = {
                type: 'wisdom_synthesized',
                agentId: 'wisdomSynthesizer',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                payload: {
                    wisdomId: docRef.id,
                    sourceCount: sources.length,
                    quality: synthesizedWisdom.quality
                },
                status: 'completed'
            };
            await db.collection('networkEvents').add(eventCard);
            await updateAgentStatus('wisdomSynthesizer', 'active', 'Synthesizing knowledge');
            return {
                status: 'success',
                message: 'Knowledge synthesis completed.',
                wisdomCard,
                wisdomId: docRef.id
            };
        }
    }
    catch (error) {
        console.error('Wisdom Synthesizer Error:', error);
        const errorCard = {
            type: 'synthesis_error',
            agentId: 'wisdomSynthesizer',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            payload: {
                error: error.message,
                action: action || 'synthesize'
            },
            status: 'failed'
        };
        await db.collection('networkEvents').add(errorCard);
        await updateAgentStatus('wisdomSynthesizer', 'error', `Error: ${error.message}`);
        return {
            status: 'error',
            message: 'Failed to synthesize wisdom.',
            error: error.message
        };
    }
});
/**
 * 融合知識源
 */
async function synthesizeKnowledge(sources) {
    // 模擬知識融合過程
    const synthesisResult = {
        title: `融合智慧: ${sources.length}源合一`,
        summary: '通過多源知識融合生成的智慧結晶',
        content: generateSynthesizedContent(sources),
        quality: calculateWisdomQuality(sources),
        confidence: calculateSynthesisConfidence(sources),
        categories: extractCategories(sources)
    };
    return synthesisResult;
}
/**
 * 生成融合內容
 */
function generateSynthesizedContent(sources) {
    const contentSections = [
        `## 🌟 智慧融合概覽\n基於 ${sources.length} 個知識源的深度融合分析`,
        `## 🔍 核心洞察\n${generateCoreInsights(sources)}`,
        `## 💎 關鍵發現\n${generateKeyFindings(sources)}`,
        `## 🚀 實踐建議\n${generateActionableRecommendations(sources)}`,
        `## 🔗 知識連結\n${generateKnowledgeConnections(sources)}`
    ];
    return contentSections.join('\n\n');
}
/**
 * 生成核心洞察
 */
function generateCoreInsights(sources) {
    const insights = [
        '跨領域知識整合能夠產生創新性解決方案',
        '多元視角的融合有助於全面理解複雜問題',
        '知識的結構化組織能提升應用效率',
        '持續學習和更新是保持智慧活力的關鍵'
    ];
    return insights
        .slice(0, Math.min(sources.length, insights.length))
        .map((insight, index) => `${index + 1}. ${insight}`)
        .join('\n');
}
/**
 * 生成關鍵發現
 */
function generateKeyFindings(sources) {
    return sources.map((source, index) => `- **源 ${index + 1}**: ${source} 提供了獨特的 ${getRandomDomain()} 視角`).join('\n');
}
/**
 * 生成實踐建議
 */
function generateActionableRecommendations(sources) {
    const recommendations = [
        '建立跨學科學習計劃',
        '創建知識圖譜以可視化連結',
        '定期進行知識回顧和更新',
        '實踐中驗證理論洞察',
        '與專家社群保持互動'
    ];
    return recommendations
        .slice(0, sources.length)
        .map((rec, index) => `${index + 1}. ${rec}`)
        .join('\n');
}
/**
 * 生成知識連結
 */
function generateKnowledgeConnections(sources) {
    return sources.map((source, index) => `- ${source} ↔ ${sources[(index + 1) % sources.length]}: 形成創新性思維鏈`).join('\n');
}
/**
 * 獲取隨機領域
 */
function getRandomDomain() {
    const domains = ['技術', '商業', '創新', '設計', '策略', '社會', '心理學', '哲學'];
    return domains[Math.floor(Math.random() * domains.length)];
}
/**
 * 計算智慧質量
 */
function calculateWisdomQuality(sources) {
    // 基於源數量和多樣性計算質量分數
    const baseScore = Math.min(sources.length * 15, 90);
    const diversityBonus = sources.length > 3 ? 10 : 0;
    return Math.min(100, baseScore + diversityBonus);
}
/**
 * 計算融合信心度
 */
function calculateSynthesisConfidence(sources) {
    // 基於源數量計算信心度
    return Math.min(95, 50 + sources.length * 8);
}
/**
 * 提取類別
 */
function extractCategories(sources) {
    const categories = ['智慧融合', '知識整合'];
    // 基於源添加類別
    sources.forEach(source => {
        if (source.includes('技術'))
            categories.push('技術');
        if (source.includes('商業'))
            categories.push('商業');
        if (source.includes('創新'))
            categories.push('創新');
    });
    return [...new Set(categories)];
}
/**
 * 生成洞察
 */
async function generateInsights(data) {
    const insights = [
        {
            type: 'pattern',
            title: '模式識別',
            description: '數據中發現重複性模式',
            confidence: 0.85,
            impact: 'medium'
        },
        {
            type: 'correlation',
            title: '關聯性分析',
            description: '識別變數間的潛在關聯',
            confidence: 0.78,
            impact: 'high'
        },
        {
            type: 'anomaly',
            title: '異常檢測',
            description: '發現數據中的異常點',
            confidence: 0.92,
            impact: 'low'
        },
        {
            type: 'trend',
            title: '趨勢分析',
            description: '識別數據的長期趨勢',
            confidence: 0.88,
            impact: 'high'
        }
    ];
    return insights.slice(0, Math.min(3, Math.max(1, Math.floor(Math.random() * 4) + 1)));
}
/**
 * 計算信心分數
 */
function calculateConfidenceScore(insights) {
    if (insights.length === 0)
        return 0;
    const avgConfidence = insights.reduce((sum, insight) => sum + insight.confidence, 0) / insights.length;
    return Math.round(avgConfidence * 100);
}
/**
 * 分類洞察
 */
function categorizeInsights(insights) {
    const categories = insights.map(insight => insight.type);
    return [...new Set(categories)];
}
/**
 * 更新代理狀態
 */
async function updateAgentStatus(agentId, status, currentTask) {
    const db = admin.firestore();
    await db.collection('agentStatus').doc(agentId).set({
        id: agentId,
        name: '智慧融合器',
        status,
        lastActivity: admin.firestore.FieldValue.serverTimestamp(),
        currentTask: currentTask || null
    }, { merge: true });
}
//# sourceMappingURL=wisdomSynthesizer.js.map