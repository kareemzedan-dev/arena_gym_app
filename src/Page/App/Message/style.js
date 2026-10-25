import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styleCss = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // Navigation bar styles
  NaveBar: {
    backgroundColor: '#102b46',
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    maxHeight: 0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  backArrow: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  Naveicon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },

  NaveText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },

  // Loading indicator
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Compose container styles
  compose_container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    margin: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },

  // Subject input styles
  compose_subject_view: {
    marginBottom: 20,
  },

  compose_subject_input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#102b46',
    fontWeight: '500',
  },

  // Message input styles
  compose_message_view: {
    marginBottom: 30,
  },

  compose_message_input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#102b46',
    textAlignVertical: 'top',
    minHeight: 150,
    maxHeight: 200,
  },

  // Send button styles
  compose_send_button: {
    backgroundColor: '#102b46',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  compose_send_button_container: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  compose_send_button_text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Additional responsive styles
  compose_subject_input_focus: {
    borderColor: '#102b46',
    borderWidth: 2,
  },

  compose_message_input_focus: {
    borderColor: '#102b46',
    borderWidth: 2,
  },

  compose_send_button_disabled: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },

  compose_send_button_text_disabled: {
    color: '#666666',
  },
});

export default styleCss;