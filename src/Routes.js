import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useSelector, useDispatch } from "react-redux";
import { USER_LOGIN, USER_LOGOUT } from "./Page/redux/constant/types";
import { fetchUserdetails } from "./Page/redux/actions/auth";
import ErrorBoundary from "./util/ErrorBoundary";
import monitoringService from "./util/MonitoringService";
import authManager from "./util/AuthManager";

import LoginPage from "./Page/Auth/LoginPage";
import RegistrationPage from "./Page/Auth/RegistrationPage";
import Home from "./Page/App/Home.js";
import Dashboard from "./Page/App/Dashboard";
import MemberShipList from "./Page/App/Membership/MemberShipList.js";
import ActivityList from "./Page/App/Activity/ActivityList";
import activityvideo from "./Page/App/Activity/activityvideo.js";
import Workouts from "./Page/App/Workout/Workouts.js";
import Schedule from "./Page/App/ClassSchedule/schedule.js";
import Booking from "./Page/App/ClassBooking/Booking.js";
import Nutritionplan from "./Page/App/NutritionPlan/nutritionplan.js";
import StaffMemberList from "./Page/App/StaffMember/staffmemberlist.js";
import Message from "./Page/App/Message/message.js";
import groupList from "./Page/App/Group/groupList.js";
import AssignWorkoutsList from "./Page/App/AssignWorkouts/AssignWorkoutsList.js";
import WorkoutsList from "./Page/App/AssignWorkouts/WorkoutsList.js";
import memberArea from "./Page/App/Member/memberArea.js";
import addmeasurement from "./Page/App/Measurement/addmeasurement.js";
import Feespayment from "./Page/App/FeesPayment/feespayment.js";
import viewpayment from "./Page/App/FeesPayment/viewpayment.js";
import viewinvoice from "./Page/App/FeesPayment/viewinvoice.js";
import Account from "./Page/App/Account/account.js";
import SubscriptionHistory from "./Page/App/SubscriptionHistory/subscriptionhistory.js";
import NutritionSchedule from "./Page/App/NutritionPlan/NutritionSchedule.js";
import Notice from "./Page/App/Notice/showNotices.js";
import CustomSideBar from "./Page/App/CustomSideBar";
import qrbik from "./Page/App/QRCode/qrbik.js";
import Language from "./Page/App/Language";

// Staff imports
import staffDashboard from "./Page/App/Staff/staffDashboard";
import MemberReport from "./Page/App/Staff/MemberReport/Member_Report";
import Attendance_Scanner from "./Page/App/Staff/Staff_Attendance_Scanner/Attendance_Scanner";
import Attendance from "./Page/App/Staff/Staff_Attendance/Attendance";
import Attendancedetails from "./Page/App/Staff/Staff_Attendance_Scanner/AttendanceDetails";
import StaffMemberListComponent from "./Page/App/Staff/Staff_staffMember/staffmemberlist";
import AddMembership from "./Page/App/Staff/Staff_membership/AddMembership";
import AddGroup from "./Page/App/Staff/Staff_group/AddGroup";
import AddMember from "./Page/App/Staff/Staff_member/AddMember";
import AddActivity from "./Page/App/Staff/Staff_activity/AddActivity";
import AddClass from "./Page/App/Staff/Staff_classSchedule/AddClass";
import AddAssignWorkout from "./Page/App/Staff/Staff_assignWorkout/AddAssignWorkout";
import AddnutritionSchedule from "./Page/App/Staff/Staff_nutritionSchedule/AddnutritionSchedule";
import Addworkout from "./Page/App/Staff/Staff_workout/Addworkout";
import Accountant from "./Page/App/Staff/Staff_Accountant/Accountant";
import AddProduct from "./Page/App/Staff/Staff_Product/AddProduct";
import AddStore from "./Page/App/Staff/Staff_Store/AddStore";
import StaffMessage from "./Page/App/Staff/Staff_Message/Message";
import StaffNotice from "./Page/App/Staff/Staff_Notice/Notice";
import AddReservation from "./Page/App/Staff/Staff_Reservation/AddReservation";
import staffaccount from "./Page/App/Staff/Staff_account/staffaccount";
import StaffSubscriptionHistory from "./Page/App/Staff/Staff_subscriptionHistory/SubscriptionHistory";
import StaffCustomSideBar from "./Page/App/Staff/StaffCustomSideBar";

