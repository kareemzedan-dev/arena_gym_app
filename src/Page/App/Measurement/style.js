import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const styleCss = StyleSheet.create({
  // Base container for the entire screen
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Top navigation bar row
  NaveBar: {
    height: 60,
    backgroundColor: '#30afb5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  // Icon inside the navbar
  Naveicon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: '#fff',
  },

  // Text inside the navbar
  NaveText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Navbar columns
  menu_col: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 10,
  },

  back_arrow: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 5,
  },

  name_col: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  workout_col: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 5,
  },

  message_col: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 10,
  },

  // Activity indicator
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styleCss;
