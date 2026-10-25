import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    ScrollView,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Col, Row } from "react-native-easy-grid";
import * as SecureStore from 'expo-secure-store';
import { connect } from "react-redux";
import {
    sendMessage,
    replayMessage,
    loadingStart,
} from "../../redux/actions/message";
import { t } from "../../../../locals";
import styleCss from "./style";

function Compose(props) {
    const navigation = useNavigation();
    const [state, setState] = useState({
        subject: "",
        message: "",
        receiver_id: props.route?.params?.receiver_id || "",
        replyId: props.route?.params?.replyId || "",
    });

    const sendMessageAction = async () => {
        const { subject, message, receiver_id, replyId } = state;
        const { sendMessage, replayMessage, loadingStart } = props;

        if (!subject.trim()) {
            alert(t("Please enter subject"));
            return;
        }
        if (!message.trim()) {
            alert(t("Please enter message"));
            return;
        }

        loadingStart();
        const Id = await SecureStore.getItemAsync("id");
        const Token = await SecureStore.getItemAsync("access_token");

        if (replyId) {
            const replyData = {
                current_user_id: Id,
                access_token: Token,
                message_id: replyId,
                message: message,
            };
            replayMessage(replyData, navigation.navigate);
        } else {
            const messageData = {
                current_user_id: Id,
                access_token: Token,
                subject: subject,
                message: message,
                receiver_id: receiver_id,
            };
            sendMessage(messageData, navigation.navigate);
        }
    };

    const renderHeader = () => (
        <Row style={styleCss.NaveBar}>
            <Col>
                <Text style={styleCss.NaveText}>
                    {state.replyId ? t("Reply Message") : t("Compose")}
                </Text>
            </Col>
        </Row>
    );

    const { loading } = props;

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
            {renderHeader()}
            <ScrollView>
                <View style={styleCss.compose_container}>
                    {!state.replyId && (
                        <View style={styleCss.compose_subject_view}>
                            <TextInput
                                style={styleCss.compose_subject_input}
                                placeholder={t("Subject")}
                                placeholderTextColor="#102b46"
                                value={state.subject}
                                onChangeText={(subject) => 
                                    setState(prev => ({ ...prev, subject }))
                                }
                            />
                        </View>
                    )}
                    <View style={styleCss.compose_message_view}>
                        <TextInput
                            style={styleCss.compose_message_input}
                            placeholder={t("Message")}
                            placeholderTextColor="#102b46"
                            multiline={true}
                            numberOfLines={8}
                            value={state.message}
                            onChangeText={(message) => 
                                setState(prev => ({ ...prev, message }))
                            }
                        />
                    </View>
                    <View>
                        <TouchableOpacity
                            style={styleCss.compose_send_button}
                            onPress={sendMessageAction}
                        >
                            <Row style={styleCss.compose_send_button_container}>
                                <Text style={styleCss.compose_send_button_text}>
                                    {state.replyId ? t("Reply") : t("Send")}
                                </Text>
                            </Row>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const mapStateToProps = (state) => ({
    loading: state.message.loading,
});

const mapDispatchToProps = {
    sendMessage,
    replayMessage,
    loadingStart,
};

export default connect(mapStateToProps, mapDispatchToProps)(Compose);
