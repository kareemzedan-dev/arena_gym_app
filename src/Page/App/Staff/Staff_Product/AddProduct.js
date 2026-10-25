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
import { useFocusEffect } from '@react-navigation/native';
import { Col, Row } from 'react-native-easy-grid';
import { staffloginAction } from '../../../../util/action';
import { WebView } from 'react-native-webview';
import { t } from '../../../../../locals';
import styleCss from '../../../../style'

// HOC to provide navigation focus events to class component
function withFocusEffect(Component) {
    return function WrappedComponent(props) {
        useFocusEffect(
            React.useCallback(() => {
                if (props.onFocus) {
                    props.onFocus();
                }
                return () => {
                    if (props.onBlur) {
                        props.onBlur();
                    }
                };
            }, [props.onFocus, props.onBlur])
        );
        return <Component {...props} />;
    };
}

class AddProduct extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loader: false,
            dataSource: '',
        };
    }

    static navigationOptions = ({ navigation }) => {
        return {
            headerShown: false,
        };
    };

    toggleDrawer = ({ navigation }) => {
        this.props.navigation.toggleDrawer();
    };

    componentDidMount() {
        this.setState({ loader: true })
        this.stafflogin();
        this.setState({ loader: false })
    }

    async stafflogin() {
        const StaffData = {
            "page_name": "productlist"
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
        // Refresh data when screen comes into focus
        this.stafflogin();
    }

    _handleBackButtonClick = () => {
        this.props.navigation.navigate('staffDashboard');
        return true; // Prevent default behavior
    }

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
                            <Text style={styleCss.NaveText}>{t("Product")}</Text>
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
                            <Text style={styleCss.NaveText}>{t("Product")}</Text>
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

// Export the component wrapped with focus effect HOC
export default withFocusEffect(AddProduct);