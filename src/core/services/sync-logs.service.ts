import {ToastAndroid} from 'react-native';
import {publish as eventPub} from 'pubsub-js';
import {translate} from '../../utils/i18n.utils';
import {convertSyncFile, generateSyncFile} from './sync-tools.service';
import sendToOdoo from './odoo-connect.service';
import {ServerInterface} from '../interfaces/server.interface';
import EventTopicEnum from '../enum/event-topic.enum';
import {LogInterface} from '../interfaces/log.interface';
import {upsertInventoryStats} from './inventory-stats.service';
import {updateLog} from './logs.service';

const syncLogs = async (
    rawLogs: LogInterface[],
    serverData: ServerInterface
): Promise<any> => {
    if (!rawLogs.length) {
        ToastAndroid.show(translate('syncErrors.noLogs'), ToastAndroid.SHORT);
        return 0;
    }

    try {
        const SYNC_DATA = await generateSyncFile(rawLogs);
        const RES = await sendToOdoo(serverData, convertSyncFile(SYNC_DATA));

        if (RES) {
            const DB_RES = upsertInventoryStats({
                allSynced: 1,
                syncedLogsNumber: rawLogs.length
            });

            const LOG_SYNC_MARKER = rawLogs.map((v: LogInterface) =>
                updateLog(`${v.id}`, {
                    synced: 1
                })
            );
            await Promise.all(LOG_SYNC_MARKER);

            if (DB_RES) {
                eventPub(EventTopicEnum.updateDefault);
                return RES;
            }
        }

        return RES;
    } catch (e) {
        throw Error(e);
    }
};

export default syncLogs;
