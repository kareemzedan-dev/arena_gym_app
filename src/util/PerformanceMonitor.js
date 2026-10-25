import React from 'react';
import config from './Config';
import monitoringService from './MonitoringService';

class PerformanceMonitor {
  constructor() {
    this.timers = new Map();
    this.metrics = new Map();
    this.isEnabled = config.enablePerformanceMonitoring;
  }

  // Start timing an operation
  startTimer(label) {
    if (!this.isEnabled) return;
    this.timers.set(label, Date.now());
  }

  // End timing and log results
  endTimer(label) {
    if (!this.isEnabled) return;
    
    const startTime = this.timers.get(label);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.timers.delete(label);
      
      // Store metric
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      this.metrics.get(label).push(duration);
      
      // Send to monitoring service
      monitoringService.logPerformance({
        type: 'timer',
        label,
        duration,
        timestamp: new Date().toISOString()
      });
      
      // Log if it takes too long
      if (duration > 1000) {
        console.warn(`⚠️ Performance Warning: ${label} took ${duration}ms`);
      } else if (duration > 500) {
        console.log(`⏱️ Performance Info: ${label} took ${duration}ms`);
      }
      
      return duration;
    }
  }

  // Measure API call performance
  measureApiCall(apiName, apiCall) {
    if (!this.isEnabled) return apiCall;
    
    const startTime = Date.now();
    
    if (apiCall && typeof apiCall.then === 'function') {
      return apiCall
        .then(result => {
          const duration = Date.now() - startTime;
          monitoringService.logApiCall(apiName, 'unknown', duration, 'success');
          return result;
        })
        .catch(error => {
          const duration = Date.now() - startTime;
          monitoringService.logApiCall(apiName, 'unknown', duration, 'error', error);
          throw error;
        });
    } else {
      // Synchronous call
      const result = apiCall;
      const duration = Date.now() - startTime;
      monitoringService.logApiCall(apiName, 'unknown', duration, 'success');
      return result;
    }
  }

  // Measure component render time
  measureRender(componentName, renderFunction) {
    if (!this.isEnabled) return renderFunction();
    
    const startTime = Date.now();
    const result = renderFunction();
    const duration = Date.now() - startTime;
    
    // Send to monitoring service
    monitoringService.logComponentRender(componentName, duration);
    
    return result;
  }

  // Get performance summary
  getSummary() {
    if (!this.isEnabled) return {};
    
    const summary = {};
    for (const [label, times] of this.metrics.entries()) {
      const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
      const max = Math.max(...times);
      const min = Math.min(...times);
      
      summary[label] = {
        count: times.length,
        average: Math.round(avg),
        max,
        min,
        total: times.reduce((sum, time) => sum + time, 0)
      };
    }
    return summary;
  }

  // Log performance summary
  logSummary() {
    if (!this.isEnabled) return;
    
    const summary = this.getSummary();
    console.group('📊 Performance Summary');
    
    Object.entries(summary).forEach(([label, stats]) => {
      if (stats.average > 100) {
        console.warn(`${label}: avg ${stats.average}ms (max: ${stats.max}ms, count: ${stats.count})`);
      } else {
        console.log(`${label}: avg ${stats.average}ms (max: ${stats.max}ms, count: ${stats.count})`);
      }
    });
    
    console.groupEnd();
  }

  // Clear all metrics
  clear() {
    this.timers.clear();
    this.metrics.clear();
  }

  // Memory usage monitoring (if available)
  logMemoryUsage(label = 'Memory Usage') {
    if (!this.isEnabled) return;
    
    if (performance && performance.memory) {
      const memory = performance.memory;
      console.log(`💾 ${label}:`, {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
      });
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Helper HOC for measuring component performance
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  return class extends React.Component {
    render() {
      return performanceMonitor.measureRender(
        componentName || WrappedComponent.name,
        () => <WrappedComponent {...this.props} />
      );
    }
  };
};

export default performanceMonitor;