import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Image,
    ScrollView,
} from 'react-native';
import { Col, Row } from "react-native-easy-grid";
import { useNavigation } from '@react-navigation/native';
import { Calendar } from "react-native-calendars";
import { useNavigationEvents } from '../../../util/navigation-hooks';
import { connect } from "react-redux";
import styleCss from '../../../style';
import { t } from '../../../../locals';

function StaffDashboard(props) {
    const navigation = useNavigation();
    const [state, setState] = useState({
        selected: undefined,
        currentDate: new Date(),
        loader: false,
        dataSource: [],
    });

    const onFocus = useCallback(() => {
        fetchDashboardData();
    }, []);

    useNavigationEvents({
        onWillFocus: onFocus
    });

    const fetchDashboardData = async () => {
        setState(prev => ({...prev, loader: true}));
        try {
            // Your existing dashboard data fetching logic here
            setState(prev => ({
                ...prev,
                loader: false,
            }));
        } catch (error) {
            console.error(error);
            setState(prev => ({...prev, loader: false}));
        }
    };

    const onDayPress = (day) => {
        setState(prev => ({
            ...prev,
            selected: day.dateString
        }));
    };

    return (
        <View style={styleCss.container}>
            <StatusBar />
            <Row style={styleCss.NaveBar}>
                <Col>
                    <TouchableOpacity onPress={() => navigation.navigate("StaffCustomSideBar")} style={styleCss.menu_col}>
                        <Image style={styleCss.Naveicon}
                            source={require('../../../images/Menu-white.png')}
                        />
                    </TouchableOpacity>
                </Col>

                <Col>
                    <TouchableOpacity onPress={() => navigation.navigate("staffDashboard")} style={styleCss.back_arrow}>
                        <Image style={styleCss.Naveicon}
                            source={require('../../../images/Back-Arrow-White.png')}
                        />
                    </TouchableOpacity>
                </Col>

                <Col style={styleCss.name_col}>
                    <Text style={styleCss.NaveText}>{t("Dashboard")}</Text>
                </Col>

                <Col>
                    <TouchableOpacity onPress={() => navigation.navigate('Addworkout')} style={styleCss.workout_col}>
                        <Image style={styleCss.Naveicon}
                            source={require('../../../images/Workout-White.png')}
                        />
                    </TouchableOpacity>
                </Col>
                <Col>
                    <TouchableOpacity onPress={() => navigation.navigate('StaffMessage')} style={styleCss.message_col}>
                        <Image style={styleCss.Naveicon}
                            source={require('../../../images/Message-white.png')}
                        />
                    </TouchableOpacity>
                </Col>
            </Row>

            <ScrollView>
                <Calendar
                    onDayPress={onDayPress}
                    style={styleCss.calendar}
                    hideExtraDays
                    markedDates={{
                        [state.selected]: {
                            selected: true,
                            selectedColor: '#30afb5'
                        }
                    }}
                    theme={{
                        selectedDayBackgroundColor: '#30afb5',
                        todayTextColor: '#30afb5',
                        arrowColor: '#30afb5',
                    }}
                />

                {/* Your existing dashboard content */}
            </ScrollView>
        </View>
    );
}

const mapStateToProps = (state) => {
    return {
        // Use staffDashboard loading instead of staff.loading
        loading: state.staffDashboard?.loading || false,
        userData: state.auth?.userData || null,
    };
};

const mapDispatchToProps = {
    // Add your dispatch actions here
};

export default connect(mapStateToProps, mapDispatchToProps)(StaffDashboard);