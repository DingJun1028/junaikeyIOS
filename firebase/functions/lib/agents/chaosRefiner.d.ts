import * as functions from 'firebase-functions';
/**
 * 混沌提純師 - Chaos Refiner Agent
 * 負責處理錯誤、異常和數據清理的智能代理
 */
export declare const chaosRefiner: functions.https.CallableFunction<any, Promise<{
    status: string;
    message: string;
    purifiedData: {
        originalLog: string;
        detectedErrors: {
            category: string;
            severity: string;
            matches: number;
        }[];
        resolution: string;
        purificationTimestamp: string;
        recommendedActions: string[];
    };
    refinedData?: undefined;
    refinementId?: undefined;
    error?: undefined;
} | {
    status: string;
    message: string;
    refinedData: any;
    refinementId: string;
    purifiedData?: undefined;
    error?: undefined;
} | {
    status: string;
    message: string;
    error: any;
    purifiedData?: undefined;
    refinedData?: undefined;
    refinementId?: undefined;
}>, unknown>;
//# sourceMappingURL=chaosRefiner.d.ts.map