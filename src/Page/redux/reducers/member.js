import { 
  LOADING_START_MEMBER, 
  LOADING_END_MEMBER, 
  ALL_CLASS_LIST, 
  ATTENDANCE_DATA,
  MEMBERSHIP_DETAILS // Add this import
} from '../constant/types';

const initialState = {
    loading: false,
    allClassList: [],
    attendanceData: [],
    membershipDetails: null, // Add this new state property
}

export const member = (state = initialState, action) => {
    switch (action.type) {
        case LOADING_START_MEMBER:
            return {
                ...state,
                loading: true,
            }
        case LOADING_END_MEMBER:
            return {
                ...state,
                loading: false,
            }
        case ALL_CLASS_LIST:
            return {
                ...state,
                allClassList: action.data.result,
                loading: false,
            }
        case ATTENDANCE_DATA:
            return {
                ...state,
                attendanceData: action.data.result,
                loading: false,
            }
        // Add this new case
        case MEMBERSHIP_DETAILS:
            return {
                ...state,
                membershipDetails: action.data,
                loading: false,
            }
        default:
            return state;
    }
}