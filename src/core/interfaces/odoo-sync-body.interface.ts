export interface OdooLogsBodyInterface {
    barcode?: string;
    num_troncon?: string;
    emplacement?: string;
    aac?: string;
    type?: string;
}

export interface OdooSyncBodyInterface {
    sync: boolean;
    sync_date: string;
    appId: string;
    billes: OdooLogsBodyInterface[];
}