const Stack = createStackNavigator();
const AppStack = createStackNavigator();
const StaffStack = createStackNavigator();
const AuthStack = createStackNavigator();

const AppStackScreen = () => (
  <ErrorBoundary componentName="AppStack">
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Home"
    >
      <AppStack.Screen name="Home" component={Home} />
      <AppStack.Screen name="Language" component={Language} />
      <AppStack.Screen name="Dashboard" component={Dashboard} />
      <AppStack.Screen name="MemberShipList" component={MemberShipList} />
      <AppStack.Screen name="ActivityList" component={ActivityList} />
      <AppStack.Screen name="activityvideo" component={activityvideo} />
      <AppStack.Screen name="Workouts" component={Workouts} />
      <AppStack.Screen name="Schedule" component={Schedule} />
      <AppStack.Screen name="Booking" component={Booking} />
      <AppStack.Screen name="Nutritionplan" component={Nutritionplan} />
      <AppStack.Screen name="StaffMemberList" component={StaffMemberList} />
      <AppStack.Screen name="Message" component={Message} />
      <AppStack.Screen name="groupList" component={groupList} />
      <AppStack.Screen name="AssignWorkoutsList" component={AssignWorkoutsList} />
      <AppStack.Screen name="WorkoutsList" component={WorkoutsList} />
      <AppStack.Screen name="memberArea" component={memberArea} />
      <AppStack.Screen name="addmeasurement" component={addmeasurement} />
      <AppStack.Screen name="Feespayment" component={Feespayment} />
      <AppStack.Screen name="viewpayment" component={viewpayment} />
      <AppStack.Screen name="viewinvoice" component={viewinvoice} />
      <AppStack.Screen name="Account" component={Account} />
      <AppStack.Screen name="SubscriptionHistory" component={SubscriptionHistory} />
      <AppStack.Screen name="NutritionSchedule" component={NutritionSchedule} />
      <AppStack.Screen name="Notice" component={Notice} />
      <AppStack.Screen name="CustomSideBar" component={CustomSideBar} />
      <AppStack.Screen name="qrbik" component={qrbik} />
    </AppStack.Navigator>
  </ErrorBoundary>
);

const StaffStackScreen = () => (
  <ErrorBoundary componentName="StaffStack">
    <StaffStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="staffDashboard"
    >
      <StaffStack.Screen name="staffDashboard" component={staffDashboard} />
      <StaffStack.Screen name="MemberReport" component={MemberReport} />
      <StaffStack.Screen name="Attendance_Scanner" component={Attendance_Scanner} />
      <StaffStack.Screen name="Attendance" component={Attendance} />
      <StaffStack.Screen name="Attendancedetails" component={Attendancedetails} />
      <StaffStack.Screen name="Addstaffmemberlist" component={StaffMemberListComponent} />
      <StaffStack.Screen name="staffmemberlist" component={StaffMemberListComponent} />
      <StaffStack.Screen name="AddMembership" component={AddMembership} />
      <StaffStack.Screen name="AddGroup" component={AddGroup} />
      <StaffStack.Screen name="AddMember" component={AddMember} />
      <StaffStack.Screen name="AddActivity" component={AddActivity} />
      <StaffStack.Screen name="AddClass" component={AddClass} />
      <StaffStack.Screen name="AddAssignWorkout" component={AddAssignWorkout} />
      <StaffStack.Screen name="AddnutritionSchedule" component={AddnutritionSchedule} />
      <StaffStack.Screen name="Addworkout" component={Addworkout} />
      <StaffStack.Screen name="Accountant" component={Accountant} />
      <StaffStack.Screen name="AddProduct" component={AddProduct} />
      <StaffStack.Screen name="AddStore" component={AddStore} />
      <StaffStack.Screen name="StaffMessage" component={StaffMessage} />
      <StaffStack.Screen name="StaffNotice" component={StaffNotice} />
      <StaffStack.Screen name="AddReservation" component={AddReservation} />
      <StaffStack.Screen name="staffaccount" component={staffaccount} />
      <StaffStack.Screen name="StaffSubscriptionHistory" component={StaffSubscriptionHistory} />
      <StaffStack.Screen name="StaffCustomSideBar" component={StaffCustomSideBar} />
    </StaffStack.Navigator>
  </ErrorBoundary>
);

