import React, { Component } from 'react';
import {
    BackHandler,
    ActivityIndicator,
    Text,
    View,
    Image,
    TouchableOpacity,
    StatusBar,
    ScrollView,
} from 'react-native';
import { Col, Row } from 'react-native-easy-grid';
import { useFocusEffect } from '@react-navigation/native';
import { t } from '../../../../locals';
import { WebView } from 'react-native-webview';
import styleCss from '../../../style.js';
import { connect } from "react-redux";
import { loadingStart } from "../../redux/actions/activity";

class ActivityVideoClass extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Activity_Video: []
        }
    }

    toggleDrawer = ({ navigation }) => {
        this.props.navigation.getParent()?.openDrawer();
    };

    componentDidMount() {
        const ActivityVideo = this.props.route.params?.ActivityVideo || [];
        this.setState({ Activity_Video: ActivityVideo });
    }


    _onBlurr = () => {
        if (this.backHandlerSubscription) {
            this.backHandlerSubscription.remove();
        }
    }

    _onFocus = () => {
        this.backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress',
            this._handleBackButtonClick);
    }

    _handleBackButtonClick = () => {
        this.props.navigation.navigate('ActivityList');
        return true; // Prevent default behavior
    }

    render() {
        const { loading } = this.props;
        const { navigate } = this.props.navigation;
        const { Activity_Video } = this.state;

        if (!loading) {
            return (
                <View style={styleCss.container}>
                    <StatusBar />
                    <Row style={styleCss.NaveBar}>
                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.getParent()?.openDrawer()} style={styleCss.menu_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Menu-white.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col>
                            <TouchableOpacity onPress={() => navigate('ActivityList')} style={styleCss.back_arrow}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Back-Arrow-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col style={styleCss.name_col}>
                            <Text style={styleCss.NaveText}>{t("Activity Video List")}</Text>
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
                    <ScrollView>
                        {(Activity_Video.length !== 0) ? (
                            <View>
                                {Activity_Video.map((Data, index) => (
                                    <View style={styleCss.activity_video_list_view} key={index}>
                                        <Text style={styleCss.activity_VideoTitleText}>{t("Video Title")} :- {Data.video_title}</Text>
                                        <WebView
                                            source={{ uri: Data.video_link }}
                                        />
                                    </View>
                                ))}
                            </View>) : (
                            <View style={styleCss.emptyContainer}>
                                <Text style={styleCss.emptyText}>{t("Data not available")}</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            );
        } else {
            return (
                <View style={styleCss.container}>
                    <StatusBar />
                    <Row style={styleCss.NaveBar}>
                        <Col>
                            <TouchableOpacity onPress={() => this.props.navigation.getParent()?.openDrawer()} style={styleCss.menu_col}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Menu-white.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col>
                            <TouchableOpacity onPress={() => navigate('ActivityList')} style={styleCss.back_arrow}>
                                <Image style={styleCss.Naveicon}
                                    source={require('../../../images/Back-Arrow-White.png')}
                                />
                            </TouchableOpacity>
                        </Col>

                        <Col style={styleCss.name_col}>
                            <Text style={styleCss.NaveText}>{t("Activity Video List")}</Text>
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

// Wrapper component to handle focus events
function ActivityVideoWrapper(props) {
    const [isFocused, setIsFocused] = React.useState(false);

    useFocusEffect(
        React.useCallback(() => {
            setIsFocused(true);
            return () => setIsFocused(false);
        }, [])
    );

    return <ActivityVideoClass {...props} isFocused={isFocused} />;
}

const mapStateToProps = (state) => {
    return {
        loading: state.activity.loading,
    };
};

const mapDispatchToProps = {
    loadingStart
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityVideoWrapper);
