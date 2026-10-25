import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styleCss = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
  },

  // Loading indicator
  loading: {
    marginTop: 20,
  },

  // Calendar section
  viewworkout_date_row: {
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 5,
  },

  viewworkout_calendar_col: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    padding: 10,
  },

  // Header text styling
  viewworkout_HeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d4150',
    fontFamily: 'Cairo-SemiBold',
    textAlign: 'left',
  },

  // Workout data section
  viewworkout_title: {
    backgroundColor: '#30afb5',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  // Workout main column container
  viewworkout_Col: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  // Workout data container rows
  viewworkout_contanier: {
    marginBottom: 15,
    paddingHorizontal: 10,
  },

  // Individual workout data rows
  viewworkout_row: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },

  // Left column data styling
  viewworkout_data_one_Col: {
    backgroundColor: '#f1f8ff',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#30afb5',
    minHeight: 50,
    justifyContent: 'center',
  },

  // Right column data styling
  viewworkout_data_one_Col2: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6c757d',
    minHeight: 50,
    justifyContent: 'center',
  },

  // Workout data text styling
  viewworkout_data_text: {
    fontSize: 14,
    color: '#2d4150',
    fontFamily: 'Cairo-Medium',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Workout name text in title
  viewworkout_title_text: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Cairo-SemiBold',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Alternative styling for workout title text
  viewworkout_HeaderText_white: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'Cairo-SemiBold',
    textAlign: 'center',
  },

  // Empty state styling
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyStateText: {
    fontSize: 16,
    color: '#6c757d',
    fontFamily: 'Cairo-Medium',
    textAlign: 'center',
  },

  // Refresh control styling
  refreshControl: {
    tintColor: '#30afb5',
  },

  // Additional responsive styling
  '@media (max-width: 350)': {
    viewworkout_data_text: {
      fontSize: 12,
    },
    viewworkout_HeaderText: {
      fontSize: 16,
    },
  },

  // Calendar theme colors (for reference)
  calendarTheme: {
    textSectionTitleColor: '#b6c1cd',
    textSectionTitleDisabledColor: '#30afb5',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#00adf5',
    dayTextColor: '#2d4150',
    textDisabledColor: '#d9e1e8',
    dotColor: '#00adf5',
    arrowColor: '#30afb5',
    disabledArrowColor: '#d9e1e8',
    monthTextColor: '#30afb5',
    indicatorColor: '#30afb5',
  },

  // Additional utility styles
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  shadowLarge: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
  },

  shadowMedium: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },

  shadowSmall: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  // Spacing utilities
  marginTop20: {
    marginTop: 20,
  },

  marginBottom15: {
    marginBottom: 15,
  },

  paddingHorizontal16: {
    paddingHorizontal: 16,
  },

  paddingVertical20: {
    paddingVertical: 20,
  },
});

export default styleCss;