const AuthStackScreen = () => (
  <ErrorBoundary componentName="AuthStack">
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="LoginPage" component={LoginPage} />
      <AuthStack.Screen name="RegistrationPage" component={RegistrationPage} />
    </AuthStack.Navigator>
  </ErrorBoundary>
);

function RootNavigator() {
  const { userToken, userRole } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigationRef = React.useRef();

  const [isLoading, setIsLoading] = React.useState(true);
  const [authCheckCompleted, setAuthCheckCompleted] = React.useState(false);

  React.useEffect(() => {
    // Set up AuthManager with navigation and logout callback
    authManager.setNavigationRef(navigationRef);
    authManager.setLogoutCallback(() => {
      dispatch({ type: USER_LOGOUT, data: {} });
    });

    // Check SecureStore for persisted login
    checkAuthState();
  }, [dispatch]);

  const checkAuthState = async () => {
    try {
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Auth check timeout, proceeding without authentication');
        setIsLoading(false);
        setAuthCheckCompleted(true);
      }, 8000); // 8 seconds timeout

      // Secure SecureStore access with proper error handling
      const [token, role, id] = await Promise.all([
        SecureStore.getItemAsync("access_token").catch((error) => {
          console.warn('Failed to get access_token:', error);
          return null;
        }),
        SecureStore.getItemAsync("role_name").catch((error) => {
          console.warn('Failed to get role_name:', error);
          return null;
        }),
        SecureStore.getItemAsync("id").catch((error) => {
          console.warn('Failed to get id:', error);
          return null;
        })
      ]);
      
      clearTimeout(timeoutId);
      
      // Validate all required auth data exists
      if (!token || !role || !id) {
        console.log('Missing auth data - token:', !!token, 'role:', !!role, 'id:', !!id);
        await clearAuthData();
        return;
      }

      // Additional validation: check if token format is valid
      try {
        // Basic token validation - ensure it's not empty or malformed
        if (token.trim().length > 10 && role.trim().length > 0 && id.trim().length > 0) {
          console.log('Valid auth data found, dispatching login');
          dispatch({
            type: USER_LOGIN,
            payload: { token, role }
          });

          // Delay user details fetch to prevent race condition
          console.log('Scheduling user details fetch after auth state update');
          setTimeout(() => {
            try {
              const userData = {
                member_id: id,
                access_token: token,
              };
              dispatch(fetchUserdetails(userData));
            } catch (fetchError) {
              console.error('Error fetching user details on restart:', fetchError);
              // Don't clear auth data just for user details fetch failure
            }
          }, 200); // Small delay to ensure auth state is updated
        } else {
          console.warn('Invalid token format - token length:', token.length, 'role:', role, 'id length:', id.length);
          await clearAuthData();
        }
      } catch (validationError) {
        console.error('Token validation error:', validationError);
        await clearAuthData();
      }
    } catch (error) {
      console.error('Auth state check error:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
      setAuthCheckCompleted(true);
    }
  };

  const clearAuthData = async () => {
    try {
      await Promise.allSettled([
        SecureStore.deleteItemAsync("access_token").catch((error) => {
          console.warn('Failed to delete access_token:', error);
        }),
        SecureStore.deleteItemAsync("role_name").catch((error) => {
          console.warn('Failed to delete role_name:', error);
        }),
        SecureStore.deleteItemAsync("id").catch((error) => {
          console.warn('Failed to delete id:', error);
        }),
        SecureStore.deleteItemAsync("email").catch((error) => {
          console.warn('Failed to delete email:', error);
        }),
      ]);
      console.log('Auth data cleanup completed');
    } catch (clearError) {
      console.error('Error clearing auth data:', clearError);
    }
  };

  // Show loading spinner while checking auth state
  if (isLoading || !authCheckCompleted) {
    return (
      <View style={styles.container}>
        <ActivityIndicator style={styles.loader} size="large" color="#30afb5" />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={(state) => {
        // Log navigation events
        if (state) {
          const route = state.routes[state.index];
          monitoringService.logNavigation('unknown', route.name, {
            routeParams: route.params,
            timestamp: new Date().toISOString()
          });
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <Stack.Screen name="Auth" component={AuthStackScreen} />
        ) : userRole === "staff_member" ? (
          <Stack.Screen name="Staff" component={StaffStackScreen} />
        ) : (
          <Stack.Screen name="App" component={AppStackScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#30afb5",
  },
  loader: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});