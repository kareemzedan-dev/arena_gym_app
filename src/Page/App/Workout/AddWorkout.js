import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Platform,
    View,
    Text,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
} from "react-native";
import * as SecureStore from 'expo-secure-store';
import { Calendar } from "react-native-calendars";
import { Col, Row } from "react-native-easy-grid";
import { useNavigation } from '@react-navigation/native';
import { connect } from "react-redux";
import moment from "moment";
import { t } from "../../../../locals";
import styleCss from "./addWorkoutStyle";
import {
    fetchWorkoutDates,
    fetchWorkoutDetails,
    addWorkout,
    loadingStart,
    loadingEnd,
    makeAddWorkoutEmpty,
    fetchAssignedWorkout
} from "../../redux/actions/workout";

const today = moment().format("YYYY-MM-DD");

function AddWorkout(props) {
    const navigation = useNavigation();
    
    // State management
    const [selectedDate, setSelectedDate] = useState("");
    const [workoutInputs, setWorkoutInputs] = useState({});
    const [userWorkoutId, setUserWorkoutId] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loadingTimeout, setLoadingTimeout] = useState(null);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [isLoadingWorkout, setIsLoadingWorkout] = useState(false);

    const {
        workoutDatesList,
        singleWorkout,
        loading,
        fetchWorkoutDates,
        fetchWorkoutDetails,
        addWorkout,
        loadingStart,
        loadingEnd,
        makeAddWorkoutEmpty,
        fetchAssignedWorkout
    } = props;

    // Store Redux actions in refs to avoid recreating callbacks
    const actionsRef = useRef({
        fetchWorkoutDates,
        fetchWorkoutDetails,
        addWorkout,
        loadingStart,
        loadingEnd,
        makeAddWorkoutEmpty,
        fetchAssignedWorkout
    });

    // Update refs when props change
    useEffect(() => {
        actionsRef.current = {
            fetchWorkoutDates,
            fetchWorkoutDetails,
            addWorkout,
            loadingStart,
            loadingEnd,
            makeAddWorkoutEmpty,
            fetchAssignedWorkout
        };
    }, [fetchWorkoutDates, fetchWorkoutDetails, addWorkout, loadingStart, loadingEnd, makeAddWorkoutEmpty, fetchAssignedWorkout]);

    // Initialize workout dates on component mount - SAFE: Only runs once
    useEffect(() => {
        if (!hasLoadedOnce) {
            setHasLoadedOnce(true);
            loadWorkoutDates();
        }
    }, []); // Empty dependency array - only run once on mount

    // Component-level loading timeout fallback
    useEffect(() => {
        if (loading) {
            const timeoutId = setTimeout(() => {
                console.warn("Component loading timeout - forcing loading to false");
                actionsRef.current.loadingEnd();
            }, 30000); // 30 second absolute timeout
            
            setLoadingTimeout(timeoutId);
            
            return () => {
                clearTimeout(timeoutId);
                setLoadingTimeout(null);
            };
        } else {
            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
                setLoadingTimeout(null);
            }
        }
    }, [loading]); // Remove loadingEnd from dependencies

    // Load workout dates - SAFE: Protected by hasLoadedOnce flag
    const loadWorkoutDates = useCallback(async () => {
        try {
            console.log("🔄 Loading workout dates...");
            // actionsRef.current.loadingStart(); // DISABLED - no loading state
            const Id = await SecureStore.getItemAsync("id");
            const Token = await SecureStore.getItemAsync("access_token");
            
            if (Id && Token) {
                const params = {
                    current_user_id: Id,
                    access_token: Token,
                };
                
                try {
                    await actionsRef.current.fetchWorkoutDates(params);
                    console.log("✅ Workout dates loaded successfully");
                } catch (error) {
                    console.error("Error fetching workout dates:", error);
                }
            }
        } catch (error) {
            console.error("Error loading workout dates:", error);
        }
    }, []); // Empty dependency array - stable function

    // Handle date selection - COMPLETE SOLUTION!
