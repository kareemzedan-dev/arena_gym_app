import React, { useEffect, useCallback, useRef } from 'react';
import {
    BackHandler,
    ActivityIndicator,
    RefreshControl,
    Text,
    View,
    Image,
    FlatList,
    TouchableOpacity,
    TouchableHighlight,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Col, Row } from 'react-native-easy-grid';
import { useNavigation } from '@react-navigation/native';
import { useNavigationEvents } from '../../../util/navigation-hooks';
import { t } from '../../../../locals';
import styleCss from '../../../style.js';
import { connect } from "react-redux";
import { fetchfeespaymentlist, loadingStart } from "../../redux/actions/feesPayment";

function FeesPayment(props) {
    const navigation = useNavigation();
    const backHandlerRef = useRef(null);

    useEffect(() => {
        paymentList();
    }, []);

    const handleBackButton = useCallback(() => {
        navigation.navigate('Dashboard');
        return true;
    }, [navigation]);

    useNavigationEvents({
        onWillFocus: () => {
            backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
        },
        onWillBlur: () => {
            if (backHandlerRef.current) {
                backHandlerRef.current.remove();
            }
        }
    });

    const paymentList = async () => {
        const { fetchfeespaymentlist, loadingStart } = props;
        loadingStart();
        const Id = await SecureStore.getItemAsync("id");
        const Token = await SecureStore.getItemAsync("access_token");

        const payment = {
            current_user_id: Id,
            access_token: Token,
        };
        fetchfeespaymentlist(payment);
    };

    const onRefresh = () => {
        paymentList();
    };

    const renderItem = ({ item }) => (
        <View style={styleCss.loign_container}>
            <Row style={styleCss.feespayment_data_row}>
                <Col style={styleCss.feespayment_data_col}>
                    <Col>
                        <Text numberOfLines={1} style={styleCss.feespayment_data_col_text}>
                            {item.membership_title}
                        </Text>
                    </Col>
                    <Row>
                        <Col style={styleCss.feespayment_details_col}>
                            <Text style={styleCss.feespayment_details_text}>{t("Amount")}</Text>
                        </Col>
                        <Col style={styleCss.feespayment_details_col_two}>
                            <Text style={styleCss.feespayment_details_text}>:</Text>
                        </Col>
                        <Col style={styleCss.feespayment_details_col_three}>
                            <Text style={styleCss.feespayment_details_text}>
                                {item.currency_symbol} {item.amount}
                            </Text>
                        </Col>
                    </Row>
                    <Row>
                        <Col style={styleCss.feespayment_details_col}>
                            <Text style={styleCss.feespayment_details_text}>{t("Paid Amount")}</Text>
                        </Col>
                        <Col style={styleCss.feespayment_details_col_two}>
                            <Text style={styleCss.feespayment_details_text}>:</Text>
                        </Col>
                        <Col style={styleCss.feespayment_details_col_three}>
                            <Text style={styleCss.feespayment_details_text}>
                                {item.currency_symbol} {item.paid_amount}
                            </Text>
                        </Col>
                    </Row>
                    <Row>
                        <Col style={styleCss.feespayment_details_col}>
                            <Text style={styleCss.feespayment_details_text}>{t("Due Amount")}</Text>
                        </Col>
                        <Col style={styleCss.feespayment_details_col_two}>
                            <Text style={styleCss.feespayment_details_text}>:</Text>
                        </Col>
                        <Col style={styleCss.feespayment_details_col_three}>
                            <Text style={styleCss.feespayment_details_text}>
                                {item.currency_symbol} {item.due_amount}
                            </Text>
                        </Col>
                    </Row>
                    <Row>
                        <Col style={styleCss.feespayment_details_col}>
                            <Text style={styleCss.feespayment_details_text}>{t("Status")}</Text>
                        </Col>
                        <Col style={styleCss.feespayment_details_col_two}>
                            <Text style={styleCss.feespayment_details_text}>:</Text>
                        </Col>
                        <Col style={styleCss.feespayment_details_col_three}>
                            <Text numberOfLines={1} style={styleCss.feespayment_details_text}>
                                {item.payment_status}
                            </Text>
                        </Col>
                    </Row>
                </Col>
                <Col style={styleCss.feespayment_data_col_two}>
                    <Row>
                        <TouchableHighlight
                            onPress={() => navigation.navigate('viewpayment', { membershipData: item })}
                            underlayColor={'#fff'}
                            style={styleCss.feespayment_button}
                        >
                            <Text style={styleCss.feespayment_button_text}>{t("View Details")}</Text>
                        </TouchableHighlight>
                    </Row>
                    <Row>
                        <TouchableHighlight
                            onPress={() => navigation.navigate('viewinvoice', { 
                                memberinvoicekey: item.invoice_id, 
                                membership_name: item.membership_title 
                            })}
                            underlayColor={'#fff'}
                            style={styleCss.feespayment_button}
                        >
                            <Text style={styleCss.feespayment_button_text}>{t("View Invoice")}</Text>
                        </TouchableHighlight>
                    </Row>
                </Col>
            </Row>
        </View>
    );

    const { data, loading } = props;

    if (!loading) {
        return (
            <View style={styleCss.container}>
                <Row style={styleCss.NaveBar}>
                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate("CustomSideBar")} 
                            style={styleCss.menu_col}
                        >
                            <Image 
                                style={styleCss.Naveicon}
                                source={require('../../../images/Menu-white.png')}
                            />
                        </TouchableOpacity>
                    </Col>

                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate("Home")} 
                            style={styleCss.back_arrow}
                        >
                            <Image 
                                style={styleCss.Naveicon}
                                source={require('../../../images/Back-Arrow-White.png')}
                            />
                        </TouchableOpacity>
                    </Col>

                    <Col style={styleCss.name_col}>
                        <Text style={styleCss.NaveText}>{t("Fees Payment")}</Text>
                    </Col>

                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Workouts')} 
                            style={styleCss.workout_col}
                        >
                            <Image 
                                style={styleCss.Naveicon}
                                source={require('../../../images/Workout-White.png')}
                            />
                        </TouchableOpacity>
                    </Col>
                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Message')} 
                            style={styleCss.message_col}
                        >
                            <Image 
                                style={styleCss.Naveicon}
                                source={require('../../../images/Message-white.png')}
                            />
                        </TouchableOpacity>
                    </Col>
                </Row>
                <Row>
                    <FlatList
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.invoice_id.toString()}
                        ListEmptyComponent={
                            <EmptyComponent title={t("Data not available")} />
                        }
                        refreshControl={
                            <RefreshControl
                                colors={["#30afb5"]}
                                refreshing={loading}
                                onRefresh={onRefresh}
                            />
                        }
                    />
                </Row>
            </View>
        );
    } else {
        return (
            <View style={styleCss.container}>
                <Row style={styleCss.NaveBar}>
                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate("CustomSideBar")} 
                            style={styleCss.menu_col}
                        >
                            <Image 
                                style={styleCss.Naveicon}
                                source={require('../../../images/Menu-white.png')}
                            />
                        </TouchableOpacity>
                    </Col>

                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate("Home")} 
                            style={styleCss.back_arrow}
                        >
                            <Image 
                                style={styleCss.Naveicon}
                                source={require('../../../images/Back-Arrow-White.png')}
                            />
                        </TouchableOpacity>
                    </Col>

                    <Col style={styleCss.name_col}>
                        <Text style={styleCss.NaveText}>{t("Fees Payment")}</Text>
                    </Col>

                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Workouts')} 
                            style={styleCss.workout_col}
                        >
                            <Image 
                                style={styleCss.Naveicon}
                                source={require('../../../images/Workout-White.png')}
                            />
                        </TouchableOpacity>
                    </Col>
                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Message')} 
                            style={styleCss.message_col}
                        >
                            <Image 
                                style={styleCss.Naveicon}
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

const EmptyComponent = ({ title }) => (
    <View style={styleCss.emptyContainer}>
        <Text style={styleCss.emptyText}>{title}</Text>
    </View>
);

const mapStateToProps = (state) => {
    return {
        data: state.feesPayment.feesPaymentData,
        loading: state.feesPayment.loading,
    };
};

const mapDispatchToProps = {
    fetchfeespaymentlist,
    loadingStart
};

export default connect(mapStateToProps, mapDispatchToProps)(FeesPayment);