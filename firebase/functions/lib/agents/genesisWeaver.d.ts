import * as functions from 'firebase-functions';
export declare const genesisWeaver: functions.https.CallableFunction<any, Promise<{
    status: string;
    message: string;
    blueprintId: any;
    error?: undefined;
} | {
    status: string;
    message: string;
    error: any;
    blueprintId?: undefined;
}>, unknown>;
//# sourceMappingURL=genesisWeaver.d.ts.map