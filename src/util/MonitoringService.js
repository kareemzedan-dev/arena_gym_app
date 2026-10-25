import config from './Config';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Application from 'expo-application';

class MonitoringService {
  constructor() {
    this.isEnabled = config.enableErrorMonitoring;
    this.performanceEnabled = config.enablePerformanceMonitoring;
    this.queue = [];
    this.isProcessing = false;
    this.batchSize = 10;
    this.flushInterval = 30000; // 30 seconds
    
    // Circuit breaker for monitoring failures
    this.failureCount = 0;
    this.maxFailures = 3; // Max failures before circuit opens
    this.isCircuitOpen = false;
    this.circuitResetTime = 300000; // 5 minutes
    this.lastFailureTime = 0;
    
    // Start periodic flush
    if (this.isEnabled) {
      setInterval(() => this.flushQueue(), this.flushInterval);
    }
  }

  // Get device and app info for context
  async getDeviceInfo() {
    try {
      const userId = await SecureStore.getItemAsync("id");
      const userRole = await SecureStore.getItemAsync("role_name");
      
      return {
        userId: userId || 'anonymous',
        userRole: userRole || 'unknown',
        deviceInfo: {
          brand: Device.brand,
          modelName: Device.modelName,
          osName: Device.osName,
          osVersion: Device.osVersion,
          platform: Device.platformApiLevel,
          isDevice: Device.isDevice
        },
        appInfo: {
          version: Application.nativeApplicationVersion,
          buildVersion: Application.nativeBuildVersion,
          bundleId: Application.applicationId
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.warn('Failed to get device info:', error);
      return {
        userId: 'unknown',
        userRole: 'unknown',
        deviceInfo: {},
        appInfo: {},
        timestamp: new Date().toISOString()
      };
    }
  }

  // Log error to monitoring server
  async logError(error, context = {}) {
    if (!this.isEnabled) return;

    try {
      const deviceInfo = await this.getDeviceInfo();
      
      const errorData = {
        type: 'error',
        error: {
          message: error?.message || String(error),
          stack: error?.stack,
          name: error?.name,
          code: error?.code
        },
        context: {
          ...context,
          isFatal: context.isFatal || false,
          component: context.component || 'unknown',
          action: context.action || 'unknown'
        },
        ...deviceInfo
      };

      this.addToQueue(config.errorLogUrl, errorData);
    } catch (logError) {
      console.warn('Failed to log error:', logError);
    }
  }

  // Log performance metrics
  async logPerformance(metrics) {
    if (!this.performanceEnabled) return;

    try {
      const deviceInfo = await this.getDeviceInfo();
      
      const performanceData = {
        type: 'performance',
        metrics: {
          ...metrics,
          memoryUsage: this.getMemoryUsage()
        },
        ...deviceInfo
      };

      this.addToQueue(config.performanceLogUrl, performanceData);
    } catch (error) {
      console.warn('Failed to log performance:', error);
    }
  }

  // Log user actions
  async logUserAction(action, data = {}) {
    if (!this.isEnabled) return;

    try {
      const deviceInfo = await this.getDeviceInfo();
      
      const actionData = {
        type: 'user_action',
        action: {
          name: action,
          data,
          screen: data.screen || 'unknown',
          timestamp: new Date().toISOString()
        },
        ...deviceInfo
      };

      this.addToQueue(config.userActionLogUrl, actionData);
    } catch (error) {
      console.warn('Failed to log user action:', error);
    }
  }

  // Log API calls
  async logApiCall(url, method, duration, status, error = null) {
    if (!this.performanceEnabled) return;

    const apiData = {
      url,
      method,
      duration,
      status,
      error: error ? String(error) : null,
      timestamp: new Date().toISOString()
    };

    this.logPerformance({
      type: 'api_call',
      ...apiData
    });
  }

  // Log component render performance
  async logComponentRender(componentName, renderTime) {
    if (!this.performanceEnabled) return;

    this.logPerformance({
      type: 'component_render',
      componentName,
      renderTime,
      timestamp: new Date().toISOString()
    });
  }

  // Log navigation events
  async logNavigation(from, to, params = {}) {
    this.logUserAction('navigation', {
      from,
      to,
      params,
      timestamp: new Date().toISOString()
    });
  }

  // Get memory usage if available
  getMemoryUsage() {
    try {
      if (global.performance && global.performance.memory) {
        const memory = global.performance.memory;
        return {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        };
      }
    } catch (error) {
      // Memory API not available
    }
    return null;
  }

  // Check if circuit breaker should allow requests
  isCircuitClosed() {
    if (!this.isCircuitOpen) return true;
    
    // Check if enough time has passed to reset the circuit
    if (Date.now() - this.lastFailureTime > this.circuitResetTime) {
      this.isCircuitOpen = false;
      this.failureCount = 0;
      console.log('Monitoring circuit breaker reset - attempting reconnection');
      return true;
    }
    
    return false;
  }

  // Record a monitoring failure
  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.maxFailures && !this.isCircuitOpen) {
      this.isCircuitOpen = true;
      console.warn(`Monitoring circuit breaker opened after ${this.failureCount} failures - disabling monitoring temporarily`);
      this.clearQueue(); // Clear pending items
    }
  }

  // Add item to queue for batch processing
  addToQueue(url, data) {
    // Don't queue items if circuit is open
    if (!this.isCircuitClosed()) {
      return;
    }
    
    this.queue.push({ url, data });
    
    // Flush if queue is full
    if (this.queue.length >= this.batchSize) {
      this.flushQueue();
    }
  }

  // Send queued items to server
  async flushQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    // Check circuit breaker
    if (!this.isCircuitClosed()) {
      this.queue = []; // Clear queue when circuit is open
      return;
    }

    this.isProcessing = true;
    const items = [...this.queue];
    this.queue = [];

    try {
      // Group items by URL
      const grouped = items.reduce((acc, item) => {
        if (!acc[item.url]) acc[item.url] = [];
        acc[item.url].push(item.data);
        return acc;
      }, {});

      // Send batches - use Promise.allSettled to handle individual failures
      const promises = Object.entries(grouped).map(([url, dataArray]) =>
        this.sendBatch(url, dataArray).catch(error => {
          console.warn(`Monitoring batch failed for ${url}:`, error.message);
          return null; // Return null for failed batches
        })
      );

      await Promise.allSettled(promises);
    } catch (error) {
      // This should rarely happen now since we catch individual batch failures
      console.warn('Monitoring queue flush error:', error.message);
    } finally {
      this.isProcessing = false;
      // Don't re-add failed monitoring items - let them be lost rather than affecting app performance
    }
  }

  // Send batch to server
  async sendBatch(url, dataArray) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Monitoring timeout')), 5000);
      });

      const fetchPromise = fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batch: dataArray,
          timestamp: new Date().toISOString()
        })
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Success - reset failure count if circuit was previously failing
      if (this.failureCount > 0) {
        this.failureCount = 0;
        console.log('Monitoring service reconnected successfully');
      }
      
    } catch (error) {
      // Record the failure for circuit breaker
      this.recordFailure();
      
      // Silently fail for monitoring - don't let monitoring issues affect the app
      console.warn(`Monitoring service unavailable (${url}):`, error.message);
      // Don't throw the error - let monitoring fail silently
    }
  }

  // Clear all queued items
  clearQueue() {
    this.queue = [];
  }

  // Get queue stats
  getQueueStats() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      isEnabled: this.isEnabled,
      performanceEnabled: this.performanceEnabled,
      failureCount: this.failureCount,
      isCircuitOpen: this.isCircuitOpen,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

export default monitoringService;