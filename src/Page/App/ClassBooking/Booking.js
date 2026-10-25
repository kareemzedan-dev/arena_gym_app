import React, { useEffect } from 'react';
import {
    BackHandler,
    Text,
    View,
    Image,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { Col, Row } from 'react-native-easy-grid';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ClassBookingTabs from './ClassBookingTabs';
import { t } from '../../../../locals';
import styleCss from '../../../style';

export default function Booking() {
    const navigation = useNavigation();

    // Handle back button press
    const handleBackButtonClick = () => {
        navigation.navigate('Dashboard');
        return true; // Prevent default back behavior
    };

    // Handle focus/blur events for back button
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => handleBackButtonClick();
            
            // Add event listener when screen comes into focus
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            
            // Clean up event listener when screen goes out of focus
            return () => subscription?.remove();
        }, [])
    );

    return (
        <View style={styleCss.container}>
            <StatusBar />
            <Row style={styleCss.NaveBar}>
                <Col>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate("CustomSideBar")} 
                        style={styleCss.menu_col}
                    >
                        <Image 
                            style={styleCss.Naveicon}
                            source={require('../../../images/Menu-white.png')}
                        />
                    </TouchableOpacity>
                </Col>

                <Col>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate("Home")} 
                        style={styleCss.back_arrow}
                    >
                        <Image 
                            style={styleCss.Naveicon}
                            source={require('../../../images/Back-Arrow-White.png')}
                        />
                    </TouchableOpacity>
                </Col>

                <Col style={styleCss.name_col}>
                    <Text style={styleCss.NaveText}>{t("Class Booking")}</Text>
                </Col>

                <Col>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Workouts')} 
                        style={styleCss.workout_col}
                    >
                        <Image 
                            style={styleCss.Naveicon}
                            source={require('../../../images/Workout-White.png')}
                        />
                    </TouchableOpacity>
                </Col>
                
                <Col>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Message')} 
                        style={styleCss.message_col}
                    >
                        <Image 
                            style={styleCss.Naveicon}
                            source={require('../../../images/Message-white.png')}
                        />
                    </TouchableOpacity>
                </Col>
            </Row>
            <ClassBookingTabs />
        </View>
    );
}