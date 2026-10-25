import {
  USER_LOGOUT,
  GET_USER_DETAILS,
  LOADING_START_SIGNUP,
  LOADING_END_SIGNUP,
  MEMBERSHIP_DROPDOWN_LIST,
  MEMBERSHIP_CLASS_LIST,
  MEMBERSHIP_DAYS,
  SIGNUP_SUCCESS,
  USER_LOGIN,
} from '../constant/types';

const initialState = {
  loading: false,
  membershipData: [],
  membershipClassData: [],
  membershipDays: [],
  userData: null,
  userToken: null,
  userRole: null,
  error: null,
  lastFetchAttempt: null,
};

export const auth = (state = initialState, action) => {
  switch (action.type) {
    case LOADING_START_SIGNUP:
      return {
        ...state,
        loading: true,
        error: null,
        lastFetchAttempt: Date.now(),
      };
    case LOADING_END_SIGNUP:
      return {
        ...state,
        loading: false,
      };
    case USER_LOGOUT:
      return {
        ...initialState, // Reset to initial state on logout
      };
    case USER_LOGIN:
      return {
        ...state,
        loading: false,
        userToken: action.payload.token,
        userRole: action.payload.role,
        error: null,
        userData: null, // Reset userData on new login
      };
    case MEMBERSHIP_DROPDOWN_LIST:
      return {
        ...state,
        membershipData: action.data.result,
        loading: false,
        error: null,
      };
    case MEMBERSHIP_CLASS_LIST:
      return {
        ...state,
        membershipClassData: action.data.result,
        loading: false,
        error: null,
      };
    case MEMBERSHIP_DAYS:
      return {
        ...state,
        membershipDays: action.data.membership_days,
        loading: false,
        error: null,
      };
    case SIGNUP_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };
    case GET_USER_DETAILS:
      // Handle both successful and failed user details fetch
      if (action.data && action.data.status === 1 && action.data.result) {
        return {
          ...state,
          userData: action.data.result,
          loading: false,
          error: null,
        };
      } else {
        // If user details fetch fails, set error but keep token
        return {
          ...state,
          loading: false,
          error: action.data?.error || 'Failed to fetch user details',
          userData: null,
        };
      }
    case 'USER_FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.error,
        userData: null,
      };
    case 'CLEAR_AUTH_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};