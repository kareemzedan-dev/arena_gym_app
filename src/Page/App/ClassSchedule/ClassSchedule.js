import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    Image,
    RefreshControl,
    StatusBar,
    FlatList,
    SafeAreaView,
    BackHandler
} from "react-native";
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { useNavigationEvents } from '../../../util/navigation-hooks';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { t } from "../../../../locals";
import styleCss from "./ClassScheduleStyle";
import { connect } from "react-redux";
import { fetchClassSchedule, loadingStart } from "../../redux/actions/classSchedule";

// Load the appropriate locale for moment - Simplified to avoid require issues
const loadLocale = (locale) => {
    try {
        // Just set the locale without dynamic requires to avoid module loading issues
        moment.locale(locale || 'en');
    } catch (error) {
        console.warn(`Failed to load locale ${locale}:`, error);
        moment.locale('en');
    }
};

function ClassSchedule(props) {
    const navigation = useNavigation();
    const [state, setState] = useState({
        selectedDate: moment().local().format('YYYY-MM-DD'),
        data: [],
    });

    useEffect(() => {
        const setupComponent = () => {
            loadLocale(moment.locale());
            classScheduleList();
        };
        setupComponent();
    }, []);

    // Effect to update data when classScheduleData or selectedDate changes
    useEffect(() => {
        if (props.classScheduleData) {
            renderShow();
        }
    }, [props.classScheduleData, state.selectedDate]);

    const handleBackButton = useCallback(() => {
        navigation.navigate('Home');
        return true;
    }, [navigation]);

    useNavigationEvents({
        onWillFocus: () => {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
            return () => backHandler?.remove();
        },
        onWillBlur: () => {
            // Cleanup is handled by the return function in onWillFocus
        }
    });

    const classScheduleList = async () => {
        const { fetchClassSchedule, loadingStart } = props;
        loadingStart();

        const Id = await SecureStore.getItemAsync("id");
        const Token = await SecureStore.getItemAsync("access_token");

        const params = {
            current_user_id: Id,
            access_token: Token,
        };

        await fetchClassSchedule(params);
        // renderShow() will be called automatically by useEffect when classScheduleData updates
    };

    const renderShow = () => {
        const { classScheduleData } = props;
        if (!classScheduleData) {
            console.log('ClassSchedule: No classScheduleData available');
            return;
        }

        console.log('ClassSchedule: classScheduleData:', classScheduleData);
        console.log('ClassSchedule: selectedDate:', state.selectedDate);

        const scheduleEntries = Object.entries(classScheduleData);
        console.log('ClassSchedule: scheduleEntries:', scheduleEntries);

        // Ensure we're using local timezone for date calculations
        const selectedMoment = moment(state.selectedDate).local();
        const dayOfWeek = selectedMoment.weekday(); // 0 = Monday, 6 = Sunday in moment.js
        
        console.log('ClassSchedule: selectedDate (local):', selectedMoment.format('YYYY-MM-DD dddd'));
        console.log('ClassSchedule: dayOfWeek:', dayOfWeek);
        console.log('ClassSchedule: day name:', selectedMoment.format('dddd'));

        let dayData = [];

        // Try to find classes for the selected day by day name (more reliable than index)
        const dayName = selectedMoment.format('dddd'); // Full day name: Monday, Tuesday, etc.
        
        console.log('ClassSchedule: Looking for day name:', dayName);
        
        // Find the day in the schedule entries
        const dayEntry = scheduleEntries.find(([dayKey, dayClasses]) => {
            return dayKey.toLowerCase() === dayName.toLowerCase();
        });
        
        if (dayEntry) {
            const [dayKey, dayClasses] = dayEntry;
            console.log(`ClassSchedule: Found match for ${dayName} (${dayKey}):`, dayClasses);
            
            if (Array.isArray(dayClasses)) {
                // If it's already an array, use it directly
                dayData = dayClasses.map((classItem, index) => [index, classItem]);
            } else if (typeof dayClasses === 'object' && dayClasses !== null) {
                // If it's an object, convert to entries
                dayData = Object.entries(dayClasses);
            }
        } else {
            console.log(`ClassSchedule: No classes found for ${dayName}`);
        }

        console.log('ClassSchedule: Final dayData:', dayData);
        console.log('ClassSchedule: Number of classes found:', dayData.length);
        setState(prev => ({ ...prev, data: dayData }));
    };

    const renderItem = ({ item }) => {
        // Handle different data structures
        let classData;
        
        if (Array.isArray(item) && item.length >= 2) {
            // If item is an array like [index, classObject]
            classData = item[1];
        } else if (typeof item === 'object' && item !== null) {
            // If item is the class object directly
            classData = item;
        } else {
            console.warn('ClassSchedule: Unexpected item structure:', item);
            return null;
        }

        // Ensure we have the required class data
        if (!classData || !classData.class_name) {
            console.warn('ClassSchedule: Missing class data:', classData);
            return null;
        }

        return (
            <View style={styleCss.scheduleItemContainer}>
                <View style={styleCss.scheduleItemCard}>
                    <View style={styleCss.classInfoContainer}>
                        <View style={styleCss.classNameContainer}>
                            <Text style={styleCss.classNameText}>
                                {classData.class_name}
                            </Text>
                        </View>
                        <View style={styleCss.timeInfoContainer}>
                            <View style={styleCss.timeIconContainer}>
                                <Image
                                    style={styleCss.timeIcon}
                                    source={require('../../../images/Time-512.png')}
                                />
                            </View>
                            <View style={styleCss.timeTextContainer}>
                                <Text style={styleCss.timeText}>
                                    {classData.start_time} - {classData.end_time}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const onRefresh = useCallback(() => {
        setState(prev => ({ ...prev, data: [] }));
        classScheduleList();
    }, []);

    const onDateSelected = useCallback((day) => {
        // Ensure we're working with local timezone
        const localDate = moment(day.dateString).local().format('YYYY-MM-DD');
        console.log('ClassSchedule: Date selected:', day.dateString, 'Local:', localDate);
        setState(prev => ({ ...prev, selectedDate: localDate }));
        // renderShow() will be called automatically by useEffect when selectedDate updates
    }, []);

    const onMonthChange = useCallback((month) => {
        // This will trigger a re-render with new marked dates for the visible month
        // The getMarkedDates function will calculate dots for the new month
    }, []);
// Create marked dates object for calendar with dots for days that have classes
const getMarkedDates = () => {
    const marked = {};
    
    // Add dots for days that have classes
    if (props.classScheduleData) {
        const selectedMoment = moment(state.selectedDate);
        const currentMonth = selectedMoment.format('YYYY-MM');
        const daysInMonth = selectedMoment.daysInMonth();
        
        // Get the first day of the month and its weekday (avoid timezone shifts)
        const firstDayOfMonth = moment({
            year: selectedMoment.year(),
            month: selectedMoment.month(),
            date: 1
        });
        
        // Iterate through each day of the current month
        for (let day = 1; day <= daysInMonth; day++) {
            // Create date properly to avoid timezone shifts
            const currentDate = moment(firstDayOfMonth).clone().date(day);
            const dateString = currentDate.format('YYYY-MM-DD');
            const dayOfWeek = currentDate.weekday(); // 0 = Monday, 6 = Sunday
            
            // Check if this day has classes using day name
            const scheduleEntries = Object.entries(props.classScheduleData);
            const dayName = currentDate.format('dddd'); // Full day name
            let hasClasses = false;
            
            // Find the day in the schedule by name
            const dayEntry = scheduleEntries.find(([dayKey, dayClasses]) => {
                return dayKey.toLowerCase() === dayName.toLowerCase();
            });
            
            if (dayEntry) {
                const [dayKey, dayClasses] = dayEntry;
                if (Array.isArray(dayClasses) && dayClasses.length > 0) {
                    hasClasses = true;
                } else if (typeof dayClasses === 'object' && Object.keys(dayClasses).length > 0) {
                    hasClasses = true;
                }
            }
            
            // Add dot for days with classes
            if (hasClasses) {
                marked[dateString] = {
                    marked: true,
                    dotColor: '#30afb5'
                };
                }
            }
        }
        
        // Add selected date styling (this will override the dot if on the same day)
        marked[state.selectedDate] = {
            ...marked[state.selectedDate], // Keep existing dot if present
            selected: true,
            selectedColor: '#30afb5',
            selectedTextColor: 'white'
        };
        
        return marked;
    };

    const markedDates = getMarkedDates();

    const { loading } = props;

    if (loading) {
        return (
            <View style={styleCss.loadingContainer}>
                <ActivityIndicator
                    style={styleCss.loadingIndicator}
                    size="large"
                    color="#30afb5"
                />
            </View>
        );
    }

    return (
        <View style={styleCss.mainContainer}>
            <StatusBar />
            <Calendar
                current={state.selectedDate}
                onDayPress={onDateSelected}
                onMonthChange={onMonthChange}
                markedDates={markedDates}
                theme={{
                    backgroundColor: 'white',
                    calendarBackground: 'white',
                    textSectionTitleColor: '#30afb5',
                    selectedDayBackgroundColor: '#30afb5',
                    selectedDayTextColor: 'white',
                    todayTextColor: '#30afb5',
                    dayTextColor: '#2d4150',
                    textDisabledColor: '#d9e1e8',
                    dotColor: '#30afb5',
                    selectedDotColor: 'white',
                    arrowColor: '#30afb5',
                    monthTextColor: '#30afb5',
                    textDayFontWeight: '300',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 13,
                    'stylesheet.day.basic': {
                        base: {
                            width: 32,
                            height: 32,
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                        text: {
                            marginTop: 4,
                            fontSize: 16,
                            fontFamily: 'System',
                            fontWeight: '300',
                            color: '#2d4150',
                            backgroundColor: 'rgba(255, 255, 255, 0)',
                        },
                        dot: {
                            width: 4,
                            height: 4,
                            marginTop: 1,
                            borderRadius: 2,
                            opacity: 1,
                        },
                    },
                }}
                style={styleCss.calendarContainer}
            />
            <SafeAreaView style={styleCss.listContainer}>
                <FlatList
                    data={state.data}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    ListEmptyComponent={
                        <EmptyComponent title={t("Data not available")} />
                    }
                    refreshControl={
                        <RefreshControl
                            colors={["#30afb5"]}
                            refreshing={loading}
                            onRefresh={onRefresh}
                        />
                    }
                />
            </SafeAreaView>
        </View>
    );
}

const EmptyComponent = ({ title }) => (
    <View style={styleCss.emptyContainer}>
        <Text style={styleCss.emptyText}>{title}</Text>
    </View>
);

const mapStateToProps = (state) => ({
    classScheduleData: state.classSchedule.classScheduleData,
    loading: state.classSchedule.loading,
});

const mapDispatchToProps = {
    fetchClassSchedule,
    loadingStart,
};

export default connect(mapStateToProps, mapDispatchToProps)(ClassSchedule);