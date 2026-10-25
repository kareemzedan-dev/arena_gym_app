import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { t } from '../../../../locals';
import ClassBooking from './ClassBooking.js';
import BookingList from './BookingList';
import ErrorBoundary from './ErrorBoundary';

const { width } = Dimensions.get('window');

// BookingList is already memoized in its own file
const MemoizedBookingList = React.memo(BookingList);

/** Wrapped ClassBooking component with error boundary - ClassBooking is a class component */
const ClassBookingWithErrorBoundary = React.memo(() => (
  <ErrorBoundary>
    <ClassBooking />
  </ErrorBoundary>
));

/** Wrapped BookingList component with error boundary */
const BookingListWithErrorBoundary = React.memo(() => (
  <ErrorBoundary>
    <MemoizedBookingList />
  </ErrorBoundary>
));

// Define tabs configuration outside component to prevent recreation
const TABS_CONFIG = [
  { 
    id: 'class-booking',
    labelKey: "Class Booking", 
    component: ClassBookingWithErrorBoundary 
  },
  { 
    id: 'booking-list',
    labelKey: "Booking List", 
    component: BookingListWithErrorBoundary 
  }
];

/** Custom tab navigation for class booking */
export default function ClassBookingTabs() {
  const [activeTab, setActiveTab] = useState(0);

  // Memoize tabs array with translated labels
  const tabs = useMemo(() => 
    TABS_CONFIG.map(tab => ({
      ...tab,
      label: t(tab.labelKey)
    })), 
    [] // Empty dependency - translations are typically static
  );

  // Memoize tab change handler with better optimization
  const handleTabChange = useCallback((index) => {
    setActiveTab(prevTab => prevTab !== index ? index : prevTab);
  }, []);

  // Memoize active component to prevent unnecessary re-renders
  const ActiveComponent = useMemo(() => {
    const tab = tabs[activeTab];
    return tab?.component || null;
  }, [tabs, activeTab]);

  // Render tab button - memoized to prevent recreation
  const renderTabButton = useCallback((tab, index) => {
    const isActive = activeTab === index;
    
    return (
      <TouchableOpacity
        key={tab.id}
        style={[
          styles.tabButton,
          isActive && styles.activeTabButton
        ]}
        onPress={() => handleTabChange(index)}
        activeOpacity={0.7}
        testID={`tab-${tab.id}`}
      >
        <Text style={[
          styles.tabLabel,
          isActive && styles.activeTabLabel
        ]}>
          {tab.label}
        </Text>
        {isActive && <View style={styles.tabIndicator} />}
      </TouchableOpacity>
    );
  }, [activeTab, handleTabChange]);

  // Memoize tab bar to prevent unnecessary re-renders
  const tabBar = useMemo(() => (
    <View style={styles.tabBar}>
      {tabs.map(renderTabButton)}
    </View>
  ), [tabs, renderTabButton]);

  return (
    <View style={styles.container}>
      {tabBar}
      <View style={styles.content}>
        {ActiveComponent && <ActiveComponent />}
      </View>
    </View>
  );
}

// Add display names for better debugging
ClassBookingWithErrorBoundary.displayName = 'ClassBookingWithErrorBoundary';
BookingListWithErrorBoundary.displayName = 'BookingListWithErrorBoundary';
MemoizedBookingList.displayName = 'MemoizedBookingList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#30afb5',
    height: 48,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    position: 'relative',
    minHeight: 48,
  },
  activeTabButton: {
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    opacity: 0.7,
    includeFontPadding: false,
  },
  activeTabLabel: {
    opacity: 1,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});