import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  FlatList,
} from "react-native";
import { Col, Row } from "react-native-easy-grid";
import { Calendar } from "react-native-calendars";
import Collapsible from 'react-native-collapsible';
import {
  viewMemberAttendanceListAction,
} from "../../../util/action.js";
import moment from "moment";
import { t } from "../../../../locals";
import styleCss from "../../../style";
const today = moment().format("YYYY-MM-DD");
import * as SecureStore from 'expo-secure-store';

//Redux
import { connect } from "react-redux";
import {
  fetchAllClass,
  fetchMemberAttendace,
  loadingStart,
} from "../../redux/actions/member";

class Attendances extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      date: "",
      selectedDate: "",
      attendancedata: [],
      collapsed: false,
      markedDay: {},
      selecttitle: t("Select Class"),
      currentMonth: moment().format("YYYY-MM"),
      selectedClassId: null,
      calendarKey: 0,
    };
  }

  toggleDrawer = ({ navigation }) => {
    this.props.navigation.toggleDrawer();
  };

  static navigationOptions = ({ navigation }) => {
    return {
      headerShown: false,
    };
  };

  componentDidMount() {
    this.ClassList();
  }

  onRefresh() {
    this.ClassList();
  }

  async ClassList() {
    const { fetchAllClass } = this.props;

    const Id = await SecureStore.getItemAsync("id");
    const Token = await SecureStore.getItemAsync("access_token");
    
    const params = {
      current_user_id: Id,
      access_token: Token,
    };

    //Redux action call to fetch class data - loading is handled in Redux action
    fetchAllClass(params);
  }

  async viewMemberAttendance(cid = null, cname = null, specificMonth = null) {
    this.setState({ selecttitle: cname });
    this.setState({ attendancedata: [] });
    this.setState({ markedDay: {} });
    this.setState({ loader: true });
    this.setState({ selectedClassId: cid });

    const Id = await SecureStore.getItemAsync("id");
    const Token = await SecureStore.getItemAsync("access_token");

    // Use specific month if provided, otherwise use current month
    const targetMonth = specificMonth || moment().format("YYYY-MM");
    const startDate = moment(targetMonth).startOf('month').format("YYYY-MM-DD");
    const endDate = moment(targetMonth).endOf('month').format("YYYY-MM-DD");

    const params = {
      member_id: Id,
      start_date: startDate,
      end_date: endDate,
      current_user_id: Id,
      access_token: Token,
      class_id: cid,
    };
    this.setState({ collapsed: false });
    
    try {
      const responseJson = await viewMemberAttendanceListAction(params);
      
      if (responseJson.status == 1) {
        // Backend now returns filtered data for the requested month
        const attendanceData = responseJson.result || [];
        
        console.log('Month attendance data:', attendanceData.length, 'records for', targetMonth);
        
        this.setState({
          attendancedata: attendanceData,
          loader: false,
          currentMonth: targetMonth,
          calendarKey: this.state.calendarKey + 1,
        });
        
        // Set marked dates after updating attendance data
        setTimeout(() => {
          this.setState({ markedDay: this.setDates() });
        }, 100);
        
        if (this.dropdown) {
          this.dropdown.alertWithType(
            "success",
            t("Success"),
            t("Attendance data loaded for") + " " + targetMonth
          );
        }
      } else {
        // Even if status is 0, try to load empty data for the month
        console.log('No attendance data found for', targetMonth, '- showing empty calendar');
        this.setState({
          attendancedata: [],
          loader: false,
          currentMonth: targetMonth,
          markedDay: {},
          calendarKey: this.state.calendarKey + 1,
        });
        
        if (this.dropdown) {
          this.dropdown.alertWithType("info", t("Info"), t("No attendance data found for this month"));
        }
      }
    } catch (error) {
      this.setState({ loader: false });
      console.error('Attendance error:', error);
      if (this.dropdown) {
        this.dropdown.alertWithType("error", t("Error"), "Failed to load attendance data");
      }
    }
  }

  // Handle calendar month changes
  onMonthChange = (month) => {
    const newMonth = moment(month.dateString).format("YYYY-MM");
    
    // Only reload if we have a selected class and month has changed
    if (this.state.selectedClassId && newMonth !== this.state.currentMonth) {
      console.log('Month changed to:', newMonth);
      this.viewMemberAttendance(this.state.selectedClassId, this.state.selecttitle, newMonth);
    }
  };

  setDates() {
    let markedDay = {};
    
    // Check if attendancedata is an array and has items
    if (Array.isArray(this.state.attendancedata) && this.state.attendancedata.length > 0) {
      this.state.attendancedata.forEach((item, index) => {
        if (item && item.date && item.status) {
          const date = item.date;
          if (item.status === "Absent") {
            markedDay[date] = { marked: true, dotColor: "white" };
          } else if (item.status === "Present") {
            markedDay[date] = { marked: true, dotColor: "green" };
          }
        }
      });
    }

    console.log('Marked dates:', Object.keys(markedDay).length, 'dates marked');
    return markedDay;
  }

  renderItem = ({ item }) => {
    return (
      <View style={styleCss.attendance_body_list}>
        <TouchableOpacity
          style={styleCss.attendance_body_item}
          onPress={() => {
            this.viewMemberAttendance(item.class_id, item.class_name);
          }}
        >
          <Text style={styleCss.attendance_body_item_text}>
            {item.class_name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    const { userData, allClassList, attendanceData, loading } = this.props;
    const { collapsed } = this.state;
    if (!loading) {
      return (
        <View style={styleCss.attendance_container}>
          <Row style={styleCss.attendance_name_col}>
            <Text style={styleCss.attendance_name_text}>
              {userData.first_name} {userData.last_name}
            </Text>
          </Row>

          <View style={{
            borderWidth: 1,
            borderColor: "#30afb5",
            borderRadius: 5,
            marginLeft: "5%",
            marginRight: "5%",
            marginBottom: "5%",
          }}>
            <TouchableOpacity onPress={() => this.setState({ collapsed: !collapsed })}>
              <Row style={styleCss.attendance_collapse_row}>
                <Col style={styleCss.attendance_collapse_text_col}>
                  <Text style={collapsed ? styleCss.attendance_collapse_text : styleCss.attendance_ClassText}>
                    {this.state.selecttitle}
                  </Text>
                </Col>
                <Col style={styleCss.attendance_collapse_image_col}>
                  <Image
                    style={styleCss.attendance_collapse_image}
                    source={collapsed ?
                      require("../../../images/down-arrow.png") :
                      require("../../../images/right-arrow.png")
                    }
                  />
                </Col>
              </Row>
            </TouchableOpacity>

            <Collapsible collapsed={!collapsed}>
              <View style={styleCss.attendance_collapse_body}>
                <FlatList
                  data={allClassList}
                  renderItem={this.renderItem}
                  keyExtractor={(item) => item.class_id.toString()}
                  ListEmptyComponent={
                    <EmptyComponent
                      title={t("Data not available")}
                      style={{ color: "white" }}
                    />
                  }
                />
              </View>
            </Collapsible>
          </View>
          <ScrollView
            refreshControl={
              <RefreshControl
                colors={["#30afb5"]}
                refreshing={this.state.loading}
                onRefresh={this.onRefresh.bind(this)}
              />
            }
          >
            {this.state.loader ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 }}>
                <ActivityIndicator size="large" color="#30afb5" />
                <Text style={{ marginTop: 10, color: '#30afb5' }}>{t("Loading attendance data...")}</Text>
              </View>
            ) : (
              <Calendar
                monthFormat={"MMMM, yyyy"}
                onMonthChange={this.onMonthChange}
                current={this.state.currentMonth + "-01"}
                key={this.state.calendarKey}
                theme={{
                  textSectionTitleColor: "#b6c1cd",
                  textSectionTitleDisabledColor: "#30afb5",
                  selectedDayTextColor: "#ffffff",
                  todayTextColor: "#00adf5",
                  dayTextColor: "#2d4150",
                  textDisabledColor: "#d9e1e8",
                  dotColor: "#00adf5",
                  selectedDotColor: "white",
                  arrowColor: "#30afb5",
                  disabledArrowColor: "#d9e1e8",
                  monthTextColor: "#30afb5",
                  indicatorColor: "#30afb5",
                  textDayFontFamily: "Cairo-Medium",
                  textMonthFontFamily: "Cairo-SemiBold",
                  textDayHeaderFontFamily: "Cairo-Medium",
                  textDayHeaderFontWeight: "300",
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 16,
                }}
                markedDates={
                  (this.state.markedDay)
                }
                maxDate={today}
              />
            )}
            <Row style={styleCss.attendance_row}>
              <Col style={styleCss.attendance_image_col}>
                <Col style={styleCss.attendance_image_css}></Col>
              </Col>
              <Col style={styleCss.attendance_col}>
                <Text style={styleCss.attendance_image_col_text}>
                  {t("Presente")}
                </Text>
              </Col>
            
            </Row>
          </ScrollView>
        </View>
      );
    } else {
      return (
        <ActivityIndicator
          style={styleCss.loading}
          size="large"
          color="#30afb5"
        />
      );
    }
  }
}

const EmptyComponent = ({ title }) => (
  <View style={styleCss.emptyContainer}>
    <Text style={styleCss.emptyText}>{title}</Text>
  </View>
);

const mapStateToProps = (state) => {
  return {
    allClassList: state.member.allClassList,
    attendanceData: state.member.attendanceData,
    userData: state.auth.userData,
    loading: state.member.loading,
  };
};

const mapDispatchToProps = {
  fetchAllClass,
  fetchMemberAttendace,
};

export default connect(mapStateToProps, mapDispatchToProps)(Attendances);
