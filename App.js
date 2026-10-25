// Global error and warning handling
import { LogBox } from "react-native";

// Ignore specific warnings if needed
LogBox.ignoreLogs([
  "Warning: componentWillReceiveProps has been renamed", // example, adjust as needed
  "StatusBar is always translucent when edge-to-edge is enabled",
  "StatusBar backgroundColor is not supported with edge-to-edge enabled",
]);
import React, { Component, useEffect } from "react";
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
} from "react-native";
import { Provider } from "react-redux";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StatusBarView from "./src/components/StatusBarView";
import monitoringService from "./src/util/MonitoringService";
import config from "./src/util/Config";

// Catch all unhandled JS errors
if (typeof ErrorUtils !== "undefined" && ErrorUtils.setGlobalHandler) {
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error("Global JS Error:", error, isFatal);
    
    // Send error to monitoring service
    monitoringService.logError(error, {
      isFatal,
      component: 'Global',
      action: 'unhandled_error'
    });
  });
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
    
    // Send error to monitoring service
    monitoringService.logError(error, {
      isFatal: false,
      component: 'App-ErrorBoundary',
      action: 'component_error',
      errorInfo: info
    });
  }
  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaProvider>
          <StatusBarView backgroundColor="#30afb5" barStyle="light" useSafeArea={true}>
            <View style={styles.errorContainer}>
              <Text style={{ color: "red", fontSize: 18, margin: 16 }}>Something went wrong.</Text>
              <Text selectable style={{ color: "#333", margin: 8 }}>{String(this.state.error)}</Text>
            </View>
          </StatusBarView>
        </SafeAreaProvider>
      );
    }
    return this.props.children;
  }
}

import Store from "./src/Page/redux/reduxStore/index";
import AppNavigator from "./src/Routes";
import { useFonts } from "expo-font";

Text.defaultProps = Text.defaultProps || {};

export default function App() {
  // Initialize monitoring and configuration
  React.useEffect(() => {
    // Log app configuration in development
    config.logConfig();
    
    // Log app startup
    monitoringService.logUserAction('app_startup', {
      timestamp: new Date().toISOString()
    });
  }, []);

  let [fontsLoaded] = useFonts({
    "Cairo-Regular": require("./assets/Fonts/Cairo-Regular.ttf"),
    "Cairo-Medium": require("./assets/Fonts/Cairo-Medium.ttf"),
    "Cairo-SemiBold": require("./assets/Fonts/Cairo-SemiBold.ttf"),
    "Cairo-Bold": require("./assets/Fonts/Cairo-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <StatusBarView backgroundColor="#30afb5" barStyle="light" useSafeArea={true}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator style={styles.loading} size="large" color="#30afb5" />
          </View>
        </StatusBarView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBarView backgroundColor="#30afb5" barStyle="light" useSafeArea={true}>
        <ErrorBoundary>
          <Provider store={Store}>
            <AppNavigator />
          </Provider>
        </ErrorBoundary>
      </StatusBarView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
