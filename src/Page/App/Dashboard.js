import React, { Component } from "react";
import {
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  Image,
} from "react-native";
import * as SecureStore from 'expo-secure-store';
import { Col, Row } from "react-native-easy-grid";
import { Calendar, LocaleConfig } from "react-native-calendars";
import Collapsible from 'react-native-collapsible';

//Redux
import { connect } from "react-redux";
import {
  fetchWeightData,
  fetchWaistData,
  fetchThighData,
  fetchChestData,
  fetchArmData,
  fetchLegData,
  fetchHipsData,
  fetchCalfData,
  fetchGlutesData,
  loadingStart,
} from "../redux/actions/dashboard";

import { LineChart } from "react-native-chart-kit";
import "react-native-svg";
import normalize from "react-native-normalize";
import moment from "moment";
import { t } from "../../../locals";
import * as Localization from "expo-localization";
import styleCss from "../../style";

// Get the current locale - updated for Expo 53
const getLocale = () => {
  const locales = Localization.getLocales();
  return locales[0]?.languageCode || 'en';
};

const lang = getLocale();
const today = moment().format("YYYY-MM-DD");

if (lang === "ar") {
  LocaleConfig.locales["ar"] = {
    monthNames: [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "اكتوبر",
      "نوفمبر",
      "ديسمبر",
    ],
    monthNamesShort: [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "اكتوبر",
      "نوفمبر",
      "ديسمبر",
    ],
    dayNames: [
      "الأحد",
      "الاثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ],
    dayNamesShort: [
      "الأحد",
      "الاثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ],
  };
  LocaleConfig.defaultLocale = "ar";
} else {
  LocaleConfig.locales["en"] = {
    monthNames: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    monthNamesShort: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    dayNames: [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ],
    dayNamesShort: ["SUN.", "MON.", "TUE.", "WED.", "THUR.", "FRI.", "SAT."],
  };
  LocaleConfig.defaultLocale = "en";
}

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,           // Weight
      two_collapsed: true,       // Waist
      three_collapsed: true,     // Arm
      four_collapsed: true,      // Leg
      five_collapsed: true,      // Chest
      six_collapsed: true,       // Hips
      seven_collapsed: true,     // Calf
      eight_collapsed: true,     // Thigh
      nine_collapsed: true,      // Glutes
      dateSelected: "",
      date: "",
    };
  }

  // React Navigation v6 - screen options are now set differently
  static options = {
    headerShown: false,
  };

  // Updated for React Navigation v6 - drawer methods
  toggleDrawer = () => {
    this.props.navigation.toggleDrawer();
  };

  async componentDidMount() {
    const { loadingStart } = this.props;
    const Id = await SecureStore.getItemAsync("id");
    const Token = await SecureStore.getItemAsync("access_token");
    this.setState({ loader: true });

    //Redux loading start function call
    loadingStart();

    this.loadAllReports();
  }

  onRefresh() {
    const { loadingStart } = this.props;
    //Redux loading start function call
    loadingStart();
    this.setState({ 
      collapsed: true,
      two_collapsed: true,
      three_collapsed: true,
      four_collapsed: true,
      five_collapsed: true,
      six_collapsed: true,
      seven_collapsed: true,
      eight_collapsed: true,
      nine_collapsed: true,
    });
    this.loadAllReports();
  }

  async loadAllReports() {
    const id = await SecureStore.getItemAsync("id");
    const token = await SecureStore.getItemAsync("access_token");
    const params = { current_user_id: id, access_token: token };

    // Load reports sequentially with priority to avoid network congestion
    // Priority 1: Most important metrics
    await this.props.fetchWeightData({ ...params, report_type: "Weight" });
    await this.props.fetchWaistData({ ...params, report_type: "Waist" });
    
    // Priority 2: Secondary metrics with small delay
    setTimeout(async () => {
      await this.props.fetchChestData({ ...params, report_type: "Chest" });
      await this.props.fetchArmData({ ...params, report_type: "Arm" });
      await this.props.fetchLegData({ ...params, report_type: "Leg" });
    }, 100);
    
    // Priority 3: Tertiary metrics with larger delay
    setTimeout(async () => {
      await this.props.fetchHipsData({ ...params, report_type: "Hips" });
      await this.props.fetchCalfData({ ...params, report_type: "Calf" });
      await this.props.fetchThighData({ ...params, report_type: "Thigh" });
      await this.props.fetchGlutesData({ ...params, report_type: "Glutes" });
    }, 200);
  }

  handleDatePress = (day) => {
    console.log('Date pressed:', day.dateString);
    this.setState({
      dateSelected: day.dateString,
      date: day.dateString
    });
  };

  renderChart = (data, labels, unit, type) => {
    // Validate that data and labels are properly formatted
    const isValidData = data !== "" && data !== null && Array.isArray(data) && data.length > 0;
    const isValidLabels = labels !== "" && labels !== null && Array.isArray(labels) && labels.length > 0;
    
    return isValidData && isValidLabels ? (
      <ScrollView
        height={210}
        horizontal={true}
        contentOffset={{ x: 0, y: 0 }}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styleCss.dashboard_collapse_body}>
          <Row>
            <Col>
              <Row style={styleCss.dashboard_collapse_body_row}>
                <Text style={styleCss.dashboard_collapse_body_text}>
                  {unit}
                </Text>
              </Row>
              <LineChart
                data={{
                  labels: labels,
                  datasets: [
                    {
                      data: data,
                    },
                  ],
                }}
                withOuterLines={true}
                width={normalize(700)}
                height={120}
                verticalLabelRotation={-0.1}
                yAxisInterval={1}
                chartConfig={{
                  backgroundColor: "#30afb5",
                  backgroundGradientFrom: "#30afb5",
                  backgroundGradientTo: "#30afb5",
                  color: (opacity = 0) => `rgb(241, 196, 14)`,
                  labelColor: (opacity = 0) => `rgba(255, 255, 255, ${opacity})`,
                  propsForDots: {
                    r: "0",
                    strokeWidth: "0",
                  },
                  propsForBackgroundLines: {
                    strokeWidth: 0,
                  },
                }}
                svg={{
                  stroke: "rgb(134, 65, 244)",
                }}
                bezier
                labelStyle={{
                  color: "grey",
                  transform: [{ rotateX: "100deg" }],
                }}
                propsForLabels={{
                  fontFamily: "Cairo-Bold",
                }}
                style={styleCss.dashboard_line_chart}
              />
              <Row style={styleCss.dashboard_collapse_body_two_row}>
                <Text style={styleCss.dashboard_collapse_body_two_text}>
                  {t("Days")}
                </Text>
              </Row>
            </Col>
          </Row>
        </View>
      </ScrollView>
    ) : (
      <View style={styleCss.dashboard_collapse_body_view}>
        <Row style={styleCss.dashboard_collapse_body_three_row}>
          <Text style={styleCss.dashboard_collapse_body_three_text}>
            {t("Record not available")}
          </Text>
        </Row>
      </View>
    );
  };

  renderCollapseSection = (title, data, labels, unit, collapsed) => {
    return (
      <Col style={styleCss.dashboard_collapse_col}>
        <TouchableOpacity
          onPress={() => this.setState({ [collapsed]: !this.state[collapsed] })}
          style={styleCss.dashboard_collapse_header}
        >
          <Row style={styleCss.dashboard_collapse_header_row}>
            <Col style={styleCss.dashboard_collapse_header_col}>
              <Text style={styleCss.dashboard_collapse_header_text}>
                {t(title)}
              </Text>
            </Col>
            <Col style={styleCss.dashboard_collapse_header_two_col}>
              <Image
                style={styleCss.dashboard_collapse_header_image}
                source={
                  this.state[collapsed]
                    ? require("../../images/right-arrow.png")
                    : require("../../images/down-arrow.png")
                }
              />
            </Col>
          </Row>
        </TouchableOpacity>
        
        <Collapsible collapsed={this.state[collapsed]}>
          {this.renderChart(data, labels, unit, title)}
        </Collapsible>
      </Col>
    );
  };

  render() {
    const mark = {
      [today]: {
        selected: true,
        customStyles: {
          container: {
            backgroundColor: "#30afb5",
            borderWidth: 2,
            borderColor: "#fff",
          },
          text: {
            color: "#fff",
          },
        },
      },
    };

    // Add selected date to marked dates if it's different from today
    if (this.state.dateSelected && this.state.dateSelected !== today) {
      mark[this.state.dateSelected] = {
        selected: true,
        customStyles: {
          container: {
            backgroundColor: "#30afb5",
            borderWidth: 2,
            borderColor: "#fff",
          },
          text: {
            color: "#fff",
          },
        },
      };
    }

    const {
      weightData,
      weightLabel,
      weightUnit,
      waistData,
      waistLabel,
      waistUnit,
      armData,
      armLabel,
      armUnit,
      legData,
      legLabel,
      legUnit,
      chestData,
      chestLabel,
      chestUnit,
      hipsData,
      hipsLabel,
      hipsUnit,
      calfData,
      calfLabel,
      calfUnit,
      thighData,
      thighLabel,
      thighUnit,
      glutesData,
      glutesLabel,
      glutesUnit,
      loading,
    } = this.props;

    if (!loading) {
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
              <Text style={styleCss.NaveText}>{t("Dashboard")}</Text>
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

            <Calendar
              monthFormat={"MMMM, yyyy"}
              markingType={"custom"}
              current={this.state.date || today}
              markedDates={mark}
              onDayPress={this.handleDatePress}
              enableSwipeMonths={true}
              theme={{
                textSectionTitleColor: "#b6c1cd",
                textSectionTitleDisabledColor: "#30afb5",
                selectedDayTextColor: "#fff",
                todayTextColor: "#00adf5",
                dayTextColor: "#2d4150",
                textDisabledColor: "#d9e1e8",
                dotColor: "#00adf5",
                selectedDotColor: "#ffffff",
                arrowColor: "#30afb5",
                disabledArrowColor: "#d9e1e8",
                monthTextColor: "#30afb5",
                indicatorColor: "#30afb5",
                textDayFontFamily: "Cairo-Medium",
                textMonthFontFamily: "Cairo-SemiBold",
                textDayHeaderFontFamily: "Cairo-Medium",
                textDayFontSize: 13,
                textMonthFontSize: 17,
                textDayHeaderFontSize: 13,
              }}
            />

            {this.renderCollapseSection(
              "Weight Progress Report",
              weightData,
              weightLabel,
              weightUnit,
              "collapsed"
            )}

            {this.renderCollapseSection(
              "Waist Progress Report",
              waistData,
              waistLabel,
              waistUnit,
              "two_collapsed"
            )}

            {this.renderCollapseSection(
              "Arm Progress Report",
              armData,
              armLabel,
              armUnit,
              "three_collapsed"
            )}

            {this.renderCollapseSection(
              "Leg Progress Report",
              legData,
              legLabel,
              legUnit,
              "four_collapsed"
            )}

            {this.renderCollapseSection(
              "Chest Progress Report",
              chestData,
              chestLabel,
              chestUnit,
              "five_collapsed"
            )}

            {this.renderCollapseSection(
              "Hips Progress Report",
              hipsData,
              hipsLabel,
              hipsUnit,
              "six_collapsed"
            )}

            {this.renderCollapseSection(
              "Calf Progress Report",
              calfData,
              calfLabel,
              calfUnit,
              "seven_collapsed"
            )}

            {this.renderCollapseSection(
              "Thigh Progress Report",
              thighData,
              thighLabel,
              thighUnit,
              "eight_collapsed"
            )}

            {this.renderCollapseSection(
              "Glutes Progress Report",
              glutesData,
              glutesLabel,
              glutesUnit,
              "nine_collapsed"
            )}

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
              <Text style={styleCss.NaveText}>{t("Dashboard")}</Text>
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

const mapStateToProps = (state) => {
  return {
    weightData: state.dashboard.weightData,
    weightLabel: state.dashboard.weightLabel,
    weightUnit: state.dashboard.weightUnit,
    waistData: state.dashboard.waistData,
    waistLabel: state.dashboard.waistLabel,
    waistUnit: state.dashboard.waistUnit,
    armData: state.dashboard.armData,
    armLabel: state.dashboard.armLabel,
    armUnit: state.dashboard.armUnit,
    legData: state.dashboard.legData,
    legLabel: state.dashboard.legLabel,
    legUnit: state.dashboard.legUnit,
    chestData: state.dashboard.chestData,
    chestLabel: state.dashboard.chestLabel,
    chestUnit: state.dashboard.chestUnit,
    hipsData: state.dashboard.hipsData,
    hipsLabel: state.dashboard.hipsLabel,
    hipsUnit: state.dashboard.hipsUnit,
    calfData: state.dashboard.calfData,
    calfLabel: state.dashboard.calfLabel,
    calfUnit: state.dashboard.calfUnit,
    thighData: state.dashboard.thighData,
    thighLabel: state.dashboard.thighLabel,
    thighUnit: state.dashboard.thighUnit,
    glutesData: state.dashboard.glutesData,
    glutesLabel: state.dashboard.glutesLabel,
    glutesUnit: state.dashboard.glutesUnit,
    loading: state.dashboard.loading,
  };
};

const mapDispatchToProps = {
  fetchWeightData,
  fetchWaistData,
  fetchArmData,
  fetchLegData,
  fetchChestData,
  fetchHipsData,
  fetchCalfData,
  fetchThighData,
  fetchGlutesData,
  loadingStart,
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);