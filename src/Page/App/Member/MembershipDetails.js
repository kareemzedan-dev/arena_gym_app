import React, { useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Col, Row } from 'react-native-easy-grid';
import { connect } from "react-redux";
import { fetchMembershipDetails, loadingStart } from "../../redux/actions/member";
import { t } from "../../../../locals";
import styleCss from '../../../style';
import moment from 'moment';

const MembershipDetails = (props) => {
    const navigation = useNavigation();

    useEffect(() => {
        fetchMembershipData();
    }, []);

    const fetchMembershipData = async () => {
        const { fetchMembershipDetails } = props;
        
        // Get member ID from route params or use current user data
        let memberId = props.route?.params?.memberId;
        
        // If no memberId in route params, try to get it from userData (if available)
        if (!memberId && props.userData?.member_id) {
            memberId = props.userData.member_id;
        }
        
        if (!memberId) {
            Alert.alert('Error', 'No member ID available');
            return;
        }

        try {
            const membershipData = {
                member_id: memberId,
            };
            
            // Call the action - loading is handled in Redux action
            fetchMembershipDetails(membershipData);
            
        } catch (error) {
            Alert.alert('Error', `Error loading membership data: ${error.message}`);
        }
    };

    const renderMembershipRow = (label, value, customStyle = {}) => (
        <Row style={styleCss.membership_row}>
            <Col style={styleCss.membership_col}>
                <Text style={styleCss.membership_label}>{label}</Text>
            </Col>
            <Col style={styleCss.membership_col}>
                <Text style={[styleCss.membership_value, customStyle]}>
                    {value || "-"}
                </Text>
            </Col>
        </Row>
    );

    // Get current membership from user data as fallback
    const getCurrentMembershipFromUserData = () => {
        const { userData } = props;
        if (!userData) return null;

        const membershipId = userData.membership_id;
        const membershipName = userData.membership_name;
        const validFrom = userData.membership_valid_from;
        const validTo = userData.membership_valid_to;
        const membershipStatus = userData.membership_status;

        if (!membershipId || !validTo) return null;

        const currentDate = moment();
        const endDate = moment(validTo, ['YYYY/MM/DD', 'DD/MM/YYYY', 'YYYY-MM-DD']);
        const isActive = endDate.isValid() && 
                         currentDate.isSameOrBefore(endDate, 'day') && 
                         membershipStatus === 'Continue';

        return {
            membership_name: membershipName || 'Golden Membership',
            join_date: formatDate(validFrom),
            expiry_date: formatDate(validTo),
            membership_status: isActive ? t('Active') : t('Expired'),
            payment_status: isActive ? t('Paid') : t('Expired'),
            isFromUserData: true
        };
    };

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = moment(dateString, ['YYYY/MM/DD', 'DD/MM/YYYY', 'YYYY-MM-DD']);
            return date.isValid() ? date.format('DD/MM/YYYY') : dateString;
        } catch (error) {
            return dateString;
        }
    };

    const renderMembershipInfo = () => {
        let { membershipData } = props;
        
        // If no membershipData from API, try to get it from userData
        if (!membershipData) {
            membershipData = getCurrentMembershipFromUserData();
        }
        
        // If still no data, show fallback message
        if (!membershipData) {
            return (
                <View style={styleCss.membership_details_container}>
                    <Text style={{textAlign: 'center', marginTop: 20, fontSize: 16, color: '#666'}}>
                        {t("No membership data available")}
                    </Text>
                    <Text style={{textAlign: 'center', marginTop: 10, fontSize: 14, color: '#888'}}>
                        {t("Please contact support if you have an active membership")}
                    </Text>
                </View>
            );
        }

        const statusStyle = 
            membershipData.membership_status === "Active" || membershipData.membership_status === t('Active')
                ? styleCss.active_status 
                : styleCss.expired_status;

        return (
            <View style={styleCss.membership_details_container}>
                {membershipData.isFromUserData && (
                    <View style={{backgroundColor: '#E8F5E8', padding: 10, borderRadius: 5, marginBottom: 15}}>
                        <Text style={{textAlign: 'center', color: '#4CAF50', fontWeight: 'bold'}}>
                            {t("Current Membership")} 
                        </Text>
                    </View>
                )}
                
                {renderMembershipRow(t("Membership"), membershipData.membership_name)}
                {membershipData.join_date && renderMembershipRow(t("Join Date"), membershipData.join_date)}
                {membershipData.expiry_date && renderMembershipRow(t("Expiry Date"), membershipData.expiry_date)}
                {renderMembershipRow(
                    t("Membership Status"), 
                    membershipData.membership_status,
                    statusStyle
                )}
                {membershipData.payment_status && 
                    renderMembershipRow(t("Payment Status"), membershipData.payment_status)
                }
            </View>
        );
    };

    if (props.loading) {
        return (
            <View style={styleCss.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator
                        style={styleCss.loading}
                        size="large"
                        color="#102b46"
                    />
                    <Text style={{ marginTop: 10, textAlign: 'center' }}>
                        {t("Loading membership details...")}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styleCss.container}>
            <ScrollView>
                {renderMembershipInfo()}
            </ScrollView>
        </View>
    );
};

const mapStateToProps = (state) => ({
    membershipData: state.member.membershipDetails,
    loading: state.member.loading,
    userData: state.auth?.userData,
});

const mapDispatchToProps = {
    fetchMembershipDetails,
};

export default connect(mapStateToProps, mapDispatchToProps)(MembershipDetails);