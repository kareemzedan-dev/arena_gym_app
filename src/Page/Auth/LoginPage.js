import React, { Component } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  TextInput,
  Text,
  Image,
  ImageBackground,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  BackHandler,
  Platform,
  Modal,
  Animated
} from "react-native";
import { Col, Row } from "react-native-easy-grid";
import { ActivityIndicator } from "react-native-paper";

/**
 * Custom Alert Component
 */
class CustomAlert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fadeAnim: new Animated.Value(0),
    };
  }

  componentDidMount() {
    Animated.timing(this.state.fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }

  closeAlert = () => {
    Animated.timing(this.state.fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      this.props.onClose();
    });
  };

  render() {
    const { visible, title, message, type } = this.props;
    
    const getBackgroundColor = () => {
      switch (type) {
        case 'error': return '#3dbcc1';
        case 'warning': 
        case 'warn': return '#FFB74D';
        case 'success': return '#4CAF50';
        default: return '#2196F3';
      }
    };

    const getIcon = () => {
      switch (type) {
        case 'error': return 'ℹ️';
        case 'warning':
        case 'warn': return '⚠️';
        case 'success': return '✅';
        default: return 'ℹ️';
      }
    };

    return (
      <Modal visible={visible} transparent animationType="none">
        <View style={customAlertStyles.overlay}>
          <Animated.View 
            style={[
              customAlertStyles.alertContainer,
              { 
                opacity: this.state.fadeAnim,
                backgroundColor: getBackgroundColor()
              }
            ]}
          >
            <Text style={customAlertStyles.icon}>{getIcon()}</Text>
            <Text style={customAlertStyles.title}>{title}</Text>
            <Text style={customAlertStyles.message}>{message}</Text>
            <TouchableOpacity 
              style={customAlertStyles.button}
              onPress={this.closeAlert}
            >
              <Text style={customAlertStyles.buttonText}>OK</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  }
}

const customAlertStyles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: '#FF6B6B',
    borderRadius: 15,
    padding: 20,
    minWidth: 280,
    maxWidth: 350,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  icon: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Cairo-Bold',
  },
  message: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: 'Cairo-Regular',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Cairo-SemiBold',
  },
};

/**
 * Simple field validation utility.
 * @param {Object} fields - The fields to validate.
 * @returns {Object|null} - Error object or null if valid.
 */
