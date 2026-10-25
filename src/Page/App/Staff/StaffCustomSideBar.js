import React, { useEffect, useCallback } from 'react';
import {
    ActivityIndicator,
    View,
    Image,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Alert,
} from "react-native";
import { Col, Row } from "react-native-easy-grid";
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { t } from "../../../../locals";
import { connect } from "react-redux";
import { fetchAccessright, loadingStart } from "../../redux/actions/sidebarMenu";
import { fetchUserdetails, Logoutmember } from "../../redux/actions/auth";
import styleCss from '../../../style';

function StaffCustomSideBar(props) {
    const navigation = useNavigation();

    useEffect(() => {
        accessRights();
        singleMember();
    }, []);

    const logout = () => {
        Alert.alert(t("Gym App"), t("Are you sure you want to exit app?"), [
            {
                text: t("No"),
                onPress: () => navigation.navigate('staffDashboard'),
                style: "cancel",
            },
            { 
                text: t("Yes"), 
                onPress: () => memberLogout() 
            },
        ]);
    };

    const memberLogout = async () => {
        const { Logoutmember, loadingStart } = props;
        loadingStart();
        const Id = await SecureStore.getItemAsync("id");
        const Token = await SecureStore.getItemAsync("access_token");
        const userData = {
            "current_user_id": Id,
            "access_token": Token,
        };
        Logoutmember(userData, navigation.navigate);
    };

    const singleMember = async () => {
        const { fetchUserdetails, loadingStart } = props;
        loadingStart();
        const Id = await SecureStore.getItemAsync("id");
        const Token = await SecureStore.getItemAsync("access_token");
        const userData = {
            "member_id": Id,
            "access_token": Token,
        };
        fetchUserdetails(userData);
    };

    const accessRights = async () => {
        const { fetchAccessright, loadingStart } = props;
        const id = await SecureStore.getItemAsync("id");
        const data = {
            user_id: id,
        };
        loadingStart();
        fetchAccessright(data);
    };

    const { 
        userData, 
        staffView, 
        membershipView, 
        groupView, 
        memberView, 
        activityView, 
        scheduleView, 
        assignworkoutView, 
        workoutView, 
        paymentView, 
        messageView, 
        noticeView, 
        accountView, 
        subscriptionView 
    } = props;

    return (
        <View style={styleCss.sidebar_container}>
            <StatusBar />
            <Row style={styleCss.sidebar_NavRow}>
                <Col style={styleCss.sidebar_NavColImg}>
                    <TouchableOpacity
                        style={styleCss.sidebar_back_arrow}
                        onPress={() => navigation.navigate("staffDashboard")}
                    >
                        <Image
                            source={require("../../../images/Close-white-512.png")}
                            style={styleCss.sidebar_Close}
                        />
                    </TouchableOpacity>
                </Col>
            </Row>

            <TouchableOpacity
                style={styleCss.sidebar_ProfileRow}
                onPress={() => navigation.navigate("staffaccount")}
            >
                <Row>
                    <Col style={styleCss.sidebar_ProfileContainer}>
                        <Row style={styleCss.sidebar_ProfileContainer_row}>
                            <Image
                                source={
                                    (userData && userData.member_image)
                                        ? { uri: userData.member_image }
                                        : require("../../../images/undefined-profile.png")
                                }
                                onError={() => {
                                    console.warn('Staff profile image load failed, using default');
                                }}
                                style={styleCss.sidebar_UserProfile}
                            />
                        </Row>
                    </Col>
                    <Col>
                        <Row style={styleCss.sidebar_ProfileName}>
                            <Text numberOfLines={1} style={styleCss.sidebar_sideNavText}>
                                {(userData && userData.first_name) || ''} {(userData && userData.last_name) || ''}
                            </Text>
                        </Row>
                        {(userData && userData.address && userData.city) && (
                            <Row>
                                <Text numberOfLines={1} style={styleCss.sidebar_address_text}>
                                    {userData.address}, {userData.city}
                                </Text>
                            </Row>
                        )}
                    </Col>
                </Row>
            </TouchableOpacity>

            <Col style={styleCss.sidebar_menu_col}>
                <ScrollView>
                    <TouchableOpacity onPress={() => navigation.navigate("staffDashboard")}>
                        <Row style={styleCss.sidebar_DrawerRow}>
                            <Col style={styleCss.sidebar_DrawerIcons}>
                                <Image
                                    source={require("../../../images/Dashboard-White.png")}
                                    style={styleCss.sidebar_Close}
                                />
                            </Col>
                            <Col>
                                <Text style={styleCss.sidebar_sideNavSubText}>
                                    {t("Dashboard")}
                                </Text>
                            </Col>
                        </Row>
                    </TouchableOpacity>

                    {staffView === 1 && (
                        <TouchableOpacity onPress={() => navigation.navigate("staffmemberlist")}>
                            <Row style={styleCss.sidebar_DrawerRow}>
                                <Col style={styleCss.sidebar_DrawerIcons}>
                                    <Image
                                        source={require("../../../images/Staff-Member-white.png")}
                                        style={styleCss.sidebar_Close}
                                    />
                                </Col>
                                <Col>
                                    <Text style={styleCss.sidebar_sideNavSubText}>
                                        {t("Staff Member")}
                                    </Text>
                                </Col>
                            </Row>
                        </TouchableOpacity>
                    )}

                    {membershipView === 1 && (
                        <TouchableOpacity onPress={() => navigation.navigate("AddMembership")}>
                            <Row style={styleCss.sidebar_DrawerRow}>
                                <Col style={styleCss.sidebar_DrawerIcons}>
                                    <Image
                                        source={require("../../../images/Membership-Type-White.png")}
                                        style={styleCss.sidebar_Close}
                                    />
                                </Col>
                                <Col>
                                    <Text style={styleCss.sidebar_sideNavSubText}>
                                        {t("Membership Type")}
                                    </Text>
                                </Col>
                            </Row>
                        </TouchableOpacity>
                    )}

                    {groupView === 1 && (
                        <TouchableOpacity onPress={() => navigation.navigate("AddGroup")}>
                            <Row style={styleCss.sidebar_DrawerRow}>
                                <Col style={styleCss.sidebar_DrawerIcons}>
                                    <Image
                                        source={require("../../../images/Group-White.png")}
                                        style={styleCss.sidebar_Close}
                                    />
                                </Col>
                                <Col>
                                    <Text style={styleCss.sidebar_sideNavSubText}>
                                        {t("Group")}
                                    </Text>
                                </Col>
                            </Row>
                        </TouchableOpacity>
                    )}

                    {memberView === 1 && (
                        <TouchableOpacity onPress={() => navigation.navigate("AddMember")}>
                            <Row style={styleCss.sidebar_DrawerRow}>
                                <Col style={styleCss.sidebar_DrawerIcons}>
                                    <Image
                                        source={require("../../../images/Staff-Member-white.png")}
                                        style={styleCss.sidebar_Close}
                                    />
                                </Col>
                                <Col>
                                    <Text style={styleCss.sidebar_sideNavSubText}>
                                        {t("Member")}
                                    </Text>
                                </Col>
                            </Row>
                        </TouchableOpacity>
                    )}

                    {activityView === 1 && (
                        <TouchableOpacity onPress={() => navigation.navigate("AddActivity")}>
                            <Row style={styleCss.sidebar_DrawerRow}>
                                <Col style={styleCss.sidebar_DrawerIcons}>
                                    <Image
                                        source={require("../../../images/Class-Schedule-White.png")}
                                        style={styleCss.sidebar_Close}
                                    />
                                </Col>
                                <Col>
                                    <Text style={styleCss.sidebar_sideNavSubText}>
                                        {t("Activity")}
                                    </Text>
                                </Col>
                            </Row>
                        </TouchableOpacity>
                    )}

                    {scheduleView === 1 && (
                        <TouchableOpacity onPress={() => navigation.navigate("AddClass")}>
                            <Row style={styleCss.sidebar_DrawerRow}>
                                <Col style={styleCss.sidebar_DrawerIcons}>
                                    <Image
                                        source={require("../../../images/Date.png")}
                                        style={styleCss.sidebar_Close}
                                    />
                                </Col>
                                <Col>
                                    <Text style={styleCss.sidebar_sideNavSubText}>
                                        {t("Class Schedule")}
                                    </Text>
                                </Col>
                            </Row>
                        </TouchableOpacity>
                    )}

                    {assignworkoutView === 1 && (
                        <TouchableOpacity onPress={() => navigation.navigate("AddAssignWorkout")}>
                            <Row style={styleCss.sidebar_DrawerRow}>
                                <Col style={styleCss.sidebar_DrawerIcons}>
                                    <Image
                                        source={require("../../../images/Workout-White.png")}
                                        style={styleCss.sidebar_Close}
                                    />
                                </Col>
                                <Col>
                                    <Text style={styleCss.sidebar_sideNavSubText}>
                                        {t("Assign Workouts")}
                                    </Text>
                                </Col>
                            </Row>
                        </TouchableOpacity>
                    )}

                    {workoutView === 1 && (
                        <TouchableOpacity onPress={() => navigation.navigate("Addworkout")}>
                            <Row style={styleCss.sidebar_DrawerRow}>
                                <Col style={styleCss.sidebar_DrawerIcons}>
                                    <Image
                                        source={require("../../../images/Workout-White.png")}
                                        style={styleCss.sidebar_Close}
                                    />
                                </Col>
                                <Col>
                                    <Text style={styleCss.sidebar_sideNavSubText}>
                                        {t("Workouts")}
                                    </Text>
                                </Col>
                            </Row>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={() => navigation.navigate("Attendance")}>
                        <Row style={styleCss.sidebar_DrawerRow}>
                            <Col style={styleCss.sidebar_DrawerIcons}>
                                <Image
                                    source={require("../../../images/Attendance.png")}
                                    style={styleCss.sidebar_Close}
                                />
                            </Col>
                            <Col>
                                <Text style={styleCss.sidebar_sideNavSubText}>
                                    {t("Attendance")}
                                </Text>
                            </Col>
                        </Row>
                    </TouchableOpacity>

                    {paymentView === 1 && (
                        <TouchableOpacity onPress={() => navigation.navigate("Accountant")}>
                            <Row style={styleCss.sidebar_DrawerRow}>
                                <Col style={styleCss.sidebar_DrawerIcons}>
                                    <Image
                                        source={require("../../../images/Fees-Payment-White.png")}
                                        style={styleCss.sidebar_Close}
                                    />
                                </Col>
                                <Col>
                                    <Text style={styleCss.sidebar_sideNavSubText}>
                                        {t("Fee Payment")}
                                    </Text>
                                </Col>
                            </Row>
                        </TouchableOpacity>
                    )}

                    {messageView === 1 && (
                        <TouchableOpacity onPress={() => navigation.navigate("StaffMessage")}>
                            <Row style={styleCss.sidebar_DrawerRow}>
                                <Col style={styleCss.sidebar_DrawerIcons}>
                                    <Image
                                        source={require("../../../images/Message-white.png")}
                                        style={styleCss.sidebar_Close}
                                    />
                                </Col>
                                <Col>
                                    <Text style={styleCss.sidebar_sideNavSubText}>
                                        {t("Message")}
                                    </Text>
                                </Col>
                            </Row>
                        </TouchableOpacity>
                    )}

                    {noticeView === 1 && (
                        <TouchableOpacity onPress={() => navigation.navigate("StaffNotice")}>
                            <Row style={styleCss.sidebar_DrawerRow}>
                                <Col style={styleCss.sidebar_DrawerIcons}>
                                    <Image
                                        source={require("../../../images/Notice-White.png")}
                                        style={styleCss.sidebar_Close}
                                    />
                                </Col>
                                <Col>
                                    <Text style={styleCss.sidebar_sideNavSubText}>
                                        {t("Notice")}
                                    </Text>
                                </Col>
                            </Row>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={() => navigation.navigate("AddnutritionSchedule")}>
                        <Row style={styleCss.sidebar_DrawerRow}>
                            <Col style={styleCss.sidebar_DrawerIcons}>
                                <Image
                                    source={require("../../../images/Nutrition-White.png")}
                                    style={styleCss.sidebar_Close}
                                />
                            </Col>
                            <Col>
                                <Text style={styleCss.sidebar_sideNavSubText}>
                                    {t("Nutrition Schedule")}
                                </Text>
                            </Col>
                        </Row>
                    </TouchableOpacity>

                    {accountView === 1 && (
                        <TouchableOpacity onPress={() => navigation.navigate("staffaccount")}>
                            <Row style={styleCss.sidebar_DrawerRow}>
                                <Col style={styleCss.sidebar_DrawerIcons}>
                                    <Image
                                        source={require("../../../images/Account-White.png")}
                                        style={styleCss.sidebar_Close}
                                    />
                                </Col>
                                <Col>
                                    <Text style={styleCss.sidebar_sideNavSubText}>
                                        {t("Account")}
                                    </Text>
                                </Col>
                            </Row>
                        </TouchableOpacity>
                    )}

                    {subscriptionView === 1 && (
                        <TouchableOpacity onPress={() => navigation.navigate("StaffSubscriptionHistory")}>
                            <Row style={styleCss.sidebar_DrawerRow}>
                                <Col style={styleCss.sidebar_DrawerIcons}>
                                    <Image
                                        source={require("../../../images/Subscription-White.png")}
                                        style={styleCss.sidebar_Close}
                                    />
                                </Col>
                                <Col>
                                    <Text style={styleCss.sidebar_sideNavSubText}>
                                        {t("Subscription History")}
                                    </Text>
                                </Col>
                            </Row>
                        </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity onPress={() => logout()}>
                        <Row style={styleCss.sidebar_DrawerRow}>
                            <Col style={styleCss.sidebar_DrawerIcons}>
                                <Image
                                    source={require("../../../images/Logout-white.png")}
                                    style={styleCss.sidebar_Close}
                                />
                            </Col>
                            <Col>
                                <Text style={styleCss.sidebar_sideNavSubText}>
                                    {t("Logout")}
                                </Text>
                            </Col>
                        </Row>
                    </TouchableOpacity>
                </ScrollView>
            </Col>
        </View>
    );
}

const mapStateToProps = (state) => {
    return {
        staffView: state.sidebarMenu.staffView,
        membershipView: state.sidebarMenu.datamembershipView,
        groupView: state.sidebarMenu.groupView,
        memberView: state.sidebarMenu.memberView,
        activityView: state.sidebarMenu.activityView,
        scheduleView: state.sidebarMenu.scheduleView,
        assignworkoutView: state.sidebarMenu.assignworkoutView,
        nutritionView: state.sidebarMenu.nutritionView,
        workoutView: state.sidebarMenu.workoutView,
        paymentView: state.sidebarMenu.paymentView,
        messageView: state.sidebarMenu.messageView,
        noticeView: state.sidebarMenu.noticeView,
        accountView: state.sidebarMenu.accountView,
        subscriptionView: state.sidebarMenu.subscriptionView,
        loading: state.sidebarMenu.loading,
        userData: state.auth.userData,
    };
};

const mapDispatchToProps = {
    fetchAccessright,
    fetchUserdetails,
    Logoutmember,
    loadingStart,
};

export default connect(mapStateToProps, mapDispatchToProps)(StaffCustomSideBar);