import {
  classListAction,
  viewMemberAttendanceListAction,
  membershipReportAction, // Add this import
} from "../../../util/action.js";
import { AlertHelper } from "../../App/AlertHelper";
import { t } from "../../../../locals";

import {
  LOADING_START_MEMBER,
  LOADING_END_MEMBER,
  ALL_CLASS_LIST,
  ATTENDANCE_DATA,
  MEMBERSHIP_DETAILS, // Add this constant
} from "../constant/types";

const setClassData = (data) => ({
  type: ALL_CLASS_LIST,
  data,
});

const setAttendanceData = (data) => ({
  type: ATTENDANCE_DATA,
  data,
});

// Add this new action creator
const setMembershipDetails = (data) => ({
  type: MEMBERSHIP_DETAILS,
  data,
});

const startLoading = () => ({
  type: LOADING_START_MEMBER,
});

const endLoading = () => ({
  type: LOADING_END_MEMBER,
});

export const fetchAllClass = (data) => (dispatch) => {
  dispatch(startLoading());
  classListAction(data).then((responseJson) => {
    if (responseJson.status == 1) {
      dispatch(setClassData(responseJson));
      dispatch(endLoading()); // Ensure loading ends on success
    } else {
      dispatch(endLoading());
      AlertHelper.show("warn", t("Warning"), responseJson.error);
    }
  }).catch((error) => {
    dispatch(endLoading());
    AlertHelper.show("error", t("Error"), error.message);
  });
};

export const fetchMemberAttendace = (data) => (dispatch) => {
  dispatch(startLoading());
  viewMemberAttendanceListAction(data).then((responseJson) => {
    if (responseJson.status == 1) {
      dispatch(setAttendanceData(responseJson));
      dispatch(endLoading()); // Ensure loading ends on success
    } else {
      dispatch(endLoading());
      AlertHelper.show("warn", t("Warning"), responseJson.error);
    }
  }).catch((error) => {
    dispatch(endLoading());
    AlertHelper.show("error", t("Error"), error.message);
  });
};

// Add this new action
export const fetchMembershipDetails = (data) => (dispatch) => {
  dispatch(startLoading());
  
  // Assuming you have a membershipDetailsAction function in your util/action.js
  // If not, you'll need to create it
  membershipReportAction(data).then((responseJson) => {
    if (responseJson.status == 1) {
      dispatch(setMembershipDetails(responseJson.result));
      dispatch(endLoading()); // Add this line to ensure loading ends on success
    } else {
      dispatch(endLoading());
      AlertHelper.show("warn", t("Warning"), responseJson.error);
    }
  }).catch((error) => {
    dispatch(endLoading());
    AlertHelper.show("error", t("Error"), error.message);
  });
};

export const loadingStart = () => (dispatch) => {
  dispatch(startLoading());
};