import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    SafeAreaView, 
    Modal, 
    BackHandler, 
    TouchableHighlight, 
    ActivityIndicator, 
    RefreshControl, 
    Text, 
    View, 
    Image, 
    FlatList, 
    TouchableOpacity, 
    StatusBar, 
    ScrollView 
} from 'react-native';
import { Col, Row } from 'react-native-easy-grid';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { useNavigationEvents } from '../../../util/navigation-hooks';
import { connect } from "react-redux";
import { fetchGrouplist, loadingStart } from "../../redux/actions/groupList";
import { t } from '../../../../locals';
import styleCss from '../../../style';

function GroupList(props) {
    const navigation = useNavigation();
    const backHandlerRef = useRef(null);
    const [state, setState] = useState({
        ImageLoading: false,
        modalVisible: false,
        Member_Data: '',
        GroupMember: '',
        Group_name: '',
    });

    useEffect(() => {
        groupListAction();
    }, []);

    const handleBackButton = useCallback(() => {
        navigation.navigate('Home');
        return true;
    }, [navigation]);

    useNavigationEvents({
        onWillFocus: () => {
            backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
        },
        onWillBlur: () => {
            if (backHandlerRef.current) {
                backHandlerRef.current.remove();
            }
        }
    });

    const groupListAction = async () => {
        const { fetchGrouplist, loadingStart } = props;
        loadingStart();
        const Id = await SecureStore.getItemAsync("id");
        const Token = await SecureStore.getItemAsync("access_token");

        const groupData = {
            current_user_id: Id,
            access_token: Token,
        };
        fetchGrouplist(groupData);
    };

    const setModalVisible = (memberData, name, totalMember) => {
        setState(prev => ({
            ...prev,
            Group_name: name,
            Member_Data: memberData,
            GroupMember: totalMember,
            modalVisible: true
        }));
    };

    const hideModal = () => {
        setState(prev => ({ ...prev, modalVisible: false }));
    };

    const renderItem = ({ item }) => (
        <View>
            <Row style={styleCss.group_RowContainer}>
                <Col style={styleCss.group_ImageCol}>
                    <Col style={styleCss.group_ImageContainer}>
                        <Image 
                            onLoadStart={() => setState(prev => ({ ...prev, ImageLoading: true }))}
                            onLoadEnd={() => setState(prev => ({ ...prev, ImageLoading: false }))}
                            source={item.group_image ? { uri: item.group_image } : null} 
                            style={styleCss.GroupImage} 
                        />
                        <ActivityIndicator
                            style={styleCss.loading}
                            animating={state.ImageLoading}
                            color="#30afb5"
                        />
                    </Col>
                </Col>
                <Col style={styleCss.group_col}>
                    <Col style={styleCss.group_details_col}>
                        <Text numberOfLines={1} style={styleCss.group_Name}>
                            {item.group_name}
                        </Text>
                    </Col>
                    <Col style={styleCss.group_details_col}>
                        <Text style={styleCss.group_member_text}>
                            {item.total_group_member} {t("member")}
                        </Text>
                    </Col>
                </Col>
                <Col style={styleCss.group_modal_col}>
                    <TouchableHighlight 
                        onPress={() => setModalVisible(item.group_member_data, item.group_name, item.total_group_member)}
                        underlayColor={'#fff'}
                        style={styleCss.group_modal_button}
                    >
                        <Text style={styleCss.group_modal_text}>{t("View")}</Text>
                    </TouchableHighlight>
                </Col>
            </Row>
        </View>
    );

    const { data, loading } = props;
    const { modalVisible, Member_Data, Group_name, GroupMember } = state;

    if (!loading) {
        return (
            <View style={styleCss.container}>
                <StatusBar />
                <Row style={styleCss.NaveBar}>
                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate("CustomSideBar")} 
                            style={styleCss.menu_col}
                        >
                            <Image 
                                style={styleCss.Naveicon}
                                source={require('../../../images/Menu-white.png')}
                            />
                        </TouchableOpacity>
                    </Col>

                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate("Home")} 
                            style={styleCss.back_arrow}
                        >
                            <Image 
                                style={styleCss.Naveicon}
                                source={require('../../../images/Back-Arrow-White.png')}
                            />
                        </TouchableOpacity>
                    </Col>

                    <Col style={styleCss.name_col}>
                        <Text style={styleCss.NaveText}>{t("Group List")}</Text>
                    </Col>

                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Workouts')} 
                            style={styleCss.workout_col}
                        >
                            <Image 
                                style={styleCss.Naveicon}
                                source={require('../../../images/Workout-White.png')}
                            />
                        </TouchableOpacity>
                    </Col>
                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Message')} 
                            style={styleCss.message_col}
                        >
                            <Image 
                                style={styleCss.Naveicon}
                                source={require('../../../images/Message-white.png')}
                            />
                        </TouchableOpacity>
                    </Col>
                </Row>
                <View style={styleCss.mainContainer}>
                    <SafeAreaView style={styleCss.mainContainer}>
                        <FlatList
                            data={data}
                            keyExtractor={(item) => item.group_id.toString()}
                            renderItem={renderItem}
                            ListEmptyComponent={
                                <EmptyComponent title={t("Data not available")} />
                            }
                            refreshControl={
                                <RefreshControl
                                    colors={["#30afb5"]}
                                    refreshing={loading}
                                    onRefresh={groupListAction}
                                />
                            }
                        />
                        <Col>
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={modalVisible}
                            >
                                <View style={styleCss.group_modal_main_view}>
                                    <View style={styleCss.group_modal_view}>
                                        <Row style={styleCss.group_modal_row}>
                                            <Col style={styleCss.group_name_col}>
                                                <Text numberOfLines={1} style={styleCss.group_name_text}>
                                                    {Group_name}
                                                </Text>
                                            </Col>
                                            <Col style={styleCss.group_back_arrow_col}>
                                                <TouchableOpacity 
                                                    onPress={hideModal} 
                                                    style={styleCss.group_back_arrow_text}
                                                >
                                                    <Image
                                                        style={styleCss.group_close_image}
                                                        source={require('../../../images/Close-blue-512.png')} 
                                                    />
                                                </TouchableOpacity>
                                            </Col>
                                        </Row>
                                        <View>
                                            <ScrollView>
                                                {GroupMember == 0 ? (
                                                    <View>
                                                        <Row style={styleCss.group_nodata_row}>
                                                            <Text style={styleCss.group_nodata_text}>
                                                                {Member_Data}
                                                            </Text>
                                                        </Row>
                                                    </View>
                                                ) : (
                                                    <View>
                                                        {Member_Data.map((Member, index) => (
                                                            <View key={index}>
                                                                <Row style={styleCss.group_member_image_row}>
                                                                    <Col style={styleCss.group_main_ImageCol}>
                                                                        <Col style={styleCss.group_member_image_col}>
                                                                            <Image 
                                                                                onLoadStart={() => setState(prev => ({ ...prev, ImageLoading: true }))}
                                                                                onLoadEnd={() => setState(prev => ({ ...prev, ImageLoading: false }))}
                                                                                source={Member.member_image ? { uri: Member.member_image } : null} 
                                                                                style={styleCss.SubGroupImage} 
                                                                            />
                                                                            <ActivityIndicator
                                                                                style={styleCss.loading}
                                                                                animating={state.ImageLoading}
                                                                                color="#30afb5"
                                                                            />
                                                                        </Col>
                                                                    </Col>
                                                                    <Col style={styleCss.group_member_name_col}>
                                                                        <Text style={styleCss.group_member_text}>
                                                                            {Member.member_name}
                                                                        </Text>
                                                                    </Col>
                                                                </Row>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </ScrollView>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                        </Col>
                    </SafeAreaView>
                </View>
            </View>
        );
    } else {
        return (
            <View style={styleCss.container}>
                <StatusBar />
                <Row style={styleCss.NaveBar}>
                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate("CustomSideBar")} 
                            style={styleCss.menu_col}
                        >
                            <Image 
                                style={styleCss.Naveicon}
                                source={require('../../../images/Menu-white.png')}
                            />
                        </TouchableOpacity>
                    </Col>

                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate("Home")} 
                            style={styleCss.back_arrow}
                        >
                            <Image 
                                style={styleCss.Naveicon}
                                source={require('../../../images/Back-Arrow-White.png')}
                            />
                        </TouchableOpacity>
                    </Col>

                    <Col style={styleCss.name_col}>
                        <Text style={styleCss.NaveText}>{t("Group List")}</Text>
                    </Col>

                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Workouts')} 
                            style={styleCss.workout_col}
                        >
                            <Image 
                                style={styleCss.Naveicon}
                                source={require('../../../images/Workout-White.png')}
                            />
                        </TouchableOpacity>
                    </Col>
                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Message')} 
                            style={styleCss.message_col}
                        >
                            <Image 
                                style={styleCss.Naveicon}
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

const EmptyComponent = ({ title }) => (
    <View style={styleCss.emptyContainer}>
        <Text style={styleCss.emptyText}>{title}</Text>
    </View>
);

const mapStateToProps = (state) => {
    return {
        data: state.groupList.GroupData,
        loading: state.groupList.loading,
    };
};

const mapDispatchToProps = {
    fetchGrouplist,
    loadingStart
};

export default connect(mapStateToProps, mapDispatchToProps)(GroupList);