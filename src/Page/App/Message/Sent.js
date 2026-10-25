import React, { useEffect, useCallback, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Col, Row } from 'react-native-easy-grid';
import * as SecureStore from 'expo-secure-store';
import { connect } from "react-redux";
import { fetchSentmessagelist, loadingStart } from "../../redux/actions/message";
import { t } from "../../../../locals";
import styleCss from '../../../style';

function Sent(props) {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchSentMessages();
    }, []);

    const fetchSentMessages = async () => {
        const { fetchSentmessagelist, loadingStart } = props;
        loadingStart();
        const Id = await SecureStore.getItemAsync("id");
        const Token = await SecureStore.getItemAsync("access_token");

        const Data = {
            current_user_id: Id,
            access_token: Token,
        };
        fetchSentmessagelist(Data);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchSentMessages().then(() => {
            setRefreshing(false);
        });
    }, []);

    const renderItem = ({ item }) => (
        <View>
            <TouchableOpacity 
                onPress={() => navigation.navigate('SentView', { 
                    messagekey: item.message_id, 
                    viewMessageID: item.view_message_id, 
                    messageimage: item.gmgt_user_avatar_image, 
                    messagetext: item.description, 
                    messagetitle: item.subject, 
                    replyid: item.replay_id, 
                    receiverid: item.receiver_id, 
                    userImage: item.current_user_image 
                })}
            >
                <Row style={styleCss.inbox_row}>
                    <Col style={styleCss.inbox_col}>
                        <Col style={styleCss.inbox_message_image_col}>
                            <Image
                                style={styleCss.inbox_message_image}
                                source={{ uri: item.gmgt_user_avatar_image }}
                            />
                        </Col>
                    </Col>
                    <Col style={styleCss.inbox_col_two}>
                        <Row style={styleCss.inbox_col_two_row}>
                            <Text numberOfLines={1} style={styleCss.inbox_message_title}>
                                {item.subject}
                            </Text>
                        </Row>
                        <Row>
                            <Text numberOfLines={2} style={styleCss.inbox_message_description}>
                                {item.description}
                            </Text>
                        </Row>
                    </Col>
                    <Col style={styleCss.inbox_col_three}>
                        <Row style={styleCss.inbox_col_three_row}>
                            <Image
                                style={styleCss.inbox_message_arrow}
                                source={require('../../../images/view_msg_arrow.png')}
                            />
                        </Row>
                    </Col>
                </Row>
            </TouchableOpacity>
        </View>
    );

    const { data, loading } = props;

    if (loading) {
        return (
            <View style={styleCss.container}>
                <ActivityIndicator
                    style={styleCss.loading}
                    size="large"
                    color="#102b46"
                />
            </View>
        );
    }

    return (
        <View style={styleCss.container}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.message_id.toString()}
                ListEmptyComponent={
                    <EmptyComponent title={t("Message are not available")} />
                }
                refreshControl={
                    <RefreshControl
                        colors={["#102b46"]}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            />
        </View>
    );
}

const EmptyComponent = ({ title }) => (
    <View style={styleCss.emptyContainer}>
        <Text style={styleCss.emptyText}>{title}</Text>
    </View>
);

const mapStateToProps = (state) => ({
    data: state.message.sentMessageData,
    loading: state.message.loading,
});

const mapDispatchToProps = {
    fetchSentmessagelist,
    loadingStart,
};

export default connect(mapStateToProps, mapDispatchToProps)(Sent);