import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SideMenu from 'react-native-side-menu-updated';

import staffDashboard from '../Staff/staffDashboard';
import MemberReport from '../Staff/MemberReport/Member_Report';
import Attendance_Scanner from './Staff_Attendance_Scanner/Attendance_Scanner';
import Attendance from './Staff_Attendance/Attendance';
import Attendancedetails from './Staff_Attendance_Scanner/AttendanceDetails';
import StaffMemberListComponent from '../Staff/Staff_staffMember/staffmemberlist';
import AddMembership from '../Staff/Staff_membership/AddMembership';
import AddGroup from '../Staff/Staff_group/AddGroup';
import AddMember from '../Staff/Staff_member/AddMember';
import AddActivity from '../Staff/Staff_activity/AddActivity';
import AddClass from '../Staff/Staff_classSchedule/AddClass';
import AddAssignWorkout from '../Staff/Staff_assignWorkout/AddAssignWorkout';
import AddnutritionSchedule from '../Staff/Staff_nutritionSchedule/AddnutritionSchedule';
import Addworkout from '../Staff/Staff_workout/Addworkout';
import Accountant from '../Staff/Staff_Accountant/Accountant';
import AddProduct from '../Staff/Staff_Product/AddProduct';
import AddStore from '../Staff/Staff_Store/AddStore';
import Message from '../Staff/Staff_Message/Message';
import Notice from '../Staff/Staff_Notice/Notice';
import AddReservation from '../Staff/Staff_Reservation/AddReservation';
import staffaccount from '../Staff/Staff_account/staffaccount';
import SubscriptionHistory from '../Staff/Staff_subscriptionHistory/SubscriptionHistory';

const { width } = Dimensions.get('screen');
const Stack = createStackNavigator();

const menuItems = [
  { key: 'staffDashboard', title: 'Dashboard', component: staffDashboard },
  { key: 'MemberReport', title: 'Member Report', component: MemberReport },
  { key: 'Attendance', title: 'Attendance', component: Attendance },
  { key: 'Attendance_Scanner', title: 'Attendance Scanner', component: Attendance_Scanner },
  { key: 'staffmemberlist', title: 'Staff Members', component: StaffMemberListComponent },
  { key: 'AddMembership', title: 'Add Membership', component: AddMembership },
  { key: 'AddGroup', title: 'Add Group', component: AddGroup },
  { key: 'AddMember', title: 'Add Member', component: AddMember },
  { key: 'AddActivity', title: 'Add Activity', component: AddActivity },
  { key: 'AddClass', title: 'Add Class', component: AddClass },
  { key: 'AddAssignWorkout', title: 'Assign Workout', component: AddAssignWorkout },
  { key: 'AddnutritionSchedule', title: 'Nutrition Schedule', component: AddnutritionSchedule },
  { key: 'Addworkout', title: 'Add Workout', component: Addworkout },
  { key: 'Accountant', title: 'Accountant', component: Accountant },
  { key: 'AddProduct', title: 'Add Product', component: AddProduct },
  { key: 'AddStore', title: 'Add Store', component: AddStore },
  { key: 'Message', title: 'Messages', component: Message },
  { key: 'Notice', title: 'Notices', component: Notice },
  { key: 'AddReservation', title: 'Add Reservation', component: AddReservation },
  { key: 'staffaccount', title: 'Staff Account', component: staffaccount },
  { key: 'SubscriptionHistory', title: 'Subscription History', component: SubscriptionHistory },
];

const MenuContent = ({ onItemPress, currentScreen }) => (
  <View style={styles.menuContainer}>
    <View style={styles.menuHeader}>
      <Text style={styles.menuTitle}>Staff Menu</Text>
    </View>
    <ScrollView style={styles.menuItems}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[
            styles.menuItem,
            currentScreen === item.key && styles.activeMenuItem
          ]}
          onPress={() => onItemPress(item.key)}
        >
          <Text style={[
            styles.menuItemText,
            currentScreen === item.key && styles.activeMenuItemText
          ]}>
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const StackNavigator = ({ currentScreen, onMenuPress }) => {
  const currentComponent = menuItems.find(item => item.key === currentScreen)?.component || staffDashboard;
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main">
        {(props) => (
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
                <Text style={styles.menuButtonText}>☰</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Staff App</Text>
            </View>
            <View style={styles.content}>
              {React.createElement(currentComponent, props)}
            </View>
          </View>
        )}
      </Stack.Screen>
      <Stack.Screen name="Attendancedetails" component={Attendancedetails} />
    </Stack.Navigator>
  );
};

function StaffSideMenuNavigator() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('staffDashboard');

  const handleMenuItemPress = (screenKey) => {
    setCurrentScreen(screenKey);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <SideMenu
      menu={
        <MenuContent
          onItemPress={handleMenuItemPress}
          currentScreen={currentScreen}
        />
      }
      isOpen={isMenuOpen}
      onChange={(isOpen) => setIsMenuOpen(isOpen)}
      menuPosition="left"
      disableGestures={false}
    >
      <StackNavigator
        currentScreen={currentScreen}
        onMenuPress={toggleMenu}
      />
    </SideMenu>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StaffSideMenuNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    paddingTop: 50,
  },
  menuButton: {
    padding: 10,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  content: {
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    backgroundColor: '#2c3e50',
    width: width - 75,
  },
  menuHeader: {
    backgroundColor: '#34495e',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  menuTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
  },
  activeMenuItem: {
    backgroundColor: '#3498db',
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
  },
  activeMenuItemText: {
    fontWeight: 'bold',
  },
});