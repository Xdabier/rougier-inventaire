export interface InventoryStatsInterface {
    lastLogDate?: string;
    id?: string;
    lastLogId?: string;
    logsNumber?: number;
    syncedLogsNumber?: number;
    allSynced: 1 | 0;
}
