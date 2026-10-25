import React, { Component } from 'react';
import {
    BackHandler,
    ActivityIndicator,
    RefreshControl,
    Text,
    View,
    Image,
    FlatList,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Col, Row } from 'react-native-easy-grid';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { connect } from "react-redux";
import { fetchStaffmemberlist, loadingStart } from "../../redux/actions/staffMember";
import { t } from '../../../../locals';
import styleCss from '../../../style'

class StaffMemberList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ImageLoading: false,
        };
        this.backHandler = null; // Store the subscription reference
    }

    componentDidMount() {
        this.StaffMemberList();
        
        // Add focus listener for navigation v6
        this.unsubscribeFocus = this.props.navigation.addListener('focus', () => {
            this._onFocus();
        });
        
        // Add blur listener for navigation v6
        this.unsubscribeBlur = this.props.navigation.addListener('blur', () => {
            this._onBlur();
        });
    }

    componentWillUnmount() {
        // Clean up listeners
        if (this.unsubscribeFocus) {
            this.unsubscribeFocus();
        }
        if (this.unsubscribeBlur) {
            this.unsubscribeBlur();
        }
        this._onBlur();
    }

    toggleDrawer = () => {
        this.props.navigation.toggleDrawer();
    };

    async StaffMemberList() {
        const { fetchStaffmemberlist, loadingStart } = this.props;

        loadingStart();
        const Id = await SecureStore.getItemAsync("id");
        const Token = await SecureStore.getItemAsync("access_token");

        const StaffMemberListData = {
            current_user_id: Id,
            access_token: Token,
        };

        // Redux action called for fetch booked class of logined user
        fetchStaffmemberlist(StaffMemberListData);
    }

    onRefresh() {
        this.StaffMemberList();
    }

    _onBlur = () => {
        // Remove the back handler subscription
        if (this.backHandler) {
            this.backHandler.remove();
            this.backHandler = null;
        }
    }

    _onFocus = () => {
        // Add the back handler subscription
        this.backHandler = BackHandler.addEventListener('hardwareBackPress',
            this._handleBackButtonClick);
    }

    _handleBackButtonClick = () => {
        this.props.navigation.navigate('Home');
        return true; // Prevent default behavior
    }

    // render item for flatlist
    renderItem = ({ item }) => {
        return (
            <View style={styleCss.mainContainer}>
                <View>
                    <Row style={styleCss.staff_member_row}>
                        <Col style={styleCss.staff_member_col}>
                            <Col style={styleCss.staff_member_image_col}>
                                <Image
                                    onLoadStart={(e) => this.setState({ ImageLoading: true })}
                                    onLoadEnd={(e) => this.setState({ ImageLoading: false })}
                                    source={item.staff_image ? { uri: item.staff_image } : null}
                                    style={styleCss.staff_member_image}
                                />
                                <ActivityIndicator
                                    style={styleCss.loading}
                                    animating={this.state.ImageLoading}
                                    size="small"
                                    color="#30afb5"
                                />
                            </Col>
                        </Col>
                        <Col style={styleCss.staff_details_col}>
                            <Row style={styleCss.staff_details_row}>
                                <Text style={styleCss.staff_member_text}>{item.staff_name}</Text>
                            </Row>
                            <Row style={styleCss.staff_details_row}>
                                <Col>
                                    <Text style={styleCss.staff_member_text_two}>{item.email}</Text>
                                </Col>
                            </Row>
                            <Row style={styleCss.staff_details_row}>
                                <Col>
                                    <Text style={styleCss.staff_member_text_two}>{item.mobile}</Text>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </View>
            </View>
        );
    };

    render() {
        const { navigate } = this.props.navigation;
        const { data, loading } = this.props;
        
        if (!loading) {
            return (
                <View style={styleCss.container}>
                    <StatusBar />
                    <Row style={styleCss.NaveBar}>
                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate("CustomSideBar")} style={styleCss.menu_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Menu-white.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col>
                            <TouchableOpacity onPress={() => navigate("Home")} style={styleCss.back_arrow}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Back-Arrow-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col style={styleCss.name_col}>
                            <Text style={styleCss.NaveText}>{t("Staff Member")}</Text>
                        </Col>

                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Workouts')} style={styleCss.workout_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Workout-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>
                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Message')} style={styleCss.message_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Message-white.png')}
                                />
                            </TouchableOpacity>
                        </Col>
                    </Row>

                    <FlatList
                        data={data}
                        renderItem={this.renderItem}
                        keyExtractor={(item) => item.staff_id.toString()}
                        ListEmptyComponent={
                            <EmptyComponent title={t("Data not available")} />
                        }
                        refreshControl={
                            <RefreshControl
                                colors={["#30afb5"]}
                                refreshing={loading}
                                onRefresh={this.onRefresh.bind(this)}
                            />
                        }
                    />

                </View>
            );
        } else {
            return (
                <View style={styleCss.container}>
                    <StatusBar />
                    <Row style={styleCss.NaveBar}>
                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate("CustomSideBar")} style={styleCss.menu_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Menu-white.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col>
                            <TouchableOpacity onPress={() => navigate("Home")} style={styleCss.back_arrow}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Back-Arrow-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col style={styleCss.name_col}>
                            <Text style={styleCss.NaveText}>{t("Staff Member")}</Text>
                        </Col>

                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Workouts')} style={styleCss.workout_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Workout-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>
                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Message')} style={styleCss.message_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Message-white.png')}
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

// empty component
const EmptyComponent = ({ title }) => (
    <View style={styleCss.emptyContainer}>
        <Text style={styleCss.emptyText}>{title}</Text>
    </View>
);

const mapStateToProps = (state) => {
    return {
        data: state.staffMember.staffMemberData,
        loading: state.staffMember.loading,
    };
};

const mapDispatchToProps = {
    fetchStaffmemberlist,
    loadingStart
};

export default connect(mapStateToProps, mapDispatchToProps)(StaffMemberList);