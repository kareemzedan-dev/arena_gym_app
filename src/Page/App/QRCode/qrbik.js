import React, { Component, } from 'react';
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
    Alert
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
/**
 * Simple profile validation utility.
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
import DateTimePicker from 'react-native-modal-datetime-picker';
import * as ImagePicker from "expo-image-picker";
import { Col, Row } from 'react-native-easy-grid';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
var today = new Date();
import * as ImageManipulator from 'expo-image-manipulator';
import { t } from '../../../../locals';
import styleCss from '../../../style'
//Redux
import { connect } from "react-redux";
import { loadingStart, updateUserdetails, fetchUserdetails, Deletemember } from "../../redux/actions/auth";

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

        // Bind navigation event handlers
        this._unsubscribeFocus = null;
        this._unsubscribeBlur = null;
        this.backHandler = null;
    }

    // Navigation options are now handled in the navigator configuration
    // Remove static navigationOptions

    toggleModal = () => {
        this.setState({ isModalVisible: !this.state.isModalVisible });
    };

    toggleDrawer = () => {
        this.props.navigation.toggleDrawer();
    };

    componentDidMount() {
        const { userData } = this.props;
        this.setState({
            user_first_name: userData.first_name,
            user_last_name: userData.last_name,
            user_city: userData.city,
            Email: userData.email,
            PhoneNumber: userData.mobile,
            DateOfBirth: userData.dob,
            Location: userData.address,
            DOB: userData.dob,
            memberId: userData.member_id,
        });

        // Set up navigation event listeners
        this._unsubscribeFocus = this.props.navigation.addListener('focus', this._onFocus);
        this._unsubscribeBlur = this.props.navigation.addListener('blur', this._onBlur);
    }

    componentWillUnmount() {
        // Clean up navigation event listeners
        if (this._unsubscribeFocus) {
            this._unsubscribeFocus();
        }
        if (this._unsubscribeBlur) {
            this._unsubscribeBlur();
        }
        
        // Remove back handler using the new API
        if (this.backHandler) {
            this.backHandler.remove();
        }
    }

    /* Date of Birth function */

    handler_DOB = (date) => {
        this.setState({
            isVisible_DOB: false,
            DateOfBirth: moment(date).format('YYYY-MM-DD')
        })
    }

    show_DOB = () => {
        this.setState({ isVisible_DOB: true });
        Keyboard.dismiss();
    }

    hide_DOB = () => {
        this.setState({
            isVisible_DOB: false,
        })
    }

    /* update proflie Image */

    async changeImage() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,
            base64: true,
        });

        if (result) {
            const manipResult = await ImageManipulator.manipulateAsync(result.uri,
                [{ resize: { height: 1024 } }],
                { compress: 0, format: ImageManipulator.SaveFormat.PNG, base64: true }
            );

            this.setState({
                updatedProfile: manipResult.uri,
                updated_Profile_base64: manipResult.base64,
                updated_Profile_name: result.uri.split('/').pop(),
            });
        }
        if (updatedProfile.length > 0) {
            this.setState({ loader: false })
        }
    }

    /* profile update function */

    async send() {

        var constraints = {

            ConfirmPassword: {
                // presence: {
                //     allowEmpty: false,
                //     message: "^ ConfirmPassword required"
                // },
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
            if (result.user_first_name) {
                this.dropdown.alertWithType('error', t('Error'), result.user_first_name);
                return false;
            }

            if (result.user_last_name) {
                this.dropdown.alertWithType('error', t('Error'), result.user_last_name);
                return false;
            }

            if (result.PhoneNumber) {
                this.dropdown.alertWithType('error', t('Error'), result.PhoneNumber);
                return false;
            }

            if (result.user_city) {
                this.dropdown.alertWithType('error', t('Error'), result.user_city);
                return false;
            }

            if (result.Location) {
                this.dropdown.alertWithType('error', t('Error'), result.Location);
                return false;
            }

            if (result.password) {
                this.dropdown.alertWithType('error', t('Error'), result.password);
                return false;
            }

            if (result.ConfirmPassword) {
                this.dropdown.alertWithType('error', t('Error'), result.ConfirmPassword);
                return false;
            }
        }


        if (!result) {
            const { updateUserdetails, loadingStart } = this.props;
            loadingStart();

            const Id = await SecureStore.getItemAsync("id");
            const Token = await SecureStore.getItemAsync("access_token");

            var updateProfileData = {
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

            }
            updateUserdetails(updateProfileData)
        }
    };

    async singleMember() {
        const { fetchUserdetails, loadingStart } = this.props;
        loadingStart();
        const Id = await SecureStore.getItemAsync("id");
        const Token = await SecureStore.getItemAsync("access_token");
        const memberData = {
            "member_id": Id,
            "access_token": Token,
        };
        fetchUserdetails(memberData)
    }

    async memberDataUpdate() {
        const { userData } = this.props;
        this.setState({
            user_first_name: userData.first_name,
            user_last_name: userData.last_name,
            user_city: userData.city,
            Email: userData.email,
            PhoneNumber: userData.mobile,
            DateOfBirth: userData.dob,
            Location: userData.address,
            DOB: userData.dob,
            memberId: userData.member_id,
        });
    }

    onRefresh() {
        this.singleMember();
        this.memberDataUpdate();
    }

    _onBlur = () => {
        if (this.backHandler) {
            this.backHandler.remove();
            this.backHandler = null;
        }
    }

    _onFocus = () => {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this._handleBackButtonClick);
    }

    _handleBackButtonClick = () => this.props.navigation.navigate('Home')

    deleteMember = async () => {
        Alert.alert(t("Gym App"), ("Are you sure you want to delete this account?"), [
            {
                text: t("No"),
                onPress: () => this.props.navigation.navigate("account"),
                style: "cancel",
            },
            { text: t("Yes"), onPress: () => this.memberDelete() },
        ]);
    };

    async memberDelete() {
        const { Deletemember, loadingStart } = this.props;
        const { navigate } = this.props.navigation;
        loadingStart();
        const Id = await SecureStore.getItemAsync("id");
        const Token = await SecureStore.getItemAsync("access_token");
        const userData = {
            "member_id": Id,
            "access_token": Token,
        };
        Deletemember(userData, navigate);
    }

    /* Body structure */
    render() {
        const { user_first_name, user_last_name, user_city, Email, PhoneNumber, Location } = this.state;
        const { navigate } = this.props.navigation;
        const { userData, loading } = this.props;

        if (!loading) {
            return (

                <View style={styleCss.container}>
                    <StatusBar />
                    <Row style={styleCss.NaveBar}>
                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate("CustomSideBar")} style={styleCss.menu_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Menu-white.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col>
                            <TouchableOpacity onPress={() => navigate("Home")} style={styleCss.back_arrow}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Back-Arrow-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col style={styleCss.name_col}>
                            <Text style={styleCss.NaveText}>{t("QR Code")}</Text>
                        </Col>

                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Workouts')} style={styleCss.workout_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Workout-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>
                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Message')} style={styleCss.message_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Message-white.png')}
                                />
                            </TouchableOpacity>
                        </Col>
                    </Row>
                     
                        <KeyboardAvoidingView>
                            <ScrollView
                                refreshControl={
                                    <RefreshControl
                                        colors={["#30afb5"]}
                                        refreshing={loading}
                                        onRefresh={this.onRefresh.bind(this)}
                                    />
                                }>
                                <Row style={styleCss.qr_bika}>
                                    <Col style={styleCss.qr_bika}>
                                        <QRCode
                                            value={[{ data: this.state.memberId }]}
                                            size={300}
                                            bgColor='black'
                                            fgColor='white'
                                        />
                                    </Col>
                                </Row>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    
                </View>
            );
        } else {
            return (
                <View style={styleCss.container}>
                    <StatusBar />
                    <Row style={styleCss.NaveBar}>
                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate("CustomSideBar")} style={styleCss.menu_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Menu-white.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col>
                            <TouchableOpacity onPress={() => navigate("Home")} style={styleCss.back_arrow}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Back-Arrow-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col style={styleCss.name_col}>
                            <Text style={styleCss.NaveText}>{t("View Profile")}</Text>
                        </Col>

                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Workouts')} style={styleCss.workout_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Workout-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>
                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Message')} style={styleCss.message_col}>
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

export default connect(mapStateToProps, mapDispatchToProps)(Account);