import React, { Component } from 'react';
import {
    BackHandler,
    ActivityIndicator,
    RefreshControl,
    Text,
    View,
    Image,
    FlatList,
    TouchableOpacity,
    StatusBar,
    TouchableHighlight
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Col, Row } from 'react-native-easy-grid';
import { useFocusEffect } from '@react-navigation/native';
import { t } from '../../../../locals';
import styleCss from '../../../style.js';
import { connect } from "react-redux";
import { fetchActivitylist, loadingStart } from "../../redux/actions/activity";

class ActivityList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loader: false,
            dataSource: [],
        };
    }

    componentDidMount() {
        this.ActivityList();
        
        // Set up focus listener for back handler
        this.unsubscribe = this.props.navigation.addListener('focus', () => {
            this._onFocus();
        });
        
        // Set up blur listener for back handler
        this.unsubscribeBlur = this.props.navigation.addListener('blur', () => {
            this._onBlur();
        });
    }

    componentWillUnmount() {
        // Clean up listeners
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        if (this.unsubscribeBlur) {
            this.unsubscribeBlur();
        }
        this._onBlur();
    }

    toggleDrawer = () => {
        this.props.navigation.toggleDrawer();
    };

    async ActivityList() {
        const { fetchActivitylist, loadingStart } = this.props;
        loadingStart();
        
        try {
            const Id = await SecureStore.getItemAsync("id");
            const Token = await SecureStore.getItemAsync("access_token");

            const activityData = {
                current_user_id: Id,
                access_token: Token,
            };
            
            // Redux action called for fetch booked class of logged in user
            fetchActivitylist(activityData);
        } catch (error) {
            console.error('Error fetching activity list:', error);
        }
    }

    onRefresh = () => {
        this.ActivityList();
    }

    _onBlur = () => {
        if (this.backHandlerSubscription) {
            this.backHandlerSubscription.remove();
            this.backHandlerSubscription = null;
        }
    }

    _onFocus = () => {
        this.backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', this._handleBackButtonClick);
    }

    _handleBackButtonClick = () => {
        this.props.navigation.navigate('Home');
        return true; // Prevent default back button behavior
    }

    // render item for flatlist
    renderItem = ({ item }) => {
        return (
            <View style={styleCss.activity_mainContainer}>
                <View style={styleCss.activity_RowContainer}>
                    <Col>
                        <Row style={styleCss.activity_video_button_row}>
                            <Col>
                                <Text style={styleCss.activity_title}>{item.activity_title}</Text>
                            </Col>
                            <Col style={styleCss.activity_video_button_col}>
                                <TouchableHighlight 
                                    onPress={() => this.props.navigation.navigate('activityvideo', { 
                                        ActivityVideo: item.activity_video_data 
                                    })}
                                    underlayColor={'#fff'}
                                    style={styleCss.activity_video}
                                    accessible={true}
                                    accessibilityLabel={`View videos for ${item.activity_title}`}
                                >
                                    <Text style={styleCss.activity_video_button_text}>{t("Videos")}</Text>
                                </TouchableHighlight>
                            </Col>
                        </Row>
                        
                        <Row style={styleCss.activity_category_row}>
                            <Col style={styleCss.activity_category_image_col}>
                                <Image 
                                    style={styleCss.activity_category_image}
                                    source={require('../../../images/Category.png')}
                                    accessible={true}
                                    accessibilityLabel="Category icon"
                                />
                            </Col>
                            <Col style={styleCss.activity_category_text_col}>
                                <Text style={styleCss.activity_category_name}>{item.activity_category}</Text>
                            </Col>
                        </Row>
                        
                        <Row style={styleCss.activity_trainer_row}>
                            <Col style={styleCss.activity_trainer_col}>
                                <Image 
                                    style={styleCss.activity_trainer_image}
                                    source={require('../../../images/General-Training.png')}
                                    accessible={true}
                                    accessibilityLabel="Trainer icon"
                                />
                            </Col>
                            <Col style={styleCss.activity_trainer_text_col}>
                                <Text style={styleCss.activity_trainer_text}>{item.activity_trainer}</Text>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col style={styleCss.activity_membership_list_col}>
                                <Image 
                                    style={styleCss.activity_membership_list_image}
                                    source={require('../../../images/Membership-Type-gray-512.png')}
                                    accessible={true}
                                    accessibilityLabel="Membership type icon"
                                />
                            </Col>
                            <Col>
                                <Text style={styleCss.activity_membership_list_text}>{item.membership_list}</Text>
                            </Col>
                        </Row>
                        
                        <View style={styleCss.activity_tranier_view_big_image}>
                            <Image
                                style={styleCss.activity_trainer_big_image}
                                source={require('../../../images/trainer.jpg')}
                                accessible={true}
                                accessibilityLabel="Trainer image"
                            />
                        </View>
                    </Col>
                </View>
            </View>
        );
    };

    renderHeader = () => {
        const { navigate } = this.props.navigation;
        
        return (
            <Row style={styleCss.NaveBar}>
                <Col>
                    <TouchableOpacity 
                        onPress={() => this.props.navigation.navigate("CustomSideBar")} 
                        style={styleCss.menu_col}
                        accessible={true}
                        accessibilityLabel="Open menu"
                    >
                        <Image 
                            style={styleCss.Naveicon}
                            source={require('../../../images/Menu-white.png')}
                        />
                    </TouchableOpacity>
                </Col>

                <Col>
                    <TouchableOpacity 
                        onPress={() => navigate("Home")} 
                        style={styleCss.back_arrow}
                        accessible={true}
                        accessibilityLabel="Go back to home"
                    >
                        <Image 
                            style={styleCss.Naveicon}
                            source={require('../../../images/Back-Arrow-White.png')}
                        />
                    </TouchableOpacity>
                </Col>

                <Col style={styleCss.name_col}>
                    <Text style={styleCss.NaveText}>{t("Activity List")}</Text>
                </Col>

                <Col>
                    <TouchableOpacity 
                        onPress={() => this.props.navigation.navigate('Workouts')} 
                        style={styleCss.workout_col}
                        accessible={true}
                        accessibilityLabel="Go to workouts"
                    >
                        <Image 
                            style={styleCss.Naveicon}
                            source={require('../../../images/Workout-White.png')}
                        />
                    </TouchableOpacity>
                </Col>
                
                <Col>
                    <TouchableOpacity 
                        onPress={() => this.props.navigation.navigate('Message')} 
                        style={styleCss.message_col}
                        accessible={true}
                        accessibilityLabel="Go to messages"
                    >
                        <Image 
                            style={styleCss.Naveicon}
                            source={require('../../../images/Message-white.png')}
                        />
                    </TouchableOpacity>
                </Col>
            </Row>
        );
    }

    render() {
        const { data, loading } = this.props;

        return (
            <View style={styleCss.container}>
                <StatusBar />
                {this.renderHeader()}
                
                {loading ? (
                    <ActivityIndicator
                        style={styleCss.loading}
                        size="large"
                        color="#30afb5"
                    />
                ) : (
                    <FlatList
                        data={data}
                        renderItem={this.renderItem}
                        keyExtractor={(item) => item.activity_id.toString()}
                        ListEmptyComponent={
                            <EmptyComponent title={t("Data not available")} />
                        }
                        refreshControl={
                            <RefreshControl
                                colors={["#30afb5"]}
                                refreshing={loading}
                                onRefresh={this.onRefresh}
                            />
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={data.length === 0 ? { flex: 1 } : {}}
                    />
                )}
            </View>
        );
    }
}

// Empty component with better accessibility
const EmptyComponent = ({ title }) => (
    <View style={styleCss.emptyContainer}>
        <Text 
            style={styleCss.emptyText}
            accessible={true}
            accessibilityLabel={title}
        >
            {title}
        </Text>
    </View>
);

const mapStateToProps = (state) => {
    return {
        data: state.activity.activityData,
        loading: state.activity.loading,
    };
};

const mapDispatchToProps = {
    fetchActivitylist,
    loadingStart
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityList);