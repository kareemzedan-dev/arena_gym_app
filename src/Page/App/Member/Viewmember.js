import React, { useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Image,
} from 'react-native';
import { Col, Row } from 'react-native-easy-grid';
import { useNavigation } from '@react-navigation/native';
import { useNavigationEvents } from '../../../util/navigation-hooks';
import ViewMemberTab from './MemberTabs';
import styleCss from '../../../style';
import { t } from '../../../../locals';

function ViewMember() {
    const navigation = useNavigation();

    const onFocus = useCallback(() => {
        // Add any focus-related logic here
    }, []);

    const onBlur = useCallback(() => {
        // Add any blur-related logic here
    }, []);

    useNavigationEvents({
        onWillFocus: onFocus,
        onWillBlur: onBlur
    });

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
                    <Text style={styleCss.NaveText}>{t("View Member")}</Text>
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
            <ViewMemberTab />
        </View>
    );
}

export default ViewMember;