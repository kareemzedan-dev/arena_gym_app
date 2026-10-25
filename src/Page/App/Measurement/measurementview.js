import React, { useEffect, useCallback, useRef } from 'react';
import {
    BackHandler,
    ActivityIndicator,
    RefreshControl,
    Text,
    View,
    Image,
    StatusBar,
    ScrollView,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Col, Row } from 'react-native-easy-grid';
import { useNavigation } from '@react-navigation/native';
import { useNavigationEvents } from '../../../util/navigation-hooks';
import { connect } from "react-redux";
import { view_measurement, loadingStart } from "../../redux/actions/measurement";
import { t } from '../../../../locals';
import styleCss from '../../../style.js';

function MeasurementView(props) {
    const navigation = useNavigation();
    const backHandlerRef = useRef(null);

    useEffect(() => {
        viewMeasurement();
    }, []);

    const handleBackButton = useCallback(() => {
        navigation.navigate('addmeasurement');
        return true;
    }, [navigation]);

    useNavigationEvents({
        onWillFocus: () => {
            backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
        },
        onWillBlur: () => {
            if (backHandlerRef.current) {
                backHandlerRef.current.remove();
            }
        }
    });

    const viewMeasurement = async () => {
        const { view_measurement, loadingStart } = props;
        loadingStart();
        const Id = await SecureStore.getItemAsync("id");
        const Token = await SecureStore.getItemAsync("access_token");

        const viewData = {
            "current_user_id": Id,
            "access_token": Token,
        };
        view_measurement(viewData);
    };

    const onRefresh = () => {
        viewMeasurement();
    };

    const { loading, measurementData } = props;

    if (!loading) {
        return (
            <View style={styleCss.container}>
                <StatusBar />
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            colors={["#30afb5"]}
                            refreshing={loading}
                            onRefresh={onRefresh}
                        />
                    }
                >
                    {(measurementData.length !== 0) ? (
                        <View>
                            {measurementData.map((View, index) => (
                                <Row style={styleCss.viewmeasurement_data_row} key={index}>
                                    <Col style={styleCss.viewmeasurement_image_col}>
                                        <Image 
                                            style={styleCss.viewmeasurement_image}
                                            source={{ uri: View.photo }}
                                        />
                                    </Col>
                                    <Col style={styleCss.viewmeasurement_data_col}>
                                        <Text style={styleCss.viewmeasurement_data_text}>
                                            {View.measurement}
                                        </Text>
                                        <Text style={styleCss.viewmeasurement_data_text_two}>
                                            {View.record_date}
                                        </Text>
                                    </Col>
                                    <Col style={styleCss.viewmeasurement_data_col_two}>
                                        <Text style={styleCss.viewmeasurement_data_text_three}>
                                            {View.result}
                                        </Text>
                                    </Col>
                                </Row>
                            ))}
                        </View>
                    ) : (
                        <View style={styleCss.emptyContainer}>
                            <Text style={styleCss.viewmeasurement_nodata_text}>
                                {t("Measurement Data are Not Available")}
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        );
    } else {
        return (
            <ActivityIndicator
                style={styleCss.loading}
                size="large"
                color="#30afb5"
            />
        );
    }
}

const mapStateToProps = (state) => {
    return {
        loading: state.measurement.loading,
        measurementData: state.measurement.measurementList,
    };
};

const mapDispatchToProps = {
    view_measurement,
    loadingStart
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementView);