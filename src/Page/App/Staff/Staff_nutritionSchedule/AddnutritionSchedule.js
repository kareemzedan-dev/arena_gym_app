import React, { Component } from "react";
import {
    BackHandler,
    View,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StatusBar,
} from "react-native";
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { Col, Row } from 'react-native-easy-grid';
import { staffloginAction } from '../../../../util/action';
import { WebView } from 'react-native-webview';
import { t } from '../../../../../locals';
import styleCss from '../../../../style'

export default class AddnutritionSchedule extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loader: false,
            dataSource: '',
        };
    }

    componentDidMount() {
        this.setState({ loader: true })
        this.stafflogin();
        this.setState({ loader: false })
    }

    async stafflogin() {
        const StaffData = {
            "page_name": "nutritionlist"
        };
        this.setState({ loader: true });
        staffloginAction(StaffData).then(responseJson => {
            if (responseJson.status == 1) {
                this.setState({
                    dataSource: responseJson.result,
                    loader: false,
                });
            } else {
                this.setState({ loader: false });
            }
        });
    }

    onRefresh() {
        this.stafflogin();
    }

    LoadingIndicatorView() {
        return <ActivityIndicator style={styleCss.loading} size="large" color="#30afb5" />
    }

    componentDidMount() {
        const { navigation } = this.props;
        this.setState({ loader: true })
        this.stafflogin();

        // Navigation v6 focus listener
        this.unsubscribe = navigation.addListener('focus', () => {
            this.stafflogin();
            // Add back button handler when screen is focused
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', this._handleBackButtonClick);
        });

        // Add blur listener to remove back button handler
        this.unsubscribeBlur = navigation.addListener('blur', () => {
            if (this.backHandler) {
                this.backHandler.remove();
            }
        });

        this.setState({ loader: false })
    }

    componentWillUnmount() {
        // Clean up listeners
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        if (this.unsubscribeBlur) {
            this.unsubscribeBlur();
        }
        if (this.backHandler) {
            this.backHandler.remove();
        }
    }

    _handleBackButtonClick = () => {
        this.props.navigation.navigate('staffDashboard');
        return true; // Prevent default back button behavior
    }

    render() {
        const { loader, dataSource } = this.state;
        const { navigation } = this.props;

        if (!loader) {
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
                            <Text style={styleCss.NaveText}>{t("Nutrition Schedule")}</Text>
                        </Col>

                        <Col>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("Attendance_Scanner")}
                                style={styleCss.workout_col}
                            >
                                <Image
                                    style={styleCss.Naveicon}
                                    source={require("../../../../images/barcode-scanner.png")}
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
                    <WebView
                        source={{ uri: dataSource }}
                        renderLoading={this.LoadingIndicatorView}
                        // startInLoadingState={true}
                        // javaScriptEnabled={false}
                        // domStorageEnabled={true}
                    />
                </View>
            );
        } else {
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
                            <Text style={styleCss.NaveText}>{t("Nutrition Schedule")}</Text>
                        </Col>

                        <Col>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("Attendance_Scanner")}
                                style={styleCss.workout_col}
                            >
                                <Image
                                    style={styleCss.Naveicon}
                                    source={require("../../../../images/barcode-scanner.png")}
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
                    <ActivityIndicator
                        style={styleCss.loading}
                        size="large"
                        color="#30afb5"
                    />
                </View>
            );
        }
    }
}