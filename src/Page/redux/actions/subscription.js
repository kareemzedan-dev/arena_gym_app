import {
    subscriptionHistoryAction,
} from '../../../util/action.js';
import { AlertHelper } from '../../App/AlertHelper';
import { t } from '../../../../locals';

import { SUBSCRIPTION_LIST, LOADING_START_SUBSCRIPTION, LOADING_END_SUBSCRIPTION } from '../constant/types';

const subscriptionData = data => ({
    type: SUBSCRIPTION_LIST,
    data,
});

const startLoading = () => ({
    type: LOADING_START_SUBSCRIPTION
});

const endLoading = () => ({
    type: LOADING_END_SUBSCRIPTION
});

export const fetchSubscriptionlist = (data) => dispatch => {
    dispatch(startLoading());
    
    subscriptionHistoryAction(data).then(responseJson => {
        if (responseJson.status == 1) {
            dispatch(subscriptionData(responseJson));
        } else {
            dispatch(endLoading());
            // Don't show warning for "Record not found" - this is expected when user has no subscription history
            if (responseJson.error_code !== 404 || responseJson.error !== "Record not found") {
                AlertHelper.show('warn', t('Warning'), responseJson.error);
            }
        }
    }).catch(error => {
        dispatch(endLoading());
        console.error('Subscription fetch error:', error);
    });
}

export const loadingStart = () => dispatch => {
        dispatch(startLoading());
}

export const loadingEnd = () => dispatch => {
        dispatch(endLoading());
}