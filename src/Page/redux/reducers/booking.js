import { BOOKING_LIST, ADD_BOOKING, CANCEL_BOOKING, GET_CLASS_SCHEDULE, LOADING_START_BOOKING, LOADING_END_BOOKING } from '../constant/types';

const initialState = {
    loading: false,
    bookingData: [],
    classSchedule: {},
    bookedClass: 0,
    totalClass: 0,
    Classlimit: '',
    error: null,
}

export const booking = (state = initialState, action) => {
    switch (action.type) {
        case LOADING_START_BOOKING:
            return {
                ...state,
                loading: true,
                error: null,
            }
        case LOADING_END_BOOKING:
            return {
                ...state,
                loading: false,
            }
        case BOOKING_LIST:
            return {
                ...state,
                bookingData: action.data?.result || [],
                bookedClass: parseInt(action.data?.booked_class) || 0,
                totalClass: parseInt(action.data?.total_class) || 0,
                Classlimit: action.data?.membership_class_limit || '',
                loading: false,
                error: null,
            }
        case CANCEL_BOOKING:
            const filteredBookings = state.bookingData.filter(({ booking_id }) => booking_id !== action.data.booking_id);
            return {
                ...state,
                bookingData: filteredBookings,
                bookedClass: Math.max(0, state.bookedClass - 1),
                loading: false,
                error: null,
            }
        case GET_CLASS_SCHEDULE:
            // ✅ Backend now returns optimized data (current + 3 months only)
            return {
                ...state,
                classSchedule: action.data?.result || {},
                loading: false,
                error: null,
            }
        case ADD_BOOKING:
            return {
                ...state,
                bookedClass: state.bookedClass + 1,
                loading: false,
                error: null,
            }
        default:
            return state;
    }
}