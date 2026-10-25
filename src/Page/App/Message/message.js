import React, { useEffect, useCallback, useRef } from 'react';
import {
    BackHandler,
    Text,
    View,
    Image,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { Col, Row } from 'react-native-easy-grid';
import { useNavigation } from '@react-navigation/native';
import { useNavigationEvents } from '../../../util/navigation-hooks';
import MessageTab from './messageTab';
import { t } from '../../../../locals';
import styleCss from '../../../style.js';

function Message() {
    const navigation = useNavigation();
    const backHandlerRef = useRef(null);

    const handleBackButton = useCallback(() => {
        navigation.navigate('Dashboard');
        return true;
    }, [navigation]);

    useNavigationEvents({
        onWillFocus: () => {
            backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
        },
        onWillBlur: () => {
            if (backHandlerRef.current) {
                backHandlerRef.current.remove();
            }
        }
    });

    const renderHeader = () => (
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
                <Text style={styleCss.NaveText}>{t("Message")}</Text>
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
    );

    return (
        <View style={styleCss.container}>
            <StatusBar />
            {renderHeader()}
            <MessageTab />
        </View>
    );
}

export default Message;