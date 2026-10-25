import React from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { Col, Row } from 'react-native-easy-grid';
import { useNavigation } from '@react-navigation/native';
import { useNavigationEvents } from '../../../util/navigation-hooks';
import { t } from '../../../../locals';
import MemberTabs from './MemberTabs';
import styleCss from '../../../style';

function MemberArea() {
    const navigation = useNavigation();

    useNavigationEvents({
        onWillFocus: () => {
            // Add any focus logic here if needed
        },
        onWillBlur: () => {
            // Add any blur logic here if needed
        }
    });

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
                    <Text style={styleCss.NaveText}>{t("View Member")}</Text>
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
            <MemberTabs />
        </View>
    );
}

export default MemberArea;