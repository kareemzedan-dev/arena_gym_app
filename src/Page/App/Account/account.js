import React, { Component } from 'react';
import {
    KeyboardAvoidingView,
    Keyboard,
    BackHandler,
    ActivityIndicator,
    RefreshControl,
    Text,
    View,
    Image,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Platform,
    TextInput,
    TouchableHighlight,
    Alert,
    Linking 
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
/**
 * Simple account validation utility.
 * @param {Object} fields - The fields to validate.
 * @returns {Object|null} - Error object or null if valid.
 */
function validateFields(fields) {
  const errors = {};
  if (fields.ConfirmPassword && fields.password !== fields.ConfirmPassword) {
    errors.ConfirmPassword = "^" + t("not matched with password");
  }
  return Object.keys(errors).length ? errors : null;
}
import QRCode from 'react-native-qrcode-svg';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as ImagePicker from "expo-image-picker";
import { Col, Row } from 'react-native-easy-grid';
import moment from 'moment';
import * as ImageManipulator from 'expo-image-manipulator';
import { t } from '../../../../locals';
import styleCss from '../../../style';

// Redux
import { connect } from "react-redux";
import { loadingStart, updateUserdetails, fetchUserdetails, Deletemember } from "../../redux/actions/auth";

// HOC to handle focus/blur events with React Navigation v6
const withFocusEffect = (WrappedComponent) => {
    return function WithFocusEffectComponent(props) {
        const [isFocused, setIsFocused] = React.useState(false);
        
        useFocusEffect(
            React.useCallback(() => {
                setIsFocused(true);
                const onBackPress = () => {
                    props.navigation.navigate('Home');
                    return true;
                };
                
                const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
                
                return () => {
                    setIsFocused(false);
                    subscription?.remove();
                };
            }, [props.navigation])
        );
        
        return <WrappedComponent {...props} isFocused={isFocused} />;
    };
};

class Account extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ImageLoading: false,
            user_first_name: '',
            user_last_name: '',
            user_city: '',
            Email: '',
            PhoneNumber: '',
            Location: '',
            DateOfBirth: '',
            isVisible_DOB: false,
            password: '',
            ConfirmPassword: '',
            updatedProfile: '',
            updated_Profile_base64: '',
            memberId: ""
        };
    }

    static navigationOptions = () => {
        return {
            headerShown: false,
        };
    };

    componentDidMount() {
        const { userData } = this.props;
        if (userData) {
            this.setState({
                user_first_name: userData.first_name || '',
                user_last_name: userData.last_name || '',
                user_city: userData.city || '',
                Email: userData.email || '',
                PhoneNumber: userData.mobile || '',
                DateOfBirth: userData.dob || '',
                Location: userData.address || '',
                DOB: userData.dob || '',
                memberId: userData.member_id || '',
            });
        }
    }

    componentWillUnmount() {
        // Clean up any running timeouts or intervals
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
        }
        if (this.permissionTimeout) {
            clearTimeout(this.permissionTimeout);
        }
        // Clean up any image loading states
        if (this.imageLoadTimeout) {
            clearTimeout(this.imageLoadTimeout);
        }
    }

    // Request permissions for image picker
// Enhanced permission handling with better user experience
requestPermissions = async () => {
    try {
        // First check current permission status
        const { status: currentStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
        
        if (currentStatus === 'granted') {
            return true;
        }
        
        // If permission was never asked, request it
        if (currentStatus === 'undetermined') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (status === 'granted') {
                return true;
            } else if (status === 'denied') {
                this.showPermissionDeniedAlert();
                return false;
            }
        }
        
        // If permission was previously denied, show settings alert
        if (currentStatus === 'denied') {
            this.showPermissionDeniedAlert();
            return false;
        }
        
        return false;
    } catch (error) {
        console.error('Error requesting permissions:', error);
        Alert.alert('Error', 'Unable to access permissions. Please try again.');
        return false;
    }
};

// Separate function to show permission denied alert
showPermissionDeniedAlert = () => {
    Alert.alert(
        'Photo Library Access Required',
        'To update your profile picture, please allow access to your photo library in Settings.',
        [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Open Settings',
                onPress: () => {
                    Linking.openSettings();
                },
            },
        ]
    );
};

