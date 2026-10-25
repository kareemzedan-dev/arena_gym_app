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

const initialState = {
  loading: false,

  weightData: [],
  weightLabel: "",
  weightUnit: "",

  waistData: [],
  waistLabel: [],
  waistUnit: "",

  armData: [],
  armLabel: [],
  armUnit: "",

  legData: [],
  legLabel: [],
  legUnit: "",

  chestData: [],
  chestLabel: [],
  chestUnit: "",

  hipsData: [],
  hipsLabel: [],
  hipsUnit: "",

  calfData: [],
  calfLabel: [],
  calfUnit: "",

  thighData: [],
  thighLabel: [],
  thighUnit: "",

  glutesData: [],
  glutesLabel: [],
  glutesUnit: "",
};

export const dashboard = (state = initialState, action) => {
  switch (action.type) {
    case LOADING_START_DASHBOARD:
      return {
        ...state,
        loading: true,
      };

    case LOADING_END_DASHBOARD:
      return {
        ...state,
        loading: false,
      };

    case WEIGHT_DATA:
      return {
        ...state,
        weightData: action.data.result.value,
        weightLabel: action.data.result.date,
        weightUnit: action.data.result.measurment_unit,
      };

    case WAIST_DATA:
      return {
        ...state,
        waistData: action.data.result.value,
        waistLabel: action.data.result.date,
        waistUnit: action.data.result.measurment_unit,
      };

    case ARM_DATA:
      return {
        ...state,
        armData: action.data.result.value,
        armLabel: action.data.result.date,
        armUnit: action.data.result.measurment_unit,
      };

    case LEG_DATA:
      return {
        ...state,
        legData: action.data.result.value,
        legLabel: action.data.result.date,
        legUnit: action.data.result.measurment_unit,
      };

    case CHEST_DATA:
      return {
        ...state,
        chestData: action.data.result.value,
        chestLabel: action.data.result.date,
        chestUnit: action.data.result.measurment_unit,
      };

    case HIPS_DATA:
      return {
        ...state,
        hipsData: action.data.result.value,
        hipsLabel: action.data.result.date,
        hipsUnit: action.data.result.measurment_unit,
      };

    case CALF_DATA:
      return {
        ...state,
        calfData: action.data.result.value,
        calfLabel: action.data.result.date,
        calfUnit: action.data.result.measurment_unit,
      };

    case THIGH_DATA:
      return {
        ...state,
        thighData: action.data.result.value,
        thighLabel: action.data.result.date,
        thighUnit: action.data.result.measurment_unit,
      };

    case GLUTES_DATA:
      return {
        ...state,
        glutesData: action.data.result.value,
        glutesLabel: action.data.result.date,
        glutesUnit: action.data.result.measurment_unit,
      };

    default:
      return state;
  }
};