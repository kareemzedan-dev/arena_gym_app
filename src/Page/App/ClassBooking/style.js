import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styleCss = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Loading indicator
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },

  // Date header styles
  date_header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  date_header_text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d4150',
  },

  // Calendar arrow
  classbooking_agenda_down_arrow: {
    width: 20,
    height: 20,
    tintColor: '#30afb5',
  },

  // Classes list container
  classes_list_container: {
    padding: 10,
    flexGrow: 1,
  },

  // Empty list state
  empty_list_container: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },

  empty_list_text: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Class booking item styles
  classbooking_item: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#30afb5',
    height: 120,
  },

  loign_container: {
    flex: 1,
  },

  class_title_css: {
    marginBottom: 5,
  },

  classbooking_title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d4150',
  },

  classbooking_time_row: {
    marginTop: 5,
  },

  // Modal styles
  classbooking_main_modal_view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  classbooking_modal_view: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 2,
    margin: 2,
    height: height * 0.7,
    width: width * 0.9,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    alignSelf: 'center',
    justifyContent: 'space-between',
  },

  classbooking_modal_row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 5,
    borderBottomColor: '#e9ecef',
    height: 50,
  },

  classbooking_modal_col: {
    justifyContent: 'center',
    padding: 10,
  },

  classbooking_modal_close_col: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },

  classbooking_modal_title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d4150',
    textAlign: 'center',
    height: 30,
  },

  classbooking_modal_close_button: {
    padding: 5,
  },

  classbooking_modal_close_image: {
    width: 24,
    height: 24,
    tintColor: '#30afb5',
  },

  // Modal data styles
  classbooking_modal_data_view: {
    marginBottom: 20,
    flex: 1,
    paddingHorizontal: 20,
  },

  classbooking_modal_data_row: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
    minHeight: 25,
  },

  classbooking_modal_data_row2: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
    minHeight: 25,
  },

  classbooking_modal_data_col: {
    flex: 1,
    justifyContent: 'center',
  },

  classbooking_modal_data_col2: {
    flex: 1.5,
    justifyContent: 'center',
  },

  classbooking_modal_data_col3: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  classbooking_modal_class_data_col: {
    flex: 1.5,
    justifyContent: 'center',
  },

  classbooking_modal_data_label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },

  classbooking_modal_data: {
    fontSize: 14,
    color: '#6c757d',
    paddingLeft: 10,
  },

  // Book button styles
  classbooking_book_button: {
    backgroundColor: '#30afb5',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  classbooking_book_button_row: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  classbooking_book_class_text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },

  // Additional utility styles
  row: {
    flexDirection: 'row',
  },

  col: {
    flex: 1,
  },

  // Responsive styles for different screen sizes
  '@media (max-width: 768)': {
    classbooking_modal_view: {
      width: width * 0.95,
      margin: 10,
    },
    
    classbooking_modal_title: {
      fontSize: 18,
    },
    
    classbooking_modal_data_label: {
      fontSize: 13,
    },
    
    classbooking_modal_data: {
      fontSize: 13,
    },
  },

  // Calendar specific styles (if you want to customize the calendar theme)
  calendar_container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },

  // Pressed states
  classbooking_item_pressed: {
    backgroundColor: '#f8f9fa',
    transform: [{ scale: 0.98 }],
  },

  date_header_pressed: {
    backgroundColor: '#e9ecef',
  },

  classbooking_book_button_pressed: {
    backgroundColor: '#2a9ca3',
    transform: [{ scale: 0.98 }],
  },

  // Status indicators
  status_indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  status_available: {
    backgroundColor: '#28a745',
  },

  status_full: {
    backgroundColor: '#dc3545',
  },

  status_booked: {
    backgroundColor: '#ffc107',
  },

  // Class info styles
  class_info_container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  class_info_text: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 5,
  },

  // Trainer info
  trainer_info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  trainer_text: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },

  // Member count styles
  member_count_container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  member_count_text: {
    fontSize: 12,
    color: '#6c757d',
  },

  // Time styles
  time_container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  time_text: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 10,
  },

  // Error states
  error_container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },

  error_text: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 10,
  },

  retry_button: {
    backgroundColor: '#30afb5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },

  retry_text: {
    color: '#ffffff',
    fontWeight: 'bold',
  },

  // Accessibility improvements
  accessible_button: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Animation styles
  fade_in: {
    opacity: 1,
  },

  fade_out: {
    opacity: 0.7,
  },

  // Landscape mode adjustments
  landscape_container: {
    flexDirection: 'row',
  },

  landscape_calendar: {
    flex: 1,
  },

  landscape_classes: {
    flex: 1,
  },
});

export default styleCss;