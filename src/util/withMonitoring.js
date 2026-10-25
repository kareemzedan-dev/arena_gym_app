import React from 'react';
import monitoringService from './MonitoringService';
import performanceMonitor from './PerformanceMonitor';

/**
 * Higher-Order Component that adds monitoring capabilities to any component
 * @param {React.Component} WrappedComponent - The component to wrap
 * @param {string} componentName - Name for monitoring purposes
 * @param {Object} options - Monitoring options
 */
export const withMonitoring = (WrappedComponent, componentName, options = {}) => {
  const {
    trackRender = true,
    trackProps = false,
    trackUserInteractions = true,
    trackNavigation = true
  } = options;

  return class MonitoredComponent extends React.Component {
    constructor(props) {
      super(props);
      this.componentName = componentName || WrappedComponent.displayName || WrappedComponent.name;
      this.renderStartTime = null;
      this.mountTime = Date.now();
      
      // Track component mount
      monitoringService.logUserAction('component_mount', {
        component: this.componentName,
        props: trackProps ? Object.keys(props) : undefined
      });
    }

    componentDidMount() {
      // Track mount time
      const mountDuration = Date.now() - this.mountTime;
      monitoringService.logPerformance({
        type: 'component_mount',
        component: this.componentName,
        duration: mountDuration
      });
    }

    componentDidUpdate(prevProps, prevState) {
      // Track prop changes if enabled
      if (trackProps) {
        const changedProps = Object.keys(this.props).filter(
          key => this.props[key] !== prevProps[key]
        );
        
        if (changedProps.length > 0) {
          monitoringService.logUserAction('component_update', {
            component: this.componentName,
            changedProps
          });
        }
      }
    }

    componentWillUnmount() {
      // Track component unmount
      monitoringService.logUserAction('component_unmount', {
        component: this.componentName,
        lifespan: Date.now() - this.mountTime
      });
    }

    shouldComponentUpdate(nextProps, nextState) {
      // Call original shouldComponentUpdate if it exists
      if (WrappedComponent.prototype.shouldComponentUpdate) {
        return WrappedComponent.prototype.shouldComponentUpdate.call(this, nextProps, nextState);
      }
      return true;
    }

    // Wrap render method to track performance
    render() {
      if (trackRender) {
        return performanceMonitor.measureRender(this.componentName, () => {
          return <WrappedComponent {...this.props} />;
        });
      } else {
        return <WrappedComponent {...this.props} />;
      }
    }
  };
};

/**
 * HOC specifically for tracking user interactions on touchable components
 */
export const withUserInteractionTracking = (WrappedComponent, actionName) => {
  return React.forwardRef((props, ref) => {
    const trackInteraction = (originalHandler, eventType) => {
      return (...args) => {
        // Log user interaction
        monitoringService.logUserAction('user_interaction', {
          action: actionName || 'unknown',
          eventType,
          component: WrappedComponent.displayName || WrappedComponent.name,
          timestamp: new Date().toISOString()
        });

        // Call original handler
        if (originalHandler) {
          return originalHandler(...args);
        }
      };
    };

    // Wrap common interaction handlers
    const wrappedProps = {
      ...props,
      onPress: props.onPress ? trackInteraction(props.onPress, 'press') : props.onPress,
      onLongPress: props.onLongPress ? trackInteraction(props.onLongPress, 'long_press') : props.onLongPress,
      onPressIn: props.onPressIn ? trackInteraction(props.onPressIn, 'press_in') : props.onPressIn,
      onPressOut: props.onPressOut ? trackInteraction(props.onPressOut, 'press_out') : props.onPressOut,
    };

    return <WrappedComponent ref={ref} {...wrappedProps} />;
  });
};

/**
 * HOC for tracking screen/page views
 */
export const withScreenTracking = (WrappedComponent, screenName) => {
  return class ScreenTrackedComponent extends React.Component {
    componentDidMount() {
      // Log screen view
      monitoringService.logUserAction('screen_view', {
        screen: screenName || WrappedComponent.displayName || WrappedComponent.name,
        timestamp: new Date().toISOString(),
        props: this.props.route?.params
      });
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
};

/**
 * Hook for tracking user actions in functional components
 */
export const useMonitoring = (componentName) => {
  const trackAction = React.useCallback((action, data = {}) => {
    monitoringService.logUserAction(action, {
      component: componentName,
      ...data,
      timestamp: new Date().toISOString()
    });
  }, [componentName]);

  const trackError = React.useCallback((error, context = {}) => {
    monitoringService.logError(error, {
      component: componentName,
      ...context
    });
  }, [componentName]);

  const trackPerformance = React.useCallback((metrics) => {
    monitoringService.logPerformance({
      component: componentName,
      ...metrics,
      timestamp: new Date().toISOString()
    });
  }, [componentName]);

  React.useEffect(() => {
    // Track component mount
    trackAction('component_mount');
    
    return () => {
      // Track component unmount
      trackAction('component_unmount');
    };
  }, [trackAction]);

  return {
    trackAction,
    trackError,
    trackPerformance
  };
};

export default withMonitoring;