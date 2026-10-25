import React, { Component } from 'react';
import {
    BackHandler,
    ActivityIndicator,
    RefreshControl,
    Text,
    View,
    Image,
    TouchableOpacity,
    StatusBar,
    ScrollView,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { connect } from "react-redux";
import { fetchSubscriptionlist, loadingStart } from "../../redux/actions/subscription";
import { Col, Row } from 'react-native-easy-grid';
import Collapsible from 'react-native-collapsible';
import { t } from '../../../../locals';
import styleCss from '../../../style.js';
import moment from 'moment';

class SubscriptionHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            historySource: [],
            ImageLoading: false,
            // Initialize with empty collapsed states object
            ...Array.from({ length: 100 }, (_, i) => ({ [`collapsed_${i}`]: false })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
        };
    }

    toggleModal = () => {
        this.setState({ isModalVisible: !this.state.isModalVisible });
    };

    toggleDrawer = () => {
        this.props.navigation.toggleDrawer();
    };

    componentDidMount() {
        this.subscriptionHistory();
        
        // Set up focus and blur listeners for React Navigation v6
        const unsubscribeFocus = this.props.navigation.addListener('focus', this._onFocus);
        const unsubscribeBlur = this.props.navigation.addListener('blur', this._onBlurr);
        
        // Store unsubscribe functions for cleanup
        this.unsubscribeFocus = unsubscribeFocus;
        this.unsubscribeBlur = unsubscribeBlur;
    }

    componentWillUnmount() {
        // Clean up listeners
        if (this.unsubscribeFocus) {
            this.unsubscribeFocus();
        }
        if (this.unsubscribeBlur) {
            this.unsubscribeBlur();
        }
        
        // Remove back handler
        if (this.backHandlerSubscription) {
            this.backHandlerSubscription.remove();
        }
    }

    async subscriptionHistory() {
        const { fetchSubscriptionlist, loadingStart } = this.props
        loadingStart();
        const Id = await SecureStore.getItemAsync("id");
        const Token = await SecureStore.getItemAsync("access_token");
        const historyData = {
            "current_user_id": Id,
            "access_token": Token,
        };
        fetchSubscriptionlist(historyData);
    }

    onRefresh() {
        this.subscriptionHistory();
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

    _handleBackButtonClick = () => {
        this.props.navigation.navigate('Dashboard');
        return true; // Prevent default back action
    }

    // Enhanced data processing with fallback to user data
    processSubscriptionData = () => {
        const { data, userData } = this.props;
        
        console.log('🔍 DEBUG processSubscriptionData - raw data:', data);
        console.log('🔍 DEBUG processSubscriptionData - userData:', userData);
        
        // Handle nested array case - API sometimes returns [[Object]] instead of [Object]
        let normalizedData = data;
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
            normalizedData = data[0];
            console.log('🔍 DEBUG found nested array, normalizing to:', normalizedData);
        }
        
        let processedData = [];
        
        // Add subscription data if available
        if (normalizedData && Array.isArray(normalizedData) && normalizedData.length > 0) {
            processedData = [...normalizedData];
        }
        
        // Add current membership from user data as fallback if no subscription data exists
        if (processedData.length === 0 && userData) {
            const currentMembership = this.getCurrentMembershipFromUserData();
            if (currentMembership) {
                processedData = [currentMembership];
                console.log('🔍 DEBUG added userData membership:', currentMembership);
            }
        }
        
        console.log('🔍 DEBUG final processed data:', processedData);
        return processedData;
    };

    // Get current membership from user data
    getCurrentMembershipFromUserData = () => {
        const { userData } = this.props;
        if (!userData) return null;

        const membershipId = userData.membership_id;
        const membershipName = userData.membership_name;
        const validFrom = userData.membership_valid_from;
        const validTo = userData.membership_valid_to;
        const membershipStatus = userData.membership_status;

        if (!membershipId || !validTo) return null;

        const currentDate = moment();
        const endDate = moment(validTo, ['YYYY/MM/DD', 'DD/MM/YYYY', 'YYYY-MM-DD']);
        const isActive = endDate.isValid() && 
                         currentDate.isSameOrBefore(endDate, 'day') && 
                         membershipStatus === 'Continue';

        return {
            membership_id: membershipId,
            membership_name: membershipName || 'Golden Membership',
            start_date: this.formatDate(validFrom),
            end_date: this.formatDate(validTo),
            membership_status: isActive ? t('Active') : t('Expired'),
            payment_status: isActive ? t('Active') : t('Expired'),
            is_current_membership: isActive,
            membership_amount: '0',
            paid_amount: '0',
            currency_symbol: '',
            isFromUserData: true
        };
    };

    // Format date helper
    formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = moment(dateString, ['YYYY/MM/DD', 'DD/MM/YYYY', 'YYYY-MM-DD']);
            return date.isValid() ? date.format('DD/MM/YYYY') : dateString;
        } catch (error) {
            return dateString;
        }
    };

    render() {
        const { loading, userData } = this.props;
        const { navigate } = this.props.navigation;
        
        // Early return with loading if userData is not available
        if (!userData) {
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
                            <Text style={styleCss.NaveText}>{t("Subscription History")}</Text>
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
        
        // Get processed subscription data
        const processedData = this.processSubscriptionData();
        
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
                            <Text style={styleCss.NaveText}>{t("Subscription History")}</Text>
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
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                colors={["#30afb5"]}
                                refreshing={loading}
                                onRefresh={this.onRefresh.bind(this)}
                            />
                        }
                    >

                        <Row style={styleCss.subscription_details_row}>
                            <Col style={styleCss.subscription_image_col}>
                                <Col style={styleCss.subscription_image_two_col}>
                                    <Image
                                        onLoadStart={(e) => this.setState({ ImageLoading: true })}
                                        onLoadEnd={(e) => this.setState({ ImageLoading: false })}
                                        style={styleCss.subscription_image_css}
                                        source={userData && userData.member_image ? { uri: userData.member_image } : require('../../../images/undefined-profile.png')}
                                        defaultSource={require('../../../images/undefined-profile.png')}
                                        onError={() => {
                                            console.warn('Profile image load failed, using default');
                                            this.setState({ ImageLoading: false });
                                        }}
                                    />
                                    <ActivityIndicator
                                        style={styleCss.loading}
                                        animating={this.state.ImageLoading}
                                        size="small"
                                        color="#30afb5"
                                    />
                                </Col>
                            </Col>
                            <Col style={styleCss.subscription_text_col}>
                                <Row style={styleCss.subscription_name_row}>
                                    <Text style={styleCss.subscription_name_text}>{(userData?.first_name || '')} {(userData?.last_name || '')}</Text>
                                </Row>
                                <Row style={styleCss.subscription_address_row}>
                                    <Text numberOfLines={1} style={styleCss.subscription_address_text}>{(userData?.address || '')}, {(userData?.city || '')}</Text>
                                </Row>
                                {userData?.state && userData.state !== "" ? (
                                    <Row style={styleCss.subscription_location_row}>
                                        <Col style={styleCss.subscription_location_col}>
                                            <Image style={styleCss.subscription_location_image}
                                                source={require('../../../images/Location2-Pin-Gray-512.png')}
                                            />
                                        </Col>
                                        <Col style={styleCss.subscription_state_col}>
                                            <Text style={styleCss.subscription_state_text}>{userData?.state || ''}</Text>
                                        </Col>
                                    </Row>
                                ) : (<View></View>)}
                            </Col>
                        </Row>

                        {(processedData.length !== 0) ? (
                            <View>
                                {processedData.map((Data, index) => (
                                    <Col style={styleCss.subscription_collaps_col} key={index}>
                                        <View>
                                            <TouchableOpacity onPress={() => {
                                                this.setState({ [`collapsed_${index}`]: !this.state[`collapsed_${index}`] })
                                            }}>
                                                <Row style={styleCss.subscription_header_row}>
                                                    <Col style={styleCss.subscription_header_col}>
                                                        <Text style={styleCss.subscription_header_text}>
                                                            {Data.membership_name}
                                                            {Data.isFromUserData && (
                                                                <Text style={{ fontSize: 12, color: '#4CAF50' }}> • {t('Current')}</Text>
                                                            )}
                                                        </Text>
                                                    </Col>
                                                    <Col style={styleCss.subscription_header_two_col}>
                                                        <Image style={styleCss.subscription_header_image}
                                                            source={this.state[`collapsed_${index}`] ?
                                                                require('../../../images/down-arrow.png') :
                                                                require('../../../images/right-arrow.png')} />
                                                    </Col>
                                                </Row>
                                            </TouchableOpacity>

                                            <Collapsible collapsed={!this.state[`collapsed_${index}`]}>
                                                <Row style={styleCss.subscription_body_top_row}>
                                                    <Col style={styleCss.subscription_body_image_col}>
                                                        <Image style={styleCss.subscription_body_image}
                                                            source={require('../../../images/subscription_menu.png')} />
                                                    </Col>
                                                    <Col style={styleCss.subscription_body_text_col}>
                                                        <Row style={styleCss.subscription_body_text_row}>
                                                            <Text style={styleCss.subscription_body_text}>{t("MemberShip Title")}</Text>
                                                        </Row>
                                                        <Row style={styleCss.subscription_body_text_row}>
                                                            <Text style={styleCss.subscription_body_text_two}>{Data.membership_name}</Text>
                                                        </Row>
                                                    </Col>
                                                </Row>

                                                {Data.membership_amount && parseFloat(Data.membership_amount) > 0 && (
                                                    <Row style={styleCss.subscription_body_row}>
                                                        <Col style={styleCss.subscription_body_image_col}>
                                                            <Image style={styleCss.subscription_body_image}
                                                                source={require('../../../images/subscription_payment.png')} />
                                                        </Col>
                                                        <Col style={styleCss.subscription_body_text_col}>
                                                            <Row style={styleCss.subscription_body_text_row}>
                                                                <Text style={styleCss.subscription_body_text}>{t("Amount")}</Text>
                                                            </Row>
                                                            <Row style={styleCss.subscription_body_text_row}>
                                                                <Text style={styleCss.subscription_body_text_two}>{Data.currency_symbol} {Data.membership_amount}</Text>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                )}

                                                {Data.start_date && (
                                                    <Row style={styleCss.subscription_body_row}>
                                                        <Col style={styleCss.subscription_body_image_col}>
                                                            <Image style={styleCss.subscription_body_image}
                                                                source={require('../../../images/date-yellow-512.png')} />
                                                        </Col>
                                                        <Col style={styleCss.subscription_body_text_col}>
                                                            <Row style={styleCss.subscription_body_text_row}>
                                                                <Text style={styleCss.subscription_body_text}>{t("Membership Start Date")}</Text>
                                                            </Row>
                                                            <Row style={styleCss.subscription_body_text_row}>
                                                                <Text style={styleCss.subscription_body_text_two}>{Data.start_date}</Text>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                )}

                                                {Data.end_date && (
                                                    <Row style={styleCss.subscription_body_row}>
                                                        <Col style={styleCss.subscription_body_image_col}>
                                                            <Image style={styleCss.subscription_body_image}
                                                                source={require('../../../images/date-yellow-512.png')} />
                                                        </Col>
                                                        <Col style={styleCss.subscription_body_text_col}>
                                                            <Row style={styleCss.subscription_body_text_row}>
                                                                <Text style={styleCss.subscription_body_text}>{t("Membership End Date")}</Text>
                                                            </Row>
                                                            <Row style={styleCss.subscription_body_text_row}>
                                                                <Text style={styleCss.subscription_body_text_two}>{Data.end_date}</Text>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                )}

                                                <Row style={styleCss.subscription_body_row}>
                                                    <Col style={styleCss.subscription_body_image_col}>
                                                        <Image style={styleCss.subscription_body_image}
                                                            source={require('../../../images/Status-Yellow-512.png')} />
                                                    </Col>
                                                    <Col style={styleCss.subscription_body_text_col}>
                                                        <Row style={styleCss.subscription_body_text_row}>
                                                            <Text style={styleCss.subscription_body_text}>{t("Membership Status")}</Text>
                                                        </Row>
                                                        <Row style={styleCss.subscription_body_text_row}>
                                                            <Text style={styleCss.subscription_body_text_two}>{Data.membership_status}</Text>
                                                        </Row>
                                                    </Col>
                                                </Row>

                                                {Data.payment_status && (
                                                    <Row style={styleCss.subscription_body_row}>
                                                        <Col style={styleCss.subscription_body_image_col}>
                                                            <Image style={styleCss.subscription_body_image}
                                                                source={require('../../../images/subscription_payment.png')} />
                                                        </Col>
                                                        <Col style={styleCss.subscription_body_text_col}>
                                                            <Row style={styleCss.subscription_body_text_row}>
                                                                <Text style={styleCss.subscription_body_text}>{t("Payment Status")}</Text>
                                                            </Row>
                                                            <Row style={styleCss.subscription_body_text_row}>
                                                                <Text style={styleCss.subscription_body_text_two}>{Data.payment_status}</Text>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                )}

                                                {Data.invoice_no && (
                                                    <Row style={styleCss.subscription_body_row}>
                                                        <Col style={styleCss.subscription_body_image_col}>
                                                            <Image style={styleCss.subscription_body_image}
                                                                source={require('../../../images/subscription_menu.png')} />
                                                        </Col>
                                                        <Col style={styleCss.subscription_body_text_col}>
                                                            <Row style={styleCss.subscription_body_text_row}>
                                                                <Text style={styleCss.subscription_body_text}>{t("Invoice Number")}</Text>
                                                            </Row>
                                                            <Row style={styleCss.subscription_body_text_row}>
                                                                <Text style={styleCss.subscription_body_text_two}>#{Data.invoice_no}</Text>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                )}
                                            </Collapsible>
                                        </View>
                                    </Col>
                                ))}
                            </View>
                        ) : (
                            <View style={styleCss.subscription_nodata_container}>
                                <Text style={styleCss.subscription_nodata_text}>{t("No Subscription History")}</Text>
                                <Text style={styleCss.subscription_nodata_text}>{t("Data is")}</Text>
                                <Text style={styleCss.subscription_nodata_text}>{t("Not available")}</Text>
                            </View>
                        )}
                    </ScrollView>
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
                            <Text style={styleCss.NaveText}>{t("Subscription History")}</Text>
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

const mapStateToProps = (state) => {
    return {
        data: state.subscription.subscriptionData,
        loading: state.subscription.loading,
        userData: state.auth.userData,
    };
};

const mapDispatchToProps = {
    fetchSubscriptionlist,
    loadingStart
};

export default connect(mapStateToProps, mapDispatchToProps)(SubscriptionHistory);