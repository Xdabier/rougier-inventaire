import {SyncDataInterface} from '../interfaces/sync-data.interface';
import {LogInterface} from '../interfaces/log.interface';
import {getUniqueId} from 'react-native-device-info';
import {
    OdooLogsBodyInterface,
    OdooSyncBodyInterface
} from '../interfaces/odoo-sync-body.interface';

export const generateSyncFile = async (
    rawLogs: LogInterface[]
): Promise<SyncDataInterface> => ({
    logs: rawLogs
});

export const convertLogsToSyncLogs = (
    logs: LogInterface[]
): OdooLogsBodyInterface[] =>
    logs.map((log: LogInterface) => {
        const ODOO_LOG_BODY: OdooLogsBodyInterface = {
            barcode: log.barcode,
            emplacement: log.site,
            type: log.type === 'Inventaire' ? 'inventaire' : 'attribution',
            aac: log.aac,
            num_troncon: log.sectionNumber
        };

        return ODOO_LOG_BODY;
    });

const parseTime = (time: number): string => {
    if (`${time}`.length === 1) {
        return `0${time}`;
    }
    return `${time}`;
};

const convertDate = (date: Date): string =>
    `${parseTime(date.getMonth() + 1)}/${parseTime(
        date.getDate()
    )}/${date.getFullYear()}`;

export const convertToTimeOnly = (date: Date): string =>
    `${parseTime(date.getHours())}:${parseTime(date.getMinutes())}`;

export const convertSyncFile = (
    syncFile: SyncDataInterface
): OdooSyncBodyInterface => {
    return {
        sync_date: convertDate(new Date()),
        sync: true,
        appId: getUniqueId(),
        billes: convertLogsToSyncLogs(syncFile.logs)
    };
};
