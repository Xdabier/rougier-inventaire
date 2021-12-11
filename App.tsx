import React, {useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Dimensions, Keyboard, KeyboardEvent, Text, View} from 'react-native';
import {subscribe as eventSub} from 'pubsub-js';
import Spinner from 'react-native-loading-spinner-overlay';
import HomeStackScreens from './src/features/home';
import LogsStackScreens from './src/features/logs';
import SettingsStackScreens from './src/features/settings';
import {MainTabsNavigationProps} from './src/core/types/main-tabs-params.type';
import {setI18nConfig, translate} from './src/utils/i18n.utils';
import BarIconNameEnum from './src/core/enum/bar-icon-name.enum';
import BarLabelNameEnum from './src/core/enum/bar-label-name.enum';
import {
    MAIN_GREY,
    MAIN_RED,
    poppinsRegular,
    TAB_BAR_BUTTON_HEIGHT,
    TAB_BAR_HEIGHT,
    TAB_BAR_VERT_PADDING
} from './src/styles';
import syncStorage from './src/core/services/sync-storage.service';
import {SiteInterface} from './src/core/interfaces/site.interface';
import {
    LogDetailsInterface,
    LogInterface
} from './src/core/interfaces/log.interface';
import {MainStateContextInterface} from './src/core/interfaces/main-state.interface';
import MainStateContext from './src/core/contexts/main-state.context';
import {getAux} from './src/core/services/aux-data.service';
import NameToTableEnum from './src/core/enum/name-to-table.enum';
import {getLogs, getRawLogs} from './src/core/services/logs.service';
import EventTopicEnum from './src/core/enum/event-topic.enum';
import {ServerInterface} from './src/core/interfaces/server.interface';
import {getServerData} from './src/core/services/server-data.service';
import {InventoryStatsInterface} from './src/core/interfaces/inventory-stats.interface';
import {getInventoryStats} from './src/core/services/inventory-stats.service';

const TAB = createBottomTabNavigator<MainTabsNavigationProps>();
const initStats: InventoryStatsInterface = {
    allSynced: 0,
    logsNumber: 0,
    id: '1',
    syncedLogsNumber: 0
};