// Also update your changeImage function to handle permission checking
async changeImage() {
    try {
        // Check permissions before proceeding
        this.permissionTimeout = setTimeout(() => {
            console.warn('Permission check timeout');
        }, 10000);
        
        const hasPermission = await this.requestPermissions();
        
        if (this.permissionTimeout) {
            clearTimeout(this.permissionTimeout);
            this.permissionTimeout = null;
        }
        
        if (!hasPermission) {
            return; // Exit if no permission
        }
        
        this.setState({ ImageLoading: true });
        
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            
            // Add timeout for image manipulation
            this.imageLoadTimeout = setTimeout(() => {
                console.warn('Image manipulation timeout');
                this.setState({ ImageLoading: false });
            }, 30000);
            
            const manipResult = await ImageManipulator.manipulateAsync(
                asset.uri,
                [{ resize: { height: 1024 } }],
                {
                    compress: 0.8,
                    format: ImageManipulator.SaveFormat.PNG,
                    base64: true
                }
            );

            if (this.imageLoadTimeout) {
                clearTimeout(this.imageLoadTimeout);
                this.imageLoadTimeout = null;
            }

            this.setState({
                updatedProfile: manipResult.uri,
                updated_Profile_base64: manipResult.base64,
                updated_Profile_name: asset.uri.split('/').pop(),
                ImageLoading: false
            });
        } else {
            this.setState({ ImageLoading: false });
        }
    } catch (error) {
        console.error('Error picking image:', error);
        this.setState({ ImageLoading: false });
        
        // Clear any pending timeouts
        if (this.permissionTimeout) {
            clearTimeout(this.permissionTimeout);
            this.permissionTimeout = null;
        }
        if (this.imageLoadTimeout) {
            clearTimeout(this.imageLoadTimeout);
            this.imageLoadTimeout = null;
        }
        
        Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
}
    /* Date of Birth function */
    handler_DOB = (date) => {
        this.setState({
            isVisible_DOB: false,
            DateOfBirth: moment(date).format('YYYY-MM-DD')
        });
    };

    show_DOB = () => {
        this.setState({ isVisible_DOB: true });
        Keyboard.dismiss();
    };

    hide_DOB = () => {
        this.setState({
            isVisible_DOB: false,
        });
    };

    /* profile update function */
    async send() {
        const constraints = {
            ConfirmPassword: {
                equality: {
                    attribute: "password",
                    message: "^" + t("not matched with password")
                }
            },
        };

        Keyboard.dismiss();

        const result = validateFields({
            user_first_name: this.state.user_first_name,
            user_last_name: this.state.user_last_name,
            user_city: this.state.user_city,
            PhoneNumber: this.state.PhoneNumber,
            Location: this.state.Location,
            DateOfBirth: this.state.DateOfBirth,
            password: this.state.password,
            ConfirmPassword: this.state.ConfirmPassword,
        });

        if (result) {
            const validationFields = [
                'user_first_name', 'user_last_name', 'PhoneNumber', 
                'user_city', 'Location', 'password', 'ConfirmPassword'
            ];
            
            for (const field of validationFields) {
                if (result[field]) {
                    this.dropdown.alertWithType('error', t('Error'), result[field]);
                    return false;
                }
            }
        }

        if (!result) {
            const { updateUserdetails, loadingStart } = this.props;
            loadingStart();

            try {
                const Id = await SecureStore.getItemAsync("id");
                const Token = await SecureStore.getItemAsync("access_token");

                const updateProfileData = {
                    current_user_id: Id,
                    member_id: Id,
                    access_token: Token,
                    first_name: this.state.user_first_name,
                    last_name: this.state.user_last_name,
                    mobile: this.state.PhoneNumber,
                    city_name: this.state.user_city,
                    address: this.state.Location,
                    birth_date: this.state.DateOfBirth,
                    new_password: this.state.password,
                    confirm_password: this.state.ConfirmPassword,
                    profile_member_image: this.state.updated_Profile_base64,
                };
                
                updateUserdetails(updateProfileData);
            } catch (error) {
                console.error('Error updating profile:', error);
                Alert.alert('Error', 'Failed to update profile. Please try again.');
            }
        }
    }

    // This function is no longer needed as we fetch user details on login
    // and only refresh manually

    async memberDataUpdate() {
        const { userData } = this.props;
        if (userData) {
            this.setState({
                user_first_name: userData.first_name || '',
                user_last_name: userData.last_name || '',
                user_city: userData.city || '',
                Email: userData.email || '',
                PhoneNumber: userData.mobile || '',
                DateOfBirth: userData.dob || '',
                Location: userData.address || '',
                DOB: userData.dob || '',
                memberId: userData.member_id || '',
            });
        }
    }

    onRefresh = async () => {
        const { fetchUserdetails, loadingStart } = this.props;
        loadingStart();
        
        try {
            // Add timeout for refresh operation
            this.refreshTimeout = setTimeout(() => {
                console.warn('Refresh operation timeout');
            }, 15000);
            
            const Id = await SecureStore.getItemAsync("id").catch(() => null);
            const Token = await SecureStore.getItemAsync("access_token").catch(() => null);
            
            if (this.refreshTimeout) {
                clearTimeout(this.refreshTimeout);
                this.refreshTimeout = null;
            }
            
            if (!Id || !Token) {
                console.warn('Missing auth data during refresh');
                return;
            }
            
            const userData = {
                "member_id": Id,
                "access_token": Token,
            };
            await fetchUserdetails(userData);
            this.memberDataUpdate();
        } catch (error) {
            console.error('Error refreshing data:', error);
            if (this.refreshTimeout) {
                clearTimeout(this.refreshTimeout);
                this.refreshTimeout = null;
            }
        }
    };

    deleteMember = async () => {
        Alert.alert(
            t("Gym App"), 
            "Are you sure you want to delete this account?", 
            [
                {
                    text: t("No"),
                    onPress: () => this.props.navigation.navigate("account"),
                    style: "cancel",
                },
                { 
                    text: t("Yes"), 
                    onPress: () => this.memberDelete(),
                    style: "destructive"
                },
            ]
        );
    };

    async memberDelete() {
        const { Deletemember, loadingStart } = this.props;
        const { navigation } = this.props;
        loadingStart();
        
        try {
            const Id = await SecureStore.getItemAsync("id");
            const Token = await SecureStore.getItemAsync("access_token");
            const userData = {
                "member_id": Id,
                "access_token": Token,
            };
            Deletemember(userData, navigation);
        } catch (error) {
            console.error('Error deleting member:', error);
            Alert.alert('Error', 'Failed to delete account. Please try again.');
        }
    }

    renderFormRow = (iconSource, placeholder, value, onChangeText, refName, keyboardType = 'default', secureTextEntry = false, editable = true) => {
        return (
            <Row style={styleCss.account_profile_name_row}>
                <Col style={styleCss.account_profile_image_col}>
                    <Image source={iconSource} style={styleCss.account_profile_image} />
                </Col>
                <Col style={editable ? styleCss.account_profile_name_col : styleCss.account_profile_Email_name_col}>
                    <TouchableOpacity disabled={!editable}>
                        <TextInput 
                            style={editable ? styleCss.account_TextValue : styleCss.account_Email_TextValue}
                            placeholder={t(placeholder)}
                            placeholderTextColor="#30afb5"
                            maxLength={25}
                            autoCorrect={false}
                            value={value}
                            keyboardType={keyboardType}
                            secureTextEntry={secureTextEntry}
                            editable={editable}
                            ref={ref => this[refName] = ref}
                            onChangeText={onChangeText}
                        />
                    </TouchableOpacity>
                </Col>
                {editable && (
                    <TouchableOpacity style={styleCss.account_Textedit} onPress={() => this[refName].focus()}>
                        <Col style={styleCss.account_Textedit_col}>
                            <Image source={require('../../../images/Account_Edit.png')} style={styleCss.account_Textedit_image} />
                        </Col>
                    </TouchableOpacity>
                )}
            </Row>
        );
    };

    renderUserHeader = () => {
        const { userData } = this.props;
        
        // Add null safety check
        if (!userData) {
            return (
                <Row style={styleCss.account_user_row}>
                    <Col style={styleCss.account_user_col}>
                        <Col style={styleCss.account_image_col}>
                            <Image
                                style={styleCss.account_image}
                                source={require('../../../images/undefined-profile.png')}
                            />
                        </Col>
                    </Col>
                    <Col>
                        <Row style={styleCss.account_name_row}>
                            <Text style={styleCss.account_name_text}>Loading...</Text>
                        </Row>
                    </Col>
                </Row>
            );
        }
        
        return (
            <Row style={styleCss.account_user_row}>
                <Col style={styleCss.account_user_col}>
                    <TouchableOpacity onPress={() => this.changeImage()}>
                        <Col style={styleCss.account_image_col}>
                            <Image
                                onLoadStart={() => this.setState({ ImageLoading: true })}
                                onLoadEnd={() => this.setState({ ImageLoading: false })}
                                onError={() => {
                                    console.warn('Profile image load failed, using default');
                                    this.setState({ ImageLoading: false });
                                }}
                                style={styleCss.account_image}
                                source={{
                                    uri: this.state.updatedProfile || (userData && userData.member_image) || null,
                                    cache: 'reload'
                                }}
                                defaultSource={require('../../../images/undefined-profile.png')}
                            />
                            <ActivityIndicator
                                style={styleCss.loading}
                                animating={this.state.ImageLoading}
                                size="small"
                                color="#30afb5"
                            />
                        </Col>
                    </TouchableOpacity>
                </Col>
                <Col>
                    <Row style={styleCss.account_name_row}>
                        <Text style={styleCss.account_name_text}>
                            {(userData.first_name || '')} {(userData.last_name || '')}
                        </Text>
                    </Row>
                    {(userData.address || userData.city) ? (
                        <Row style={styleCss.account_address_row}>
                            <Text numberOfLines={1} style={styleCss.account_address_text}>
                                {userData.address || ''} {userData.city ? `, ${userData.city}` : ''}
                            </Text>
                        </Row>
                    ) : null}

                    {userData.state ? (
                        <Row style={styleCss.account_state_row}>
                            <Col style={styleCss.account_state_image_col}>
                                <Image 
                                    style={styleCss.account_state_image}
                                    source={require('../../../images/Location2-Pin-Gray-512.png')}
                                />
                            </Col>
                            <Col style={styleCss.account_state_col}>
                                <Text numberOfLines={1} style={styleCss.account_state_text}>{userData.state}</Text>
                            </Col>
                            <TouchableHighlight 
                                onPress={() => this.deleteMember()}
                                underlayColor={'#fff'}
                                style={styleCss.delete_member_button}
                            >
                                <Text style={styleCss.delete_member_text}>Delete</Text>
                            </TouchableHighlight>
                        </Row>
                    ) : (
                        <View>
                            <TouchableHighlight 
                                onPress={() => this.deleteMember()}
                                underlayColor={'#fff'}
                                style={styleCss.delete_member_button}
                            >
                                <Text style={styleCss.delete_member_text}>Delete</Text>
                            </TouchableHighlight>
                        </View>
                    )}
                </Col>
                
<Col style={styleCss.account_qr_col}>
    <TouchableOpacity onPress={() => this.props.navigation.navigate("qrbik")}>
        {this.state.memberId ? (
            <QRCode
                value={this.state.memberId}
                size={60}
                backgroundColor='black'
                color='white'
            />
        ) : (
            <View style={{ width: 60, height: 60, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: '#666' }}>No ID</Text>
            </View>
        )}
    </TouchableOpacity>
</Col>
            </Row>
        );
    };

    /* Body structure */
    render() {
        const { user_first_name, user_last_name, user_city, Email, PhoneNumber, Location } = this.state;
        const { navigation, userData, loading } = this.props;

        if (loading) {
            return (
                <View style={styleCss.container}>
                    <StatusBar />
                    <Row style={styleCss.NaveBar}>
                        <Col>
                            <TouchableOpacity onPress={() => navigation.navigate("CustomSideBar")} style={styleCss.menu_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Menu-white.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col>
                            <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styleCss.back_arrow}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Back-Arrow-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col style={styleCss.name_col}>
                            <Text style={styleCss.NaveText}>{t("Account")}</Text>
                        </Col>

                        <Col>
                            <TouchableOpacity onPress={() => navigation.navigate('Workouts')} style={styleCss.workout_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Workout-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>
                        <Col>
                            <TouchableOpacity onPress={() => navigation.navigate('Message')} style={styleCss.message_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Message-white.png')}
                                />
                            </TouchableOpacity>
                        </Col>
                    </Row>
                    <ActivityIndicator
                        style={styleCss.loading}
                        size="large"
                        color="#30afb5"
                    />
                </View>
            );
        }

        return (
            <View style={styleCss.container}>
                <StatusBar />
                <Row style={styleCss.NaveBar}>
                    <Col>
                        <TouchableOpacity onPress={() => navigation.navigate("CustomSideBar")} style={styleCss.menu_col}>
                            <Image style={styleCss.Naveicon}
                                source={require('../../../images/Menu-white.png')}
                            />
                        </TouchableOpacity>
                    </Col>

                    <Col>
                        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styleCss.back_arrow}>
                            <Image style={styleCss.Naveicon}
                                source={require('../../../images/Back-Arrow-White.png')}
                            />
                        </TouchableOpacity>
                    </Col>

                    <Col style={styleCss.name_col}>
                        <Text style={styleCss.NaveText}>{t("Account")}</Text>
                    </Col>

                    <Col>
                        <TouchableOpacity onPress={() => navigation.navigate('Workouts')} style={styleCss.workout_col}>
                            <Image style={styleCss.Naveicon}
                                source={require('../../../images/Workout-White.png')}
                            />
                        </TouchableOpacity>
                    </Col>
                    <Col>
                        <TouchableOpacity onPress={() => navigation.navigate('Message')} style={styleCss.message_col}>
                            <Image style={styleCss.Naveicon}
                                source={require('../../../images/Message-white.png')}
                            />
                        </TouchableOpacity>
                    </Col>
                </Row>
                
                <KeyboardAvoidingView 
                    style={Platform.OS === "ios" ? styleCss.account_keyboard : {flex: 1}} 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                colors={["#30afb5"]}
                                refreshing={loading}
                                onRefresh={this.onRefresh}
                            />
                        }
                    >
                        {this.renderUserHeader()}

                        {this.renderFormRow(
                            require('../../../images/Account_user.png'),
                            "First Name",
                            user_first_name,
                            (user_first_name) => this.setState({ user_first_name }),
                            'firstName'
                        )}

                        {this.renderFormRow(
                            require('../../../images/Account_user.png'),
                            "Last Name",
                            user_last_name,
                            (user_last_name) => this.setState({ user_last_name }),
                            'LastName'
                        )}

                        {this.renderFormRow(
                            require('../../../images/Account_envelope.png'),
                            "Email",
                            Email,
                            (Email) => this.setState({ Email }),
                            'Email',
                            'email-address',
                            false,
                            false
                        )}

                        {this.renderFormRow(
                            require('../../../images/Account_Call.png'),
                            "Phone Number",
                            PhoneNumber,
                            (PhoneNumber) => this.setState({ PhoneNumber }),
                            'PhoneNumber',
                            'phone-pad'
                        )}

                        {this.renderFormRow(
                            require('../../../images/Account_Location.png'),
                            "City",
                            user_city,
                            (user_city) => this.setState({ user_city }),
                            'City'
                        )}

                        {this.renderFormRow(
                            require('../../../images/Account_Location.png'),
                            "Location",
                            Location,
                            (Location) => this.setState({ Location }),
                            'Location'
                        )}

                        <Row style={styleCss.account_profile_name_row}>
                            <Col style={styleCss.account_profile_image_col}>
                                <Image source={require('../../../images/Account_DOB.png')} style={styleCss.account_profile_image} />
                            </Col>
                            <Col style={styleCss.account_profile_name_col}>
                                <TouchableOpacity onPress={this.show_DOB}>
                                    <TextInput
                                        placeholder={t("Date Of Birth")}
                                        placeholderTextColor="#30afb5"
                                        showSoftInputOnFocus={false}
                                        value={this.state.DateOfBirth}
                                        style={styleCss.account_TextValue}
                                        editable={false}
                                        ref={ref => this.DateOfBirth = ref}
                                    />
                                </TouchableOpacity>
                            </Col>
                            <TouchableOpacity style={styleCss.account_Textedit} onPress={this.show_DOB}>
                                <Col style={styleCss.account_Textedit_col}>
                                    <Image source={require('../../../images/Account_Edit.png')} style={styleCss.account_Textedit_image} />
                                </Col>
                            </TouchableOpacity>
                        </Row>

<DateTimePickerModal
    isVisible={this.state.isVisible_DOB}
    mode="date"
    onConfirm={this.handler_DOB}
    onCancel={this.hide_DOB}
    maximumDate={new Date()}
    date={(() => {
        if (this.state.DateOfBirth) {
            const parsedDate = new Date(this.state.DateOfBirth);
            return !isNaN(parsedDate.getTime()) ? parsedDate : new Date();
        }
        return new Date();
    })()}
/>
                        {this.renderFormRow(
                            require('../../../images/Account_Password.png'),
                            "New Password",
                            this.state.password,
                            (password) => this.setState({ password }),
                            'NewPassword',
                            'default',
                            true
                        )}

                        {this.renderFormRow(
                            require('../../../images/Account_Password.png'),
                            "Confirm Password",
                            this.state.ConfirmPassword,
                            (ConfirmPassword) => this.setState({ ConfirmPassword }),
                            'ConfirmPassword',
                            'default',
                            true
                        )}

                        <TouchableOpacity style={styleCss.account_btn} onPress={this.send.bind(this)}>
                            <Row style={styleCss.account_btn_container}>
                                <Text style={styleCss.account_btn_text}>{t("Save")}</Text>
                            </Row>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
                            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        userData: state.auth.userData,
        loading: state.auth.loading,
    };
};

const mapDispatchToProps = {
    updateUserdetails,
    fetchUserdetails,
    loadingStart,
    Deletemember
};

export default connect(mapStateToProps, mapDispatchToProps)(withFocusEffect(Account));