function validateFields(fields) {
  const errors = {};
  // Email validation
  if (!fields.email || fields.email.trim() === "") {
    errors.email = "^" + t("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "^" + t("The email is doesn't look like a valid");
  }
  // Password validation
  if (!fields.Password || fields.Password.trim() === "") {
    errors.Password = "^" + t("password is required");
  }
  return Object.keys(errors).length ? errors : null;
}
import { t } from "../../../locals";
import styleCss from "./loginStyle";
import { AlertHelper } from '../App/AlertHelper';
// import { Notifications } from 'expo';
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device';
// import * as Permissions from 'expo-permissions';

//Redux
import { connect } from "react-redux";
import { login, loadingStart, setGlobalShowAlert } from "../redux/actions/auth";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class LoginPage extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerShown: false,
    };
  };

  /* state function */

  constructor(props) {
    super(props);
    this.state = {
      email: "",
      Password: "",
      visible: false,
      validationError: "",
      passwordshow: true,
      token: '',
      notification: '',
      // Custom alert state
      showCustomAlert: false,
      alertTitle: '',
      alertMessage: '',
      alertType: 'error'
    };
  }

  showAlert = (type, title, message) => {
    console.log(`🚨 Showing custom alert: ${type} - ${title}: ${message}`);
    this.setState({
      showCustomAlert: true,
      alertType: type,
      alertTitle: title,
      alertMessage: message
    });
  };

  hideAlert = () => {
    this.setState({
      showCustomAlert: false,
      alertTitle: '',
      alertMessage: '',
      alertType: 'error'
    });
  };

  /* hide and show password */
  getPasswordshow = () => {
    if (this.state.passwordshow == true) {
      this.setState({ passwordshow: false })
    } else {
      this.setState({ passwordshow: true })
    }
  }

  /*data load before screen using this function */

  async componentDidMount() {
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);

    // Register this component's alert function with the auth actions
    setGlobalShowAlert(this.showAlert);

    this.registerForPushNotifications();
    this.requestPermissionsAsync();
    Notifications.addNotificationReceivedListener(this._handleNotification);
    Notifications.addNotificationResponseReceivedListener(this._handleNotificationResponse);

  }

  componentWillUnmount() {
    if (this.backHandler) {
      this.backHandler.remove();
    }
    // Clear the global alert function
    setGlobalShowAlert(null);
  }

  _handleNotification = notification => {
    this.setState({ notification: notification });
  };

  _handleNotificationResponse = response => {
    if (response.notification.request.content.data.type == "Notice") {
      this.props.navigation.navigate("Notice");
    } else if (response.notification.request.content.data.type == "Workouts") {
      this.props.navigation.navigate("Workouts");
    } else if (response.notification.request.content.data.type == "Nutritionplan") {
      this.props.navigation.navigate("Nutritionplan");
    } else if (response.notification.request.content.data.type == "viewinvoice") {
      this.props.navigation.navigate("viewinvoice");
    } else if (response.notification.request.content.data.type == "Message") {
      this.props.navigation.navigate("Message");
    } else if (response.notification.request.content.data.type == "") {
      this.props.navigation.navigate("Home");
    }
  };

  requestPermissionsAsync = async () => {
    return await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    });
  }


  /* for get device token */

  registerForPushNotifications = async () => {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      this.setState({ token: token });
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    return token;
  }

  /* login function */
  async login() {
    console.log("🚀 Login function called");
    
    const { login, loadingStart } = this.props;
    const { navigate } = this.props.navigation;

    console.log("📧 Email:", this.state.email);
    console.log("🔑 Password length:", this.state.Password ? this.state.Password.length : 0);
    console.log("📱 Device token:", this.state.token ? "Present" : "Missing");

    var constraints = {
      email: {
        presence: {
          allowEmpty: false,
          message: "^" + t("Email is required"),
        },
        email: {
          message: "^" + t("The email is doesn't look like a valid"),
        },
      },
      Password: {
        presence: {
          allowEmpty: false,
          message: "^" + t("password is required"),
        },
        
      },
    };

    const result = validateFields({
      email: this.state.email,
      Password: this.state.Password,
    });

    console.log("✅ Validation result:", result);

    if (result) {
      console.log("❌ Validation failed");
      if (result.email) {
        this.showAlert("error", t("Error"), result.email);
        return false;
      }
      if (result.Password) {
        this.showAlert("error", t("Error"), result.Password);
        return false;
      }
    }

    const loginData = {
      username: this.state.email,
      password: this.state.Password,
      device_token: this.state.token
    };
    
    console.log("📤 Prepared login data:", {
      username: loginData.username,
      password: loginData.password ? `***${loginData.password.slice(-2)}` : "missing",
      device_token: loginData.device_token ? "present" : "missing"
    });

    if (!result) {
      console.log("✅ Validation passed, starting login process");
      loadingStart();
      
      try {
        console.log("🔄 Calling login action...");
        const loginResult = await login(loginData);
        console.log("✅ Login action completed");
        
        // The auth action will now handle showing the custom alert
        // through the setGlobalShowAlert mechanism
        
      } catch (error) {
        console.error('❌ Component login error:', error);
        this.showAlert("error", "Login Failed", "An unexpected error occurred. Please try again.");
      }
    }
  }
  
  handleBackPress() {
    Alert.alert(t("Hold on!"), t("Are you sure you want to exit app?"), [
      {
        text: t("No"),
        onPress: () => null,
        style: "cancel",
      },
      { text: t("Yes"), onPress: () => BackHandler.exitApp() },
    ]);
    return true;
  }

  handleLogout() {
    this.props.navigation.navigate("Login");
  }

  /* Design section */
  render() {
    const { loading } = this.props;
    const { email, Password, token, showCustomAlert, alertTitle, alertMessage, alertType } = this.state;

    if (!loading) {
      return (
        <View style={styleCss.loign_container}>
          <ImageBackground
            source={require("../../images/Login-BG-Image.png")}
            style={styleCss.login_bg_image}
          >
            <StatusBar />
            <KeyboardAvoidingView
              behavior={Platform.select({ android: "height", ios: "padding" })}
              style={styleCss.loign_container}
            >
              <ScrollView style={styleCss.loign_page}>
                <Col style={styleCss.login_email_col}>
                  <Col style={styleCss.login_image_col}>
                    <Image
                      style={styleCss.login_image}
                      source={require("../../images/Logo.png")}
                    />
                  </Col>

                  <Row style={styleCss.login_input}>
                    <Col style={styleCss.login_input_col}>
                      <Image
                        style={styleCss.login_icon_image}
                        source={require("../../images/Email-512.png")}
                      />
                    </Col>
                    <Col>
                      <TextInput
                        style={styleCss.login_input_email}
                        value={email}
                        onChangeText={(email) =>
                          this.setState({ email: email })
                        }
                        maxLength={30}
                        placeholderTextColor="#333"
                        placeholder={t("Email")}
                      />
                    </Col>
                  </Row>

                  <Row style={styleCss.login_input}>
                    <Col style={styleCss.login_input_col}>
                      <Image
                        style={styleCss.login_icon_image}
                        source={require("../../images/Password.png")}
                      />
                    </Col>
                    <Col>
                      <TextInput
                        style={styleCss.login_input_password}
                        value={Password}
                        onChangeText={(Password) =>
                          this.setState({ Password: Password })
                        }
                        placeholderTextColor="#333"
                        placeholder={t("Password")}
                        secureTextEntry={this.state.passwordshow}
                      />
                    </Col>
                    <Col style={styleCss.login_input_password_show}>
                      {this.state.passwordshow ? (<TouchableOpacity
                        onPress={this.getPasswordshow}>
                        <Image source={require('../../images/Eye.png')}
                          style={styleCss.password_eye_image}></Image>
                      </TouchableOpacity>) : (<TouchableOpacity
                        onPress={this.getPasswordshow}>
                        <Image source={require('../../images/EyeClose.png')}
                          style={styleCss.password_eye_image}></Image>
                      </TouchableOpacity>)}
                    </Col>
                  </Row>

                  <TouchableOpacity
                    style={styleCss.login_btn}
                    onPress={this.login.bind(this)}
                  >
                    <Row style={styleCss.login_btn_container}>
                      <Text style={styleCss.login_btn_text}>{t("Login")}</Text>
                    </Row>
                  </TouchableOpacity>
                  <Row style={styleCss.login_signup_container}>
                    <TouchableOpacity
                      style={styleCss.login_signup_button}
                      onPress={() =>
                        this.props.navigation.navigate("RegistrationPage")
                      }
                    >
                      <Text style={styleCss.login_signup_text}>
                        {t("Signup with Email")}
                      </Text>
                    </TouchableOpacity>
                  </Row>
                </Col>
              </ScrollView>
            </KeyboardAvoidingView>
          </ImageBackground>
          
          {/* Custom Alert */}
          <CustomAlert
            visible={showCustomAlert}
            title={alertTitle}
            message={alertMessage}
            type={alertType}
            onClose={this.hideAlert}
          />
        </View>
      );
    } else {
      return (
        <View style={styleCss.login_loding_container}>
          <ImageBackground
            source={require("../../images/Login-BG-Image.png")}
            style={styleCss.login_bg_image}
          >
            <StatusBar />
            <KeyboardAvoidingView
              behavior={Platform.select({ android: "height", ios: "padding" })}
              style={styleCss.loign_container}
            >
              <ScrollView style={styleCss.loign_page}>
                <Col style={styleCss.login_email_col}>
                  <Col style={styleCss.login_image_col}>
                    <Image
                      style={styleCss.login_image}
                      source={require("../../images/Logo.png")}
                    />
                  </Col>

                  <Row style={styleCss.login_input}>
                    <Col style={styleCss.login_input_col}>
                      <Image
                        style={styleCss.login_icon_image}
                        source={require("../../images/Email-white-512.png")}
                      />
                    </Col>
                    <Col>
                      <TextInput
                        style={styleCss.login_input_email}
                        value={email}
                        onChangeText={(email) =>
                          this.setState({ email: email })
                        }
                        maxLength={30}
                        placeholderTextColor="#ffffff"
                        placeholder={t("Email")}
                      />
                    </Col>
                  </Row>

                  <Row style={styleCss.login_input}>
                    <Col style={styleCss.login_input_col}>
                      <Image
                        style={styleCss.login_icon_image}
                        source={require("../../images/Password.png")}
                      />
                    </Col>
                    <Col>
                      <TextInput
                        style={styleCss.login_input_password}
                        value={Password}
                        onChangeText={(Password) =>
                          this.setState({ Password: Password })
                        }
                        placeholderTextColor="#ffffff"
                        placeholder={t("Password")}
                        secureTextEntry
                      />
                    </Col>
                  </Row>

                  <TouchableOpacity
                    style={styleCss.login_btn}
                    onPress={this.login.bind(this)}
                  >
                    <Row style={styleCss.login_btn_container}>
                      <Text style={styleCss.login_btn_text}>{t("Login")}</Text>
                    </Row>
                  </TouchableOpacity>
                  <Row style={styleCss.login_signup_container}>
                    <TouchableOpacity
                      style={styleCss.login_signup_button}
                      onPress={() =>
                        this.props.navigation.navigate("RegistrationPage")
                      }
                    >
                      <Text style={styleCss.login_signup_text}>
                        {t("Signup with Email")}
                      </Text>
                    </TouchableOpacity>
                  </Row>
                </Col>
              </ScrollView>
            </KeyboardAvoidingView>
          </ImageBackground>
          <ActivityIndicator
            style={styleCss.login_loader}
            size="large"
            color="#30afb5"
          />
        </View>
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.auth.loading,
  };
};

const mapDispatchToProps = {
  login,
  loadingStart,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
