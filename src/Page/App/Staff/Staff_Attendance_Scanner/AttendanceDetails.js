import React, { Component } from "react";
import {
    Platform,
    View,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    FlatList,
} from "react-native";
import * as SecureStore from 'expo-secure-store';
import { RadioButton } from 'react-native-paper';
import normalize from 'react-native-normalize';
import { Col, Row } from 'react-native-easy-grid';
import { Calendar } from 'react-native-calendars';
import Collapsible from 'react-native-collapsible';
import moment from 'moment';
/**
 * Simple attendance validation utility.
 * @param {Object} fields - The fields to validate.
 * @returns {Object|null} - Error object or null if valid.
 */
function validateFields(fields) {
  const errors = {};
  if (!fields.classname) {
    errors.classname = "^" + t("Class name is required");
  }
  if (!fields.Date) {
    errors.Date = "is required.";
  }
  if (!fields.attendancestatus) {
    errors.attendancestatus = "is required";
  }
  return Object.keys(errors).length ? errors : null;
}
import { t } from '../../../../../locals';
import { connect } from "react-redux";
import { fetchMemberClasslist, loadingStart, takeMemberAttendance, memberDataList } from "../../../redux/actions/attendance";
import styleCss from '../../../../style'

const today = moment().format("YYYY-MM-DD");
var date = moment().format("YYYY-MM-DD")
class Attendances extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loader: false,
            date: '',
            selectedDate: date,
            collapsed: false,
            Status: '',
            selecttitle: t('Select Class'),
            attendancestatus: 'Present',
            Member_ID: '',
            Class_ID: '',
        };
        // this.onDayPress = this.onDayPress.bind(this);
    }
    toggleDrawer = ({ navigation }) => {
        this.props.navigation.toggleDrawer();
    };
    static navigationOptions = ({ navigation }) => {
        return {
            headerShown: false,
        };
    };
    componentDidMount() {
        const MemberID = this.props.navigation.getParam('memberidkey',);
        this.setState({ Member_ID: MemberID, });
        this.memberName();
        this.memberClass();
    }

    onRefresh() {
        this.setState({ selecttitle: 'Select Class', });
        this.memberName();
        this.memberClass();
    }

    async memberClass() {
        const { fetchMemberClasslist, loadingStart } = this.props;
        loadingStart();

        const MemberID = this.props.navigation.getParam('memberidkey',);
        const listdata = {
            "member_id": MemberID,
        };
        fetchMemberClasslist(listdata)
    }

    async memberName() {
        const { memberDataList, loadingStart } = this.props;
        loadingStart();

        const MemberID = this.props.navigation.getParam('memberidkey');
        const userData = {
            "member_id": MemberID,
        };
        memberDataList(userData)
    }

    async take_attendance() {
        var constraints = {
            classname: {
                presence: {
                    allowEmpty: false,
                    message: "^" + t("Class name is required")
                },
            },

            Date: {
                presence: {
                    allowEmpty: false,
                    message: "is required."
                },
            },
            attendancestatus: {
                presence: {
                    allowEmpty: false,
                    message: "is required"
                },
            },
        };

        const result = validateFields({
            classname: this.state.Class_ID,
            Date: this.state.selectedDate,
            attendancestatus: this.state.attendancestatus,
        });


        if (result) {
            if (result.classname) {
                this.dropdown.alertWithType('error', t('Error'), result.classname);
                this.setState({ visible: true });
                return false;
            }
            if (result.Date) {
                this.dropdown.alertWithType('error', t('Error'), result.Date);
                this.setState({ visible: true });
                return false;
            }
            if (result.attendancestatus) {
                this.dropdown.alertWithType('error', t('Error'), result.attendancestatus);
                this.setState({ visible: true });
                return false;
            }
        }
        if (!result) {
            this.setState({ validationError: '' })
            const { takeMemberAttendance, loadingStart } = this.props;
            loadingStart();

            const Id = await SecureStore.getItemAsync("id");
            const Token = await SecureStore.getItemAsync("access_token");
            const MemberID = this.props.navigation.getParam('memberidkey',);

            const attendanceData = {
                current_user_id: Id,
                date: moment(this.state.selectedDate).format('YYYY-MM-DD'),
                member_id: MemberID,
                status: this.state.attendancestatus,
                class: this.state.Class_ID,
                access_token: Token,
            }
            takeMemberAttendance(attendanceData)

        }

    }

    async onDayPress(date) {
        this.setState({
            selectedDate: date.dateString
        });
    }
    renderItem = ({ item }) => {
        return (
            <View style={styleCss.container}>
                <View style={{ backgroundColor: '#30afb5' }}>
                    <View style={{ borderBottomWidth: 2, marginLeft: '5%', marginRight: '5%' }}>
                        <TouchableOpacity style={{ width: "100%" }} onPress={() => { this.setState({ Class_ID: item.class_id, selecttitle: item.class_name, collapsed: false, }); }}>
                            <Text numberOfLines={1} style={{ fontSize: 15, fontFamily: 'Cairo-Regular', color: '#ffffff', paddingLeft: '5%', }}>{item.class_name}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };


    render() {
        const mark = {

            [this.state.selectedDate]: {
                customStyles: {
                    container: {
                        backgroundColor: '#30afb5',
                        borderWidth: 2,
                        borderColor: '#fff'
                    },
                    text: {
                        color: '#fff',
                    }
                }
            },

        };
        const { collapsed, attendancestatus } = this.state;
        const { navigate } = this.props.navigation;
        const { memberClassData, loading, memberData } = this.props
        if (!loading) {
            return (
                <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                colors={["#30afb5"]}
                                refreshing={loading}
                                onRefresh={this.onRefresh.bind(this)}
                            />
                        }
                    >
                        <Row style={styleCss.NaveBar}>
                            <Col>
                                <TouchableOpacity style={styleCss.menu_col} onPress={() => this.props.navigation.navigate("StaffCustomSideBar")}>
                                    <Image
                                        style={styleCss.Naveicon}
                                        source={require("../../../../images/Menu-white.png")}
                                    />
                                </TouchableOpacity>
                            </Col>

                            <Col>
                                <TouchableOpacity onPress={() => navigate("Attendance_Scanner")} style={styleCss.back_arrow}>
                                    <Image style={styleCss.Naveicon}
                                        source={require('../../../../images/Back-Arrow-White.png')}
                                    />
                                </TouchableOpacity>
                            </Col>

                            <Col
                                style={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: normalize(200),
                                    paddingLeft: normalize(0),
                                }}
                            >
                                <Text style={styleCss.NaveText}>{t("Attendance")}</Text>
                            </Col>

                            <Col>
                                <TouchableOpacity
                                    onPress={() => this.props.navigation.navigate("Addworkout")}
                                    style={{
                                        backgroundColor: "",
                                        height: normalize(50),
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: normalize(50),
                                    }}
                                >
                                    <Image
                                        style={styleCss.Naveicon}
                                        source={require("../../../../images/Workout-White.png")}
                                    />
                                </TouchableOpacity>
                            </Col>

                            <Col>
                                <TouchableOpacity
                                    onPress={() => this.props.navigation.navigate("Message")}
                                    style={{
                                        backgroundColor: "",
                                        height: normalize(50),
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: normalize(50),
                                    }}
                                >
                                    <Image
                                        style={styleCss.Naveicon}
                                        source={require("../../../../images/Message-white.png")}
                                    />
                                </TouchableOpacity>
                            </Col>
                        </Row>
                        {memberData.membership_status == "Continue" ? (
                            <View style={{ flex: 1, }}>
                                <Row style={{ height: normalize(50), alignItems: 'center', marginRight: '5%', marginLeft: '5%', }}>
                                    <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: '#30afb5' }}>{memberData.member_name}</Text>
                                </Row>
                                <View style={{ borderWidth: 1, borderColor: '#30afb5', borderRadius: 5, marginLeft: '5%', marginRight: '5%', marginBottom: '5%' }}>
                                    <TouchableOpacity onPress={() => this.setState({ collapsed: !this.state.collapsed })}>
                                        <Row style={{ paddingLeft: '5%', height: 45, backgroundColor: '#30afb5', justifyContent: 'center', alignItems: 'center' }}>
                                            <Col style={{ width: '90%' }}>
                                                <Text style={{
                                                    fontSize: 18,
                                                    fontFamily: 'Cairo-Bold',
                                                    color: '#ffffff',
                                                }}
                                                numberOfLines={1}
                                                >{this.state.selecttitle}</Text>
                                            </Col>
                                            <Col style={{ width: '10%' }}>
                                                <Image style={{ height: 20, width: 20 }}
                                                    source={collapsed ?
                                                        require('../../../../images/down-arrow.png') :
                                                        require('../../../../images/right-arrow.png')} />
                                            </Col>
                                        </Row>
                                    </TouchableOpacity>

                                    <Collapsible collapsed={!this.state.collapsed} style={{ backgroundColor: '#30afb5' }}>
                                        <FlatList
                                            data={memberClassData}
                                            renderItem={this.renderItem}
                                            // renderItem={({item}) => <Text> {item.title}</Text>}
                                            keyExtractor={(item) => item.class_id.toString()}
                                            ListEmptyComponent={
                                                <EmptyComponent title={t("Data not available")} style={{ color: 'white' }} />
                                            }
                                        />
                                    </Collapsible>
                                </View>
                                <Calendar
                                    monthFormat={'MMMM, yyyy'}
                                    markingType={'custom'}
                                    date={this.state.date}
                                    maxDate={today}
                                    onDayPress={(date) => { this.onDayPress(date) }}
                                    markedDates={mark}
                                    theme={{
                                        textSectionTitleColor: '#b6c1cd',
                                        textSectionTitleDisabledColor: '#30afb5',
                                        selectedDayTextColor: '#ffffff',
                                        todayTextColor: '#00adf5',
                                        dayTextColor: '#2d4150',
                                        textDisabledColor: '#d9e1e8',
                                        dotColor: '#00adf5',
                                        selectedDotColor: '#ffffff',
                                        arrowColor: '#30afb5',
                                        disabledArrowColor: '#d9e1e8',
                                        monthTextColor: '#30afb5',
                                        indicatorColor: '#30afb5',
                                        // textDayFontFamily: 'monospace',
                                        // textMonthFontFamily: 'monospace',
                                        // textDayHeaderFontFamily: 'monospace',
                                        textDayFontFamily: 'Cairo-Medium',
                                        textMonthFontFamily: 'Cairo-SemiBold',
                                        textDayHeaderFontFamily: 'Cairo-Medium',
                                        textDayFontSize: 16,
                                        textMonthFontSize: 16,
                                        textDayHeaderFontSize: 16
                                    }}
                                />
                                <Row style={{ height: normalize(45), marginTop: normalize(20), }}>
                                    <Col style={styleCss.attendance_details_radio_col}>
                                        <View style={styleCss.attendance_details_radio}>
                                            <RadioButton style={{ borderWidth: Platform.OS === 'ios' ? '#fffff' : '#fffff', uncheckedColor: Platform.OS === 'ios' ? '#fffff' : '#fffff' }}
                                                value="Present"
                                                color='green'
                                                uncheckedColor='green'
                                                status={attendancestatus === 'Present' ? 'checked' : 'unchecked'}
                                                onPress={() => this.setState({ attendancestatus: 'Present' })}
                                            />
                                        </View>
                                    </Col>
                                    <Col style={{ justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 18, fontFamily: 'Cairo-Medium', color: '#30afb5', }}>
                                            {t("Present")}</Text>
                                    </Col>
                                    <Col style={styleCss.attendance_details_radio_col}>
                                        <View style={styleCss.attendance_details_radio}>
                                            <RadioButton style={{ borderWidth: Platform.OS === 'ios' ? '#fffff' : '#fffff', uncheckedColor: Platform.OS === 'ios' ? '#fffff' : '#fffff' }}
                                                value="Absent"
                                                color='red'
                                                uncheckedColor='red'
                                                status={attendancestatus === 'Absent' ? 'checked' : 'unchecked'}
                                                onPress={() => this.setState({ attendancestatus: 'Absent' })}
                                            />
                                        </View>
                                    </Col>
                                    <Col style={{ justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 18, fontFamily: 'Cairo-Medium', color: '#30afb5', paddingRight: '40%', }}>
                                            {t("Absent")}</Text>
                                    </Col>
                                </Row>

                                <TouchableOpacity style={styleCss.attendance_details_btn} onPress={this.take_attendance.bind(this)}>
                                    <Row style={styleCss.attendance_details_btn_container}>
                                        <Text style={styleCss.attendance_details_btn_text}>{t("Submit")}</Text>
                                    </Row>
                                </TouchableOpacity>

                            </View>
                        ) : (
                            <View style={styleCss.emptyContainer}>
                                <Text style={styleCss.attendance_details_membership_expire_text}>{memberData.member_name}</Text>
                                <Text style={styleCss.attendance_details_membership_expire_text}>Membership has been expire</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            );
        } else {
            return (
                <View style={styleCss.container}>
                    <Row style={styleCss.NaveBar}>
                        <Col>
                            <TouchableOpacity style={styleCss.menu_col} onPress={() => this.props.navigation.navigate("StaffCustomSideBar")}>
                                <Image
                                    style={styleCss.Naveicon}
                                    source={require("../../../../images/Menu-white.png")}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col>
                            <TouchableOpacity onPress={() => navigate("Attendance_Scanner")} style={styleCss.back_arrow}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../../images/Back-Arrow-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                                width: normalize(200),
                                paddingLeft: normalize(0),
                            }}
                        >
                            <Text style={styleCss.NaveText}>{t("Attendance")}</Text>
                        </Col>

                        <Col>
                            <TouchableOpacity
                                onPress={() => this.props.navigation.navigate("Addworkout")}
                                style={{
                                    backgroundColor: "",
                                    height: normalize(50),
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: normalize(50),
                                }}
                            >
                                <Image
                                    style={styleCss.Naveicon}
                                    source={require("../../../../images/Workout-White.png")}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col>
                            <TouchableOpacity
                                onPress={() => this.props.navigation.navigate("Message")}
                                style={{
                                    backgroundColor: "",
                                    height: normalize(50),
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: normalize(50),
                                }}
                            >
                                <Image
                                    style={styleCss.Naveicon}
                                    source={require("../../../../images/Message-white.png")}
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
const EmptyComponent = ({ title }) => (
    <View style={styleCss.emptyContainer}>
        <Text style={styleCss.emptyText}>{title}</Text>
    </View>
);

const mapStateToProps = (state) => {
    return {
        memberClassData: state.attendance.memberClassData,
        memberData: state.attendance.memberData,
        loading: state.attendance.loading,
    };
};

const mapDispatchToProps = {
    fetchMemberClasslist,
    takeMemberAttendance,
    memberDataList,
    loadingStart
};

export default connect(mapStateToProps, mapDispatchToProps)(Attendances);