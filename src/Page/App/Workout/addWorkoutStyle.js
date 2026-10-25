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
    flexDirection: 'row',
  },

  // Left column data styling
  viewworkout_data_one_Col: {
    backgroundColor: '#f1f8ff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#30afb5',
    width: '50%',
    
  },

  // Right column data styling
  viewworkout_data_one_Col2: {
    backgroundColor: '#f1f8ff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#30afb5',
    width: '50%',

  },

  // Workout data text styling
  viewworkout_data_text: {
    fontSize: 14,
    color: '#2d4150',
    fontFamily: 'Cairo-Medium',
    textAlign: 'center',
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

  // Add workout button
  addworkout_btn: {
    backgroundColor: '#30afb5',
    borderRadius: 8,
    marginVertical: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  addworkout_btn_container: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addworkout_btn_text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    fontFamily: 'Cairo-SemiBold',
  },

  addworkout_keyboard: {
    flex: 1,
  },

  // Additional responsive styles
  '@media (max-width: 768)': {
    container: {
      padding: 5,
    },
    viewworkout_HeaderText: {
      fontSize: 16,
    },
    viewworkout_data_text: {
      fontSize: 14,
    },
  },
});

export default styleCss;