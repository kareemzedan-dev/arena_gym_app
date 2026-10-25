import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Container and Layout
  container: {
    flex: 1,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  backgroundImageStyle: {
    opacity: 0.7,
  },
  

  
  keyboardAvoidingView: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    marginBottom: 20,
  },
  
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#30afb4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#30afb4',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  // Profile Section
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#30afb4',
    shadowColor: '#30afb4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  profileImageActual: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#30afb4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  profileText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  
  // Form Container
  formContainer: {
    paddingBottom: 40,
  },
  
  // Accordion Styles
  accordionContainer: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff77',
    overflow: 'hidden',
  },
  
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#ffffff77',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  accordionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  accordionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff99',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  accordionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  
  accordionArrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  accordionContent: {
    padding: 20,
    overflow: 'hidden',
  },
  
  // Input Field Styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  
  inputIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  
  inputFieldContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  inputField: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    paddingVertical: 12,
    fontWeight: '500',
  },
  
  inputFieldError: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  
  requiredIndicator: {
    color: '#f44336',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  
  // Gender Selection
  genderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  
  genderIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  
  genderContent: {
    flex: 1,
  },
  
  genderLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  
  genderOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 80,
  },
  
  genderOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#30afb4',
  },
  
  genderOptionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  genderOptionTextSelected: {
    color: '#30afb4',
    fontWeight: '600',
  },
  
  // Date Picker Styles
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  
  dateContent: {
    flex: 1,
    marginLeft: 12,
  },
  
  dateLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  
  dateText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  
  datePlaceholder: {
    color: '#999',
  },
  
  // Password Field
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  
  passwordInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    fontWeight: '500',
  },
  
  passwordToggle: {
    padding: 8,
  },
  
  // Dropdown Styles
  dropdownContainer: {
    marginBottom: 20,
    zIndex: 1000,
  },
  
  dropdownLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  
  dropdown: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 50,
  },
  
  dropdownList: {
    backgroundColor: '#fff',
    borderColor: '#e9ecef',
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  
  dropdownText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  
  dropdownPlaceholder: {
    color: '#999',
    fontSize: 16,
  },
  
  // Submit Button
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  
  // Login Link
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  loginLinkText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  
  loginLink: {
    marginLeft: 8,
  },
  
  loginLinkButtonText: {
    fontSize: 16,
    color: '#30afb4',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  
  // Responsive Design
  '@media (max-width: 480)': {
    scrollView: {
      paddingHorizontal: 16,
    },
    
    headerTitle: {
      fontSize: 24,
    },
    
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    
    profileImageActual: {
      width: 92,
      height: 92,
      borderRadius: 46,
    },
    
    accordionTitle: {
      fontSize: 16,
    },
    
    inputField: {
      fontSize: 15,
    },
    
    submitButtonText: {
      fontSize: 16,
    },
  },
  
  // Dark Mode Support (Optional)
  '@media (prefers-color-scheme: dark)': {
    container: {
      backgroundColor: '#121212',
    },
    
    accordionContainer: {
      backgroundColor: '#1e1e1e',
    },
    
    accordionHeader: {
      backgroundColor: '#1e1e1e',
      borderBottomColor: '#333',
    },
    
    accordionTitle: {
      color: '#fff',
    },
    
    inputContainer: {
      backgroundColor: '#2a2a2a',
      borderColor: '#333',
    },
    
    inputField: {
      color: '#fff',
    },
    
    genderContainer: {
      backgroundColor: '#2a2a2a',
      borderColor: '#333',
    },
    
    genderLabel: {
      color: '#fff',
    },
    
    genderOption: {
      backgroundColor: '#1e1e1e',
      borderColor: '#333',
    },
    
    genderOptionText: {
      color: '#ccc',
    },
    
    dateContainer: {
      backgroundColor: '#2a2a2a',
      borderColor: '#333',
    },
    
    dateText: {
      color: '#fff',
    },
    
    passwordContainer: {
      backgroundColor: '#2a2a2a',
      borderColor: '#333',
    },
    
    passwordInput: {
      color: '#fff',
    },
    
    dropdown: {
      backgroundColor: '#2a2a2a',
      borderColor: '#333',
    },
    
    dropdownList: {
      backgroundColor: '#1e1e1e',
      borderColor: '#333',
    },
    
    dropdownText: {
      color: '#fff',
    },
    
    dropdownLabel: {
      color: '#fff',
    },
    
    loginLinkText: {
      color: '#ccc',
    },
  },
  
  // Accessibility Enhancements
  accessibilityFocused: {
    borderWidth: 2,
    borderColor: '#30afb4',
    backgroundColor: '#e3f2fd',
  },
  
  // Animation Helpers
  fadeIn: {
    opacity: 1,
  },
  
  fadeOut: {
    opacity: 0,
  },
  
  // Utility Classes
  marginTop8: {
    marginTop: 8,
  },
  
  marginTop16: {
    marginTop: 16,
  },
  
  marginBottom8: {
    marginBottom: 8,
  },
  
  marginBottom16: {
    marginBottom: 16,
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  flexRow: {
    flexDirection: 'row',
  },
  
  flexColumn: {
    flexDirection: 'column',
  },
  
  alignCenter: {
    alignItems: 'center',
  },
  
  justifyCenter: {
    justifyContent: 'center',
  },
  
  flex1: {
    flex: 1,
  },
});

// Export additional theme constants
export const theme = {
  colors: {
    primary: '#30afb4',
    secondary: '#4CAF50',
    accent: '#FF9800',
    error: '#f44336',
    warning: '#FF9800',
    success: '#4CAF50',
    info: '#30afb4',
    background: '#f5f7fa',
    surface: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    placeholder: '#999999',
    border: '#e9ecef',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};