const App = () => {
    const loadStorage = async () => syncStorage.init();
    const [isReady, setIsReady] = useState<boolean>(false);
    const [isSpinning, setIsSpinning] = useState<boolean>(false);

    loadStorage()
        .then(() => {
            setI18nConfig();
            setIsReady(true);
        })
        .catch(() => {
            setI18nConfig();
            setIsReady(true);
        });

    const [sites, setSites] = useState<SiteInterface[]>([]);
    const [logs, setLogs] = useState<LogDetailsInterface[]>([]);
    const [rawLogs, setRawLogs] = useState<LogInterface[]>([]);
    const [serverData, setServerData] = useState<ServerInterface>();
    const [
        inventoryStats,
        setInventoryStats
    ] = useState<InventoryStatsInterface>(initStats);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const onKeyboardDidShow = (e: KeyboardEvent) => {
        const spacerHeight =
            Dimensions.get('window').height - e.endCoordinates.height;
        setKeyboardHeight(spacerHeight);
    };

    const onKeyboardDidHide = () => {
        setKeyboardHeight(0);
    };

    const MAIN_CONTEXT: MainStateContextInterface = {
        keyboardHeight,
        logs,
        sites,
        rawLogs,
        serverData,
        inventoryStats,
        setInventoryStats: (v: InventoryStatsInterface) => {
            setInventoryStats(v);
        },
        setServerData: (v: ServerInterface) => {
            setServerData(v);
        },
        setSites: (v: SiteInterface | SiteInterface[]) => {
            if (Array.isArray(v)) {
                setSites(v);
            } else {
                setSites([...sites, v]);
            }
        },
        setLogs: (v: LogDetailsInterface | LogDetailsInterface[]) => {
            if (Array.isArray(v)) {
                setLogs(v);
            } else {
                setLogs([...logs, v]);
            }
        },
        setRawLogs: (v: LogInterface | LogInterface[]) => {
            if (Array.isArray(v)) {
                setRawLogs(v);
            } else {
                setRawLogs([...rawLogs, v]);
            }
        }
    };

    const refreshInventoryStats = () => {
        getInventoryStats().then((value2: InventoryStatsInterface[]) => {
            if (value2 && value2.length) {
                setInventoryStats(value2[0]);
            }
        });
    };

    const refreshDefault = () => {
        getLogs().then((value: LogDetailsInterface[]) => {
            setLogs(value);
            getRawLogs().then((value4: LogInterface[]) => {
                setRawLogs(value4);

                getInventoryStats().then(
                    (value2: InventoryStatsInterface[]) => {
                        if (value2 && value2.length) {
                            setInventoryStats(value2[0]);
                        }

                        getServerData().then((value3: ServerInterface[]) => {
                            if (value3 && value3.length) {
                                setServerData(value3[0]);
                            }
                        });
                    }
                );
            });
        });
    };

    const refreshServerData = () => {
        getServerData().then((value: ServerInterface[]) => {
            if (value && value.length) {
                setServerData(value[0]);
            }
        });
    };

    const refreshAux = () => {
        getAux(NameToTableEnum.site).then((value1) => {
            if (value1 && value1.length) {
                setSites(value1);
            }
        });
    };

    useEffect(() => {
        refreshDefault();
        refreshAux();
        refreshServerData();

        eventSub(EventTopicEnum.updateDefault, () => {
            refreshDefault();
        });

        eventSub(
            EventTopicEnum.setSpinner,
            (name: string, spinning: boolean) => {
                setIsSpinning(spinning);
            }
        );

        eventSub(EventTopicEnum.updateStats, () => {
            refreshInventoryStats();
        });

        eventSub(EventTopicEnum.updateAux, () => {
            refreshAux();
        });

        eventSub(EventTopicEnum.updateServer, () => {
            refreshServerData();
        });

        Keyboard.addListener('keyboardDidShow', onKeyboardDidShow);
        Keyboard.addListener('keyboardDidHide', onKeyboardDidHide);

        return (): void => {
            Keyboard.removeListener('keyboardDidShow', onKeyboardDidShow);
            Keyboard.removeListener('keyboardDidHide', onKeyboardDidHide);
        };
    }, []);

    return isReady ? (
        <>
            <Spinner
                visible={isSpinning}
                animation="fade"
                textStyle={{
                    color: '#FFF'
                }}
                overlayColor="rgba(0, 0, 0, 0.7)"
                textContent={translate('common.syncing')}
            />
            <MainStateContext.Provider value={MAIN_CONTEXT}>
                <NavigationContainer>
                    <TAB.Navigator
                        initialRouteName="homeStack"
                        tabBarOptions={{
                            style: {
                                height: TAB_BAR_HEIGHT,
                                paddingVertical: TAB_BAR_VERT_PADDING
                            },
                            activeTintColor: MAIN_RED,
                            inactiveTintColor: MAIN_GREY,
                            labelStyle: {
                                fontFamily: poppinsRegular,
                                fontSize: 12
                            },
                            tabStyle: {
                                height: TAB_BAR_BUTTON_HEIGHT
                            }
                        }}
                        screenOptions={({route}) => ({
                            tabBarIcon: ({
                                size,
                                focused
                            }: {
                                focused: boolean;
                                size: number;
                            }) => {
                                const COLOR = focused ? MAIN_RED : MAIN_GREY;
                                const NAME = BarIconNameEnum[route.name];
                                return (
                                    <Icon
                                        name={NAME}
                                        size={size}
                                        color={COLOR}
                                    />
                                );
                            },
                            tabBarLabel: translate(BarLabelNameEnum[route.name])
                        })}>
                        <TAB.Screen
                            name="logsStack"
                            component={LogsStackScreens}
                        />
                        <TAB.Screen
                            name="homeStack"
                            component={HomeStackScreens}
                        />
                        <TAB.Screen
                            name="settingsStack"
                            component={SettingsStackScreens}
                        />
                    </TAB.Navigator>
                </NavigationContainer>
            </MainStateContext.Provider>
        </>
    ) : (
        <View>
            <Text>Loading...</Text>
        </View>
    );
};
export default App;
