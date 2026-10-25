import Constants from 'expo-constants';

class Config {
  constructor() {
    // Get environment variables from expo config or process.env
    this.env = Constants.expoConfig?.extra || process.env || {};
    this.isDev = __DEV__;
  }

  // API Configuration
  get apiBaseUrl() {
    return this.isDev 
      ? (this.env.API_BASE_URL_DEV || 'https://app.arenagym-om.com/?gmgt_json_api')
      : (this.env.API_BASE_URL_PROD || 'https://app.arenagym-om.com/?gmgt_json_api');
  }

  // Monitor Server Configuration
  get monitorServerUrl() {
    return this.isDev
      ? (this.env.MONITOR_SERVER_URL_DEV || 'https://monitor.arenagym-om.com')
      : (this.env.MONITOR_SERVER_URL_PROD || 'https://monitor.arenagym-om.com');
  }

  // Monitor Endpoints
  get monitorErrorEndpoint() {
    return this.env.MONITOR_ERROR_ENDPOINT || '/api/log-error';
  }

  get monitorPerformanceEndpoint() {
    return this.env.MONITOR_PERFORMANCE_ENDPOINT || '/api/log-performance';
  }

  get monitorUserActionEndpoint() {
    return this.env.MONITOR_USER_ACTION_ENDPOINT || '/api/log-user-action';
  }

  // Full Monitor URLs
  get errorLogUrl() {
    return `${this.monitorServerUrl}${this.monitorErrorEndpoint}`;
  }

  get performanceLogUrl() {
    return `${this.monitorServerUrl}${this.monitorPerformanceEndpoint}`;
  }

  get userActionLogUrl() {
    return `${this.monitorServerUrl}${this.monitorUserActionEndpoint}`;
  }

  // Performance Settings — opt-in only (disabled by default)
  get enablePerformanceMonitoring() {
    return this.env.ENABLE_PERFORMANCE_MONITORING === 'true';
  }

  get performanceCacheTimeout() {
    return parseInt(this.env.PERFORMANCE_CACHE_TIMEOUT) || 300000; // 5 minutes
  }

  get apiTimeout() {
    return parseInt(this.env.API_TIMEOUT) || 5000; // 5 seconds
  }

  // Error Monitoring Settings — opt-in only (disabled by default)
  get enableErrorMonitoring() {
    return this.env.ENABLE_ERROR_MONITORING === 'true';
  }

  get logLevel() {
    return this.env.LOG_LEVEL || 'info';
  }

  // Debug helper
  logConfig() {
    if (this.isDev) {
      console.group('📋 App Configuration');
      console.log('Environment:', this.isDev ? 'Development' : 'Production');
      console.log('API Base URL:', this.apiBaseUrl);
      console.log('Monitor Server:', this.monitorServerUrl);
      console.log('Performance Monitoring:', this.enablePerformanceMonitoring);
      console.log('Error Monitoring:', this.enableErrorMonitoring);
      console.groupEnd();
    }
  }
}

// Create singleton instance
const config = new Config();

export default config;