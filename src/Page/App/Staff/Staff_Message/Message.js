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
import { useNavigationEvents } from '../../../../util/navigation-hooks';
import { connect } from "react-redux";
import { t } from '../../../../../locals';
import styleCss from '../../../../style';

function StaffMessage(props) {
    const navigation = useNavigation();
    const [state, setState] = useState({
        loader: false,
        dataSource: [],
        messageData: {
            messages: [],
            selectedMessage: null,
            isComposing: false,
        }
    });

    const onFocus = useCallback(() => {
        fetchMessages();
    }, []);

    useNavigationEvents({
        onWillFocus: onFocus
    });

    const fetchMessages = async () => {
        setState(prev => ({...prev, loader: true}));
        try {
            // Your existing messages fetching logic here
            setState(prev => ({
                ...prev,
                loader: false,
            }));
        } catch (error) {
            console.error(error);
            setState(prev => ({...prev, loader: false}));
        }
    };

    const handleComposeMessage = () => {
        setState(prev => ({
            ...prev,
            messageData: {
                ...prev.messageData,
                isComposing: true
            }
        }));
    };

    const handleSelectMessage = (message) => {
        setState(prev => ({
            ...prev,
            messageData: {
                ...prev.messageData,
                selectedMessage: message
            }
        }));
    };

    if (!props.loading) {
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
                        <Text style={styleCss.NaveText}>{t("Messages")}</Text>
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
                    {/* Your existing message list and compose components */}
                    <TouchableOpacity 
                        style={styleCss.composeButton}
                        onPress={handleComposeMessage}
                    >
                        <Text style={styleCss.composeButtonText}>{t("Compose Message")}</Text>
                    </TouchableOpacity>

                    {state.messageData.messages.map((message, index) => (
                        <TouchableOpacity 
                            key={index}
                            style={styleCss.messageItem}
                            onPress={() => handleSelectMessage(message)}
                        >
                            {/* Message item content */}
                        </TouchableOpacity>
                    ))}
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
        loading: state.message?.loading || false,
        messages: state.message?.messages || [],
    };
};

const mapDispatchToProps = {
    // Add your dispatch actions here
};

export default connect(mapStateToProps, mapDispatchToProps)(StaffMessage);