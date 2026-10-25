import {
  dashboardReportAction,
  dashboardReportWaistAction,
  dashboardReportArmsAction,
  dashboardReportLegAction,
  dashboardReportChestAction,
  dashboardReportHipsAction,
  dashboardReportCalfAction,
  dashboardReportThighAction,
  dashboardReportGlutesAction,
} from "../../../util/action.js";
import { AlertHelper } from "../../App/AlertHelper";
import { t } from "../../../../locals";

import {
  LOADING_START_DASHBOARD,
  LOADING_END_DASHBOARD,
  WEIGHT_DATA,
  WAIST_DATA,
  ARM_DATA,
  LEG_DATA,
  CHEST_DATA,
  HIPS_DATA,
  CALF_DATA,
  THIGH_DATA,
  GLUTES_DATA,
} from "../constant/types";

const setWeightData = (data) => ({
  type: WEIGHT_DATA,
  data,
});

const setWaistData = (data) => ({
  type: WAIST_DATA,
  data,
});

const setArmData = (data) => ({
  type: ARM_DATA,
  data,
});

const setLegData = (data) => ({
  type: LEG_DATA,
  data,
});

const setChestData = (data) => ({
  type: CHEST_DATA,
  data,
});

const setHipsData = (data) => ({
  type: HIPS_DATA,
  data,
});

const setCalfData = (data) => ({
  type: CALF_DATA,
  data,
});

const setThighData = (data) => ({
  type: THIGH_DATA,
  data,
});

const setGlutesData = (data) => ({
  type: GLUTES_DATA,
  data,
});

const startLoading = () => ({
  type: LOADING_START_DASHBOARD,
});

const endLoading = () => ({
  type: LOADING_END_DASHBOARD,
});

export const fetchWeightData = (data) => (dispatch) => {
  return dashboardReportAction(data)
    .then((responseJson) => {
      if (responseJson.status == 1) {
        dispatch(setWeightData(responseJson));
        dispatch(endLoading());
      } else {
        dispatch(endLoading());
        AlertHelper.show("warn", t("Warning"), responseJson.error);
      }
    })
    .catch((error) => {
      dispatch(endLoading());
      console.error("fetchWeightData error:", error);
    });
};

export const fetchWaistData = (data) => (dispatch) => {
  return dashboardReportWaistAction(data)
    .then((responseJson) => {
      if (responseJson.status == 1) {
        dispatch(setWaistData(responseJson));
        dispatch(endLoading());
      } else {
        dispatch(endLoading());
        // AlertHelper.show("warn", t("Warning"), responseJson.error);
      }
    })
    .catch((error) => {
      dispatch(endLoading());
      console.error("fetchWaistData error:", error);
    });
};

export const fetchArmData = (data) => (dispatch) => {
  return dashboardReportArmsAction(data)
    .then((responseJson) => {
      if (responseJson.status == 1) {
        dispatch(setArmData(responseJson));
        dispatch(endLoading());
      } else {
        dispatch(endLoading());
        // AlertHelper.show("warn", t("Warning"), responseJson.error);
      }
    })
    .catch((error) => {
      dispatch(endLoading());
      console.error("fetchArmData error:", error);
    });
};

export const fetchLegData = (data) => (dispatch) => {
  return dashboardReportLegAction(data)
    .then((responseJson) => {
      if (responseJson.status == 1) {
        dispatch(setLegData(responseJson));
        dispatch(endLoading());
      } else {
        dispatch(endLoading());
        // AlertHelper.show("warn", t("Warning"), responseJson.error);
      }
    })
    .catch((error) => {
      dispatch(endLoading());
      console.error("fetchLegData error:", error);
    });
};

export const fetchChestData = (data) => (dispatch) => {
  return dashboardReportChestAction(data)
    .then((responseJson) => {
      if (responseJson.status == 1) {
        dispatch(setChestData(responseJson));
        dispatch(endLoading());
      } else {
        dispatch(endLoading());
        // AlertHelper.show("warn", t("Warning"), responseJson.error);
      }
    })
    .catch((error) => {
      dispatch(endLoading());
      console.error("fetchChestData error:", error);
    });
};

export const fetchHipsData = (data) => (dispatch) => {
  return dashboardReportHipsAction(data)
    .then((responseJson) => {
      if (responseJson.status == 1) {
        dispatch(setHipsData(responseJson));
        dispatch(endLoading());
      } else {
        dispatch(endLoading());
        // AlertHelper.show("warn", t("Warning"), responseJson.error);
      }
    })
    .catch((error) => {
      dispatch(endLoading());
      console.error("fetchHipsData error:", error);
    });
};

export const fetchCalfData = (data) => (dispatch) => {
  return dashboardReportCalfAction(data)
    .then((responseJson) => {
      if (responseJson.status == 1) {
        dispatch(setCalfData(responseJson));
        dispatch(endLoading());
      } else {
        dispatch(endLoading());
        // AlertHelper.show("warn", t("Warning"), responseJson.error);
      }
    })
    .catch((error) => {
      dispatch(endLoading());
      console.error("fetchCalfData error:", error);
    });
};

export const fetchThighData = (data) => (dispatch) => {
  return dashboardReportThighAction(data)
    .then((responseJson) => {
      if (responseJson.status == 1) {
        dispatch(setThighData(responseJson));
        dispatch(endLoading());
      } else {
        dispatch(endLoading());
        // AlertHelper.show("warn", t("Warning"), responseJson.error);
      }
    })
    .catch((error) => {
      dispatch(endLoading());
      console.error("fetchThighData error:", error);
    });
};

export const fetchGlutesData = (data) => (dispatch) => {
  return dashboardReportGlutesAction(data)
    .then((responseJson) => {
      if (responseJson.status == 1) {
        dispatch(setGlutesData(responseJson));
        dispatch(endLoading());
      } else {
        dispatch(endLoading());
        // AlertHelper.show("warn", t("Warning"), responseJson.error);
      }
    })
    .catch((error) => {
      dispatch(endLoading());
      console.error("fetchGlutesData error:", error);
    });
};

export const loadingStart = () => (dispatch) => {
  dispatch(startLoading());
};