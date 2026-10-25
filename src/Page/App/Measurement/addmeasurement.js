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
import MeasurementTab from './measurementTab';
import { t } from '../../../../locals';
import styleCss from '../../../style';

// HOC to provide navigation focus events for class components
function withFocusEffect(Component) {
    return function WrappedComponent(props) {
        useFocusEffect(
            React.useCallback(() => {
                const onBackPress = () => {
                    props.navigation.navigate('Dashboard');
                    return true;
                };

                const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

                return () => subscription.remove();
            }, [props.navigation])
        );

        return <Component {...props} />;
    };
}

class StaffMemberList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loader: false,
            dataSource: [],
            measurementUnits: {
                'Weight': 'gmgt_weight_unit',
                'Waist': 'gmgt_waist_unit',
                'Arm': 'gmgt_arm_unit',
                'Leg': 'gmgt_leg_unit',
                'Chest': 'gmgt_chest_unit',
                'Hips': 'gmgt_hips_unit',
                'Calf': 'gmgt_calf_unit',
                'Thigh': 'gmgt_thigh_unit',
                'Glutes': 'gmgt_glutes_unit'
            }
        };
    }

    static navigationOptions = ({ navigation }) => {
        return {
            headerShown: false,
        };
    };

    toggleDrawer = () => {
        this.props.navigation.toggleDrawer();
    };
    
    onRefresh() {
        this.setState({ dataSource: [] });
        this.StaffMemberList();
    }

    render() {
        const { loader, measurementUnits } = this.state;
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
                            <Text style={styleCss.NaveText}>{t("Measurement")}</Text>
                        </Col>
                        
                        <Col>
                            <TouchableOpacity onPress={()=> this.props.navigation.navigate('Workouts')} style={styleCss.workout_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Workout-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>
                        <Col>
                            <TouchableOpacity onPress={()=> this.props.navigation.navigate('Message')} style={styleCss.message_col}>
                            <Image style={styleCss.Naveicon}
                                source={require('../../../images/Message-white.png')}
                            />
                            </TouchableOpacity>
                        </Col>
                    </Row>
                    <MeasurementTab measurementUnits={measurementUnits} />
                </View>
            );
        } else {
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
                            <Text style={styleCss.NaveText}>{t("Measurement")}</Text>
                        </Col>
                        
                        <Col>
                            <TouchableOpacity onPress={()=> this.props.navigation.navigate('Workouts')} style={styleCss.workout_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Workout-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>
                        <Col>
                            <TouchableOpacity onPress={()=> this.props.navigation.navigate('Message')} style={styleCss.message_col}>
                            <Image style={styleCss.Naveicon}
                                source={require('../../../images/Message-white.png')}
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

export default withFocusEffect(StaffMemberList);