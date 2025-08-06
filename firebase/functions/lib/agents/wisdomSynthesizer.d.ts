import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
/**
 * 智慧融合器 - Wisdom Synthesizer Agent
 * 負責知識融合和智慧生成的智能代理
 */
export declare const wisdomSynthesizer: functions.https.CallableFunction<any, Promise<{
    status: string;
    message: string;
    insights: {
        type: string;
        title: string;
        description: string;
        confidence: number;
        impact: string;
    }[];
    insightId: string;
    wisdomCard?: undefined;
    wisdomId?: undefined;
    error?: undefined;
} | {
    status: string;
    message: string;
    wisdomCard: {
        title: string;
        summary: string;
        content: string;
        sources: any;
        timestamp: admin.firestore.FieldValue;
        synthesizedBy: string;
        quality: number;
        categories: string[];
        metadata: {
            sourceCount: any;
            synthesisMethod: string;
            confidence: number;
        };
    };
    wisdomId: string;
    insights?: undefined;
    insightId?: undefined;
    error?: undefined;
} | {
    status: string;
    message: string;
    error: any;
    insights?: undefined;
    insightId?: undefined;
    wisdomCard?: undefined;
    wisdomId?: undefined;
}>, unknown>;
//# sourceMappingURL=wisdomSynthesizer.d.ts.map