import { StyleSheet } from 'react-native';

// Add these style classes to your ClassScheduleStyle.js file

const styleCss = StyleSheet.create({
  // Main container styles
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  
  loadingIndicator: {
    // Add any specific loading indicator styles here
  },
  
  // Calendar styles
  calendarContainer: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  
  // List container styles
  listContainer: {
    flex: 1,
  },
  
  // Schedule item styles
  scheduleItemContainer: {
    // Container for each schedule item
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  
  scheduleItemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 16,
  },
  
  classInfoContainer: {
    // Container for class information
  },
  
  classNameContainer: {
    marginBottom: 8,
  },
  
  classNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  
  timeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  timeIconContainer: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
    width: 20,
  },
  
  timeIcon: {
    width: 16,
    height: 16,
    tintColor: '#30afb5',
  },
  
  timeTextContainer: {
    flex: 1,
  },
  
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default styleCss;