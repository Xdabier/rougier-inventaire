import * as React from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useContext, useMemo, useState} from 'react';
import {publish as eventPub} from 'pubsub-js';
import {HomeScreenProps} from '../../../core/types/home-screen-props.type';
import CommonStyles, {
    BORDER_RADIUS,
    MAIN_GREEN,
    MAIN_RED,
    PADDING_HORIZONTAL,
    poppinsMedium
} from '../../../styles';
import {translate} from '../../../utils/i18n.utils';
import PageTitle from '../../../shared/components/page-title/page-title.component';
import EvacuationCard from '../../../shared/components/evacuation-card/evacuation-card.component';
import MatButton from '../../../shared/components/mat-button.component';
import AddLogDetails from '../../../shared/components/add-log-modal/add-log-modal.component';
import EventTopicEnum from '../../../core/enum/event-topic.enum';
import {MainStateContextInterface} from '../../../core/interfaces/main-state.interface';
import MainStateContext from '../../../core/contexts/main-state.context';
import CameraModal from '../../../shared/components/camera-modal/camera-modal.component';
import {requestServerEdit} from '../../../utils/modal.utils';
import {LogInterface} from '../../../core/interfaces/log.interface';
import syncLogs from '../../../core/services/sync-logs.service';

const {
    appPage,
    vSpacer60,
    vSpacer12,
    centerHorizontally,
    centerVertically,
    spaceEvenly,
    fullWidth,
    justifyAlignCenter,
    textAlignCenter,
    scrollView
} = CommonStyles;

const ICON_SIZE = 30;
const STYLES = StyleSheet.create({
    button: {
        width: Dimensions.get('screen').width - PADDING_HORIZONTAL * 2,
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: BORDER_RADIUS
    },
    buttonSecond: {
        backgroundColor: MAIN_RED
    },
    buttonMain: {
        backgroundColor: MAIN_GREEN
    },
    buttonText: {
        lineHeight: 30,
        fontFamily: poppinsMedium,
        fontSize: 18,
        color: '#fff'
    },
    textView: {
        width: 240
    }
});

const HomePage: React.FunctionComponent<HomeScreenProps> = ({
    navigation
}: any) => {
    const [barcode, setBarCode] = useState<string>('');
    const [addLogModalShow, setAddLogModalShow] = useState<boolean>(false);
    const [cameraModalShow, setCameraModalShow] = useState<boolean>(false);
    const {
        serverData,
        inventoryStats,
        rawLogs
    } = useContext<MainStateContextInterface>(MainStateContext);

    const notSyncedLogs = useMemo(
        () => rawLogs.filter((file: LogInterface) => !+file.synced),
        [rawLogs]
    );

    const onSyncAllClicked = async () => {
        if (!serverData) {
            requestServerEdit(() => {
                navigation.navigate('settingsStack');
                setTimeout(() => eventPub(EventTopicEnum.showServerModal), 666);
            });
        }
        if (serverData && notSyncedLogs && notSyncedLogs.length) {
            try {
                eventPub(EventTopicEnum.setSpinner, true);

                const RES = await syncLogs(notSyncedLogs, serverData);
                eventPub(EventTopicEnum.setSpinner, false);
                if (RES) {
                    ToastAndroid.show(
                        translate('common.succAllSync'),
                        ToastAndroid.SHORT
                    );
                }
            } catch (e) {
                eventPub(EventTopicEnum.setSpinner, false);
                ToastAndroid.show(
                    translate('common.syncError'),
                    ToastAndroid.SHORT
                );
                throw Error(e);
            }
        }
    };

    return (
        <SafeAreaView style={[appPage]}>
            <ScrollView
                contentContainerStyle={[
                    centerVertically,
                    justifyAlignCenter,
                    scrollView
                ]}>
                {inventoryStats.logsNumber ? (
                    <>
                        <PageTitle title={translate('homePage.title')} />

                        <EvacuationCard inventoryStats={inventoryStats} />
                    </>
                ) : (
                    <View />
                )}
                <View style={[vSpacer60]} />
                <MatButton
                    onPress={() => setCameraModalShow(true)}
                    disabled={!inventoryStats.logsNumber}>
                    <View
                        style={[
                            fullWidth,
                            STYLES.button,
                            STYLES.buttonSecond,
                            centerHorizontally,
                            spaceEvenly
                        ]}>
                        <Icon
                            name="qr-code-scanner"
                            color="#fff"
                            size={ICON_SIZE}
                        />
                        <View
                            style={[
                                STYLES.textView,
                                textAlignCenter,
                                centerHorizontally,
                                justifyAlignCenter
                            ]}>
                            <Text style={[STYLES.buttonText, textAlignCenter]}>
                                {translate('common.scanBarCode')}
                            </Text>
                        </View>
                    </View>
                </MatButton>
                <View style={[vSpacer12]} />
                <MatButton onPress={() => setAddLogModalShow(true)}>
                    <View
                        style={[
                            fullWidth,
                            STYLES.button,
                            STYLES.buttonMain,
                            centerHorizontally,
                            spaceEvenly
                        ]}>
                        <Icon name="add-circle" color="#fff" size={ICON_SIZE} />
                        <View
                            style={[
                                STYLES.textView,
                                textAlignCenter,
                                centerHorizontally,
                                justifyAlignCenter
                            ]}>
                            <Text style={[STYLES.buttonText, textAlignCenter]}>
                                {translate('common.addLog')}
                            </Text>
                        </View>
                    </View>
                </MatButton>
                <View style={[vSpacer12]} />
                <MatButton
                    onPress={onSyncAllClicked}
                    disabled={!notSyncedLogs.length}>
                    <View
                        style={[
                            fullWidth,
                            STYLES.button,
                            STYLES.buttonMain,
                            centerHorizontally,
                            spaceEvenly
                        ]}>
                        <Icon name="sync" color="#fff" size={ICON_SIZE} />
                        <View
                            style={[
                                STYLES.textView,
                                textAlignCenter,
                                centerHorizontally,
                                justifyAlignCenter
                            ]}>
                            <Text style={[STYLES.buttonText, textAlignCenter]}>
                                {translate('common.syncAll')}
                            </Text>
                        </View>
                    </View>
                </MatButton>
                <View style={[vSpacer60]} />
            </ScrollView>

            <CameraModal
                modalVisible={cameraModalShow}
                onClose={(code?: string) => {
                    setCameraModalShow(false);

                    if (code && code.length) {
                        setBarCode(code);
                        setAddLogModalShow(true);
                    }
                }}
                modalName={translate('common.scanBarCode')}
            />

            <AddLogDetails
                scannedBarCode={barcode}
                modalVisible={addLogModalShow}
                onClose={(refresh) => {
                    setAddLogModalShow(false);

                    if (refresh) {
                        eventPub(EventTopicEnum.updateDefault);
                    }
                }}
            />
        </SafeAreaView>
    );
};

export default HomePage;
