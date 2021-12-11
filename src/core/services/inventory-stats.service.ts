import {ResultSet, SQLError} from 'react-native-sqlite-storage';
import SqlLiteService from './sql-lite.service';
import {InventoryStatsInterface} from '../interfaces/inventory-stats.interface';

const SQLiteService: SqlLiteService = new SqlLiteService();

export const getInventoryStats = async (
    close = false
): Promise<InventoryStatsInterface[]> => {
    try {
        const RES: ResultSet = await SQLiteService.executeQuery(
            `SELECT * FROM inventoryStats WHERE id=1;`
        );
        if (close && !SQLiteService.finished) {
            SQLiteService.db.close().catch((reason: SQLError) => {
                console.error('err evacuationStats = ', reason);
            });
        }

        return RES.rows.length
            ? (RES.rows.raw() as InventoryStatsInterface[])
            : [];
    } catch (e) {
        return Promise.reject(e);
    }
};

export const upsertInventoryStats = async (
    element: InventoryStatsInterface
): Promise<ResultSet> => {
    try {
        const KEYS = Object.keys(element);

        const STATS: InventoryStatsInterface[] = await getInventoryStats();
        if (STATS && STATS.length) {
            if (element.syncedLogsNumber && STATS[0].syncedLogsNumber) {
                // eslint-disable-next-line no-param-reassign
                element.syncedLogsNumber += STATS[0].syncedLogsNumber;
            }
            return await SQLiteService.executeQuery(
                `UPDATE inventoryStats SET ${KEYS.map(
                    (value: string) => `${value} = ?`
                ).join(', ')} WHERE id = ?;`,
                [...KEYS.map((x: string) => (element as any)[x]), '1']
            );
        }

        return await SQLiteService.executeQuery(
            `INSERT INTO inventoryStats (${[...KEYS, 'id'].join(
                ', '
            )}) VALUES (${[...KEYS, 'id'].map(() => '?').join(', ')})`,
            [...KEYS.map((x: string) => (element as any)[x]), '1']
        );
    } catch (e) {
        return Promise.reject(e);
    }
};
