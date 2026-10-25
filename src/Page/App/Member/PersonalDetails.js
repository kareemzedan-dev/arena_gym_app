import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Col, Row } from 'react-native-easy-grid';
import { connect } from "react-redux";
import { loadingStart, fetchUserdetails } from "../../redux/actions/auth";
import { t } from "../../../../locals";
import styleCss from '../../../style';

function PersonalDetails(props) {
    const navigation = useNavigation();
    const [state, setState] = useState({
        imageLoader: true,
    });

    useEffect(() => {
        const shouldFetchData = determineShouldFetchData();
        if (shouldFetchData) {
            fetchMemberData();
        }
    }, []);

    const determineShouldFetchData = () => {
        const { userData, route } = props;
        
        if (userData && userData.member_id) {
            const routeMemberId = route?.params?.memberId;
            if (routeMemberId && routeMemberId !== userData.member_id) {
                return true;
            }
            return false;
        }
        
        return true;
    };

    const fetchMemberData = async () => {
        const { fetchUserdetails, loadingStart, userData } = props;

        let memberId = props.route?.params?.memberId;
        
        if (!memberId && userData?.member_id) {
            memberId = userData.member_id;
        }

        if (!memberId) {
            Alert.alert('Error', 'No member ID available');
            return;
        }

        try {
            const requestData = {
                member_id: memberId,
            };
            
            // Loading is handled in the auth Redux action
            await fetchUserdetails(requestData);
            
        } catch (error) {
            Alert.alert('Error', `Error loading member data: ${error.message}`);
        }
    };

    const renderPersonalInfo = () => {
        const { userData } = props;
        if (!userData) {
            return null;
        }

        return (
            <View style={styleCss.personal_details_container}>
                <Row style={styleCss.personal_img_row}>
                    <Col style={styleCss.personal_img_col}>
                        <View style={styleCss.personal_img_view}>
                            {userData.member_image && (
                                <Image
                                    onLoadStart={() => {
                                        setState(prev => ({ ...prev, imageLoader: true }));
                                    }}
                                    onLoadEnd={() => {
                                        setState(prev => ({ ...prev, imageLoader: false }));
                                    }}
                                    onError={() => {
                                        setState(prev => ({ ...prev, imageLoader: false }));
                                    }}
                                    source={{ uri: userData.member_image }}
                                    style={styleCss.personal_img}
                                />
                            )}
                        </View>
                    </Col>
                </Row>

                <View style={styleCss.details_section}>
                    <Row style={styleCss.details_row}>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_text}>
                                {t("First Name")}
                            </Text>
                        </Col>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_value}>
                                {userData.first_name || "-"}
                            </Text>
                        </Col>
                    </Row>

                    <Row style={styleCss.details_row}>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_text}>
                                {t("Last Name")}
                            </Text>
                        </Col>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_value}>
                                {userData.last_name || "-"}
                            </Text>
                        </Col>
                    </Row>

                    <Row style={styleCss.details_row}>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_text}>
                                {t("Gender")}
                            </Text>
                        </Col>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_value}>
                                {userData.gender || "-"}
                            </Text>
                        </Col>
                    </Row>

                    <Row style={styleCss.details_row}>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_text}>
                                {t("Date of Birth")}
                            </Text>
                        </Col>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_value}>
                                {userData.dob || userData.birth_date || "-"}
                            </Text>
                        </Col>
                    </Row>

                    <Row style={styleCss.details_row}>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_text}>
                                {t("Address")}
                            </Text>
                        </Col>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_value}>
                                {userData.address || "-"}
                            </Text>
                        </Col>
                    </Row>

                    <Row style={styleCss.details_row}>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_text}>
                                {t("City")}
                            </Text>
                        </Col>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_value}>
                                {userData.city || "-"}
                            </Text>
                        </Col>
                    </Row>

                    <Row style={styleCss.details_row}>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_text}>
                                {t("State")}
                            </Text>
                        </Col>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_value}>
                                {userData.state || "-"}
                            </Text>
                        </Col>
                    </Row>

                    <Row style={styleCss.details_row}>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_text}>
                                {t("Zip Code")}
                            </Text>
                        </Col>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_value}>
                                {userData.zip || userData.zip_code || "-"}
                            </Text>
                        </Col>
                    </Row>

                    <Row style={styleCss.details_row}>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_text}>
                                {t("Mobile Number")}
                            </Text>
                        </Col>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_value}>
                                {userData.mobile || "-"}
                            </Text>
                        </Col>
                    </Row>

                    <Row style={styleCss.details_row}>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_text}>
                                {t("Email")}
                            </Text>
                        </Col>
                        <Col style={styleCss.details_col}>
                            <Text style={styleCss.details_value}>
                                {userData.email || "-"}
                            </Text>
                        </Col>
                    </Row>
                </View>
            </View>
        );
    };

    const { loading } = props;

    if (loading) {
        return (
            <View style={styleCss.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator
                        style={styleCss.loading}
                        size="large"
                        color="#102b46"
                    />
                    <Text style={{ marginTop: 10, textAlign: 'center' }}>
                        Loading personal details...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styleCss.container}>
            <ScrollView>
                {renderPersonalInfo()}
            </ScrollView>
        </View>
    );
}

const mapStateToProps = (state) => {
    return {
        userData: state.auth.userData,
        loading: state.auth.loading,
    };
};

const mapDispatchToProps = {
    fetchUserdetails,
};

export default connect(mapStateToProps, mapDispatchToProps)(PersonalDetails);