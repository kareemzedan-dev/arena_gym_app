import React, { useEffect, memo } from "react";
import {
  BackHandler,
  View,
  Text,
  Image,
  StatusBar,
  FlatList,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Col, Row } from "react-native-easy-grid";
import { t } from "../../../../locals";
import { TouchableHighlight } from "react-native-gesture-handler";
import { SecureStorageHelper } from '../../../util/secureStorage';
import { useSelector, useDispatch } from "react-redux";
import { fetchBooking, cancelBooking, loadingStart } from "../../redux/actions/booking";
import PropTypes from "prop-types";
import styleCss from "../../../style";

const EmptyComponent = memo(({ title }) => (
  <View style={styleCss.emptyContainer}>
    <Text style={styleCss.emptyText}> {title} </Text>
  </View>
));

EmptyComponent.propTypes = {
  title: PropTypes.string.isRequired,
};

const BookingList = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const data = useSelector(state => state.booking.bookingData);
  const bookedClass = useSelector(state => state.booking.bookedClass);
  const totalClass = useSelector(state => state.booking.totalClass);
  const classLimit = useSelector(state => state.booking.Classlimit);
  const loading = useSelector(state => state.booking.loading);

  // Load booking data on mount only
  useEffect(() => {
    const loadBookingData = async () => {
      try {
        dispatch(loadingStart());
        const { id, token } = await SecureStorageHelper.getAuthCredentials();

        const BookingListData = {
          current_user_id: id,
          access_token: token,
        };

        await dispatch(fetchBooking(BookingListData));
      } catch (error) {
        console.error("Error loading booking data:", error);
      }
    };
    loadBookingData();
    // eslint-disable-next-line
  }, [dispatch]);

  // Cancel booking action
  const bookingCancelAction = async (item) => {
    try {
      dispatch(loadingStart());
      const { id, token } = await SecureStorageHelper.getAuthCredentials();

      const CancelBookingData = {
        current_user_id: id,
        access_token: token,
        booking_id: item.booking_id,
      };

      await dispatch(cancelBooking(CancelBookingData));
    } catch (error) {
      console.error("Error canceling booking:", error);
    }
  };

  // Handle back button press
  const handleBackButtonClick = () => {
    navigation.navigate("Home");
    return true;
  };

  // Handle focus/blur events for back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => handleBackButtonClick();
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription?.remove();
    }, [navigation])
  );

  // Refresh handler
  const onRefresh = () => {
    // Just reload booking data
    const reload = async () => {
      try {
        dispatch(loadingStart());
        const { id, token } = await SecureStorageHelper.getAuthCredentials();
        const BookingListData = {
          current_user_id: id,
          access_token: token,
        };
        await dispatch(fetchBooking(BookingListData));
      } catch (error) {
        console.error("Error refreshing booking data:", error);
      }
    };
    reload();
  };

  // Render item for flatlist
  const renderItem = ({ item }) => (
    <View style={styleCss.container}>
      <Row style={styleCss.bookclasslist_row}>
        <Col>
          <Row style={styleCss.bookclasslist_name_row}>
            <Text
              numberOfLines={1}
              style={styleCss.bookclasslist_name_text}
            >
              {item.class_name}
            </Text>
          </Row>
          <Row style={styleCss.bookclasslist_calendar_row}>
            <Col style={styleCss.bookclasslist_calendar_col}>
              <Image
                style={styleCss.bookclasslist_calendar_image}
                source={require("../../../images/calendar.png")}
              />
            </Col>
            <Col style={styleCss.bookclasslist_class_col}>
              <Text style={styleCss.bookclasslist_class_text}>
                {item.class_date}
              </Text>
            </Col>
          </Row>
          <Row style={styleCss.bookclasslist_time_row}>
            <Col style={styleCss.bookclasslist_time_col}>
              <Image
                style={styleCss.bookclasslist_time_image}
                source={require("../../../images/Time-512.png")}
              />
            </Col>
            <Col style={styleCss.bookclasslist_time_col2}>
              <Text style={styleCss.bookclasslist_time_text}>
                {item.start_time} - {item.end_time}
              </Text>
            </Col>
          </Row>
        </Col>
        <Col style={styleCss.bookclasslist_cancel_button_col}>
          {item.status_for_cancel == 1 && (
            <TouchableHighlight
              onPress={() => bookingCancelAction(item)}
              underlayColor={"#fff"}
              style={styleCss.bookclasslist_cancel_button}
            >
              <Text style={styleCss.bookclasslist_cancel_button_text}>
                {t("cancel")}
              </Text>
            </TouchableHighlight>
          )}
        </Col>
      </Row>
    </View>
  );

  // Key extractor for FlatList
  const keyExtractor = (item) => item.booking_id?.toString();

  // List header component
  const ListHeaderComponent = () => {
    if (classLimit !== "limited") return null;
    return (
      <Row style={styleCss.classlimit_row}>
        <Text
          numberOfLines={1}
          style={styleCss.classlimit_row_text}
        >
          {t("Booking Class")} {bookedClass} {t("Out of")} {totalClass}
        </Text>
      </Row>
    );
  };

  if (!loading) {
    return (
      <View style={styleCss.container}>
        <StatusBar />
        <SafeAreaView style={styleCss.container}>
          <FlatList
            data={data || []}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListHeaderComponent={ListHeaderComponent}
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
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
            updateCellsBatchingPeriod={50}
            getItemLayout={null}
          />
        </SafeAreaView>
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
};

BookingList.propTypes = {};

export default memo(BookingList);