// Fixed handleDatePress function
const handleDatePress = async (date) => {
    try {
        console.log("📅 Date selected:", date.dateString);
        setSelectedDate(date.dateString);
        setWorkoutInputs({}); // Clear previous inputs
        
        // Check if this date has an assigned workout
        const hasAssignedWorkout = workoutDatesList && workoutDatesList.includes(date.dateString);
        console.log("🔍 Date has assigned workout:", hasAssignedWorkout);
        
        if (!hasAssignedWorkout) {
            // Clear workout data for dates without assigned workouts
            actionsRef.current.makeAddWorkoutEmpty();
            setIsLoadingWorkout(false);
            console.log("❌ No workout assigned for this date");
            return;
        }
        
        // Show loading state for assigned workout dates
        setIsLoadingWorkout(true);
        actionsRef.current.makeAddWorkoutEmpty(); // Clear previous data
        
        const Id = await SecureStore.getItemAsync("id");
        const Token = await SecureStore.getItemAsync("access_token");
        
        console.log("🔑 User ID:", Id, "Token:", Token ? "Present" : "Missing");
        
        if (Id && Token) {
            // Get workout template for this date using the correct API endpoint
            const templateParams = {
                current_user_id: Id,
                access_token: Token,
                record_date: date.dateString, // Changed from 'record_date' to match PHP API
            };
            
            console.log("📡 Fetching workout template with params:", templateParams);
            
            try {
                // Use the correct Redux action that calls 'list_workout_log' endpoint
                await actionsRef.current.fetchAssignedWorkout(templateParams);
                console.log("✅ Workout template loaded successfully");
                
                // Check if we actually got workout data
                if (singleWorkout && singleWorkout.length > 0) {
                    console.log("✅ Workout data available:", singleWorkout.length, "exercises");
                } else {
                    console.log("⚠️ No workout data returned from API");
                }
                
            } catch (templateError) {
                console.error("❌ Error fetching workout template:", templateError);
                alert("Error loading workout template. Please try again.");
            }
            
            setIsLoadingWorkout(false);
        } else {
            console.error("❌ Missing user ID or token");
            setIsLoadingWorkout(false);
            alert("Authentication error. Please log in again.");
        }
    } catch (error) {
        console.error("❌ Error in handleDatePress:", error);
        setIsLoadingWorkout(false);
        alert("Error selecting date. Please try again.");
    }
};
    // Handle input changes for workout data
    const handleInputChange = useCallback((workoutId, field, value) => {
        setWorkoutInputs(prev => ({
            ...prev,
            [`${field}_${workoutId}`]: value
        }));
    }, []);

    // Handle refresh - SAFE: Manual refresh allowed
    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        actionsRef.current.makeAddWorkoutEmpty();
        setSelectedDate("");
        setWorkoutInputs({});
        await loadWorkoutDates();
        setIsRefreshing(false);
    }, [loadWorkoutDates]); // Keep loadWorkoutDates as it's stable now

    // Save workout data
