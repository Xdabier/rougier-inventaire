import React, {
    createRef,
    RefObject,
    useCallback,
    useContext,
    useEffect,
    useState
} from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    View
} from 'react-native';
import ActionSheetComponent from 'react-native-actions-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ResultSet, SQLError} from 'react-native-sqlite-storage';
import {publish as eventPub} from 'pubsub-js';
import CommonStyles, {
    FILTER_ROW_HEIGHT,
    MAIN_LIGHT_GREY,
    poppinsRegular
} from '../../../styles';
import ModalHeader from '../modal-header/modal-header.component';
import {translate} from '../../../utils/i18n.utils';
import ModalFooter from '../modal-footer/modal-footer.component';
import FormInput from '../form-input/form-input.component';
import ActionSheetContent from '../action-sheet-content/action-sheet-content.component';
import {SiteInterface} from '../../../core/interfaces/site.interface';
import MatButton from '../mat-button.component';
import SelectInput from '../select-input/select-input.component';
import {
    LogDetailsInterface,
    LogInterface
} from '../../../core/interfaces/log.interface';
import {MainStateContextInterface} from '../../../core/interfaces/main-state.interface';
import MainStateContext from '../../../core/contexts/main-state.context';
import {insertLog, updateLog} from '../../../core/services/logs.service';
import CameraModal from '../camera-modal/camera-modal.component';
import {requestCloseModal} from '../../../utils/modal.utils';
import EventTopicEnum from '../../../core/enum/event-topic.enum';
import ScanInput from '../scan-input/form-input.component';

const {
    fullWidth,
    appPage,
    vSpacer100,
    scrollView,
    centerHorizontally,
    justifyAlignTLeftHorizontal,
    alignCenter
} = CommonStyles;

const TEXT_LINE_HEIGHT = 27;
const STYLES = StyleSheet.create({
    searchResult: {
        height: FILTER_ROW_HEIGHT,
        borderBottomWidth: 1,
        borderBottomColor: MAIN_LIGHT_GREY
    },
    searchResultText: {
        marginLeft: 18,
        fontFamily: poppinsRegular,
        fontSize: 16,
        lineHeight: TEXT_LINE_HEIGHT
    }
});

const actionSheetRef: RefObject<ActionSheetComponent> = createRef();

const TYPES = ['Attribution code a barre', 'Inventaire'];

