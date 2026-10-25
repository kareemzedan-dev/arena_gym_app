import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styleCss = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Loading indicator
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },

  // Error container
  error_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  error_text: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },

  // Button styles
  button: {
    backgroundColor: '#102b46',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  button_text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Workout details container
  workout_details_container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Workout name row and styles
  workout_details_row: {
    marginBottom: 16,
  },

  workout_name_col: {
    flex: 1,
  },

  workout_name_text: {
    fontSize: 24,
    fontWeight: '700',
    color: '#102b46',
    textAlign: 'center',
    marginBottom: 8,
  },

  // Workout description row and styles
  workout_description_row: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },

  workout_description_text: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Workout days row and styles
  workout_days_row: {
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
  },

  workout_days_label_col: {
    flex: 1,
    justifyContent: 'center',
  },

  workout_days_label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },

  workout_days_value_col: {
    flex: 1,
    justifyContent: 'center',
  },

  workout_days_value: {
    fontSize: 16,
    color: '#102b46',
    fontWeight: '500',
    textAlign: 'right',
  },

  // Workout date row and styles
  workout_date_row: {
    marginBottom: 8,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
  },

  workout_date_label_col: {
    flex: 1,
    justifyContent: 'center',
  },

  workout_date_label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },

  workout_date_value_col: {
    flex: 1,
    justifyContent: 'center',
  },

  workout_date_value: {
    fontSize: 16,
    color: '#102b46',
    fontWeight: '500',
    textAlign: 'right',
  },

  // Additional utility styles
  section_divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 16,
  },

  info_badge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },

  info_badge_text: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },

  // Responsive adjustments
  '@media (max-width: 350)': {
    workout_name_text: {
      fontSize: 20,
    },
    workout_description_text: {
      fontSize: 14,
    },
    workout_days_label: {
      fontSize: 14,
    },
    workout_days_value: {
      fontSize: 14,
    },
    workout_date_label: {
      fontSize: 14,
    },
    workout_date_value: {
      fontSize: 14,
    },
  },
});

export default styleCss;