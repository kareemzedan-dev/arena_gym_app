import React from 'react';
import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

const StatusBarView = ({ 
  backgroundColor = '#30afb5', 
  barStyle = 'light', 
  useSafeArea = true,
  children 
}) => {
  if (useSafeArea) {
    // Use SafeAreaView as the single source of truth for safe area handling
    return (
      <SafeAreaView 
        style={{ 
          flex: 1, 
          backgroundColor: backgroundColor 
        }}
        edges={['top', 'left', 'right']} // Only handle top, left, right - let bottom be natural
      >
        <StatusBar 
          style={barStyle} 
          backgroundColor={backgroundColor}
          translucent={false}
        />
        {children}
      </SafeAreaView>
    );
  } else {
    // Fallback without SafeAreaView
    return (
      <View 
        style={{ 
          flex: 1, 
          backgroundColor: backgroundColor
        }}
      >
        <StatusBar 
          style={barStyle} 
          backgroundColor={backgroundColor}
          translucent={false}
        />
        {children}
      </View>
    );
  }
};

export default StatusBarView;