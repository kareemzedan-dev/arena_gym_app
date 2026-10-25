import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Inbox from './Inbox.js';
import InboxView from './InboxView.js';
import Compose from './Compose.js';
import Sent from './Sent.js';
import SentView from './SentView.js';
import { t } from '../../../../locals';
import ErrorBoundary from '../../../util/ErrorBoundary';

const Stack = createStackNavigator();

// Stack Navigators
function InboxStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Inbox" 
        component={Inbox}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="InboxView" 
        component={InboxView}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function SentStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Sent" 
        component={Sent}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SentView" 
        component={SentView}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Custom Tab Navigator Component
function CustomTabNavigator() {
  const [activeTab, setActiveTab] = useState('Inbox');

  // Wrapper component for Compose to provide mock route
  const ComposeWrapper = () => {
    const mockRoute = { params: {} };
    return <Compose route={mockRoute} />;
  };

  const tabs = [
    { key: 'Inbox', label: t("Inbox"), component: InboxStack },
    { key: 'Compose', label: t("Compose"), component: ComposeWrapper },
    { key: 'Sent', label: t("Sent"), component: SentStack },
  ];

  const renderActiveComponent = () => {
    const activeTabData = tabs.find(tab => tab.key === activeTab);
    if (activeTabData) {
      const Component = activeTabData.component;
      return (
        <ErrorBoundary componentName={`MessageTab-${activeTab}`}>
          <Component />
        </ErrorBoundary>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Custom Tab Bar */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => {
          const isFocused = activeTab === tab.key;
          
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabButton, isFocused && styles.activeTab]}
            >
              <Text style={[styles.tabLabel, isFocused && styles.activeTabLabel]}>
                {tab.label}
              </Text>
              {isFocused && <View style={styles.indicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        {renderActiveComponent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#30afb5',
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  activeTab: {
    // Add any active tab specific styles here
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: 'Cairo-SemiBold',
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#fff',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
});

export default CustomTabNavigator;