import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Col, Row } from 'react-native-easy-grid';
import { useNavigation } from '@react-navigation/native';
import { t } from '../../../../../locals';
import { useNavigationEvents } from '../../../../util/navigation-hooks';
import { connect } from "react-redux";
import styleCss from '../../../../style';

function StaffAccount(props) {
    const navigation = useNavigation();
    const [state, setState] = useState({
        loader: false,
        dataSource: [],
    });

    const onFocus = useCallback(() => {
        fetchData();
    }, []);

    useNavigationEvents({
        onWillFocus: onFocus
    });

    const fetchData = async () => {
        setState(prev => ({...prev, loader: true}));
        try {
            // Your existing data fetching logic here
            setState(prev => ({
                ...prev,
                loader: false,
            }));
        } catch (error) {
            console.error(error);
            setState(prev => ({...prev, loader: false}));
        }
    };

    const { loading, userData } = props;

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
                        <Text style={styleCss.NaveText}>{t("Staff Account")}</Text>
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

                {/* Staff Profile Section with null safety */}
                <View style={styleCss.account_container}>
                    <Row style={styleCss.account_user_row}>
                        <Col style={styleCss.account_user_col}>
                            <Col style={styleCss.account_image_col}>
                                <Image
                                    style={styleCss.account_image}
                                    source={
                                        (userData && userData.member_image)
                                            ? { uri: userData.member_image }
                                            : require('../../../../images/undefined-profile.png')
                                    }
                                    onError={() => {
                                        console.warn('Staff profile image load failed, using default');
                                    }}
                                />
                            </Col>
                        </Col>
                        <Col>
                            <Row style={styleCss.account_name_row}>
                                <Text style={styleCss.account_name_text}>
                                    {(userData && userData.first_name) || ''} {(userData && userData.last_name) || ''}
                                </Text>
                            </Row>
                            {(userData && userData.address && userData.city) && (
                                <Row style={styleCss.account_address_row}>
                                    <Text numberOfLines={1} style={styleCss.account_address_text}>
                                        {userData.address}, {userData.city}
                                    </Text>
                                </Row>
                            )}
                        </Col>
                    </Row>
                </View>
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
                        <Text style={styleCss.NaveText}>{t("Staff Account")}</Text>
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
        // Use auth loading instead of staff.loading
        loading: state.auth?.loading || false,
        userData: state.auth?.userData || null,
    };
};

const mapDispatchToProps = {
    // Add your dispatch actions here
};

export default connect(mapStateToProps, mapDispatchToProps)(StaffAccount);