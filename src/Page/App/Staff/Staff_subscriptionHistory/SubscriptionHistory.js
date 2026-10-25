import React, { Component } from 'react';
import {
    BackHandler,
    ActivityIndicator,
    Text,
    View,
    Image,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { Col, Row } from 'react-native-easy-grid';
import { useFocusEffect } from '@react-navigation/native';
import { staffloginAction } from '../../../../util/action';
import { t } from '../../../../../locals';
import { WebView } from 'react-native-webview';
import styleCss from '../../../../style'

class SubscriptionHistoryClass extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loader: false,
            ImageLoading: false,
            dataSource: '',
        };
    }

    toggleDrawer = ({ navigation }) => {
        this.props.navigation.getParent()?.openDrawer();
    };

    componentDidMount() {
        this.setState({ loader: true })
        this.stafflogin();
        this.setState({ loader: false })
    }

    async stafflogin() {
        const StaffData = {
            "page_name": "subscription_history"
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

    _onBlurr = () => {
        if (this.backHandlerSubscription) {
            this.backHandlerSubscription.remove();
        }
    }

    _onFocus = () => {
        this.backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress',
            this._handleBackButtonClick);
    }

    _handleBackButtonClick = () => this.props.navigation.navigate('staffDashboard')

    render() {
        const { loader, dataSource } = this.state;
        const { navigate } = this.props.navigation;
        if (!loader) {
            return (
                <View style={styleCss.container}>
                    <StatusBar />
                    <Row style={styleCss.NaveBar}>
                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate("StaffCustomSideBar")} style={styleCss.menu_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../../images/Menu-white.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col>
                            <TouchableOpacity onPress={() => navigate("staffDashboard")} style={styleCss.back_arrow}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../../images/Back-Arrow-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col style={styleCss.name_col}>
                            <Text style={styleCss.NaveText}>{t("Subscription History")}</Text>
                        </Col>

                        <Col>
                            <TouchableOpacity
                                onPress={() => this.props.navigation.navigate("Attendance_Scanner")}
                                style={styleCss.workout_col}
                            >
                                <Image
                                style={styleCss.Naveicon}
                                source={require("../../../../images/barcode-scanner.png")}
                                />
                            </TouchableOpacity>
                            </Col>
                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('StaffMessage')} style={styleCss.message_col}>
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
                            <TouchableOpacity onPress={() => this.props.navigation.navigate("StaffCustomSideBar")} style={styleCss.menu_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../../images/Menu-white.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col>
                            <TouchableOpacity onPress={() => navigate("staffDashboard")} style={styleCss.back_arrow}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../../images/Back-Arrow-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col style={styleCss.name_col}>
                            <Text style={styleCss.NaveText}>{t("Subscription History")}</Text>
                        </Col>

                        <Col>
                            <TouchableOpacity
                                onPress={() => this.props.navigation.navigate("Attendance_Scanner")}
                                style={styleCss.workout_col}
                            >
                                <Image
                                style={styleCss.Naveicon}
                                source={require("../../../../images/barcode-scanner.png")}
                                />
                            </TouchableOpacity>
                            </Col>
                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('StaffMessage')} style={styleCss.message_col}>
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

// Wrapper component to handle focus events with hooks
export default function SubscriptionHistory(props) {
    const componentRef = React.useRef();

    useFocusEffect(
        React.useCallback(() => {
            // On focus
            if (componentRef.current) {
                componentRef.current._onFocus();
                componentRef.current.stafflogin();
            }

            // On blur (cleanup)
            return () => {
                if (componentRef.current) {
                    componentRef.current._onBlurr();
                }
            };
        }, [])
    );

    return <SubscriptionHistoryClass ref={componentRef} {...props} />;
}