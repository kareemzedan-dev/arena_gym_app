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
import { staffloginAction } from '../../../../util/action';
import { connect } from "react-redux";
import { t } from '../../../../../locals';
import styleCss from '../../../../style';

function StaffNotice(props) {
    const navigation = useNavigation();
    const [state, setState] = useState({
        loader: false,
        dataSource: [],
        noticeData: {
            notices: [],
            selectedNotice: null,
            isCreating: false,
        }
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
            // Your existing notices fetching logic here
            setState(prev => ({
                ...prev,
                loader: false,
            }));
        } catch (error) {
            console.error(error);
            setState(prev => ({...prev, loader: false}));
        }
    };

    const handleCreateNotice = () => {
        setState(prev => ({
            ...prev,
            noticeData: {
                ...prev.noticeData,
                isCreating: true
            }
        }));
    };

    const handleSelectNotice = (notice) => {
        setState(prev => ({
            ...prev,
            noticeData: {
                ...prev.noticeData,
                selectedNotice: notice
            }
        }));
    };

    const { loading } = props;

    if (!loading) {
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
                        <Text style={styleCss.NaveText}>{t("Notices")}</Text>
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
                    <TouchableOpacity 
                        style={styleCss.createButton}
                        onPress={handleCreateNotice}
                    >
                        <Text style={styleCss.createButtonText}>{t("Create Notice")}</Text>
                    </TouchableOpacity>

                    {state.noticeData.notices.map((notice, index) => (
                        <TouchableOpacity 
                            key={index}
                            style={styleCss.noticeItem}
                            onPress={() => handleSelectNotice(notice)}
                        >
                            <View style={styleCss.noticeContent}>
                                <Text style={styleCss.noticeTitle}>
                                    {notice.title || `Notice ${index + 1}`}
                                </Text>
                                <Text style={styleCss.noticeDate}>
                                    {notice.date || new Date().toLocaleDateString()}
                                </Text>
                                <Text style={styleCss.noticePreview} numberOfLines={2}>
                                    {notice.content || 'No content available'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {state.noticeData.notices.length === 0 && (
                        <View style={styleCss.emptyState}>
                            <Text style={styleCss.emptyText}>{t("No notices available")}</Text>
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
                        <Text style={styleCss.NaveText}>{t("Notices")}</Text>
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
                <ActivityIndicator
                    style={styleCss.loading}
                    size="large"
                    color="#30afb5"
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        // Use auth loading instead of staff.loading which doesn't exist
        loading: state.auth?.loading || false,
        notices: state.auth?.notices || [],
        userData: state.auth?.userData || null,
    };
};

const mapDispatchToProps = {
    staffloginAction,
    // Add other dispatch actions here
};

export default connect(mapStateToProps, mapDispatchToProps)(StaffNotice);