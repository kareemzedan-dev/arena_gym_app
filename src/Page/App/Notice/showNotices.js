import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Image,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { Col, Row } from 'react-native-easy-grid';
import { useNavigation } from '@react-navigation/native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { useNavigationEvents } from '../../../util/navigation-hooks';
import { connect } from "react-redux";
import { t } from '../../../../locals';
import styleCss from '../../../style';

function ShowNotices(props) {
    const navigation = useNavigation();
    const [state, setState] = useState({
        loader: false,
        dataSource: [],
        collapsed: [],
    });

    const onFocus = useCallback(() => {
        fetchNotices();
    }, []);

    useNavigationEvents({
        onWillFocus: onFocus
    });

    const fetchNotices = async () => {
        setState(prev => ({...prev, loader: true}));
        try {
            // Your existing notice fetching logic here
            setState(prev => ({
                ...prev,
                loader: false,
            }));
        } catch (error) {
            console.error(error);
            setState(prev => ({...prev, loader: false}));
        }
    };

    const toggleExpanded = (index) => {
        setState(prev => {
            const newCollapsed = [...prev.collapsed];
            newCollapsed[index] = !newCollapsed[index];
            return {
                ...prev,
                collapsed: newCollapsed
            };
        });
    };

    if (!props.loading) {
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
                        <Text style={styleCss.NaveText}>{t("Notices")}</Text>
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

                <ScrollView>
                    {/* Your existing notices list rendering logic */}
                </ScrollView>
            </View>
        );
    } else {
        return (
            <View style={styleCss.container}>
                <StatusBar />
                <Row style={styleCss.NaveBar}>
                    {/* Same navigation bar as above */}
                </Row>
                <ActivityIndicator
                    style={styleCss.loading}
                    size="large"
                    color="#102b46"
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        loading: state.notice.loading,
    };
};

const mapDispatchToProps = {
    // Add your dispatch actions here
};

export default connect(mapStateToProps, mapDispatchToProps)(ShowNotices);
