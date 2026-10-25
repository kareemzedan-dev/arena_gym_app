import {
  listWorkoutLogAction,
  addWorkoutLogAction,
  workoutdateArrayAction,
  viewWorkoutLogAction,
  viewAssignWorkoutAction
} from "../../../util/action.js";
import { AlertHelper } from "../../App/AlertHelper";
import { t } from "../../../../locals";

import {
  LOADING_START_WORKOUT,
  LOADING_END_WORKOUT,
  WORKOUT_DATES_LIST,
  WORKOUT_DETAILS,
  PREVIEW_WORKOUT,
  MAKE_WORKOUT_EMPTY,
  MAKE_PREVIEW_WORKOUT_EMPTY
} from "../constant/types";

const setWorkoutDates = (data) => ({
  type: WORKOUT_DATES_LIST,
  data,
});

const setSingleWorkoutDetails = (data) => ({
  type: WORKOUT_DETAILS,
  data,
});

const setSingleWorkoutEmpty = () => ({
  type: MAKE_WORKOUT_EMPTY,
});

const setPreviewWorkoutData = (data) => ({
  type: PREVIEW_WORKOUT,
  data,
});

const setPreviewWorkoutEmpty = () => ({
  type: MAKE_PREVIEW_WORKOUT_EMPTY,
});

const startLoading = () => ({
  type: LOADING_START_WORKOUT,
});

const endLoading = () => ({
  type: LOADING_END_WORKOUT,
});

export const fetchWorkoutDates = (data) => (dispatch) => {
  // Set timeout fallback to prevent infinite loading
  const timeoutId = setTimeout(() => {
    dispatch(endLoading());
    console.warn("Workout dates fetch timed out");
  }, 15000); // 15 second timeout

  return workoutdateArrayAction(data)
    .then((responseJson) => {
      clearTimeout(timeoutId);
      console.log("Workout dates response:", responseJson);
      if (responseJson && responseJson.status == 1) {
        dispatch(setWorkoutDates(responseJson));
        // Loading is set to false in the reducer for WORKOUT_DATES_LIST
      } else {
        dispatch(endLoading());
        const errorMessage = responseJson?.error || "Failed to fetch workout dates";
        AlertHelper.show("warn", t("Warning"), errorMessage);
      }
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      dispatch(endLoading());
      console.error("Error fetching workout dates:", error);
      AlertHelper.show("error", t("Error"), t("Failed to fetch workout dates. Please try again."));
    });
};

export const fetchWorkoutDetails = (data) => (dispatch) => {
  // Set timeout fallback to prevent infinite loading
  const timeoutId = setTimeout(() => {
    dispatch(setSingleWorkoutEmpty());
    console.warn("Workout details fetch timed out");
  }, 15000); // 15 second timeout

  return viewAssignWorkoutAction(data)
    .then((responseJson) => {
      clearTimeout(timeoutId);
      console.log("Workout details response:", responseJson);
      if (responseJson && responseJson.status == 1) {
        dispatch(setSingleWorkoutDetails(responseJson));
        // Loading is set to false in the reducer for WORKOUT_DETAILS
      } else {
        dispatch(setSingleWorkoutEmpty());
        const errorMessage = responseJson?.error || "Failed to fetch workout details";
        AlertHelper.show("warn", t("Warning"), errorMessage);
      }
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      dispatch(setSingleWorkoutEmpty());
      console.error("Error fetching workout details:", error);
      AlertHelper.show("error", t("Error"), t("Failed to fetch workout details. Please try again."));
    });
};

export const addWorkout = (data) => (dispatch) => {
  // Set timeout fallback to prevent infinite loading
  const timeoutId = setTimeout(() => {
    dispatch(endLoading());
    console.warn("Add workout timed out");
    AlertHelper.show("error", t("Error"), t("Request timed out. Please try again."));
  }, 20000); // 20 second timeout for save operations

  return addWorkoutLogAction(data)
    .then((responseJson) => {
      clearTimeout(timeoutId);
      dispatch(endLoading());
      console.log("💾 Add workout response:", responseJson);
      console.log("📊 Response status:", responseJson?.status);
      console.log("📝 Response error:", responseJson?.error);
      
      if (responseJson && responseJson.status == 1) {
        dispatch(setSingleWorkoutEmpty());
        const successMessage = responseJson.error || "Workout saved successfully";
        console.log("✅ Success message:", successMessage);
        AlertHelper.show("success", t("Success"), successMessage);
        return responseJson; // Return success response
      } else {
        const errorMessage = responseJson?.error || "Failed to save workout";
        console.log("❌ Error message:", errorMessage);
        AlertHelper.show("warn", t("Warning"), errorMessage);
        throw new Error(errorMessage); // Throw error so component can catch it
      }
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      dispatch(endLoading());
      console.error("Error adding workout:", error);
      AlertHelper.show("error", t("Error"), t("Failed to save workout. Please try again."));
    });
};

export const fetchPreviewWorkout = (data) => (dispatch) => {
  // Set timeout fallback to prevent infinite loading
  const timeoutId = setTimeout(() => {
    dispatch(setPreviewWorkoutEmpty());
    console.warn("Preview workout fetch timed out");
  }, 15000); // 15 second timeout

  return viewWorkoutLogAction(data)
    .then((responseJson) => {
      clearTimeout(timeoutId);
      console.log("Preview workout response:", responseJson);
      if (responseJson && responseJson.status == 1) {
        dispatch(setPreviewWorkoutData(responseJson));
        // Loading is set to false in the reducer for PREVIEW_WORKOUT
      } else {
        dispatch(setPreviewWorkoutEmpty());
        const errorMessage = responseJson?.error || "Failed to fetch workout preview";
        AlertHelper.show("warn", t("Warning"), errorMessage);
      }
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      dispatch(setPreviewWorkoutEmpty());
      console.error("Error fetching preview workout:", error);
      AlertHelper.show("error", t("Error"), t("Failed to fetch workout preview. Please try again."));
    });
};

export const fetchAssignedWorkout = (data) => (dispatch) => {
  // Set timeout fallback to prevent infinite loading
  const timeoutId = setTimeout(() => {
    dispatch(setSingleWorkoutEmpty());
    console.warn("Assigned workout fetch timed out");
  }, 15000); // 15 second timeout

  return listWorkoutLogAction(data)
    .then((responseJson) => {
      clearTimeout(timeoutId);
      console.log("Assigned workout response:", responseJson);
      if (responseJson && responseJson.status == 1) {
        dispatch(setSingleWorkoutDetails(responseJson));
        // Loading is set to false in the reducer for WORKOUT_DETAILS
      } else {
        dispatch(setSingleWorkoutEmpty());
        const errorMessage = responseJson?.error || "Failed to fetch assigned workout";
        AlertHelper.show("warn", t("Warning"), errorMessage);
      }
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      dispatch(setSingleWorkoutEmpty());
      console.error("Error fetching assigned workout:", error);
      AlertHelper.show("error", t("Error"), t("Failed to fetch assigned workout. Please try again."));
    });
};

export const makeAddWorkoutEmpty = () => (dispatch) => {
  dispatch(setSingleWorkoutEmpty());
};

export const makeViewWorkoutEmpty = () => (dispatch) => {
  dispatch(setPreviewWorkoutEmpty());
};

export const loadingStart = () => (dispatch) => {
  dispatch(startLoading());
};

export const loadingEnd = () => (dispatch) => {
  dispatch(endLoading());
};
