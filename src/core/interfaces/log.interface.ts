export interface LogInterface {
    id?: string;
    site?: string;
    barcode?: string;
    aac?: string;
    type?: string;
    sectionNumber?: string;
    creationDate?: string;
    synced: 1 | 0;
}

export interface LogDetailsInterface {
    id: string;
    siteName?: string;
    siteCode?: string;
    barcode: string;
    aac: string;
    type: string;
    sectionNumber: string;
    creationDate: string;
    synced: 1 | 0;
}
