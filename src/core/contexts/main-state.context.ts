import React from 'react';
import {MainStateContextInterface} from '../interfaces/main-state.interface';

const MainStateContext: React.Context<MainStateContextInterface> = React.createContext<MainStateContextInterface>(
    {
        logs: [],
        rawLogs: [],
        sites: [],
        inventoryStats: {
            allSynced: 0,
            logsNumber: 0,
            id: '1',
            syncedLogsNumber: 0
        }
    }
);

export default MainStateContext;
