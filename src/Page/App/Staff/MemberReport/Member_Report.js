import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Image,
    ScrollView,
    Dimensions
} from 'react-native';
import { Col, Row } from "react-native-easy-grid";
import { useNavigation } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { useNavigationEvents } from '../../../../util/navigation-hooks';
import { connect } from "react-redux";
import { t } from '../../../../../locals';
import styleCss from '../../../../style';

const screenWidth = Dimensions.get('window').width;

function MemberReport(props) {
    const navigation = useNavigation();
    const [state, setState] = useState({
        loader: false,
        membershipData: [],
        chartData: {
            labels: [],
            datasets: [{
                data: []
            }]
        }
    });

    const onFocus = useCallback(() => {
        fetchReportData();
    }, []);

    useNavigationEvents({
        onWillFocus: onFocus
    });

    const fetchReportData = async () => {
        setState(prev => ({...prev, loader: true}));
        try {
            // Your existing data fetching logic here
            
            // Example chart data
            const chartData = {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [{
                    data: [20, 45, 28, 80, 99, 43]
                }]
            };

            setState(prev => ({
                ...prev,
                loader: false,
                chartData
            }));
        } catch (error) {
            console.error(error);
            setState(prev => ({...prev, loader: false}));
        }
    };

    const chartConfig = {
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        color: (opacity = 1) => `rgba(48, 175, 181, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5
    };

    return (
        <View style={styleCss.container}>
            <StatusBar />
            <Row style={styleCss.NaveBar}>
                <Col>
                    <TouchableOpacity onPress={() => navigation.navigate("StaffCustomSideBar")} style={styleCss.menu_col}>
                        <Image style={styleCss.Naveicon}
                            source={require('../../../../images/Menu-white.png')}
                        />
                    </TouchableOpacity>
                </Col>

                <Col>
                    <TouchableOpacity onPress={() => navigation.navigate("staffDashboard")} style={styleCss.back_arrow}>
                        <Image style={styleCss.Naveicon}
                            source={require('../../../../images/Back-Arrow-White.png')}
                        />
                    </TouchableOpacity>
                </Col>

                <Col style={styleCss.name_col}>
                    <Text style={styleCss.NaveText}>{t("Member Report")}</Text>
                </Col>

                <Col>
                    <TouchableOpacity onPress={() => navigation.navigate('Addworkout')} style={styleCss.workout_col}>
                        <Image style={styleCss.Naveicon}
                            source={require('../../../../images/Workout-White.png')}
                        />
                    </TouchableOpacity>
                </Col>
                <Col>
                    <TouchableOpacity onPress={() => navigation.navigate('StaffMessage')} style={styleCss.message_col}>
                        <Image style={styleCss.Naveicon}
                            source={require('../../../../images/Message-white.png')}
                        />
                    </TouchableOpacity>
                </Col>
            </Row>

            <ScrollView>
                <View style={styleCss.chartContainer}>
                    <BarChart
                        data={state.chartData}
                        width={screenWidth - 20}
                        height={220}
                        chartConfig={chartConfig}
                        style={styleCss.chart}
                    />
                </View>
                {/* Your existing report content */}
            </ScrollView>
        </View>
    );
}

const mapStateToProps = (state) => {
    return {
        loading: state.report?.loading || false,
    };
};

const mapDispatchToProps = {
    // Add your dispatch actions here
};

export default connect(mapStateToProps, mapDispatchToProps)(MemberReport);