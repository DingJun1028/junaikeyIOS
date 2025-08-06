import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * 混沌提純師 - Chaos Refiner Agent
 * 負責處理錯誤、異常和數據清理的智能代理
 */

export const chaosRefiner = functions.https.onCall(async (data, context) => {
  const { rawData, action, errorLog } = data;
  const db = admin.firestore();

  try {
    if (action === 'purify') {
      // 提純錯誤日誌
      const purifiedData = await purifyErrorLog(errorLog);
      
      // 記錄提純結果
      const purificationRecord = {
        originalError: errorLog,
        purifiedData,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        processedBy: 'chaosRefiner',
        status: 'completed'
      };
      
      await db.collection('purificationLogs').add(purificationRecord);
      
      // 創建事件卡
      const eventCard = {
        type: 'chaos_purified',
        agentId: 'chaosRefiner',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        payload: { 
          purificationId: 'generated_id',
          errorCount: 1,
          resolution: purifiedData.resolution
        },
        status: 'completed'
      };
      await db.collection('networkEvents').add(eventCard);

      await updateAgentStatus('chaosRefiner', 'active', 'Purifying error logs');

      return { 
        status: 'success', 
        message: 'Error purification completed.',
        purifiedData 
      };
    } else {
      // 提純原始數據
      const refinedData = await refineRawData(rawData);
      
      // 保存提純結果
      const refinementRecord = {
        rawData,
        refinedData,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        processedBy: 'chaosRefiner',
        qualityScore: calculateQualityScore(rawData, refinedData)
      };
      
      const docRef = await db.collection('dataRefinements').add(refinementRecord);

      // 創建事件卡
      const eventCard = {
        type: 'data_refined',
        agentId: 'chaosRefiner',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        payload: { 
          refinementId: docRef.id,
          dataSize: JSON.stringify(rawData).length,
          qualityImprovement: refinementRecord.qualityScore
        },
        status: 'completed'
      };
      await db.collection('networkEvents').add(eventCard);

      await updateAgentStatus('chaosRefiner', 'active', 'Refining raw data');

      return { 
        status: 'success', 
        message: 'Data refinement completed.',
        refinedData,
        refinementId: docRef.id 
      };
    }
  } catch (error) {
    console.error('Chaos Refiner Error:', error);
    
    const errorCard = {
      type: 'refiner_chaos_detected',
      agentId: 'chaosRefiner',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      payload: { 
        error: error.message,
        action: action || 'refine'
      },
      status: 'failed'
    };
    await db.collection('networkEvents').add(errorCard);

    await updateAgentStatus('chaosRefiner', 'error', `Error: ${error.message}`);

    return { 
      status: 'error', 
      message: 'Failed to refine data.',
      error: error.message 
    };
  }
});

/**
 * 提純錯誤日誌
 */
async function purifyErrorLog(errorLog: string) {
  // 分析錯誤模式
  const errorPatterns = [
    { pattern: /TypeError:/g, category: 'type_error', severity: 'medium' },
    { pattern: /ReferenceError:/g, category: 'reference_error', severity: 'high' },
    { pattern: /SyntaxError:/g, category: 'syntax_error', severity: 'high' },
    { pattern: /Network Error/g, category: 'network_error', severity: 'low' },
    { pattern: /Permission denied/g, category: 'permission_error', severity: 'high' }
  ];

  const detectedErrors = errorPatterns
    .filter(pattern => pattern.pattern.test(errorLog))
    .map(pattern => ({
      category: pattern.category,
      severity: pattern.severity,
      matches: errorLog.match(pattern.pattern)?.length || 0
    }));

  const resolution = generateErrorResolution(detectedErrors);

  return {
    originalLog: errorLog,
    detectedErrors,
    resolution,
    purificationTimestamp: new Date().toISOString(),
    recommendedActions: generateRecommendedActions(detectedErrors)
  };
}

/**
 * 提純原始數據
 */
async function refineRawData(rawData: any) {
  const refinedData = JSON.parse(JSON.stringify(rawData)); // Deep clone

  // 數據清理流程
  if (typeof refinedData === 'object' && refinedData !== null) {
    // 移除空值和未定義值
    Object.keys(refinedData).forEach(key => {
      if (refinedData[key] === null || refinedData[key] === undefined || refinedData[key] === '') {
        delete refinedData[key];
      }
    });

    // 標準化字符串格式
    Object.keys(refinedData).forEach(key => {
      if (typeof refinedData[key] === 'string') {
        refinedData[key] = refinedData[key].trim();
      }
    });

    // 添加元數據
    refinedData._metadata = {
      refinedAt: new Date().toISOString(),
      refinedBy: 'chaosRefiner',
      originalSize: JSON.stringify(rawData).length,
      refinedSize: JSON.stringify(refinedData).length
    };
  }

  return refinedData;
}

/**
 * 計算數據質量分數
 */
function calculateQualityScore(rawData: any, refinedData: any): number {
  const rawSize = JSON.stringify(rawData).length;
  const refinedSize = JSON.stringify(refinedData).length;
  const sizeReduction = (rawSize - refinedSize) / rawSize;
  
  // 基於數據減少比例和結構完整性計算分數
  return Math.min(100, Math.max(0, (1 - sizeReduction) * 100 + 20));
}

/**
 * 生成錯誤解決方案
 */
function generateErrorResolution(errors: any[]): string {
  if (errors.length === 0) return 'No errors detected.';
  
  const highSeverityErrors = errors.filter(e => e.severity === 'high');
  if (highSeverityErrors.length > 0) {
    return 'Critical errors detected. Immediate attention required.';
  }
  
  return 'Minor errors detected. Monitor and address as needed.';
}

/**
 * 生成建議操作
 */
function generateRecommendedActions(errors: any[]): string[] {
  const actions: string[] = [];
  
  errors.forEach(error => {
    switch (error.category) {
      case 'type_error':
        actions.push('檢查變數類型聲明');
        break;
      case 'reference_error':
        actions.push('確認變數是否已正確定義');
        break;
      case 'syntax_error':
        actions.push('檢查語法錯誤');
        break;
      case 'network_error':
        actions.push('檢查網絡連接');
        break;
      case 'permission_error':
        actions.push('檢查存取權限設定');
        break;
    }
  });
  
  return [...new Set(actions)]; // 去重
}

/**
 * 更新代理狀態
 */
async function updateAgentStatus(agentId: string, status: string, currentTask?: string) {
  const db = admin.firestore();
  
  await db.collection('agentStatus').doc(agentId).set({
    id: agentId,
    name: '混沌提純師',
    status,
    lastActivity: admin.firestore.FieldValue.serverTimestamp(),
    currentTask: currentTask || null
  }, { merge: true });
}