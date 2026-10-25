import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
} from "react-native";
import * as SecureStore from 'expo-secure-store';
import { Calendar } from "react-native-calendars";
import { Col, Row } from "react-native-easy-grid";
import { useFocusEffect } from '@react-navigation/native';
import { t } from "../../../../locals";
import styleCss from "./viewWorkoutStyle.js";

// Redux
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPreviewWorkout,
  loadingStart,
  fetchWorkoutDates,
  makeViewWorkoutEmpty,
  makeAddWorkoutEmpty,
  fetchAssignedWorkout
} from "../../redux/actions/workout";

const ViewWorkout = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Redux state
  const dispatch = useDispatch();
  const { previewWorkoutData, singleWorkout, workoutDatesList, loading } = useSelector(
    (state) => state.workout
  );

  // Fetch workout dates when component mounts or comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only fetch if workoutDatesList is empty to prevent unnecessary API calls
      if (!workoutDatesList || workoutDatesList.length === 0) {
        workoutdateArrayAction();
      }
    }, [workoutDatesList])
  );

  const workoutdateArrayAction = async () => {
    try {
      dispatch(loadingStart());
      const id = await SecureStore.getItemAsync("id");
      const token = await SecureStore.getItemAsync("access_token");
      
      if (!id || !token) {
        Alert.alert("Error", "Authentication required");
        return;
      }

      const params = {
        current_user_id: id,
        access_token: token,
      };

      dispatch(fetchWorkoutDates(params));
    } catch (error) {
      console.error("Error fetching workout dates:", error);
      Alert.alert("Error", "Failed to load workout dates");
    }
  };

  const onDayPress = async (date) => {
    try {
      dispatch(loadingStart());
      setSelectedDate(date.dateString);

      const id = await SecureStore.getItemAsync("id");
      const token = await SecureStore.getItemAsync("access_token");

      if (!id || !token) {
        Alert.alert("Error", "Authentication required");
        return;
      }

      // Use the correct endpoint and parameters for viewing assigned workouts
      const params = {
        current_user_id: id,
        access_token: token,
        record_date: date.dateString, // Use record_date for list_workout_log endpoint
      };

      // Use fetchAssignedWorkout to get assigned workouts for the selected date
      dispatch(fetchAssignedWorkout(params));
    } catch (error) {
      console.error("Error fetching workout data:", error);
      Alert.alert("Error", "Failed to load workout data");
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    dispatch(makeViewWorkoutEmpty());
    dispatch(makeAddWorkoutEmpty()); // Clear singleWorkout data
    setSelectedDate("");
    await workoutdateArrayAction();
    setRefreshing(false);
  }, [dispatch]);

  // Calendar marking logic
  const getMarkedDates = () => {
    const marks = {};

    // Mark all workout dates
    workoutDatesList.forEach((day) => {
      marks[day] = {
        selected: true,
        customStyles: {
          container: {
            backgroundColor: "#30afb5",
          },
          text: {
            color: "#fff",
          },
        },
      };
    });

    // Mark selected date with special styling
    if (selectedDate) {
      marks[selectedDate] = {
        selected: true,
        customStyles: {
          container: {
            backgroundColor: "#fff",
            borderColor: "#30afb5",
            borderWidth: 2,
          },
          text: {
            color: "#30afb5",
            fontWeight: "bold",
          },
        },
      };
    }

    return marks;
  };

  const renderWorkoutData = () => {
    if (!singleWorkout || singleWorkout.length === 0) {
      return null;
    }

    return (
      <View>
        {singleWorkout.map((data, index) => (
          <View key={`workout-${index}`}>
            <Row style={styleCss.viewworkout_title}>
              <Text style={styleCss.viewworkout_HeaderText}>
                {data.workout_name || `Workout ${data.workout_id}`}
              </Text>
            </Row>
            <Col style={styleCss.viewworkout_Col}>
              <Row style={styleCss.viewworkout_contanier}>
                <Col>
                  <Row style={styleCss.viewworkout_row}>
                    <Col style={styleCss.viewworkout_data_one_Col}>
                      <Text style={styleCss.viewworkout_data_text}>
                        {t("Target Sets")}: {data.sets || "N/A"}
                      </Text>
                    </Col>
                  </Row>
                </Col>
                <Col>
                  <Row style={styleCss.viewworkout_row}>
                    <Col style={styleCss.viewworkout_data_one_Col2}>
                      <Text style={styleCss.viewworkout_data_text}>
                        {t("Target Kg")}: {data.kg || "N/A"}
                      </Text>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row style={styleCss.viewworkout_contanier}>
                <Col>
                  <Row style={styleCss.viewworkout_row}>
                    <Col style={styleCss.viewworkout_data_one_Col}>
                      <Text style={styleCss.viewworkout_data_text}>
                        {t("Target Reps")}: {data.reps || "N/A"}
                      </Text>
                    </Col>
                  </Row>
                </Col>
                <Col>
                  <Row style={styleCss.viewworkout_row}>
                    <Col style={styleCss.viewworkout_data_one_Col2}>
                      <Text style={styleCss.viewworkout_data_text}>
                        {t("Rest Time")}: {data.rest_time || "N/A"}
                      </Text>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </View>
        ))}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styleCss.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator
          style={styleCss.loading}
          size="large"
          color="#30afb5"
        />
      </View>
    );
  }

  return (
    <View style={styleCss.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            colors={["#30afb5"]}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Row style={styleCss.viewworkout_date_row}>
          <Text style={styleCss.viewworkout_HeaderText}>
            {t("Select Date")}:
          </Text>
        </Row>
        
        <Col style={styleCss.viewworkout_calendar_col}>
          <Calendar
            monthFormat={"MMMM, yyyy"}
            markingType={"custom"}
            onDayPress={onDayPress}
            markedDates={getMarkedDates()}
            theme={{
              textSectionTitleColor: "#b6c1cd",
              textSectionTitleDisabledColor: "#30afb5",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#00adf5",
              dayTextColor: "#2d4150",
              textDisabledColor: "#d9e1e8",
              dotColor: "#00adf5",
              arrowColor: "#30afb5",
              disabledArrowColor: "#d9e1e8",
              monthTextColor: "#30afb5",
              indicatorColor: "#30afb5",
              textDayFontFamily: "Cairo-Medium",
              textMonthFontFamily: "Cairo-SemiBold",
              textDayHeaderFontFamily: "Cairo-Medium",
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 16,
            }}
          />
        </Col>

        {renderWorkoutData()}
      </ScrollView>
    </View>
  );
};

export default ViewWorkout;