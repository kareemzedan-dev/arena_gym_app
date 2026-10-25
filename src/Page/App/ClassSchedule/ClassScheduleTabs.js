import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import ClassSchedule from './ClassSchedule.js';
import ClassList from './ClassList.js';
import { t } from '../../../../locals';

const { width } = Dimensions.get('window');

/** Tab navigation page of bookings tab */
export default function ClassScheduleTabs() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: t("Class Schedule"), component: ClassSchedule },
    { label: t("Class List"), component: ClassList }
  ];

  const ActiveComponent = tabs[activeTab].component;

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tabButton,
              activeTab === index && styles.activeTabButton
            ]}
            onPress={() => setActiveTab(index)}
          >
            <Text style={[
              styles.tabLabel,
              activeTab === index && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
            {activeTab === index && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>
        <ActiveComponent />
      </View>
    </View>
  );
}

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
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    position: 'relative',
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
