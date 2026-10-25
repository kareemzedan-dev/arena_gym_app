import React, { Component } from "react";
import {
  TouchableOpacity,
  BackHandler,
  RefreshControl,
  View,
  Modal,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
  FlatList,
} from "react-native";
import { Col, Row } from "react-native-easy-grid";
import moment from "moment";
import { t } from "../../../../locals";
import { Calendar } from "react-native-calendars";
import styleCss from "./style";
import { SecureStorageHelper } from '../../../util/secureStorage';

const today = moment().format("YYYY-MM-DD");

//Redux
import { connect } from "react-redux";
import {
  addBooking,
  fetchClassSchedule,
  loadingStart,
} from "../../redux/actions/booking";

class ClassBooking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      ClassData: [],
      isRefreshing: false,
      isInitialized: false,
      selectedDate: today,
      calendarVisible: false,
    };
  }

  componentDidMount() {
    // Only initialize once
    if (!this.state.isInitialized) {
      this.setState({ isInitialized: true });
      this.initializeComponent();
    }
  }

  componentWillUnmount() {
    // Clean up back button handler
    if (this.backHandler) {
      this.backHandler.remove();
    }
    
    // Clean up navigation listeners
    if (this.unsubscribeFocus) {
      this.unsubscribeFocus();
    }
    if (this.unsubscribeBlur) {
      this.unsubscribeBlur();
    }
  }

  initializeComponent = () => {
    this.getClassSchedule();
    this.setupBackHandler();
    this.setupNavigationListeners();
  }

  setupBackHandler = () => {
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }

  setupNavigationListeners = () => {
    if (this.props.navigation) {
      this.unsubscribeFocus = this.props.navigation.addListener('focus', this.onFocus);
      this.unsubscribeBlur = this.props.navigation.addListener('blur', this.onBlur);
    }
  }

  getClassSchedule = async () => {
    const { fetchClassSchedule, loadingStart } = this.props;

    try {
      loadingStart();
      const { id, token } = await SecureStorageHelper.getAuthCredentials();

      const userData = {
        current_user_id: id,
        access_token: token,
      };
      
      await fetchClassSchedule(userData);
    } catch (error) {
      console.error("Error fetching class schedule:", error);
    } finally {
      this.setState({ isRefreshing: false });
    }
  }

  setClassBookingData = (Data) => {
    this.setState({ 
      ClassData: [Data],
      modalVisible: true 
    });
  }

  closeModal = () => {
    this.setState({ modalVisible: false });
  }

  classBooing = async (classbooking_item) => {
    const { addBooking, loadingStart } = this.props;

    try {
      loadingStart();
      const { id, token } = await SecureStorageHelper.getAuthCredentials();

      const classBooingData = {
        class_id: classbooking_item.class_id,
        day: classbooking_item.day,
        class_date: classbooking_item.class_date,
        remaning_member: classbooking_item.remaning_member,
        current_user_id: id,
        access_token: token,
      };

      this.setState({ modalVisible: false });
      await addBooking(classBooingData);
    } catch (error) {
      console.error("Error booking class:", error);
    }
  }

  onRefresh = () => {
    this.setState({ isRefreshing: true });
    this.getClassSchedule();
  }

  onBlur = () => {
    if (this.backHandler) {
      this.backHandler.remove();
      this.backHandler = null;
    }
  }

  onFocus = () => {
    if (!this.backHandler) {
      this.setupBackHandler();
    }
  }

  handleBackButtonClick = () => {
    if (this.props.navigation?.navigate) {
      this.props.navigation.navigate("Home");
    }
    return true;
  }

  onDayPress = (day) => {
    this.setState({ 
      selectedDate: day.dateString,
      calendarVisible: false
    });
  }

  toggleCalendar = () => {
    this.setState({ calendarVisible: !this.state.calendarVisible });
  }

  getMarkedDates = () => {
    const { classSchedule } = this.props;
    const markedDates = {};
    
    if (classSchedule) {
      Object.keys(classSchedule).forEach(date => {
        if (classSchedule[date] && classSchedule[date].length > 0) {
          markedDates[date] = {
            marked: true,
            dotColor: '#30afb5',
          };
        }
      });
    }

    // Mark selected date
    markedDates[this.state.selectedDate] = {
      ...markedDates[this.state.selectedDate],
      selected: true,
      selectedColor: '#30afb5',
    };

    return markedDates;
  }

  getCurrentDateClasses = () => {
    const { classSchedule } = this.props;
    const { selectedDate } = this.state;
    
    if (!classSchedule || !classSchedule[selectedDate]) {
      return [];
    }
    
    return classSchedule[selectedDate];
  }

  renderClassItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styleCss.classbooking_item}
        testID={"classbooking_item"}
        onPress={() => this.setClassBookingData(item)}
      >
        <View style={styleCss.loign_container}>
          <Row>
            <Col>
              <Row style={styleCss.class_title_css}>
                <Text style={styleCss.classbooking_title} numberOfLines={1}>
                  {item.title}
                </Text>
              </Row>
              <Row style={styleCss.classbooking_time_row}>
                <Text style={styleCss.classbooking_title}>
                  {item.start_time} - {item.end_time}
                </Text>
              </Row>
            </Col>
            <Col>
              <Row>
                <Text style={styleCss.classbooking_title}>{item.trainer}</Text>
              </Row>
            </Col>
          </Row>
        </View>
      </TouchableOpacity>
    );
  }

  renderEmptyList = () => {
    return (
      <View style={styleCss.empty_list_container}>
        <Text style={styleCss.empty_list_text}>
          {t("No classes scheduled for this date")}
        </Text>
      </View>
    );
  }

  render() {
    const { modalVisible, isRefreshing, ClassData, selectedDate, calendarVisible } = this.state;
    const { loading } = this.props;
    const currentDateClasses = this.getCurrentDateClasses();

    if (loading) {
      return (
        <ActivityIndicator
          style={styleCss.loading}
          size="large"
          color="#30afb5"
        />
      );
    }

    return (
      <View style={styleCss.container}>
        {/* Date Header */}
        <TouchableOpacity 
          style={styleCss.date_header}
          onPress={this.toggleCalendar}
        >
          <Text style={styleCss.date_header_text}>
            {moment(selectedDate).format("MMMM DD, YYYY")}
          </Text>
          <Image
            source={require("../../../../assets/down-arrow.png")}
            fadeDuration={0}
            style={[
              styleCss.classbooking_agenda_down_arrow,
              calendarVisible && { transform: [{ rotate: '180deg' }] }
            ]}
          />
        </TouchableOpacity>

        {/* Calendar */}
        {calendarVisible && (
          <Calendar
            current={selectedDate}
            minDate={today}
            maxDate={moment().add(2, 'months').format('YYYY-MM-DD')}
            onDayPress={this.onDayPress}
            markedDates={this.getMarkedDates()}
            monthFormat={'MMMM yyyy'}
            hideExtraDays={true}
            disableMonthChange={false}
            firstDay={1}
            hideDayNames={false}
            showWeekNumbers={false}
            onPressArrowLeft={subtractMonth => subtractMonth()}
            onPressArrowRight={addMonth => addMonth()}
            disableArrowLeft={false}
            disableArrowRight={false}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#30afb5',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#30afb5',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#30afb5',
              selectedDotColor: '#ffffff',
              arrowColor: '#30afb5',
              monthTextColor: '#2d4150',
              indicatorColor: '#30afb5',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13
            }}
          />
        )}

        {/* Classes List */}
        <FlatList
          data={currentDateClasses}
          renderItem={this.renderClassItem}
          keyExtractor={(item, index) => `${item.class_id}-${index}`}
          ListEmptyComponent={this.renderEmptyList}
          refreshControl={
            <RefreshControl
              colors={["#30afb5"]}
              refreshing={isRefreshing}
              onRefresh={this.onRefresh}
            />
          }
          contentContainerStyle={styleCss.classes_list_container}
        />
        
        {/* Modal remains the same */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={this.closeModal}
        >
          <View style={styleCss.classbooking_main_modal_view}>
            <View style={styleCss.classbooking_modal_view}>
              <Row style={styleCss.classbooking_modal_row}>
                <Col style={styleCss.classbooking_modal_col}>
                  <Text style={styleCss.classbooking_modal_title}>
                    {t("Class Booking")}
                  </Text>
                </Col>
                <Col style={styleCss.classbooking_modal_close_col}>
                  <TouchableOpacity
                    onPress={this.closeModal}
                    style={styleCss.classbooking_modal_close_button}
                  >
                    <Image
                      style={styleCss.classbooking_modal_close_image}
                      source={require("../../../images/Close-blue-512.png")}
                    />
                  </TouchableOpacity>
                </Col>
              </Row>
              {ClassData.map((classbooking_item, index) => (
                <View
                  style={styleCss.classbooking_modal_data_view}
                  key={index}
                >
                  <Row style={styleCss.classbooking_modal_data_row}>
                    <Col style={styleCss.classbooking_modal_data_col}>
                      <Text style={styleCss.classbooking_modal_data_label}>
                        {t("Class Name")} :
                      </Text>
                    </Col>
                    <Col style={styleCss.classbooking_modal_class_data_col}>
                      <Text
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        style={styleCss.classbooking_modal_data}
                      >
                        {classbooking_item.title}
                      </Text>
                    </Col>
                  </Row>
                  <Row style={styleCss.classbooking_modal_data_row}>
                    <Col style={styleCss.classbooking_modal_data_col}>
                      <Text style={styleCss.classbooking_modal_data_label}>
                        {t("Date")} :
                      </Text>
                    </Col>
                    <Col style={styleCss.classbooking_modal_class_data_col}>
                      <Text style={styleCss.classbooking_modal_data}>
                        {classbooking_item.class_date}
                      </Text>
                    </Col>
                  </Row>
                  <Row style={styleCss.classbooking_modal_data_row}>
                    <Col style={styleCss.classbooking_modal_data_col}>
                      <Text style={styleCss.classbooking_modal_data_label}>
                        {t("Start Time")} :
                      </Text>
                    </Col>
                    <Col style={styleCss.classbooking_modal_class_data_col}>
                      <Text style={styleCss.classbooking_modal_data}>
                        {classbooking_item.start_time}
                      </Text>
                    </Col>
                  </Row>
                  <Row style={styleCss.classbooking_modal_data_row}>
                    <Col style={styleCss.classbooking_modal_data_col}>
                      <Text style={styleCss.classbooking_modal_data_label}>
                        {t("End Time")} :
                      </Text>
                    </Col>
                    <Col style={styleCss.classbooking_modal_class_data_col}>
                      <Text style={styleCss.classbooking_modal_data}>
                        {classbooking_item.end_time}
                      </Text>
                    </Col>
                  </Row>
                  <Row style={styleCss.classbooking_modal_data_row}>
                    <Col style={styleCss.classbooking_modal_data_col}>
                      <Text style={styleCss.classbooking_modal_data_label}>
                        {t("Trainer Name")} :
                      </Text>
                    </Col>
                    <Col style={styleCss.classbooking_modal_class_data_col}>
                      <Text style={styleCss.classbooking_modal_data}>
                        {classbooking_item.trainer}
                      </Text>
                    </Col>
                  </Row>
                  <Row style={styleCss.classbooking_modal_data_row2}>
                    <Col style={styleCss.classbooking_modal_data_col2}>
                      <Text style={styleCss.classbooking_modal_data_label}>
                        {t("Member Limit In Class")} :
                      </Text>
                    </Col>
                    <Col style={styleCss.classbooking_modal_data_col3}>
                      <Text style={styleCss.classbooking_modal_data}>
                        {classbooking_item.Member_limit}
                      </Text>
                    </Col>
                  </Row>
                  <Row style={styleCss.classbooking_modal_data_row2}>
                    <Col style={styleCss.classbooking_modal_data_col2}>
                      <Text style={styleCss.classbooking_modal_data_label}>
                        {t("Remaining Member In Class")} :
                      </Text>
                    </Col>
                    <Col style={styleCss.classbooking_modal_data_col3}>
                      <Text style={styleCss.classbooking_modal_data}>
                        {classbooking_item.remaning_member}
                      </Text>
                    </Col>
                  </Row>

                  {classbooking_item.booked_class_status === "no" && (
                    <TouchableOpacity
                      style={styleCss.classbooking_book_button}
                      onPress={() => this.classBooing(classbooking_item)}
                    >
                      <View style={styleCss.classbooking_book_button_row}>
                        <Text style={styleCss.classbooking_book_class_text}>
                          {t("Book Class")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    data: state.booking.bookingData,
    bookedClass: state.booking.bookedClass,
    totalClass: state.booking.totalClass,
    classLimit: state.booking.Classlimit,
    classSchedule: state.booking.classSchedule,
    loading: state.booking.loading,
  };
};

const mapDispatchToProps = {
  addBooking,
  fetchClassSchedule,
  loadingStart,
};

export default connect(mapStateToProps, mapDispatchToProps)(ClassBooking);