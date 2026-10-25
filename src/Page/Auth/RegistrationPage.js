import React, { Component } from "react";
import {
  Platform,
  Keyboard,
  ActivityIndicator,
  View,
  ScrollView,
  ImageBackground,
  Text,
  TextInput,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Animated,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { RadioButton } from "react-native-paper";
import * as ImageManipulator from "expo-image-manipulator";
import DropDownPicker from "react-native-dropdown-picker";
import { 
  Ionicons, 
  MaterialIcons, 
  Feather, 
  AntDesign,
  FontAwesome5,
  Entypo 
} from "@expo/vector-icons";
import { t } from "../../../locals";
import { styles } from "./style";
import { AlertHelper } from "../App/AlertHelper";

// Redux
import { connect } from "react-redux";
import {
  fetchMembershipList,
  fetchMembershipClassList,
  signUp,
  loadingStart,
} from "../redux/actions/auth";

const today = new Date();
const defaultDate = moment().format("YYYY-MM-DD");

class RegistrationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Dropdown states
      open: false,
      Membershipopen: false,
      
      // Form data
      Firstname: "",
      Middlename: "",
      Lastname: "",
      gender: "male",
      DateOfBirth: "",
      Address: "",
      City: "",
      State: "",
      Zipcode: "",
      mobile: "",
      email: "",
      Password: "",
      passwordshow: true,
      Membership: "",
      Class: [],
      MembershipValidFromDate: defaultDate,
      MembershipValidToDate: "",
      
      // Image states
      updatedProfile: "",
      updatedProfileForDatabase: "",
      
      // Collapse states with animation values
      personalCollapsed: false,
      contactCollapsed: true,
      loginCollapsed: true,
      moreInfoCollapsed: true,
      
      // Animation values
      personalAnimation: new Animated.Value(1),
      contactAnimation: new Animated.Value(0),
      loginAnimation: new Animated.Value(0),
      moreInfoAnimation: new Animated.Value(0),
      
      // Date picker states
      isVisible: false,
      isVisible_valid: false,
      
      // Validation errors
      errors: {},
    };
  }

  componentDidMount() {
    this.membershipList();
  }

  // Enhanced validation with better error messages
  validateForm = () => {
    const errors = {};
    
    // First name validation
    if (!this.state.Firstname.trim()) {
      errors.Firstname = t("First name is required");
    } else if (!/^[A-Za-z\s]{2,30}$/.test(this.state.Firstname)) {
      errors.Firstname = t("First name must be 2-30 characters and contain only letters");
    }
    
    // Last name validation
    if (!this.state.Lastname.trim()) {
      errors.Lastname = t("Last name is required");
    } else if (!/^[A-Za-z\s]{2,30}$/.test(this.state.Lastname)) {
      errors.Lastname = t("Last name must be 2-30 characters and contain only letters");
    }
    
    // Gender validation
    if (!this.state.gender) {
      errors.gender = t("Please select gender");
    }
    
    // Email validation
    if (!this.state.email.trim()) {
      errors.email = t("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email)) {
      errors.email = t("Please enter a valid email address");
    }
    
    // Password validation
    if (!this.state.Password.trim()) {
      errors.Password = t("Password is required");
    } else if (this.state.Password.length < 6) {
      errors.Password = t("Password must be at least 6 characters long");
    }
    
    // Phone validation
    if (this.state.mobile && !/^\d{10}$/.test(this.state.mobile)) {
      errors.mobile = t("Please enter a valid 10-digit phone number");
    }
    
    // Membership validation
    if (!this.state.Membership) {
      errors.Membership = t("Please select a membership type");
    }
    
    // Class validation
    if (!this.state.Class || this.state.Class.length === 0) {
      errors.Class = t("Please select at least one class");
    }
    
    // Date validation
    if (!this.state.MembershipValidFromDate) {
      errors.MembershipValidFromDate = t("Please select membership start date");
    }
    
    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  showValidationError = (errors) => {
    const fields = ['Firstname', 'Lastname', 'gender', 'email', 'Password', 'mobile', 'Membership', 'Class', 'MembershipValidFromDate'];
    
    for (const field of fields) {
      if (errors[field]) {
        AlertHelper.show("error", t("Validation Error"), errors[field]);
        return;
      }
    }
  };

  togglePasswordVisibility = () => {
    this.setState(prevState => ({ passwordshow: !prevState.passwordshow }));
  };

  async membershipList() {
    const { fetchMembershipList, loadingStart } = this.props;
    loadingStart();
    fetchMembershipList();
  }

  async signup() {
    const { signUp, loadingStart } = this.props;

    if (!this.validateForm()) {
      this.showValidationError(this.state.errors);
      return;
    }

    loadingStart();
    
    const signupData = {
      first_name: this.state.Firstname,
      middle_name: this.state.Middlename,
      last_name: this.state.Lastname,
      gender: this.state.gender,
      dob: this.state.DateOfBirth,
      address: this.state.Address,
      city: this.state.City,
      state: this.state.State,
      zip: this.state.Zipcode,
      mobile: this.state.mobile,
      email: this.state.email,
      password: this.state.Password,
      membership: this.state.Membership,
      class: this.state.Class,
      membership_valid_from: this.state.MembershipValidFromDate,
      hidden_member_image: this.state.updatedProfileForDatabase,
      role: "member",
    };

    signUp(signupData, this.props.navigation.navigate);
  }

  // Enhanced accordion toggle with smooth animation
  toggleAccordion = (section) => {
    const sections = ['personal', 'contact', 'login', 'moreInfo'];
    const animations = {};
    const collapsed = {};
    
    sections.forEach(sec => {
      const animationKey = `${sec}Animation`;
      const collapsedKey = `${sec}Collapsed`;
      
      if (sec === section) {
        // Toggle the selected section
        collapsed[collapsedKey] = !this.state[collapsedKey];
        animations[animationKey] = collapsed[collapsedKey] ? 0 : 1;
      } else {
        // Close other sections
        collapsed[collapsedKey] = true;
        animations[animationKey] = 0;
      }
    });
    
    this.setState(collapsed);
    
    // Animate all sections
    Object.keys(animations).forEach(key => {
      Animated.timing(this.state[key], {
        toValue: animations[key],
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

  // Date picker handlers
  handleDOB = (event, date) => {
    this.setState({ isVisible: false });
    if (date) {
      this.setState({ DateOfBirth: moment(date).format("YYYY-MM-DD") });
    }
    Keyboard.dismiss();
  };

  showDOB = () => {
    this.setState({ isVisible: true });
    Keyboard.dismiss();
  };

  handleValidFromDate = (event, date) => {
    this.setState({ isVisible_valid: false });
    if (date) {
      const membershipdays = this.props.membershipDays;
      const formattedDate = moment(date).format("YYYY-MM-DD");
      
      this.setState({ MembershipValidFromDate: formattedDate });

      if (membershipdays > 0) {
        const toDate = moment(formattedDate)
          .add(parseFloat(membershipdays), "days")
          .format("YYYY-MM-DD");
        this.setState({ MembershipValidToDate: toDate });
      }
    }
  };

  showValidFromDate = () => {
    this.setState({ isVisible_valid: true });
    Keyboard.dismiss();
  };

  async changeImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      this.setState({
        updatedProfile: manipResult.uri,
        updatedProfileForDatabase: manipResult.base64,
      });
    }
  }

  // Dropdown handlers
  setMembershipOpen = (Membershipopen) => {
    this.setState({ Membershipopen });
  };

  setMembershipValue = (callback) => {
    this.setState(state => ({ Membership: callback(state.Membership) }));
  };

  async getClass(membershipID) {
    if (membershipID) {
      this.setState({ Membership: membershipID.value });
      const { fetchMembershipClassList } = this.props;
      fetchMembershipClassList({ membership_id: membershipID.value });
    }
  }

  setClassOpen = (open) => {
    this.setState({ open });
  };

  setClassValue = (callback) => {
    this.setState(state => ({ Class: callback(state.Class) }));
  };

  // Render enhanced input field
  renderInputField = (IconComponent, iconName, value, onChangeText, placeholder, maxLength, keyboardType, isRequired = false, secureTextEntry = false, additionalProps = {}) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputIconContainer}>
        <IconComponent name={iconName} size={20} color="#666" />
      </View>
      <View style={styles.inputFieldContainer}>
        <TextInput
          style={[styles.inputField, this.state.errors[placeholder] && styles.inputFieldError]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#999"
          placeholder={placeholder}
          maxLength={maxLength}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          {...additionalProps}
        />
        {isRequired && (
          <Text style={styles.requiredIndicator}>*</Text>
        )}
      </View>
    </View>
  );

  // Render enhanced accordion section
  renderAccordionSection = (title, isCollapsed, animationValue, onToggle, children, iconName) => (
    <View style={styles.accordionContainer}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.accordionHeaderContent}>
          <View style={styles.accordionIconContainer}>
            <MaterialIcons name={iconName} size={24} color="#30afb4" />
          </View>
          <Text style={styles.accordionTitle}>{title}</Text>
        </View>
        <Animated.View style={[
          styles.accordionArrowContainer,
          {
            transform: [{
              rotate: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg']
              })
            }]
          }
        ]}>
          <AntDesign name="down" size={16} color="#666" />
        </Animated.View>
      </TouchableOpacity>
      
      <Animated.View
        style={[
          styles.accordionContent,
          {
            maxHeight: animationValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1000]
            }),
            opacity: animationValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1]
            })
          }
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );

  render() {
    const { membershipData, membershipClassData, loading } = this.props;
    const {
      Membershipopen,
      open,
      gender,
      Class,
      Firstname,
      Middlename,
      Lastname,
      Address,
      City,
      State,
      Zipcode,
      mobile,
      email,
      Password,
      personalCollapsed,
      contactCollapsed,
      loginCollapsed,
      moreInfoCollapsed,
      personalAnimation,
      contactAnimation,
      loginAnimation,
      moreInfoAnimation,
      Membership,
      isVisible,
      isVisible_valid,
      DateOfBirth,
      MembershipValidFromDate,
    } = this.state;

    // Transform data for dropdowns
    const membershipList = membershipData?.map(item => ({
      label: item.membership_label,
      value: item.membership_id,
    })) || [];

    const classList = membershipClassData?.map(item => ({
      label: item.name,
      value: item.id,
    })) || [];

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#30afb4" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#30afb4" />
        <ImageBackground
          source={require("../../images/Login-BG-Image.png")}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.overlay} />
          <KeyboardAvoidingView
            behavior={Platform.select({ android: "height", ios: "padding" })}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View style={styles.header}>
              </View>

              {/* Profile Image Section */}
              <View style={styles.profileSection}>
                <View style={styles.profileImageContainer}>
                  <View style={styles.profileImage}>
                    {this.state.updatedProfile ? (
                      <Image
                        style={styles.profileImageActual}
                        source={{ uri: this.state.updatedProfile }}
                      />
                    ) : (
                      <MaterialIcons name="person" size={80} color="#ccc" />
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => this.changeImage()}
                    style={styles.cameraButton}
                  >
                    <Ionicons name="camera" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.profileText}>{t("Add Profile Photo")}</Text>
              </View>

              {/* Form Sections */}
              <View style={styles.formContainer}>
                {/* Personal Information */}
                {this.renderAccordionSection(
                  t("Personal Information"),
                  personalCollapsed,
                  personalAnimation,
                  () => this.toggleAccordion('personal'),
                  <>
                    {this.renderInputField(
                      Ionicons,
                      "person",
                      Firstname,
                      (text) => this.setState({ Firstname: text }),
                      t("First Name"),
                      30,
                      "default",
                      true
                    )}
                    {this.renderInputField(
                      Ionicons,
                      "person",
                      Middlename,
                      (text) => this.setState({ Middlename: text }),
                      t("Middle Name"),
                      30
                    )}
                    {this.renderInputField(
                      Ionicons,
                      "person",
                      Lastname,
                      (text) => this.setState({ Lastname: text }),
                      t("Last Name"),
                      30,
                      "default",
                      true
                    )}
                    
                    {/* Gender Selection */}
                    <View style={styles.genderContainer}>
                      <View style={styles.genderIconContainer}>
                        <MaterialIcons name="wc" size={20} color="#666" />
                      </View>
                      <View style={styles.genderContent}>
                        <Text style={styles.genderLabel}>{t("Gender")}</Text>
                        <View style={styles.genderOptions}>
                          <TouchableOpacity
                            style={[styles.genderOption, gender === "male" && styles.genderOptionSelected]}
                            onPress={() => this.setState({ gender: "male" })}
                          >
                            <MaterialIcons name="male" size={20} color={gender === "male" ? "#30afb4" : "#666"} />
                            <Text style={[styles.genderOptionText, gender === "male" && styles.genderOptionTextSelected]}>
                              {t("Male")}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.genderOption, gender === "female" && styles.genderOptionSelected]}
                            onPress={() => this.setState({ gender: "female" })}
                          >
                            <MaterialIcons name="female" size={20} color={gender === "female" ? "#30afb4" : "#666"} />
                            <Text style={[styles.genderOptionText, gender === "female" && styles.genderOptionTextSelected]}>
                              {t("Female")}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {/* Date of Birth */}
                    <TouchableOpacity
                      style={styles.dateContainer}
                      onPress={this.showDOB}
                    >
                      <View style={styles.inputIconContainer}>
                        <MaterialIcons name="date-range" size={20} color="#666" />
                      </View>
                      <View style={styles.dateContent}>
                        <Text style={[styles.dateText, !DateOfBirth && styles.datePlaceholder]}>
                          {DateOfBirth || t("Date of Birth")}
                        </Text>
                      </View>
                      <AntDesign name="calendar" size={16} color="#666" />
                    </TouchableOpacity>

                    {isVisible && (
                      <DateTimePicker
                        value={DateOfBirth ? new Date(DateOfBirth) : new Date()}
                        mode="date"
                        display="default"
                        onChange={this.handleDOB}
                        maximumDate={new Date()}
                      />
                    )}
                  </>,
                  "person"
                )}

                {/* Contact Information */}
                {this.renderAccordionSection(
                  t("Contact Information"),
                  contactCollapsed,
                  contactAnimation,
                  () => this.toggleAccordion('contact'),
                  <>
                    {this.renderInputField(
                      Ionicons,
                      "location",
                      Address,
                      (text) => this.setState({ Address: text }),
                      t("Address"),
                      100,
                      "default",
                      false,
                      false,
                      { multiline: true, numberOfLines: 2 }
                    )}
                    {this.renderInputField(
                      Ionicons,
                      "business",
                      City,
                      (text) => this.setState({ City: text }),
                      t("City"),
                      50
                    )}
                    {this.renderInputField(
                      Ionicons,
                      "map",
                      State,
                      (text) => this.setState({ State: text }),
                      t("State"),
                      50
                    )}
                    {this.renderInputField(
                      MaterialIcons,
                      "markunread-mailbox",
                      Zipcode,
                      (text) => this.setState({ Zipcode: text }),
                      t("Zip Code"),
                      10,
                      "numeric"
                    )}
                    {this.renderInputField(
                      Ionicons,
                      "call",
                      mobile,
                      (text) => this.setState({ mobile: text }),
                      t("Mobile Number"),
                      10,
                      "phone-pad"
                    )}
                  </>,
                  "contact-mail"
                )}

                {/* Login Information */}
                {this.renderAccordionSection(
                  t("Login Information"),
                  loginCollapsed,
                  loginAnimation,
                  () => this.toggleAccordion('login'),
                  <>
                    {this.renderInputField(
                      MaterialIcons,
                      "email",
                      email,
                      (text) => this.setState({ email: text }),
                      t("Email"),
                      50,
                      "email-address",
                      true
                    )}
                    
                    {/* Password field with enhanced design */}
                    <View style={styles.passwordContainer}>
                      <View style={styles.inputIconContainer}>
                        <MaterialIcons name="lock" size={20} color="#666" />
                      </View>
                      <View style={styles.passwordInputContainer}>
                        <TextInput
                          style={styles.passwordInput}
                          placeholderTextColor="#999"
                          value={Password}
                          onChangeText={(text) => this.setState({ Password: text })}
                          placeholder={t("Password")}
                          maxLength={20}
                          secureTextEntry={this.state.passwordshow}
                        />
                        <TouchableOpacity
                          onPress={this.togglePasswordVisibility}
                          style={styles.passwordToggle}
                        >
                          <Ionicons
                            name={this.state.passwordshow ? "eye-off" : "eye"}
                            size={20}
                            color="#666"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>,
                  "login"
                )}

                {/* More Information */}
                {this.renderAccordionSection(
                  t("More Information"),
                  moreInfoCollapsed,
                  moreInfoAnimation,
                  () => this.toggleAccordion('moreInfo'),
                  <>
                    {/* Membership Dropdown */}
                    <View style={styles.dropdownContainer}>
                      <Text style={styles.dropdownLabel}>{t("Select Membership")}</Text>
                      <DropDownPicker
                        listMode="SCROLLVIEW"
                        scrollViewProps={{ nestedScrollEnabled: true }}
                        placeholder={t("Choose membership type")}
                        open={Membershipopen}
                        value={Membership}
                        onSelectItem={(items) => this.getClass(items)}
                        items={membershipList}
                        setOpen={this.setMembershipOpen}
                        setValue={this.setMembershipValue}
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownList}
                        textStyle={styles.dropdownText}
                        placeholderStyle={styles.dropdownPlaceholder}
                      />
                    </View>

                    {/* Class Dropdown */}
                    <View style={styles.dropdownContainer}>
                      <Text style={styles.dropdownLabel}>{t("Select Classes")}</Text>
                      <DropDownPicker
                        listMode="SCROLLVIEW"
                        scrollViewProps={{ nestedScrollEnabled: true }}
                        placeholder={t("Choose classes")}
                        open={open}
                        value={Class}
                        items={classList}
                        setOpen={this.setClassOpen}
                        setValue={this.setClassValue}
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownList}
                        textStyle={styles.dropdownText}
                        placeholderStyle={styles.dropdownPlaceholder}
                        multiple={true}
                        mode="BADGE"
                        badgeDotColors={["#30afb4", "#4CAF50", "#FF9800", "#F44336"]}
                      />
                    </View>

                    {/* Membership Valid From Date */}
                    <TouchableOpacity
                      style={styles.dateContainer}
                      onPress={this.showValidFromDate}
                    >
                      <View style={styles.inputIconContainer}>
                        <MaterialIcons name="event" size={20} color="#666" />
                      </View>
                      <View style={styles.dateContent}>
                        <Text style={styles.dateLabel}>{t("Membership Valid From")}</Text>
                        <Text style={[styles.dateText, !MembershipValidFromDate && styles.datePlaceholder]}>
                          {MembershipValidFromDate || t("Select Date")}
                        </Text>
                      </View>
                      <AntDesign name="calendar" size={16} color="#666" />
                    </TouchableOpacity>
                    
                    {isVisible_valid && (
                      <DateTimePicker
                        value={MembershipValidFromDate ? new Date(MembershipValidFromDate) : new Date()}
                        mode="date"
                        display="default"
                        onChange={this.handleValidFromDate}
                        minimumDate={today}
                      />
                    )}
                  </>,
                  "info"
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={this.signup.bind(this)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>{t("Create Account")}</Text>
                  <AntDesign name="arrowright" size={20} color="#fff" />
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.loginLinkContainer}>
                  <Text style={styles.loginLinkText}>{t("Already have an Account?")}</Text>
                  <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => this.props.navigation.navigate("LoginPage")}
                  >
                    <Text style={styles.loginLinkButtonText}>{t("Login")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  membershipData: state.auth.membershipData,
  membershipClassData: state.auth.membershipClassData,
  membershipDays: state.auth.membershipDays,
  loading: state.auth.loading,
});

const mapDispatchToProps = {
  fetchMembershipList,
  fetchMembershipClassList,
  signUp,
  loadingStart,
};

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationPage);