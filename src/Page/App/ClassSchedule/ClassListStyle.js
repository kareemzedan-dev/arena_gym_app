import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styleCss = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },

  // Loading indicator
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },


  classlist_staff_col: {
    justifyContent: 'center',
},
  // Class list row styling
  classlist_row: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  // Class list column
  classlist_col: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Class name row
  classlist_dataname_row: {
    alignItems: 'center',
  },

  // Class name text
  classlist_dataname_text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'left',
  },

  // Image and time row
  classlist_image_row: {
    marginBottom: 5,
    minHeight: 25,
  },


  // Image column
  classlist_image_col: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Image styling
  classlist_image: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#30afb5',
  },

    classlist_image2: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#30afb5',
  },

  // Time column
  classlist_time_col: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '75%',
  },


  classlist_image_row2:{
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  // Time text
  classlist_dataname_time: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },

    // Date column

      // Time column
  classlist_time_col_date: {
    width: '100%',
  },

  // Time text
  classlist_dataname_time_date: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'left',
    width: '100%',
  },


  // Staff member text row
  classlist_dataname_text_row: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 5,
  },

  // Empty state container
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.3,
  },

  // Empty state text
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Additional utility styles
  classlist_staff_text: {
    fontSize: 14,
    color: '#30afb5',
    fontWeight: '600',
    textAlign: 'right',
  },

  // Class status indicator (if needed)
  classlist_status_active: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  classlist_status_inactive: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  classlist_status_text: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Responsive adjustments
  classlist_row_tablet: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  classlist_dataname_text_tablet: {
    fontSize: 20,
  },

  classlist_dataname_time_tablet: {
    fontSize: 16,
  },

  // Dark mode support (optional)
  container_dark: {
    backgroundColor: '#2c3e50',
  },

  classlist_row_dark: {
    backgroundColor: '#34495e',
    borderColor: '#4a5568',
  },

  classlist_dataname_text_dark: {
    color: '#ecf0f1',
  },

  classlist_dataname_time_dark: {
    color: '#bdc3c7',
  },

  emptyText_dark: {
    color: '#7f8c8d',
  },

  // Custom animations (if needed)
  classlist_row_animated: {
    transform: [{ scale: 1 }],
  },

  // Separator line
  classlist_separator: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 8,
  },

  // Header styles (if you add a header)
  classlist_header: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  classlist_header_title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },

  // Refresh control colors
  refreshControl: {
    tintColor: '#30afb5',
  },

  // Safe area styling
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // FlatList content container
  flatListContent: {
    paddingBottom: 20,
  },

  // Class item hover effect (for web/desktop)
  classlist_row_hover: {
    backgroundColor: '#f8f9fa',
    borderColor: '#30afb5',
  },
});

export default styleCss;