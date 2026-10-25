import { StyleSheet, Dimensions } from "react-native";
const { width } = Dimensions.get("window");

export default StyleSheet.create({
  attendance_container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  attendance_name_col: {
    backgroundColor: "#30afb5",
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  attendance_name_text: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Cairo-SemiBold",
  },

  attendance_collapse_row: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  attendance_collapse_text_col: {
    flex: 1,
    justifyContent: "center",
  },

  attendance_collapse_image_col: {
    width: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  attendance_collapse_text: {
    fontSize: 16,
    color: "#999999",
    fontFamily: "Cairo-Regular",
  },

  attendance_ClassText: {
    fontSize: 16,
    color: "#30afb5",
    fontWeight: "bold",
    fontFamily: "Cairo-Bold",
  },

  attendance_collapse_image: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },

  attendance_collapse_body: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: "#f8f8f8",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },

  attendance_body_list: {
    marginVertical: 5,
  },

  attendance_body_item: {
    padding: 12,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#30afb5",
  },

  attendance_body_item_text: {
    fontSize: 16,
    color: "#333333",
    fontFamily: "Cairo-Regular",
  },

  attendance_row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },

  attendance_image_col: {
    flex: 0.5,
    alignItems: "center",
  },

  attendance_image_css: {
    width: 20,
    height: 20,
    backgroundColor: "green",
    borderRadius: 10,
  },

  attendance_image_two_css: {
    width: 20,
    height: 20,
    backgroundColor: "red",
    borderRadius: 10,
  },

  attendance_col: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  attendance_image_col_text: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 5,
    fontFamily: "Cairo-Regular",
  },

  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#888",
    fontFamily: "Cairo-Regular",
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
