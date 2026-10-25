import React, { Component } from 'react';
import {
    KeyboardAvoidingView,
    BackHandler,
    ActivityIndicator,
    RefreshControl,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Platform,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
/**
 * @param {Object} fields
 * @returns {Object|null} 
 */
function validateFields(fields) {
  const errors = {};
  if (!fields.Date) {
    errors.Date = "^" + t("Date") + " " + t("is required");
  }
  return Object.keys(errors).length ? errors : null;
}
import { Col, Row } from 'react-native-easy-grid';
import { Calendar } from 'react-native-calendars';
import { connect } from "react-redux";
import { add_measurement, view_measurement, loadingStart } from "../../redux/actions/measurement";
import moment from 'moment';
import { t } from '../../../../locals';
import styleCss from '../../../style.js';

const today = moment().format('YYYY-MM-DD');

class AddMeasurement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: today,  // Auto-select today's date
            date: '',
            dataSource: [],
            Weight: '',
            Waist: '',
            Arm: '',
            Leg: '',
            Chest: '',
            Hips: '',
            Calf: '',
            Thigh: '',
            Glutes: '',
        };
        this.onDayPress = this.onDayPress.bind(this);
        this.addMeasurement = this.addMeasurement.bind(this);
        this.onRefresh = this.onRefresh.bind(this);
        this._handleBackButtonClick = this._handleBackButtonClick.bind(this);
    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this._handleBackButtonClick);
    }

    componentWillUnmount() {
        if (this.backHandler) {
            this.backHandler.remove();
        }
    }

    _handleBackButtonClick = () => {
        this.props.navigation.navigate('Dashboard');
        return true;
    }

    async onDayPress(date) {
        this.setState({
            selectedDate: date.dateString,
        });
    }

    async addMeasurement() {
        var constraints = {
            Date: {
                presence: {
                    allowEmpty: false,
                    message: "^" + t("Date") + " " + t("is required")
                },
            },
      
        };

        const result = validateFields({
            Date: this.state.selectedDate,
            Weight: this.state.Weight,
            Waist: this.state.Waist,
            Arm: this.state.Arm,
            Leg: this.state.Leg,
            Chest: this.state.Chest,
            Hips: this.state.Hips,
            Calf: this.state.Calf,
            Thigh: this.state.Thigh,
            Glutes: this.state.Glutes,
        });

        if (result) {
            if (result.Date) {
                this.dropdown.alertWithType('warn', 'warning', result.Date);
                return false;
            }

            if (result.Weight) {
                this.dropdown.alertWithType('error', 'Error', result.Weight);
                return false;
            }
            if (result.Waist) {
                this.dropdown.alertWithType('error', 'Error', result.Waist);
                return false;
            }
            if (result.Arm) {
                this.dropdown.alertWithType('error', 'Error', result.Arm);
                return false;
            }
            if (result.Leg) {
                this.dropdown.alertWithType('error', 'Error', result.Leg);
                return false;
            }
            if (result.Chest) {
                this.dropdown.alertWithType('error', 'Error', result.Chest);
                return false;
            }
            if (result.Hips) {
                this.dropdown.alertWithType('error', 'Error', result.Hips);
                return false;
            }
            if (result.Calf) {
                this.dropdown.alertWithType('error', 'Error', result.Calf);
                return false;
            }
            if (result.Thigh) {
                this.dropdown.alertWithType('error', 'Error', result.Thigh);
                return false;
            }
            if (result.Glutes) {
                this.dropdown.alertWithType('error', 'Error', result.Glutes);
                return false;
            }
        }

        if (!result) {
            const { add_measurement, loadingStart } = this.props;
            loadingStart();
            const Id = await SecureStore.getItemAsync("id");
            const Token = await SecureStore.getItemAsync("access_token");
            var measurementData = {
                current_user_id: Id,
                member_id: Id,
                access_token: Token,
                Weight: this.state.Weight,
                Waist: this.state.Waist,
                Arm: this.state.Arm,
                Leg: this.state.Leg,
                Chest: this.state.Chest,
                Hips: this.state.Hips,
                Calf: this.state.Calf,
                Thigh: this.state.Thigh,
                Glutes: this.state.Glutes,
                result_date: this.state.selectedDate,
            }
            add_measurement(measurementData);
            this.setState({
                selectedDate: today,  // Reset to today's date after saving
                Weight: '',
                Waist: '',
                Arm: '',
                Leg: '',
                Chest: '',
                Hips: '',
                Calf: '',
                Thigh: '',
                Glutes: '',
            });
        }
    }

    onRefresh() {
        this.setState({ selectedDate: today });
    }

    render() {
        const { Weight, Waist, Arm, Leg, Chest, Hips, Calf, Thigh, Glutes } = this.state;
        const { loading } = this.props;
        const mark = {
            [this.state.selectedDate]: {
                customStyles: {
                    container: {
                        backgroundColor: '#30afb5',
                        borderWidth: 2,
                        borderColor: '#30afb5',
                    },
                    text: {
                        color: '#fff',
                    }
                }
            },
        };

        if (!loading) {
            return (
                <View style={styleCss.container}>
                    <StatusBar />
                    {(Platform.OS == "ios") ? (
                        <KeyboardAvoidingView style={styleCss.measurement_keyboard} behavior="padding" enabled keyboardVerticalOffset={100}>
                            <ScrollView>
                                <Row style={styleCss.measurement_header_text_row}>
                                    <Text style={styleCss.measurement_header_text}>{t("Select Date")}:</Text>
                                </Row>
                                <Col>
                                    <Calendar
                                        monthFormat={'MMMM, yyyy'}
                                        markingType={'custom'}
                                        maxDate={today}
                                        date={this.state.date}
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
                                            textDayFontFamily: 'Cairo-Medium',
                                            textMonthFontFamily: 'Cairo-SemiBold',
                                            textDayHeaderFontFamily: 'Cairo-Medium',
                                            textDayFontSize: 16,
                                            textMonthFontSize: 16,
                                            textDayHeaderFontSize: 16
                                        }}
                                    />
                                    <Col style={styleCss.measurement_field_col}>
                                        <Row style={styleCss.measurement}>
                                            <Col>
                                                <Text style={styleCss.measurement_header_text}>{t("Add Measurement")}</Text>
                                            </Col>
                                        </Row>
                                        <Row style={styleCss.measurement_container}>
                                            <Col>
                                                <Row style={styleCss.measurement_field_container}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Weight")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Weight}
                                                            placeholder={t('Kg')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Weight) => this.setState({ Weight })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col style={styleCss.measurement_container_col}>
                                                <Row style={styleCss.measurement_field_container}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Waist")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Waist}
                                                            placeholder={t('Inches')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Waist) => this.setState({ Waist })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                        <Row style={styleCss.measurement_container}>
                                            <Col>
                                                <Row style={styleCss.measurement_field_container}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Arm")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Arm}
                                                            placeholder={t('Inches')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Arm) => this.setState({ Arm })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col style={styleCss.measurement_container_col}>
                                                <Row style={styleCss.measurement_field_container}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Leg")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Leg}
                                                            placeholder={t('Inches')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Leg) => this.setState({ Leg })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>

                                        <Row style={styleCss.measurement_container}>
                                            <Col>
                                                <Row style={styleCss.measurement_field_container}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Chest")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Chest}
                                                            placeholder={t('Inches')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Chest) => this.setState({ Chest })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col style={styleCss.measurement_container_col}>
                                                <Row style={styleCss.measurement_field_container}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Hips")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Hips}
                                                            placeholder={t('Inches')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Hips) => this.setState({ Hips })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>

                                        <Row style={styleCss.measurement_container}>
                                            <Col>
                                                <Row style={styleCss.measurement_field_container}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Calf")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Calf}
                                                            placeholder={t('Inches')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Calf) => this.setState({ Calf })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col style={styleCss.measurement_container_col}>
                                                <Row style={styleCss.measurement_field_container}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Thigh")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Thigh}
                                                            placeholder={t('Inches')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Thigh) => this.setState({ Thigh })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>

                                        <Row style={{ height: 40, marginBottom: '8%' }}>
                                            <Col>
                                                <Row style={{ borderWidth: 1, borderRadius: 30, width: "45%", backgroundColor: '#fcfbfb', borderColor: '#ecebeb' }}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Glutes")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Glutes}
                                                            placeholder={t('Inches')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Glutes) => this.setState({ Glutes })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>

                                        <TouchableOpacity style={styleCss.measurement_btn} onPress={this.addMeasurement}>
                                            <Row style={styleCss.measurement_btn_container}>
                                                <Text style={styleCss.measurement_btn_text}>{t("Save")}</Text>
                                            </Row>
                                        </TouchableOpacity>
                                    </Col>
                                </Col>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    ) : (
                        <KeyboardAvoidingView>
                            <ScrollView>
                                <Row style={styleCss.measurement_header_text_row}>
                                    <Text style={styleCss.measurement_header_text}>{t("Select Date")}:</Text>
                                </Row>
                                <Col>
                                    <Calendar
                                        monthFormat={'MMMM, yyyy'}
                                        markingType={'custom'}
                                        maxDate={today}
                                        date={this.state.date}
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
                                            textDayFontFamily: 'Cairo-Medium',
                                            textMonthFontFamily: 'Cairo-SemiBold',
                                            textDayHeaderFontFamily: 'Cairo-Medium',
                                            textDayFontSize: 16,
                                            textMonthFontSize: 16,
                                            textDayHeaderFontSize: 16
                                        }}
                                    />
                                    <Col style={styleCss.measurement_field_col}>
                                        <Row style={styleCss.measurement}>
                                            <Col>
                                                <Text style={styleCss.measurement_header_text}>{t("Add Measurement")}</Text>
                                            </Col>
                                        </Row>
                                        <Row style={styleCss.measurement_container}>
                                            <Col>
                                                <Row style={styleCss.measurement_field_container}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Weight")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Weight}
                                                            placeholder={t('Kg')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Weight) => this.setState({ Weight })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col style={styleCss.measurement_container_col}>
                                                <Row style={styleCss.measurement_field_container}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Waist")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Waist}
                                                            placeholder={t('Inches')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Waist) => this.setState({ Waist })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                        <Row style={styleCss.measurement_container}>
                                            <Col>
                                                <Row style={styleCss.measurement_field_container}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Arm")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Arm}
                                                            placeholder={t('Inches')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Arm) => this.setState({ Arm })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col style={styleCss.measurement_container_col}>
                                                <Row style={styleCss.measurement_field_container}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Leg")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Leg}
                                                            placeholder={t('Inches')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Leg) => this.setState({ Leg })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>

                                        <Row style={styleCss.measurement_container}>
                                            <Col>
                                                <Row style={styleCss.measurement_field_container}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Chest")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Chest}
                                                            placeholder={t('Inches')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Chest) => this.setState({ Chest })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col style={styleCss.measurement_container_col}>
                                                <Row style={styleCss.measurement_field_container}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Hips")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Hips}
                                                            placeholder={t('Inches')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Hips) => this.setState({ Hips })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>

                                        <Row style={styleCss.measurement_container}>
                                            <Col>
                                                <Row style={styleCss.measurement_field_container}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Calf")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Calf}
                                                            placeholder={t('Inches')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Calf) => this.setState({ Calf })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col style={styleCss.measurement_container_col}>
                                                <Row style={styleCss.measurement_field_container}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Thigh")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Thigh}
                                                            placeholder={t('Inches')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Thigh) => this.setState({ Thigh })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>

                                        <Row style={{ height: 40, marginBottom: '8%' }}>
                                            <Col>
                                                <Row style={{ borderWidth: 1, borderRadius: 30, width: "45%", backgroundColor: '#fcfbfb', borderColor: '#ecebeb' }}>
                                                    <Col style={styleCss.measurement_sub_field_container}>
                                                        <Text style={styleCss.measurement_field_text}>{t("Glutes")}</Text>
                                                    </Col>
                                                    <Col style={styleCss.measurement_sub_field_container_two}>
                                                        <TextInput
                                                            value={Glutes}
                                                            placeholder={t('Inches')}
                                                            keyboardType="numeric"
                                                            style={styleCss.measurement_field_input} 
                                                            maxLength={3} 
                                                            onChangeText={(Glutes) => this.setState({ Glutes })}>
                                                        </TextInput>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>

                                        <TouchableOpacity style={styleCss.measurement_btn} onPress={this.addMeasurement}>
                                            <Row style={styleCss.measurement_btn_container}>
                                                <Text style={styleCss.measurement_btn_text}>{t("Save")}</Text>
                                            </Row>
                                        </TouchableOpacity>
                                    </Col>
                                </Col>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    )}
                </View>
            );
        } else {
            return (
                <ActivityIndicator
                    style={styleCss.loading}
                    size="large"
                    color="#30afb5"
                />
            );
        }
    }
}

const mapStateToProps = (state) => {
    return {
        loading: state.measurement.loading,
    };
};

const mapDispatchToProps = {
    add_measurement,
    view_measurement,
    loadingStart
};

export default connect(mapStateToProps, mapDispatchToProps)(AddMeasurement);