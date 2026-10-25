import React, { Component } from "react";
import {
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  Image,
  Dimensions,
} from "react-native";
import * as SecureStore from 'expo-secure-store';
import { Col, Row } from "react-native-easy-grid";
import Carousel from 'react-native-reanimated-carousel';

//Redux
import { connect } from "react-redux";
import {
  loadingStart,
} from "../redux/actions/dashboard";
import { fetchUserdetails } from "../redux/actions/auth";

import "react-native-svg";
import { t } from "../../../locals";
import styleCss from "../../style";
import QRCode from 'react-native-qrcode-svg';

const { width: screenWidth } = Dimensions.get('window');

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      memberId: null,
      updatedProfile: null,
      ImageLoading: false,
      carouselImages: [
        "https://app.arenagym-om.com/media/offer-1.jpg",
        "https://app.arenagym-om.com/media/offer-2.jpg",
        "https://app.arenagym-om.com/media/offer-3.jpg",
      ],
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

  // Component Lifecycle Methods
  async componentDidMount() {
    try {
      const Id = await SecureStore.getItemAsync("id");
      if (Id) {
        this.setState({ memberId: Id });
      }
    } catch (error) {
      console.error('Home componentDidMount error:', error);
    }
  }

  componentDidUpdate(prevProps) {
    const { userToken, userData, loading } = this.props;
    
    // Fetch user data if we have token but no user data and not currently loading
    if (userToken && !userData && !loading && (!prevProps.userToken || prevProps.userToken !== userToken)) {
      // Use setTimeout to defer the state update until after the current render cycle
      setTimeout(() => {
        this.onRefresh();
      }, 0);
    }
  }

  // Add shouldComponentUpdate for performance optimization
  shouldComponentUpdate(nextProps, nextState) {
    // Only update if essential props/state have changed
    const currentProps = this.props;
    const currentState = this.state;
    
    return (
      nextProps.userToken !== currentProps.userToken ||
      nextProps.userData !== currentProps.userData ||
      nextProps.loading !== currentProps.loading ||
      nextState.loader !== currentState.loader ||
      nextState.memberId !== currentState.memberId ||
      nextState.ImageLoading !== currentState.ImageLoading ||
      nextState.updatedProfile !== currentState.updatedProfile
    );
  }

  onRefresh = async () => {
    const { loadingStart, fetchUserdetails } = this.props;
    loadingStart();
    
    try {
      const Id = await SecureStore.getItemAsync("id");
      const Token = await SecureStore.getItemAsync("access_token");
      
      if (!Id || !Token) {
        console.warn('Missing authentication data on refresh');
        return;
      }

      const userData = {
        "member_id": Id,
        "access_token": Token,
      };
      await fetchUserdetails(userData);
    } catch (error) {
      console.error('Refresh error:', error);
    }
  }

  // Render item for carousel
  renderCarouselItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={styles.carouselItem}
        onPress={() => console.warn(`image ${index} pressed`)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item }}
          style={styles.carouselImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  render() {
    const { navigate } = this.props.navigation;
    const { userData, loading, userToken } = this.props;

    // Show loading state if we're waiting for data
    if (userToken && (!userData || loading)) {
      return (
        <View style={styleCss.container}>
          <ActivityIndicator
            style={styleCss.loading}
            size="large"
            color="#30afb5"
          />
        </View>
      );
    }

    // Show loading state
    if (loading) {
      return (
        <View style={styleCss.container}>
          <ActivityIndicator
            style={styleCss.loading}
            size="large"
            color="#30afb5"
          />
        </View>
      );
    }

    // Only render main content if we have both token and user data
    if (userToken && userData) {
      return (
        <View style={styleCss.container}>
          <Row style={styleCss.NaveBar}>
            <Col>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("CustomSideBar")}
                style={styleCss.menu_col}
              >
                <Image
                  style={styleCss.Naveicon}
                  source={require("../../images/Menu-white.png")}
                />
              </TouchableOpacity>
            </Col>

            <Col style={styleCss.dashboard_NaveBar_text_col}>
              <Text style={styleCss.NaveText}>{t("Home")}</Text>
            </Col>

            <Col>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("Workouts")}
                style={styleCss.workout_col}
              >
                <Image
                  style={styleCss.Naveicon}
                  source={require("../../images/Workout-White.png")}
                />
              </TouchableOpacity>
            </Col>
            <Col>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("Message")}
                style={styleCss.message_col}
              >
                <Image
                  style={styleCss.Naveicon}
                  source={require("../../images/Message-white.png")}
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
            <Row style={styleCss.home_container2}>
              <TouchableOpacity onPress={() => navigate("Account")}>
                <Col style={styleCss.account_user_col}>
                  <Col style={styleCss.account_image_col2}>
                    <ActivityIndicator
                      style={styleCss.loading}
                      animating={this.state.ImageLoading}
                      size="small"
                      color="#30afb5"
                    />
                    <Image
                      onLoadStart={() => this.setState({ ImageLoading: true })}
                      onLoadEnd={() => this.setState({ ImageLoading: false })}
                      onError={() => {
                        console.warn('Profile image load failed, using default');
                        this.setState({ ImageLoading: false });
                      }}
                      style={styleCss.account_image}
                      source={{
                        uri: this.state.updatedProfile || (userData && userData.member_image) || null,
                        cache: 'reload'
                      }}
                      defaultSource={require('../../images/undefined-profile.png')}
                    />
                  </Col>
                </Col>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigate("Account")}>
                <Text style={styleCss.account_name_text2}>
                  {(userData && userData.first_name) || ''} {(userData && userData.last_name) || ''}
                </Text>
                <Col style={styleCss.personaldetail_data_col}>
                  <Row style={styleCss.personaldetail_data_row}>
                    <Text style={styleCss.newtext}>{t("Member ID")}:</Text>
                    <Text style={styleCss.newtext2}>{(userData && userData.member_unique_id) || ''}</Text>
                  </Row>
                </Col>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigate("qrbik")}>
                <Col style={styleCss.qrbik}>
                  {this.state.memberId ? (
                    <QRCode
                      value={this.state.memberId}
                      size={60}
                      bgColor='blue'
                      fgColor='white'
                    />
                  ) : (
                    <ActivityIndicator
                      size="small"
                      color="#30afb5"
                    />
                  )}
                </Col>
              </TouchableOpacity>
            </Row>

            <Row style={styleCss.dashboard_menu_row}>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("Workouts")}
                style={styleCss.dashboard_workout_menu}
              >
                <Col style={styleCss.dashboard_workout_image_col}>
                  <Row style={styleCss.dashboard_workout_image_row}>
                    <Image
                      style={styleCss.dashboard_workout_image}
                      source={require("../../images/Workout-White.png")}
                    />
                  </Row>
                  <Row>
                    <Text style={styleCss.dashboard_workout_text}>
                      {t("Workouts")}
                    </Text>
                  </Row>
                </Col>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("Schedule")}
                style={styleCss.dashboard_schedule_menu}
              >
                <Col style={styleCss.dashboard_schedule_image_col}>
                  <Row style={styleCss.dashboard_schedule_image_row}>
                    <Image
                      style={styleCss.dashboard_schedule_image}
                      source={require("../../images/Class-Schedule-White.png")}
                    />
                  </Row>
                  <Row>
                    <Text style={styleCss.dashboard_schedule_text}>
                      {t("Class Schedule")}
                    </Text>
                  </Row>
                </Col>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("Booking")}
                style={styleCss.dashboard_booking_menu}
              >
                <Col style={styleCss.dashboard_booking_col}>
                  <Row style={styleCss.dashboard_booking_row}>
                    <Image
                      style={styleCss.dashboard_booking_image}
                      source={require("../../images/Class-Schedule-white-512.png")}
                    />
                  </Row>
                  <Row>
                    <Text style={styleCss.dashboard_booking_text}>
                      {t("Class Booking")}
                    </Text>
                  </Row>
                </Col>
              </TouchableOpacity>
            </Row>

            <Row style={styleCss.home_container3}>
              <Text style={styleCss.account_name_text3}>{t("Latest Offers")}</Text>
            </Row>

            <Row style={styleCss.slider1}>
              <View style={styles.carouselContainer}>
                <Carousel
                  loop
                  width={screenWidth - 20}
                  height={200}
                  autoPlay={true}
                  data={this.state.carouselImages}
                  scrollAnimationDuration={1000}
                  autoPlayInterval={3000}
                  renderItem={this.renderCarouselItem}
                />
              </View>
            </Row>
          </ScrollView>
        </View>
      );
    } else {
      return (
        <View style={styleCss.container}>
          <Row style={styleCss.NaveBar}>
            <Col>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("CustomSideBar")}
                style={styleCss.menu_col}
              >
                <Image
                  style={styleCss.Naveicon}
                  source={require("../../images/Menu-white.png")}
                />
              </TouchableOpacity>
            </Col>

            <Col style={styleCss.dashboard_NaveBar_text_col}>
              <Text style={styleCss.NaveText}>{t("Home")}</Text>
            </Col>

            <Col>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("Workouts")}
                style={styleCss.workout_col}
              >
                <Image
                  style={styleCss.Naveicon}
                  source={require("../../images/Workout-White.png")}
                />
              </TouchableOpacity>
            </Col>
            <Col>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("Message")}
                style={styleCss.message_col}
              >
                <Image
                  style={styleCss.Naveicon}
                  source={require("../../images/Message-white.png")}
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

// Styles for the carousel
const styles = {
  carouselContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  carouselItem: {
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 5,
  },
  carouselImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
};

const mapStateToProps = (state) => {
  return {
    userData: state.auth.userData,
    loading: state.auth.loading,
    userToken: state.auth.userToken,
  };
};

const mapDispatchToProps = {
  loadingStart,
  fetchUserdetails,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);