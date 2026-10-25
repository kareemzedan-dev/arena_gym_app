import React, { Component } from 'react';
import {
    BackHandler,
    ActivityIndicator,
    Text,
    View,
    Image,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { Col, Row } from 'react-native-easy-grid';
import { useFocusEffect } from '@react-navigation/native';
import ScheduleTebs from './ClassScheduleTabs';
import { t } from '../../../../locals';
import styleCss from '../../../style';

// HOC to provide navigation focus events to class component
function withNavigationFocus(Component) {
    return function WrappedComponent(props) {
        useFocusEffect(
            React.useCallback(() => {
                const onBackPress = () => {
                    props.navigation.navigate('Home');
                    return true;
                };

                const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

                return () => subscription.remove();
            }, [props.navigation])
        );

        return <Component {...props} />;
    };
}

class Schedule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loader: false,
        };
    }

    toggleDrawer = () => {
        this.props.navigation.toggleDrawer();
    };

    render() {
        const { loader } = this.state;
        const { navigate } = this.props.navigation;
        
        if (!loader) {
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
                            <Text style={styleCss.NaveText}>{t("Class Schedule")}</Text>
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
                    <ScheduleTebs />
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

export default withNavigationFocus(Schedule);