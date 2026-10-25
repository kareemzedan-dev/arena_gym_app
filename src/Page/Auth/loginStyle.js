import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styleCss = StyleSheet.create({
  // Main Container
  loign_container: {
    flex: 1,
  },
  
  // Background Image
  login_bg_image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  // Keyboard Avoiding View
  keyboardAvoidingView: {
    flex: 1,
  },
  
  // Main Page Container
  loign_page: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Email/Main Column
  login_email_col: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  
  // Logo Section
  login_image_col: {
    alignItems: 'center',
    marginBottom: 40,
    height: 220,
  },
  
  login_image: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  
  // Input Container
  login_input: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#ffffff55',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#cccccc99',

  },
  
  // Input Icon Container
  login_input_col: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  
  login_icon_image: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#30afb4',
  },
  
  // Email Input
  login_input_email: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    fontWeight: '500',
  },
  
  // Password Input
  login_input_password: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    fontWeight: '500',
  },
  
  // Password Show/Hide Button
  login_input_password_show: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  password_eye_image: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#666',
  },
  
  // Login Button
  login_btn: {
    backgroundColor: '#30afb4',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    marginBottom: 20,
    shadowColor: '#30afb4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  login_btn_container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  login_btn_text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  
  // Signup Link
  login_signup_container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  login_signup_button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  
  login_signup_text: {
    fontSize: 16,
    color: '#30afb4',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  
  // Loading State Container
  login_loding_container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  
  login_loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 1000,
  },
  
  // Loading State Input Styles (when loading)
  login_input_loading: {
    backgroundColor: 'rgba(248, 249, 250, 0.7)',
    borderColor: 'rgba(233, 236, 239, 0.7)',
  },
  
  // Error State
  login_input_error: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  
  // Focus State
  login_input_focused: {
    borderColor: '#30afb4',
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
  },
  
});

export default styleCss;