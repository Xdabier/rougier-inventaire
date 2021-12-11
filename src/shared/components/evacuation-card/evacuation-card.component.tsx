import React from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import CommonStyles, {
    BORDER_RADIUS,
    MAIN_GREEN,
    MAIN_RED,
    PADDING_HORIZONTAL,
    poppinsRegular
} from '../../../styles';
import {translate} from '../../../utils/i18n.utils';
import {InventoryStatsInterface} from '../../../core/interfaces/inventory-stats.interface';

const {
    mainColor,
    centerHorizontally,
    centerVertically,
    spaceBetween,
    alignCenter,
    rougierShadow,
    regularFont,
    textAlignLeft,
    justifyAlignLeftVertical,
    justifyCenter,
    info,
    title,
    subTitle
} = CommonStyles;

const STYLES = StyleSheet.create({
    firstHalfOfCard: {
        maxWidth: '90%'
    },
    mainView: {
        width: Dimensions.get('screen').width - (PADDING_HORIZONTAL + 2) * 2,
        padding: 11,
        borderRadius: BORDER_RADIUS,
        backgroundColor: '#fff'
    },
    button: {
        minWidth: 111,
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderRadius: BORDER_RADIUS
    },
    buttonFill: {
        backgroundColor: MAIN_RED
    },
    buttonFillConfirmed: {
        backgroundColor: MAIN_GREEN
    },
    buttonClear: {
        backgroundColor: '#fff'
    },
    buttonText: {
        lineHeight: 20,
        fontFamily: poppinsRegular,
        fontSize: 13,
        marginLeft: 6
    },
    buttonTextFill: {
        color: '#fff'
    },
    buttonTextClear: {
        color: MAIN_RED
    },
    defCardCapsule: {
        borderRadius: BORDER_RADIUS,
        paddingHorizontal: 5,
        paddingVertical: 2,
        backgroundColor: 'rgba(69, 96, 14, .3)'
    },
    defCardIdx: {
        fontSize: 10,
        color: MAIN_GREEN
    },
    syncedLogs: {
        color: MAIN_RED
    }
});

const EvacuationCard: React.FunctionComponent<{
    inventoryStats: InventoryStatsInterface;
}> = ({inventoryStats}: {inventoryStats: InventoryStatsInterface}) => (
    <View
        style={[
            STYLES.mainView,
            centerHorizontally,
            spaceBetween,
            alignCenter,
            rougierShadow
        ]}>
        <View
            style={[
                STYLES.firstHalfOfCard,
                centerVertically,
                justifyAlignLeftVertical,
                justifyCenter
            ]}>
            <Text style={[mainColor, title, regularFont, textAlignLeft]}>
                {translate('common.lastLogId')}{' '}
                <Text style={[mainColor, subTitle, regularFont, textAlignLeft]}>
                    {inventoryStats.lastLogId}
                </Text>
            </Text>
            {inventoryStats.lastLogDate ? (
                <Text style={[info, regularFont, textAlignLeft]}>
                    {translate('common.lastLogDate', {
                        date: new Date(
                            inventoryStats.lastLogDate
                        ).toLocaleDateString()
                    })}
                </Text>
            ) : (
                <View />
            )}
            {inventoryStats.logsNumber ? (
                <Text style={[mainColor, title, regularFont, textAlignLeft]}>
                    {translate('common.logs')}{' '}
                    <Text
                        style={[
                            mainColor,
                            subTitle,
                            regularFont,
                            textAlignLeft
                        ]}>
                        {translate('common.logsNumber', {
                            numLogs: inventoryStats.logsNumber
                        })}
                    </Text>
                </Text>
            ) : (
                <View />
            )}
            {inventoryStats.logsNumber ? (
                <Text
                    style={[
                        STYLES.syncedLogs,
                        title,
                        regularFont,
                        textAlignLeft
                    ]}>
                    {translate('common.syncedLogs')}{' '}
                    <Text
                        style={[
                            STYLES.syncedLogs,
                            subTitle,
                            regularFont,
                            textAlignLeft
                        ]}>
                        {translate('common.logsNumber', {
                            numLogs: inventoryStats.syncedLogsNumber
                        })}
                    </Text>
                </Text>
            ) : (
                <View />
            )}
        </View>
        <View />
    </View>
);

export default EvacuationCard;
