import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Col, Row } from 'react-native-easy-grid';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { staffMemberListAction } from '../../../util/action.js';
import { connect } from 'react-redux';
import WorkoutsTabs from './WorkoutsTabs';
import styleCss from '../../../style.js';
import { t } from '../../../../locals';

function Workouts(props) {
    const navigation = useNavigation();
    const [state, setState] = useState({
        loader: false,
        dataSource: [],
    });

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                setState(prev => ({...prev, loader: true}));
                const data = await staffMemberListAction();
                setState(prev => ({
                    ...prev,
                    loader: false,
                    dataSource: data
                }));
            };

            fetchData();

            // Cleanup
            return () => {
                // Any cleanup code here
            };
        }, [])
    );

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
                    <Text style={styleCss.NaveText}>{t("Workouts")}</Text>
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
            <WorkoutsTabs />
        </View>
    );
}

const mapStateToProps = (state) => {
    return {
        // Remove workout loading dependency to prevent unnecessary re-renders
    };
};

const mapDispatchToProps = {
    // Add dispatch actions if needed
};

export default connect(mapStateToProps, mapDispatchToProps)(Workouts);