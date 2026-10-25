import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import AddWorkout from './AddWorkout.js';
import ViewWorkout from './ViewWorkout.js';
import { t } from '../../../../locals';

const { width } = Dimensions.get('window');

export default function WorkoutsTabs() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = useMemo(() => [
    { label: t("Add Workout Log"), component: AddWorkout },
    { label: t("View Workout"), component: ViewWorkout }
  ], []);

  const handleTabPress = useCallback((index) => {
    setActiveTab(index);
  }, []);

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
            onPress={() => handleTabPress(index)}
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
        <ActiveComponent key={activeTab} />
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
