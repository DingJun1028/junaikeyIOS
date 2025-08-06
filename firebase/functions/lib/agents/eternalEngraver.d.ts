import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
/**
 * 永恆刻印師 - Eternal Engraver Agent
 * 負責創建和管理事件卡的智能代理
 */
export declare const eternalEngraver: functions.https.CallableFunction<any, Promise<{
    status: string;
    message: string;
    eventId: any;
    eventCard?: undefined;
    error?: undefined;
} | {
    status: string;
    message: string;
    eventId: string;
    eventCard: {
        type: any;
        agentId: string;
        timestamp: admin.firestore.FieldValue;
        payload: any;
        status: string;
        metadata: {
            createdBy: string;
            version: string;
            tags: string[];
        };
    };
    error?: undefined;
} | {
    status: string;
    message: string;
    error: any;
    eventId?: undefined;
    eventCard?: undefined;
}>, unknown>;
/**
 * 事件卡觸發器 - 監聽特定集合的變化
 */
export declare const eventCardTrigger: any;
//# sourceMappingURL=eternalEngraver.d.ts.map