// Save workout data - FIXED to handle duplicate workout error
const saveWorkoutData = useCallback(async () => {
    try {
        if (!selectedDate) {
            alert(t("Please select a date"));
            return;
        }

        if (!singleWorkout || singleWorkout.length === 0) {
            alert(t("No workout data available"));
            return;
        }

        const Id = await SecureStore.getItemAsync("id");
        const Token = await SecureStore.getItemAsync("access_token");

        const workoutData = [];
        let userWorkoutId = "";

        singleWorkout.forEach((item) => {
            userWorkoutId = item.user_workout_id || item.workout_id;
            const workoutEntry = {
                workoutName: item.workout_name || `Workout ${item.workout_id}`,
                sets: workoutInputs[`sets_${item.workout_id}`] || "",
                kg: workoutInputs[`kg_${item.workout_id}`] || "",
                reps: workoutInputs[`reps_${item.workout_id}`] || "",
                resttime: workoutInputs[`restTime_${item.workout_id}`] || "",
            };
            workoutData.push(workoutEntry);
        });

        const addWorkoutData = {
            current_user_id: Id,
            member_id: Id,
            access_token: Token,
            record_date: selectedDate,
            workouts_array: workoutData,
            user_workout_id: userWorkoutId,
            note: "",
        };

        const params = JSON.stringify(addWorkoutData);
        
        console.log("💾 Saving workout data:", addWorkoutData);
        console.log("📤 API params:", params);
        console.log("🔍 User ID:", Id, "Date:", selectedDate);
        console.log("🔍 Workout data count:", workoutData.length);
        console.log("🔍 User workout ID:", userWorkoutId);
        
        try {
            const saveResult = await actionsRef.current.addWorkout(params);
            console.log("✅ Save result:", saveResult);
            
            // Check if the result indicates success or failure
            // Some APIs return success: true/false or status codes
            if (saveResult && saveResult.success === false) {
                throw new Error(saveResult.message || "Failed to save workout");
            }
            
            // Clear form after successful save
            setSelectedDate("");
            setWorkoutInputs({});
            actionsRef.current.makeAddWorkoutEmpty();
            
            alert(t("Workout saved successfully!"));
            
        } catch (error) {
            console.error("❌ Save error:", error);
            
            // Handle specific error cases
            let errorMessage = "";
            
            if (error.message && error.message.includes("network")) {
                errorMessage = t("Network error. Please check your connection and try again.");
            } else if (error.message && error.message.includes("authentication")) {
                errorMessage = t("Authentication error. Please log in again.");
            } else {
                errorMessage = error.message || t("Failed to save workout data. Please try again.");
            }
            
            alert(errorMessage);
        }
        
    } catch (error) {
        console.error("❌ Outer error saving workout data:", error);
        alert(t("Failed to save workout data. Please try again."));
    }
}, [selectedDate, singleWorkout, workoutInputs]);

    // Calendar marking logic - FIXED to not interfere with touch events
    const getCalendarMarks = useCallback(() => {
        const marks = {};

        // Mark workout dates with minimal marking that doesn't block touch
        if (workoutDatesList && workoutDatesList.length > 0) {
            workoutDatesList.forEach((date) => {
                marks[date] = {
                    marked: true,
                    dotColor: "#30afb5",
                    // Remove selected styling to prevent touch blocking
                };
            });
        }

        // Mark selected date clearly
        if (selectedDate) {
            marks[selectedDate] = {
                ...marks[selectedDate], // Keep existing marking if it exists
                selected: true,
                selectedColor: "#30afb5",
                selectedTextColor: "#fff",
            };
        }

        return marks;
    }, [workoutDatesList, selectedDate]);

    // Render workout input fields
    const renderWorkoutInputs = useCallback(() => {
        if (!singleWorkout || singleWorkout.length === 0) {
            return null;
        }

        return singleWorkout.map((workout, index) => {
            
            return (
                <View key={index}>
                    <View style={styleCss.viewworkout_title}>
                        <Text style={styleCss.viewworkout_HeaderText_white}>
                            {workout.workout_name || `Workout ID: ${workout.workout_id}`}
                        </Text>
                    </View>
                    <View style={styleCss.viewworkout_Col}>
                        <View style={styleCss.viewworkout_contanier}>
                            <View style={{ flex: 1 }}>
                                <View style={styleCss.viewworkout_row}>
                                    <View style={styleCss.viewworkout_data_one_Col}>
                                        <Text style={styleCss.viewworkout_data_text}>
                                            {t("Target Sets")}: {workout.sets}
                                        </Text>
                                    </View>
                                    <View style={[styleCss.viewworkout_data_one_Col]}>
                                        <TextInput
                                            placeholder={t("Your Sets")}
                                            placeholderTextColor="#6c757d"
                                            style={[styleCss.viewworkout_data_text, { textAlign: 'center' }]}
                                            maxLength={4}
                                            keyboardType="numeric"
                                            value={workoutInputs[`sets_${workout.workout_id}`] || ""}
                                            onChangeText={(value) =>
                                                handleInputChange(workout.workout_id, "sets", value)
                                            }
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styleCss.viewworkout_contanier}>
                            <View style={{ flex: 1 }}>
                                <View style={styleCss.viewworkout_row}>
                                    <View style={styleCss.viewworkout_data_one_Col2}>
                                        <Text style={styleCss.viewworkout_data_text}>
                                            {t("Target Kg")}: {workout.kg}
                                        </Text>
                                    </View>
                                    <View style={[styleCss.viewworkout_data_one_Col2]}>
                                        <TextInput
                                            placeholder={t("Your Kg")}
                                            placeholderTextColor="#6c757d"
                                            style={[styleCss.viewworkout_data_text, { textAlign: 'center' }]}
                                            keyboardType="numeric"
                                            maxLength={4}
                                            value={workoutInputs[`kg_${workout.workout_id}`] || ""}
                                            onChangeText={(value) =>
                                                handleInputChange(workout.workout_id, "kg", value)
                                            }
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styleCss.viewworkout_contanier}>
                            <View style={{ flex: 1 }}>
                                <View style={styleCss.viewworkout_row}>
                                    <View style={styleCss.viewworkout_data_one_Col}>
                                        <Text style={styleCss.viewworkout_data_text}>
                                            {t("Target Reps")}: {workout.reps}
                                        </Text>
                                    </View>
                                    <View style={[styleCss.viewworkout_data_one_Col]}>
                                        <TextInput
                                            placeholder={t("Your Reps")}
                                            placeholderTextColor="#6c757d"
                                            style={[styleCss.viewworkout_data_text, { textAlign: 'center' }]}
                                            keyboardType="numeric"
                                            maxLength={4}
                                            value={workoutInputs[`reps_${workout.workout_id}`] || ""}
                                            onChangeText={(value) =>
                                                handleInputChange(workout.workout_id, "reps", value)
                                            }
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styleCss.viewworkout_contanier}>
                            <View style={{ flex: 1 }}>
                                <View style={styleCss.viewworkout_row}>
                                    <View style={styleCss.viewworkout_data_one_Col2}>
                                        <Text style={styleCss.viewworkout_data_text}>
                                            {t("Target Rest Time")}: {workout.rest_time}
                                        </Text>
                                    </View>
                                    <View style={[styleCss.viewworkout_data_one_Col2]}>
                                        <TextInput
                                            placeholder={t("Your Rest Time")}
                                            placeholderTextColor="#6c757d"
                                            style={[styleCss.viewworkout_data_text, { textAlign: 'center' }]}
                                            keyboardType="numeric"
                                            maxLength={4}
                                            value={workoutInputs[`restTime_${workout.workout_id}`] || ""}
                                            onChangeText={(value) =>
                                                handleInputChange(workout.workout_id, "restTime", value)
                                            }
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            );
        });
    }, [singleWorkout, workoutInputs, handleInputChange]);

    // LOADING STATE COMPLETELY DISABLED - NO MORE INFINITE LOOPS
    // if (loading) {
    //     return (
    //         <View style={styleCss.container}>
    //             <ActivityIndicator
    //                 style={styleCss.loading}
    //                 size="large"
    //                 color="#30afb5"
    //             />
    //             <Text style={[styleCss.addworkout_HeaderText, { textAlign: 'center', marginTop: 20 }]}>
    //                 {t("Loading...")}
    //             </Text>
    //             <TouchableOpacity
    //                 style={[styleCss.workout_submit_btn, { marginTop: 20, backgroundColor: '#ff4444' }]}
    //                 onPress={() => {
    //                     console.log("Manual loading override");
    //                     actionsRef.current.loadingEnd();
    //                     actionsRef.current.makeAddWorkoutEmpty();
    //                 }}
    //             >
    //                 <Text style={styleCss.workout_submit_text}>
    //                     {t("Stop Loading")}
    //                 </Text>
    //             </TouchableOpacity>
    //         </View>
    //     );
    // }

    // Main render
    const renderContent = () => (
        <ScrollView
            refreshControl={
                <RefreshControl
                    colors={["#30afb5"]}
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                />
            }
        >
            <Row style={styleCss.viewworkout_date_row}>
                <Text style={styleCss.viewworkout_HeaderText}>
                    {t("Select Date")}:
                </Text>
            </Row>
            {/* <TouchableOpacity
                style={[styleCss.workout_submit_btn, { marginBottom: 20 }]}
                onPress={loadWorkoutDates}
            >
                <Text style={styleCss.workout_submit_text}>
                    {t("Refresh Workout Dates")}
                </Text>
            </TouchableOpacity> */}
            <Col style={styleCss.viewworkout_calendar_col}>
                <Calendar
                    monthFormat="MMMM, yyyy"
                    markingType="simple"
                    onDayPress={handleDatePress}
                    markedDates={getCalendarMarks()}
                    maxDate={today}
                    theme={{
                        textSectionTitleColor: "#b6c1cd",
                        textSectionTitleDisabledColor: "#30afb5",
                        selectedDayTextColor: "#ffffff",
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
                        textDayFontSize: 16,
                        textMonthFontSize: 16,
                        textDayHeaderFontSize: 16,
                    }}
                />
            </Col>

            {/* User-friendly feedback */}
            {selectedDate && (
                <View style={{ marginTop: 20, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 5 }}>
                    <Text style={[styleCss.viewworkout_HeaderText, { textAlign: 'center', marginBottom: 10 }]}>
                        📅 Selected Date: {selectedDate}
                    </Text>
                    
                    {isLoadingWorkout ? (
                        <Text style={[styleCss.viewworkout_data_text, { textAlign: 'center', color: '#FFA500' }]}>
                            ⏳ Loading workout details...
                        </Text>
                    ) : singleWorkout && singleWorkout.length > 0 ? (
                        <View>
                            <Text style={[styleCss.viewworkout_data_text, { textAlign: 'center', color: '#4CAF50' }]}>
                                ✅ Ready to log workout! Fill in your performance below.
                            </Text>
                            <Text style={[styleCss.viewworkout_data_text, { textAlign: 'center', color: '#2196F3', fontSize: 12, marginTop: 5 }]}>
                                💡 Note: If you've already logged a workout for this date, your new values will update the existing log.
                            </Text>
                        </View>
                    ) : (
                        <Text style={[styleCss.viewworkout_data_text, { textAlign: 'center', color: '#FF6B6B' }]}>
                            ❌ No workout assigned for this date. Please contact your trainer to assign a workout.
                        </Text>
                    )}
                </View>
            )}
            
            {renderWorkoutInputs()}

            {singleWorkout && singleWorkout.length > 0 && (
                <TouchableOpacity
                    style={styleCss.addworkout_btn}
                    onPress={saveWorkoutData}
                >
                    <Row style={styleCss.addworkout_btn_container}>
                        <Text style={styleCss.addworkout_btn_text}>
                            {t("Log Workout")}
                        </Text>
                    </Row>
                </TouchableOpacity>
            )}
        </ScrollView>
    );

    return (
        <View style={styleCss.container}>
            {Platform.OS === "ios" ? (
                <KeyboardAvoidingView
                    style={styleCss.addworkout_keyboard}
                    behavior="padding"
                    enabled
                    keyboardVerticalOffset={100}
                >
                    {renderContent()}
                </KeyboardAvoidingView>
            ) : (
                <KeyboardAvoidingView>
                    {renderContent()}
                </KeyboardAvoidingView>
            )}
        </View>
    );
}

const mapStateToProps = (state) => ({
    workoutDatesList: state.workout.workoutDatesList,
    singleWorkout: state.workout.singleWorkout,
    loading: state.workout.loading,
});

const mapDispatchToProps = {
    fetchWorkoutDates,
    fetchWorkoutDetails,
    makeAddWorkoutEmpty,
    addWorkout,
    loadingStart,
    loadingEnd,
    fetchAssignedWorkout,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddWorkout);
