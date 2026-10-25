import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from "react-native";
import * as SecureStore from "expo-secure-store";
import moment from "moment";
import { connect } from "react-redux";
import {
  fetchInboxviewmessagelist,
  inboxMessagesend,
  loadingStart
} from "../../redux/actions/inboxMessage";
import { t } from "../../../../locals";

const InboxView = ({ navigation, route, ...props }) => {
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [userImage, setUserImage] = useState("");
  const [title, setTitle] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [messageId, setMessageId] = useState("");

  const flatListRef = useRef();

  useEffect(() => {
    (async () => {
      const id = await SecureStore.getItemAsync("id");
      const token = await SecureStore.getItemAsync("access_token");
      
      // Safely get params with fallback values
      const routeParams = route?.params || {};
      const viewMessageID = routeParams.viewMessageID || "";
      const mid = routeParams.messagekey || "";
      const photo = routeParams.userImage || "";
      const headerTitle = routeParams.messagetitle || t("Message");
      const recvId = routeParams.receiverid || "";

      setUserId(id);
      setUserImage(photo);
      setTitle(headerTitle);
      setReceiverId(recvId);
      setMessageId(mid);

      if (mid && id && token) {
        props.loadingStart();
        props.fetchInboxviewmessagelist({
          message_id: mid,
          from: "inbox",
          current_user_id: id,
          view_message_id: viewMessageID,
          access_token: token
        });
      }
    })();
  }, [route?.params]);

  const onSend = async () => {
    if (!message.trim()) return;

    const token = await SecureStore.getItemAsync("access_token");

    props.loadingStart();
    props.inboxMessagesend({
      message_id: messageId,
      reply_message_content: message,
      receiver_id: receiverId,
      current_user_id: userId,
      access_token: token
    });

    setMessage("");
  };

  const renderItem = ({ item }) => {
    const isMe = item.sender_id === userId;

    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.bubbleRight : styles.bubbleLeft
        ]}
      >
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.messageTime}>
          {moment(item.created_at).format("hh:mm A")}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Inbox")}>
          <Image
            source={require("../../../images/view_msg_arrow.png")}
            style={styles.backArrow}
          />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {title}
        </Text>
      </View>

      {/* Chat body */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={props.ViewData}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          refreshControl={
            <RefreshControl
              colors={["#30afb5"]}
              refreshing={props.loading}
              onRefresh={() => {
                props.loadingStart();
                props.fetchInboxviewmessagelist(/* same payload if needed */);
              }}
            />
          }
          contentContainerStyle={{ padding: 10 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input section */}
        <View style={styles.inputBar}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            style={styles.textInput}
            placeholder={t("Type a message")}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={onSend}>
            <Text style={styles.sendButtonText}>{t("Send")}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#30afb5",
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  backArrow: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginRight: 10
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Cairo-Medium",
    flexShrink: 1
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 4
  },
  bubbleRight: {
    backgroundColor: "#30afb5",
    alignSelf: "flex-end"
  },
  bubbleLeft: {
    backgroundColor: "#bbb",
    alignSelf: "flex-start"
  },
  messageText: {
    color: "#fff",
    fontFamily: "Cairo-Medium",
    fontSize: 14
  },
  messageTime: {
    color: "#eee",
    fontSize: 10,
    marginTop: 4,
    fontFamily: "Cairo-Regular"
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#eee"
  },
  textInput: {
    flex: 1,
    height: 45,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 15,
    fontFamily: "Cairo-Medium"
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#30afb5",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20
  },
  sendButtonText: {
    color: "#fff",
    fontFamily: "Cairo-Bold"
  }
});

const mapStateToProps = (state) => ({
  ViewData: state.inboxMessage.inboxViewData,
  loading: state.inboxMessage.loading
});

const mapDispatchToProps = {
  fetchInboxviewmessagelist,
  inboxMessagesend,
  loadingStart
};

export default connect(mapStateToProps, mapDispatchToProps)(InboxView);
