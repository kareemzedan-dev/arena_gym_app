import { StyleSheet, Platform, Dimensions } from 'react-native';
import normalize from 'react-native-normalize';

const { width, height } = Dimensions.get("screen");

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: '#30afb5',
  },
  

  closeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: normalize(45),
    width: normalize(50)
  },
  
  closeIcon: {
    width: normalize(23),
    height: normalize(23),
  },
  
  profileSection: {
    backgroundColor: '#30afb5',
    height: normalize(90),
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: normalize(22),
  },
  
  profileImageContainer: {
    borderWidth: 1,
    borderRadius: 30,
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#fff',
    marginRight: normalize(15),
  },
  
  profileImage: {
    borderRadius: 30,
    height: 60,
    width: 60,
  },
  
  profileInfo: {
    flex: 1,
  },
  
  profileName: {
    fontSize: 24,
    lineHeight: 60,
    fontFamily: 'Cairo-Bold',
    color: '#fff',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    marginBottom: normalize(5),
  },
  
  profileAddress: {
    fontSize: 16,
    fontFamily: 'Cairo-Medium',
    color: '#fff'
  },
  
  menuContainer: {
    flex: 1,
  },
  
  menuScrollView: {
    flex: 1,
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    marginVertical: normalize(5),
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff22',
  },
  
  menuIconContainer: {
    width: normalize(40),
    height: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(15),
  },
  
  menuIcon: {
    width: normalize(23),
    height: normalize(23),
  },
  
  menuText: {
    fontSize: 18,
    fontFamily: 'Cairo-Medium',
    color: '#fff',
    lineHeight: 28,
    flex: 1,
  },
  
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: normalize(20),
    marginVertical: normalize(12),
    marginBottom: normalize(50),
    minHeight: normalize(40),
  },
});