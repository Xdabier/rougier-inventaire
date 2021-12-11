import {SiteInterface} from './site.interface';
import {LogDetailsInterface, LogInterface} from './log.interface';
import {ServerInterface} from './server.interface';
import {InventoryStatsInterface} from './inventory-stats.interface';

export interface MainStateContextInterface {
    keyboardHeight?: number;
    setServerData?: (v: ServerInterface) => void;
    serverData?: ServerInterface;
    setSites?: (v: SiteInterface | SiteInterface[]) => void;
    sites: SiteInterface[];
    setLogs?: (v: LogDetailsInterface | LogDetailsInterface[]) => void;
    logs: LogDetailsInterface[];
    setRawLogs?: (v: LogInterface | LogInterface[]) => void;
    rawLogs: LogInterface[];
    inventoryStats: InventoryStatsInterface;
    setInventoryStats?: (v: InventoryStatsInterface) => void;
}