const AddLogDetails: React.FunctionComponent<{
    modalVisible: boolean;
    scannedBarCode?: string | null;
    oldLog?: LogDetailsInterface | null;
    onClose: (refresh?: boolean) => void;
}> = ({
    modalVisible,
    onClose,
    oldLog,
    scannedBarCode
}: {
    modalVisible: boolean;
    scannedBarCode?: string | null;
    oldLog?: LogDetailsInterface | null;
    onClose: (refresh?: boolean) => void;
}) => {
    const [cameraModalShow, setCameraModalShow] = useState<'log' | 'park' | ''>(
        ''
    );
    const [aacValid, setAacValid] = useState<boolean | boolean[]>(true);
    const [aac, setAac] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [barcode, setBarCode] = useState<string>(scannedBarCode || '');
    const [sectionNumber, setSectionNumber] = useState<string>('');
    const [site, setSite] = useState<SiteInterface>({
        code: '',
        name: ''
    });

    const {keyboardHeight} = useContext<MainStateContextInterface>(
        MainStateContext
    );

    const resetFields = useCallback(
        (data?: LogDetailsInterface) => {
            setSite(
                data && data?.siteCode
                    ? {
                          code: '',
                          name: data?.siteCode
                      }
                    : {
                          code: '',
                          name: ''
                      }
            );
            setBarCode(data ? data.barcode : '');
            setAac(data ? data.aac : '');
            setSectionNumber(data ? `${data.sectionNumber}` : '');
            setType(data ? `${data.type}` : '');

            if (scannedBarCode && !data) {
                setBarCode(scannedBarCode);
            }
        },
        [scannedBarCode]
    );

    useEffect(() => {
        if (oldLog) {
            resetFields(oldLog);
        } else {
            resetFields();
        }
    }, [modalVisible, oldLog, resetFields]);

    const validForm = () =>
        aac &&
        aacValid &&
        type &&
        barcode &&
        barcode.length >= 3 &&
        sectionNumber &&
        sectionNumber.length >= 1 &&
        (type === 'Inventaire' ? site.code.length > 1 : true);

    const confirmInsertion = () => {
        if (validForm() && site) {
            const EL: LogInterface = {
                creationDate: new Date().toISOString(),
                type,
                aac,
                barcode,
                site: site.code,
                sectionNumber,
                synced: 0
            };

            if (oldLog) {
                updateLog(oldLog.id, EL)
                    .then((res: ResultSet) => {
                        if (res && res.rows) {
                            resetFields();
                            onClose(true);
                            ToastAndroid.show(
                                translate('modals.logs.succMsgEdit'),
                                ToastAndroid.SHORT
                            );
                        }
                        eventPub(EventTopicEnum.updateDefault);
                    })
                    .catch((reason: SQLError) => {
                        console.error('er = ', reason);
                        if (!reason.code) {
                            ToastAndroid.show(
                                translate('common.dupErr'),
                                ToastAndroid.LONG
                            );
                        }
                    });
            } else {
                insertLog(EL)
                    .then((res: ResultSet) => {
                        if (res && res.rows) {
                            resetFields();
                            onClose(true);
                            ToastAndroid.show(
                                translate('modals.logs.succMsg'),
                                ToastAndroid.SHORT
                            );
                        }
                        eventPub(EventTopicEnum.updateDefault);
                    })
                    .catch((reason: SQLError) => {
                        if (!reason.code) {
                            ToastAndroid.show(
                                translate('common.dupErr'),
                                ToastAndroid.LONG
                            );
                        }
                    });
            }
        } else {
            ToastAndroid.show('One of the fields is wrong.', ToastAndroid.LONG);
        }
    };

    const onSelectMenu = (visible = true): void => {
        actionSheetRef.current?.setModalVisible(visible);
    };

    const renderFilterBtn = ({item}: {item: string}, _i: number) => (
        <MatButton
            onPress={() => {
                setType(item);
                actionSheetRef.current?.setModalVisible(false);
            }}
            key={_i}>
            <View
                style={[
                    scrollView,
                    centerHorizontally,
                    justifyAlignTLeftHorizontal,
                    alignCenter,
                    STYLES.searchResult
                ]}>
                <Icon
                    name="photo-size-select-actual"
                    size={TEXT_LINE_HEIGHT}
                    color={MAIN_LIGHT_GREY}
                />
                <Text style={[STYLES.searchResultText]}>{item}</Text>
            </View>
        </MatButton>
    );

    return (
        <Modal
            style={[fullWidth]}
            onRequestClose={() => {
                requestCloseModal(() => {
                    resetFields();
                    onClose();
                });
            }}
            animationType="slide"
            visible={modalVisible}>
            <ModalHeader
                title={translate(oldLog ? 'common.editLog' : 'common.addLog')}
                onClose={() => {
                    requestCloseModal(() => {
                        resetFields();
                        onClose();
                    });
                }}
            />
            <SafeAreaView style={[appPage]}>
                <ScrollView>
                    <FormInput
                        maxLength={8}
                        title={translate('modals.logs.fields.aac.label')}
                        placeholder={translate('modals.logs.fields.aac.ph')}
                        onChangeText={setAac}
                        value={aac}
                        pattern={[
                            '(99|[0-9]?[0-9])-(99|[0-9]?[0-9])-(99|[0-9]?[0-9])'
                        ]}
                        errText={translate('modals.logs.fields.aac.err')}
                        onValidation={setAacValid}
                        required
                    />
                    <ScanInput
                        title={translate('modals.logs.fields.barcode.label')}
                        placeholder={translate('modals.logs.fields.barcode.ph')}
                        onChangeText={setBarCode}
                        keyboardType="default"
                        value={barcode}
                        showCodeScanner={() => setCameraModalShow('log')}
                        required
                    />
                    <FormInput
                        title={translate(
                            'modals.logs.fields.sectionNumber.label'
                        )}
                        placeholder={translate(
                            'modals.logs.fields.sectionNumber.ph'
                        )}
                        onChangeText={setSectionNumber}
                        keyboardType="default"
                        value={sectionNumber}
                        required
                    />
                    <SelectInput
                        title={translate('modals.logs.fields.type.label')}
                        placeholder={translate('modals.logs.fields.type.ph')}
                        showSelectMenu={onSelectMenu}
                        value={type}
                        required
                    />
                    {type === 'Inventaire' && (
                        <ScanInput
                            title={translate('modals.logs.fields.site.label')}
                            placeholder={translate(
                                'modals.logs.fields.site.ph'
                            )}
                            onChangeText={(text) => {
                                setSite({
                                    name: '',
                                    code: text
                                });
                            }}
                            keyboardType="default"
                            value={site.code}
                            showCodeScanner={() => setCameraModalShow('park')}
                            required
                        />
                    )}
                    <View style={[vSpacer100]} />
                </ScrollView>
            </SafeAreaView>
            <ModalFooter
                disabled={!validForm()}
                onPress={confirmInsertion}
                title={translate('modals.logs.confirm')}
            />

            <ActionSheetComponent
                initialOffsetFromBottom={0.6}
                ref={actionSheetRef}
                statusBarTranslucent
                bounceOnOpen
                bounciness={4}
                gestureEnabled
                defaultOverlayOpacity={0.3}>
                <ActionSheetContent
                    isSearchable={false}
                    keyboardHeight={keyboardHeight}
                    actionSheetRef={actionSheetRef}
                    valuesList={TYPES || []}
                    renderElement={renderFilterBtn}
                />
            </ActionSheetComponent>

            <CameraModal
                modalVisible={!!cameraModalShow}
                onClose={(code?: string) => {
                    if (code && code.length) {
                        if (cameraModalShow === 'log') {
                            setBarCode(code);
                        }
                        if (cameraModalShow === 'park') {
                            setSite({
                                name: '',
                                code
                            });
                        }
                    }

                    setCameraModalShow('');
                }}
                modalName={translate('common.scanBarCode')}
            />
        </Modal>
    );
};

AddLogDetails.defaultProps = {
    oldLog: null,
    scannedBarCode: null
};

export default AddLogDetails;
