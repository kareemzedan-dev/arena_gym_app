import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Image,
    Alert,
} from 'react-native';
import { Col, Row } from "react-native-easy-grid";
import { useNavigation, CommonActions } from '@react-navigation/native';
import { CameraView, Camera } from 'expo-camera';
import { useNavigationEvents } from '../../../../util/navigation-hooks';
import { t } from '../../../../../locals';
import styleCss from '../../../../style';

function AttendanceScanner() {
    const navigation = useNavigation();
    const [state, setState] = useState({
        hasCameraPermission: null,
        scanned: false,
        loader: false,
    });

    const onFocus = useCallback(async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setState(prev => ({
            ...prev,
            hasCameraPermission: status === 'granted'
        }));
    }, []);

    useNavigationEvents({
        onWillFocus: onFocus
    });

    const handleBarCodeScanned = ({ data }) => {
        setState(prev => ({ ...prev, scanned: true }));
        
        // Parse scanned data
        try {
            const scannedData = JSON.parse(data);
            // Navigate to details screen with the new API
            navigation.dispatch(
                CommonActions.navigate({
                    name: 'Attendancedetails',
                    params: { scannedData }
                })
            );
        } catch (error) {
            Alert.alert(t('Error'), t('Invalid QR Code'));
            setState(prev => ({ ...prev, scanned: false }));
        }
    };

    if (state.hasCameraPermission === null) {
        return (
            <View style={styleCss.container}>
                <StatusBar />
                <Row style={styleCss.NaveBar}>
                    <Col>
                        <TouchableOpacity onPress={() => navigation.navigate("StaffCustomSideBar")} style={styleCss.menu_col}>
                            <Image style={styleCss.Naveicon}
                                source={require('../../../../images/Menu-white.png')}
                            />
                        </TouchableOpacity>
                    </Col>

                    <Col>
                        <TouchableOpacity onPress={() => navigation.navigate("staffDashboard")} style={styleCss.back_arrow}>
                            <Image style={styleCss.Naveicon}
                                source={require('../../../../images/Back-Arrow-White.png')}
                            />
                        </TouchableOpacity>
                    </Col>

                    <Col style={styleCss.name_col}>
                        <Text style={styleCss.NaveText}>{t("Scan QR Code")}</Text>
                    </Col>

                    <Col>
                        <TouchableOpacity onPress={() => navigation.navigate('Addworkout')} style={styleCss.workout_col}>
                            <Image style={styleCss.Naveicon}
                                source={require('../../../../images/Workout-White.png')}
                            />
                        </TouchableOpacity>
                    </Col>
                    <Col>
                        <TouchableOpacity onPress={() => navigation.navigate('StaffMessage')} style={styleCss.message_col}>
                            <Image style={styleCss.Naveicon}
                                source={require('../../../../images/Message-white.png')}
                            />
                        </TouchableOpacity>
                    </Col>
                </Row>
                <Text>{t("Requesting camera permission")}</Text>
            </View>
        );
    }

    if (state.hasCameraPermission === false) {
        return (
            <View style={styleCss.container}>
                <StatusBar />
                <Row style={styleCss.NaveBar}>
                    <Col>
                        <TouchableOpacity onPress={() => navigation.navigate("StaffCustomSideBar")} style={styleCss.menu_col}>
                            <Image style={styleCss.Naveicon}
                                source={require('../../../../images/Menu-white.png')}
                            />
                        </TouchableOpacity>
                    </Col>

                    <Col>
                        <TouchableOpacity onPress={() => navigation.navigate("staffDashboard")} style={styleCss.back_arrow}>
                            <Image style={styleCss.Naveicon}
                                source={require('../../../../images/Back-Arrow-White.png')}
                            />
                        </TouchableOpacity>
                    </Col>

                    <Col style={styleCss.name_col}>
                        <Text style={styleCss.NaveText}>{t("Scan QR Code")}</Text>
                    </Col>

                    <Col>
                        <TouchableOpacity onPress={() => navigation.navigate('Addworkout')} style={styleCss.workout_col}>
                            <Image style={styleCss.Naveicon}
                                source={require('../../../../images/Workout-White.png')}
                            />
                        </TouchableOpacity>
                    </Col>
                    <Col>
                        <TouchableOpacity onPress={() => navigation.navigate('StaffMessage')} style={styleCss.message_col}>
                            <Image style={styleCss.Naveicon}
                                source={require('../../../../images/Message-white.png')}
                            />
                        </TouchableOpacity>
                    </Col>
                </Row>
                <Text>{t("No access to camera")}</Text>
            </View>
        );
    }

    return (
        <View style={styleCss.attendance_scanner_view}>
            <StatusBar />
            <Row style={styleCss.NaveBar}>
                <Col>
                    <TouchableOpacity onPress={() => navigation.navigate("StaffCustomSideBar")} style={styleCss.menu_col}>
                        <Image style={styleCss.Naveicon}
                            source={require('../../../../images/Menu-white.png')}
                        />
                    </TouchableOpacity>
                </Col>

                <Col>
                    <TouchableOpacity onPress={() => navigation.navigate("staffDashboard")} style={styleCss.back_arrow}>
                        <Image style={styleCss.Naveicon}
                            source={require('../../../../images/Back-Arrow-White.png')}
                        />
                    </TouchableOpacity>
                </Col>

                <Col style={styleCss.name_col}>
                    <Text style={styleCss.NaveText}>{t("Scan QR Code")}</Text>
                </Col>

                <Col>
                    <TouchableOpacity onPress={() => navigation.navigate('Addworkout')} style={styleCss.workout_col}>
                        <Image style={styleCss.Naveicon}
                            source={require('../../../../images/Workout-White.png')}
                        />
                    </TouchableOpacity>
                </Col>
                <Col>
                    <TouchableOpacity onPress={() => navigation.navigate('StaffMessage')} style={styleCss.message_col}>
                        <Image style={styleCss.Naveicon}
                            source={require('../../../../images/Message-white.png')}
                        />
                    </TouchableOpacity>
                </Col>
            </Row>
            <CameraView
                style={styleCss.scanner_preview}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ["qr", "pdf417"],
                }}
                onBarcodeScanned={state.scanned ? undefined : handleBarCodeScanned}
            />
            {state.scanned && (
                <TouchableOpacity
                    onPress={() => setState(prev => ({ ...prev, scanned: false }))}
                    style={styleCss.scan_again_button}
                >
                    <Text style={styleCss.scan_again_text}>{t("Tap to Scan Again")}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export default AttendanceScanner;