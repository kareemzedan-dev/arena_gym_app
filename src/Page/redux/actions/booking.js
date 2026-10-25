import {
    cancelBookingClassAction,
    classBookingListAction,
    classBooingAction,
    classScheduleDataAction
} from '../../../util/action.js';
import { AlertHelper } from '../../App/AlertHelper';
import { SecureStorageHelper } from '../../../util/secureStorage';
import { t } from '../../../../locals';

import { BOOKING_LIST, ADD_BOOKING, CANCEL_BOOKING, GET_CLASS_SCHEDULE, LOADING_START_BOOKING, LOADING_END_BOOKING } from '../constant/types';

const myBookingData = data => ({
    type: BOOKING_LIST,
    data,
});

const dataStore = data => ({
    type: ADD_BOOKING,
    data,
});

const deleteBooking = data => ({
    type: CANCEL_BOOKING,
    data,
});

const fetchClassScheduleData = data => ({
    type: GET_CLASS_SCHEDULE,
    data,
});

const startLoading = () => ({
    type: LOADING_START_BOOKING
});

const endLoading = () => ({
    type: LOADING_END_BOOKING,
});

export const fetchBooking = (data) => async dispatch => {
    try {
        const responseJson = await classBookingListAction(data);
        if (responseJson && responseJson.status == 1) {
            dispatch(myBookingData(responseJson));
        } else {
            dispatch(endLoading());
            if (responseJson && responseJson.error) {
                AlertHelper.show('warn', t('Warning'), responseJson.error);
            }
        }
        return responseJson;
    } catch (error) {
        console.error('Error fetching booking:', error);
        dispatch(endLoading());
        AlertHelper.show('error', t('Error'), t('Something went wrong. Please try again.'));
        throw error;
    }
}

export const addBooking = (data) => async dispatch => {
    try {
        const responseJson = await classBooingAction(data);
        if (responseJson && responseJson.status == 1) {
            AlertHelper.show('success', t("Success"), responseJson.error || t("Class booked successfully"));
            await dispatch(fetchClassSchedule(data));
            await dispatch(fetchBooking(data));
        } else {
            dispatch(endLoading());
            AlertHelper.show('warn', t('Warning'), responseJson?.error || t('Booking failed'));
        }
        return responseJson;
    } catch (error) {
        console.error('Error adding booking:', error);
        dispatch(endLoading());
        AlertHelper.show('error', t('Error'), t('Something went wrong. Please try again.'));
        throw error;
    }
}

export const cancelBooking = (data) => async dispatch => {
    try {
        // Optimistically update the UI
        dispatch(deleteBooking(data));
        
        const responseJson = await cancelBookingClassAction(data);
        if (responseJson && responseJson.status == 1) {
            await dispatch(fetchClassSchedule(data));
            AlertHelper.show('success', t("Success"), responseJson.error || t("Booking canceled successfully"));
            dispatch(endLoading());
        } else {
            // Revert the optimistic update by refetching
            await dispatch(fetchBooking(data));
            dispatch(endLoading());
            AlertHelper.show('warn', t('Warning'), responseJson?.error || t('Cancellation failed'));
        }
        return responseJson;
    } catch (error) {
        console.error('Error canceling booking:', error);
        // Revert the optimistic update by refetching
        await dispatch(fetchBooking(data));
        dispatch(endLoading());
        AlertHelper.show('error', t('Error'), t('Something went wrong. Please try again.'));
        throw error;
    }
}

export const fetchClassSchedule = (data) => async dispatch => {
    try {
        const responseJson = await classScheduleDataAction(data);
        if (responseJson && responseJson.status == 1) {
            dispatch(fetchClassScheduleData(responseJson));
        } else {
            dispatch(endLoading());
            if (responseJson && responseJson.error) {
                AlertHelper.show('warn', t('Warning'), responseJson.error);
            }
        }
        return responseJson;
    } catch (error) {
        console.error('Error fetching class schedule:', error);
        dispatch(endLoading());
        AlertHelper.show('error', t('Error'), t('Something went wrong. Please try again.'));
        throw error;
    }
}

export const loadingStart = () => dispatch => {
    dispatch(startLoading());
}