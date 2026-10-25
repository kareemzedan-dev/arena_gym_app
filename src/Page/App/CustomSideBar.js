import React, { Component } from "react";
import {
  ActivityIndicator,
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import * as SecureStore from 'expo-secure-store';
import { t } from "../../../locals";
import styles from "./CustomSideBar.styles";
import i18n from "i18n-js";
import * as Localization from "expo-localization";

//Redux
import { connect } from "react-redux";
import { fetchAccessright, loadingStart } from "../redux/actions/sidebarMenu";
import { fetchUserdetails, Logoutmember } from "../redux/actions/auth";

class CustomSidebarMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      staffView: "",
      membershipView: "",
      groupView: "",
      memberView: "",
      activityView: "",
      scheduleView: "",
      assignworkoutView: "",
      nutritionView: "",
      workoutView: "",
      paymentView: "",
      messageView: "",
      noticeView: "",
      accountView: "",
      subscriptionView: "",
      ImageLoading: false,
      dataSource: [],
      user_image: "",
      First_Name: "",
      Last_Name: "",
      user_Address: "",
      user_City: "",
    };
  }

  async componentDidMount() {
    this.accessRights();
    this.singleMember();
  }

  logout = async () => {
    Alert.alert(t("Gym App"), t("Are you sure you want to logout?"), [
      {
        text: t("No"),
        onPress: () => this.props.navigation.navigate("Home"),
        style: "cancel",
      },
      { text: t("Yes"), onPress: () => this.memberLogout()},
    ]);
  };

  async memberLogout() {
    const { Logoutmember, loadingStart } = this.props;
    const { navigate } = this.props.navigation;
    loadingStart();
    const Id = await SecureStore.getItemAsync("id");
    const Token = await SecureStore.getItemAsync("access_token");
    const userData = {
      "current_user_id": Id,
      "access_token": Token,
    };
    Logoutmember(userData, navigate);
  }

  async singleMember() {
    const { fetchUserdetails, loadingStart } = this.props;
    loadingStart();
    const Id = await SecureStore.getItemAsync("id");
    const Token = await SecureStore.getItemAsync("access_token");
    const userData = {
      "member_id": Id,
      "access_token": Token,
    };
    fetchUserdetails(userData)
  }

  async accessRights() {
    const { fetchAccessright, loadingStart, userData } = this.props;

    const id = await SecureStore.getItemAsync("id");
    const data = {
      user_id: id,
    };
    loadingStart();
    fetchAccessright(data);
  }

  renderMenuItem = (iconSource, text, onPress, visible = true) => {
    if (!visible) return null;
    
    return (
      <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIconContainer}>
          <Image source={iconSource} style={styles.menuIcon} />
        </View>
        <Text style={styles.menuText}>{text}</Text>
      </TouchableOpacity>
    );
  };

  /** Design part of page */
  render() {
    const { navigate } = this.props.navigation;
    const { userData, staffView, membershipView, groupView, memberView, activityView, scheduleView, assignworkoutView, workoutView, paymentView, messageView, noticeView, accountView, subscriptionView } = this.props;
    
    return (
      <View style={styles.container}>

        {/* Profile Section */}
        
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() => navigate("Account")}
        >
          <View style={styles.profileImageContainer}>
            <Image
              onLoadStart={(e) => this.setState({ ImageLoading: true })}
              source={
                (userData && userData.member_image)
                  ? { uri: userData.member_image }
                  : require("../../images/undefined-profile.png")
              }
              onLoadEnd={(e) => this.setState({ ImageLoading: false })}
              onError={() => {
                console.warn('Profile image load failed, using default');
                this.setState({ ImageLoading: false });
              }}
              style={styles.profileImage}
            />
            
          </View>
          
          <View style={styles.profileInfo}>
            <Text numberOfLines={1} style={styles.profileName}>
              {(userData && userData.first_name) || ''} {(userData && userData.last_name) || ''}
            </Text>
            {/* {(userData && userData.address && userData.city) && (
              <Text numberOfLines={1} style={styles.profileAddress}>
                {userData.address}, {userData.city}
              </Text>
            )} */}
          </View>

                 <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigate("Home")}
          >
            <Image
              source={require("../../images/Close-white-512.png")}
              style={styles.closeIcon}
            />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <ScrollView style={styles.menuScrollView} showsVerticalScrollIndicator={false}>
            
            {this.renderMenuItem(
              require("../../images/home-white.png"),
              t("Home"),
              () => navigate("Home")
            )}

            {this.renderMenuItem(
              require("../../images/Dashboard-White.png"),
              t("Dashboard"),
              () => navigate("Dashboard")
            )}

            {this.renderMenuItem(
              require("../../images/qr-white.png"),
              t("QR Code"),
              () => navigate("qrbik")
            )}

            {this.renderMenuItem(
              require("../../images/Staff-Member-white.png"),
              t("Staff Member"),
              () => navigate("StaffMemberList"),
              staffView == 1
            )}

            {this.renderMenuItem(
              require("../../images/Membership-Type-White.png"),
              t("Membership Type"),
              () => navigate("MemberShipList"),
              membershipView == 1
            )}

            {this.renderMenuItem(
              require("../../images/Staff-Member-white.png"),
              t("Member"),
              () => navigate("memberArea"),
              memberView == 1
            )}

            {this.renderMenuItem(
              require("../../images/Class-Schedule-White.png"),
              t("Activity"),
              () => navigate("ActivityList"),
              activityView == 1
            )}

            {this.renderMenuItem(
              require("../../images/Date.png"),
              t("Class Schedule"),
              () => navigate("Schedule"),
              scheduleView == 1
            )}

            {this.renderMenuItem(
              require("../../images/Date.png"),
              t("Class Booking"),
              () => navigate("Booking"),
              scheduleView == 1
            )}

            {this.renderMenuItem(
              require("../../images/Workout-White.png"),
              t("Assign Workouts"),
              () => navigate("AssignWorkoutsList"),
              assignworkoutView == 1
            )}

            {this.renderMenuItem(
              require("../../images/Workout-White.png"),
              t("Workouts"),
              () => navigate("Workouts"),
              workoutView == 1
            )}

            {this.renderMenuItem(
              require("../../images/Measurement-white.png"),
              t("Measurement"),
              () => navigate("addmeasurement")
            )}

            {this.renderMenuItem(
              require("../../images/Fees-Payment-White.png"),
              t("Fee Payment"),
              () => navigate("Feespayment"),
              paymentView == 1
            )}

            {this.renderMenuItem(
              require("../../images/Message-white.png"),
              t("Message"),
              () => navigate("Message"),
              messageView == 1
            )}

            {this.renderMenuItem(
              require("../../images/Notice-White.png"),
              t("Notice"),
              () => navigate("Notice"),
              noticeView == 1
            )}

            {this.renderMenuItem(
              require("../../images/Nutrition-White.png"),
              t("Nutrition Schedule"),
              () => navigate("Nutritionplan")
            )}

            {this.renderMenuItem(
              require("../../images/Account-White.png"),
              t("Account"),
              () => navigate("Account"),
              accountView == 1
            )}

            {this.renderMenuItem(
              require("../../images/Subscription-White.png"),
              t("Subscription History"),
              () => navigate("SubscriptionHistory"),
              subscriptionView == 1
            )}

            {this.renderMenuItem(
              require("../../images/translation-white.png"),
              t("Switch Language"),
              () => { 
                // Switch language
                const newLocale = i18n.locale === 'en' ? 'ar' : 'en';
                i18n.locale = newLocale;
                Localization.locale = newLocale === 'ar' ? 'ar-EG' : 'en-US';
                
                // Force update component to reflect changes
                this.setState({ refresh: !this.state.refresh });
                
                // Reload necessary data
                this.accessRights();
                this.singleMember();
              }
            )}

            {/* Logout Item */}
            <TouchableOpacity style={styles.logoutItem} onPress={() => this.logout()}>
              <View style={styles.menuIconContainer}>
                <Image
                  source={require("../../images/Logout-white.png")}
                  style={styles.menuIcon}
                />
              </View>
              <Text style={styles.menuText}>{t("Logout")}</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    );
  }
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

export default connect(mapStateToProps, mapDispatchToProps)(CustomSidebarMenu);
