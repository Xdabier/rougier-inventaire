import {ResultSet, SQLError} from 'react-native-sqlite-storage';
import SqlLiteService from './sql-lite.service';
import {LogDetailsInterface, LogInterface} from '../interfaces/log.interface';
import {InventoryStatsInterface} from '../interfaces/inventory-stats.interface';
import {
    getInventoryStats,
    upsertInventoryStats
} from './inventory-stats.service';

const SQLiteService: SqlLiteService = new SqlLiteService();

export const getLogs = async (
    close = false
): Promise<LogDetailsInterface[]> => {
    try {
        const RES: ResultSet = await SQLiteService.executeQuery(
            `SELECT l.creationDate, l.barcode, l.type,
            l.sectionNumber, l.id, l.synced, l.aac,
            l.site as siteCode FROM log AS l;`
        );
        if (close && !SQLiteService.finished) {
            SQLiteService.db.close().catch((reason: SQLError) => {
                console.error('err log = ', reason);
            });
        }
        return RES.rows.raw() as LogDetailsInterface[];
    } catch (e) {
        return Promise.reject(e);
    }
};

export const getRawLogs = async (close = false): Promise<LogInterface[]> => {
    try {
        const RES: ResultSet = await SQLiteService.executeQuery(
            `SELECT l.barcode, l.sectionNumber, l.id, l.type, l.synced, l.aac, l.site FROM log AS l;`
        );
        if (close && !SQLiteService.finished) {
            SQLiteService.db.close().catch((reason: SQLError) => {
                console.error('err log = ', reason);
            });
        }
        return RES.rows.raw() as LogInterface[];
    } catch (e) {
        return Promise.reject(e);
    }
};

export const insertLog = async (element: LogInterface) => {
    try {
        const KEYS = Object.keys(element);
        await SQLiteService.executeQuery(
            `INSERT INTO log (${KEYS.join(', ')}) VALUES (${KEYS.map(
                () => '?'
            ).join(', ')})`,
            KEYS.map((x: string) => (element as any)[x])
        );
        const INVENTORY_STATS: InventoryStatsInterface[] = await getInventoryStats();
        const INVENTORY_STAT: InventoryStatsInterface = INVENTORY_STATS.length
            ? INVENTORY_STATS[0]
            : {allSynced: 0};

        const LAST_ID = await SQLiteService.executeQuery(
            'SELECT last_insert_rowid() as lastID;'
        );

        const STATS: InventoryStatsInterface = {
            ...INVENTORY_STAT,
            logsNumber: INVENTORY_STAT.logsNumber
                ? INVENTORY_STAT.logsNumber + 1
                : 1,
            lastLogDate: element.creationDate,
            lastLogId: LAST_ID.rows.raw()[0].lastID,
            allSynced: 0
        };
        const {syncedLogsNumber, ...otherStats} = STATS;

        return upsertInventoryStats(otherStats);
    } catch (e) {
        return Promise.reject(e);
    }
};

export const updateLog = async (oldId: string, element: LogInterface) => {
    try {
        const KEYS = Object.keys(element);
        const UP_L = await SQLiteService.executeQuery(
            `UPDATE log SET ${KEYS.map((value: string) => `${value} = ?`).join(
                ', '
            )} WHERE id = ?;`,
            [...KEYS.map((x: string) => (element as any)[x]), oldId]
        );
        await upsertInventoryStats({allSynced: 0});

        return UP_L;
    } catch (e) {
        return Promise.reject(e);
    }
};
