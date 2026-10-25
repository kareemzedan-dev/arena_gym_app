// Debug helpers for ClassBooking component
export const debugClassBooking = {
  logComponentState: (componentName, state) => {
    if (__DEV__) {
      console.log(`[${componentName}] State:`, JSON.stringify(state, null, 2));
    }
  },

  logReduxState: (reduxState) => {
    if (__DEV__) {
      console.log('[Redux] Booking State:', {
        loading: reduxState.loading,
        classScheduleKeys: Object.keys(reduxState.classSchedule || {}),
        bookingDataLength: reduxState.bookingData?.length || 0,
        bookedClass: reduxState.bookedClass,
        totalClass: reduxState.totalClass,
        classLimit: reduxState.Classlimit,
        error: reduxState.error
      });
    }
  },

  logAction: (actionName, data) => {
    if (__DEV__) {
      console.log(`[Action] ${actionName}:`, data);
    }
  },

  logError: (componentName, error) => {
    console.error(`[${componentName}] Error:`, error);
  },

  logRender: (componentName, props) => {
    if (__DEV__) {
      console.log(`[${componentName}] Rendering with props:`, {
        loading: props.loading,
        classScheduleKeys: Object.keys(props.classSchedule || {}),
        bookingDataLength: props.data?.length || 0,
      });
    }
  }
};

// Performance monitoring
export const performanceMonitor = {
  startTimer: (name) => {
    if (__DEV__) {
      console.time(name);
    }
  },

  endTimer: (name) => {
    if (__DEV__) {
      console.timeEnd(name);
    }
  },

  logRenderCount: (() => {
    const renderCounts = {};
    
    return (componentName) => {
      if (__DEV__) {
        renderCounts[componentName] = (renderCounts[componentName] || 0) + 1;
        console.log(`[${componentName}] Render count: ${renderCounts[componentName]}`);
        
        // Warn if component is re-rendering too much
        if (renderCounts[componentName] > 5) {
          console.warn(`[${componentName}] High render count detected: ${renderCounts[componentName]}`);
        }
      }
    };
  })()
};