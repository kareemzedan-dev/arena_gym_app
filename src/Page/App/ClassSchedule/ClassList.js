import React, { Component } from "react";
import {
    BackHandler,
    View,
    Text,
    Image,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    FlatList,
    SafeAreaView
} from "react-native";
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { Col, Row } from 'react-native-easy-grid';
import { t } from '../../../../locals';
import styleCss from "./ClassListStyle";

//Redux
import { connect } from "react-redux";
import { fetchClass, loadingStart } from "../../redux/actions/classSchedule";

class ClassList extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.ClassList();
    }

    componentWillUnmount() {
        // Clean up back handler when component unmounts
        if (this.backHandler) {
            this.backHandler.remove();
        }
    }

    async ClassList() {
        const { fetchClass, loadingStart } = this.props;

        loadingStart();
        const Id = await SecureStore.getItemAsync("id");
        const Token = await SecureStore.getItemAsync("access_token");

        const paramas = {
            "current_user_id": Id,
            "access_token": Token,
        };

        // Redux action call for fetch class list
        fetchClass(paramas);
    }

    onRefresh() {
        this.setState({ dataSource: [] });
        this.ClassList();
    }

    _handleBackButtonClick = () => {
        this.props.navigation.navigate('Dashboard');
        return true; // Prevent default back action
    }

    // render item for flatlist
    renderItem = ({ item }) => {
        // Debug: Log the item to see what data we're receiving
        console.log('ClassList item data:', item);

        // Format dates for display
        const formatDate = (dateString) => {
            if (!dateString) return '';
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return '';
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            } catch (error) {
                console.log('Date formatting error:', error);
                return '';
            }
        };

        const startDate = formatDate(item.start_date);
        const endDate = formatDate(item.end_date);
        const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : '';

        // Debug: Log the formatted dates
        console.log('Formatted dates:', { startDate, endDate, dateRange });

        return (
            <View style={styleCss.container} >
                <Row style={[styleCss.classlist_row]}>
                    <Col style={styleCss.classlist_col}>
                        <Row style={styleCss.classlist_dataname_row}>
                            <Text numberOfLines={1} style={styleCss.classlist_dataname_text}>{item.class_name}</Text>
                        </Row>
                        <Row style={styleCss.classlist_image_row}>
                            <Col style={styleCss.classlist_image_col}>
                                <Image style={styleCss.classlist_image}
                                    source={require('../../../images/Time-512.png')}
                                />
                            </Col>
                            <Col style={styleCss.classlist_time_col}>
                                <Text style={styleCss.classlist_dataname_time}>{item.start_time} - {item.end_time}</Text>
                            </Col>
                        </Row>
                        {item.day && (
                            <Row style={styleCss.classlist_image_row}>
                                <Col style={styleCss.classlist_image_col}>
                                    <Image style={styleCss.classlist_image}
                                        source={require('../../../images/calendar.png')}
                                    />
                                </Col>
                                <Col style={styleCss.classlist_time_col}>
                                    <Text style={styleCss.classlist_dataname_time}>Days: {item.day}</Text>
                                </Col>
                            </Row>
                        )}
       
                    </Col>
                        <Col style={styleCss.classlist_staff_col}>
                        <Row style={styleCss.classlist_dataname_row}>
                            <Text style={styleCss.classlist_dataname_time}>{item.staff_member}</Text>
                        </Row>
                        <Row style={styleCss.classlist_dataname_text_row}>
                        </Row>
                    </Col>

                    
                </Row>

                    <Row style={[styleCss.classlist_image_row2, { height: 30, paddingBottom: 5 }]}>
                        
  
                                <Text style={styleCss.classlist_dataname_time}>
                                    Date Range: {dateRange || `${item.start_date || 'N/A'} - ${item.end_date || 'N/A'}`}
                                </Text>
                       
                        </Row>
            </View>
        );
    };

    render() {
        const { classData, loading } = this.props;

        if (!loading) {
            return (
                <View style={{ flex: 1 }}>
                    <FocusHandler
                        onFocus={() => {
                            this.backHandler = BackHandler.addEventListener('hardwareBackPress', this._handleBackButtonClick);
                        }}
                        onBlur={() => {
                            if (this.backHandler) {
                                this.backHandler.remove();
                                this.backHandler = null;
                            }
                        }}
                    />
                    <StatusBar />
                    <SafeAreaView style={{ flex: 1 }}>
                        <FlatList
                            data={classData}
                            renderItem={this.renderItem}
                            keyExtractor={(item) => item.class_id.toString()}
                            ListEmptyComponent={
                                <EmptyComponent title={t("Data not available")} />
                            }
                            refreshControl={
                                <RefreshControl
                                    colors={["#30afb5"]}
                                    refreshing={loading}
                                    onRefresh={this.onRefresh.bind(this)}
                                />
                            }
                        />
                    </SafeAreaView>
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

// Focus Handler Component using useFocusEffect hook
const FocusHandler = ({ onFocus, onBlur }) => {
    useFocusEffect(
        React.useCallback(() => {
            // Screen is focused
            onFocus();
            
            // Cleanup function when screen loses focus
            return () => {
                onBlur();
            };
        }, [onFocus, onBlur])
    );
    
    return null;
};

// Empty component
const EmptyComponent = ({ title }) => (
    <View style={styleCss.emptyContainer}>
        <Text style={styleCss.emptyText}>{title}</Text>
    </View>
);

const mapStateToProps = (state) => {
    return {
      classData: state.classSchedule.classData,
      loading: state.classSchedule.loading,
    };
};
  
const mapDispatchToProps = {
    fetchClass,
    loadingStart
};
  
export default connect(mapStateToProps, mapDispatchToProps)(ClassList);