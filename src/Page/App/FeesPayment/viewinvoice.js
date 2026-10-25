import React, { Component } from 'react';
import {
    BackHandler,
    ActivityIndicator,
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    SafeAreaView,
    Alert,
    Dimensions,
    StyleSheet,
    Platform,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import Pdf from 'react-native-pdf';
import { Col, Row } from 'react-native-easy-grid';
import { t } from '../../../../locals';
import styleCss from '../../../style.js';
import { connect } from "react-redux";
import { fetchInvoice, loadingStart, loadingEnd } from "../../redux/actions/feesPayment";

const { width, height } = Dimensions.get('window');

class ViewInvoice extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            pdfError: false,
            retryCount: 0,
            maxRetries: 3,
            isSaving: false,
        };
        this.backHandlerSubscription = null;
    }

    static navigationOptions = {
        headerShown: false,
    };

    componentDidMount() {
        this.setupNavigationListeners();
        this.fetchInvoiceData();
    }

    componentWillUnmount() {
        this.cleanup();
    }

    setupNavigationListeners = () => {
        const { navigation } = this.props;
        this.focusListener = navigation.addListener('focus', this.onFocus);
        this.blurListener = navigation.addListener('blur', this.onBlur);
    }

    cleanup = () => {
        if (this.backHandlerSubscription) {
            this.backHandlerSubscription.remove();
        }
        if (this.focusListener) {
            this.focusListener();
        }
        if (this.blurListener) {
            this.blurListener();
        }
    }

    onBlur = () => {
        if (this.backHandlerSubscription) {
            this.backHandlerSubscription.remove();
            this.backHandlerSubscription = null;
        }
    }

    onFocus = () => {
        this.backHandlerSubscription = BackHandler.addEventListener(
            'hardwareBackPress',
            this.handleBackButtonClick
        );
    }

    onRefresh = () => {
        this.setState({
            refreshing: true,
            pdfError: false,
            retryCount: 0
        });
        this.fetchInvoiceData();
    }

    fetchInvoiceData = async () => {
        try {
            const { fetchInvoice, loadingStart, loadingEnd } = this.props;
            loadingStart();
            
            const invoice_key = this.props.route?.params?.memberinvoicekey;
            
            if (!invoice_key) {
                loadingEnd();
                this.setState({ refreshing: false });
                Alert.alert(t("Error"), t("No invoice key provided"));
                return;
            }

            const Id = await SecureStore.getItemAsync("id");
            const Token = await SecureStore.getItemAsync("access_token");

            if (!Id || !Token) {
                loadingEnd();
                this.setState({ refreshing: false });
                Alert.alert(t("Error"), t("Authentication required"));
                return;
            }

            const invoiceData = {
                current_user_id: Id,
                access_token: Token,
                invoice_type: "membership_invoice",
                invoice_id: invoice_key,
            };

            await fetchInvoice(invoiceData);
            loadingEnd();
            
        } catch (error) {
            this.props.loadingEnd();
            console.error('Error fetching invoice:', error);
            Alert.alert(t("Error"), t("Failed to load invoice"));
            this.setState({ pdfError: true });
        } finally {
            this.setState({ refreshing: false });
        }
    }

    handleBackButtonClick = () => {
        this.props.navigation.navigate('Feespayment');
        return true;
    }

    handlePdfLoadStart = () => {
        this.setState({ pdfError: false });
    }

    handlePdfLoadComplete = (numberOfPages, filePath) => {
        this.setState({ pdfError: false });
        console.log(`PDF loaded successfully: ${numberOfPages} pages`);
    }

    handlePdfError = (error) => {
        console.error('PDF loading error:', error);
        this.setState({ pdfError: true });
        
        const { retryCount, maxRetries } = this.state;
        if (retryCount < maxRetries) {
            this.setState({ retryCount: retryCount + 1 });
            setTimeout(() => {
                this.fetchInvoiceData();
            }, 2000);
        } else {
            Alert.alert(t("Error"), t("Failed to load PDF. Please try again later."));
        }
    }

    retryPdfLoad = () => {
        this.setState({
            pdfError: false,
            retryCount: 0
        });
        this.fetchInvoiceData();
    }

    saveInvoiceToDevice = async () => {
        const { paymentInvoice } = this.props;
        
        if (!paymentInvoice) {
            Alert.alert(t("Error"), t("No invoice available to save"));
            return;
        }

        try {
            this.setState({ isSaving: true });

            // Generate filename with current date
            const currentDate = new Date();
            const dateString = currentDate.toISOString().split('T')[0];
            const filename = `Invoice_${dateString}.pdf`;

            // Download the PDF file to temporary location
            const tempUri = FileSystem.documentDirectory + filename;
            const downloadResult = await FileSystem.downloadAsync(paymentInvoice, tempUri);

            if (downloadResult.status === 200) {
                if (Platform.OS === 'android') {
                    // Request media library permissions for Android
                    const { status } = await MediaLibrary.requestPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert(t("Error"), t("Storage permission required to save files"));
                        return;
                    }

                    // Create asset and save to Downloads
                    const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
                    const album = await MediaLibrary.getAlbumAsync('Download');
                    
                    if (album == null) {
                        await MediaLibrary.createAlbumAsync('Download', asset, false);
                    } else {
                        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
                    }
                    
                    Alert.alert(t("Success"), t("Invoice saved to Downloads folder"));
                } else {
                    // For iOS, save to Photos app (or use sharing if needed)
                    const { status } = await MediaLibrary.requestPermissionsAsync();
                    if (status === 'granted') {
                        await MediaLibrary.createAssetAsync(downloadResult.uri);
                        Alert.alert(t("Success"), t("Invoice saved to Photos"));
                    } else {
                        Alert.alert(t("Success"), t("Invoice saved to app documents"));
                    }
                }
            } else {
                throw new Error('Download failed');
            }
        } catch (error) {
            console.error('Error saving invoice:', error);
            Alert.alert(t("Error"), t("Failed to save invoice. Please try again."));
        } finally {
            this.setState({ isSaving: false });
        }
    }

    renderLoadingIndicator = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#30afb5" />
            <Text style={styles.loadingText}>{t("Loading Invoice")}</Text>
        </View>
    )

    renderErrorView = () => (
        <View style={styles.errorContainer}>
            <Image 
                source={require('../../../images/error-icon.png')} 
                style={styles.errorIcon}
            />
            <Text style={styles.errorText}>{t("Failed to load invoice")}</Text>
            <TouchableOpacity 
                style={styles.retryButton}
                onPress={this.retryPdfLoad}
            >
                <Text style={styles.retryButtonText}>{t("Retry")}</Text>
            </TouchableOpacity>
        </View>
    )

    renderSaveButton = () => {
        const { paymentInvoice } = this.props;
        const { isSaving } = this.state;
        
        if (!paymentInvoice) return null;

        return (
            <TouchableOpacity
                style={styles.saveButton}
                onPress={this.saveInvoiceToDevice}
                disabled={isSaving}
            >
                {isSaving ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <Image
                        source={require('../../../images/Icon-open-external-link.png')}
                        style={styles.saveButtonIcon}
                    />
                )}
                <Text style={styles.saveButtonText}>
                    {isSaving ? t("Saving...") : t("Save")}
                </Text>
            </TouchableOpacity>
        );
    }

    renderPdfViewer = () => {
        const { paymentInvoice } = this.props;
        const { pdfError } = this.state;
        
        if (!paymentInvoice) {
            return (
                <View style={styles.noInvoiceContainer}>
                    <Text style={styles.noInvoiceText}>{t("No invoice available")}</Text>
                </View>
            );
        }

        if (pdfError) {
            return this.renderErrorView();
        }

        return (
            <View style={styles.pdfContainer}>
                <Pdf
                    source={{ uri: paymentInvoice, cache: true }}
                    onLoadStart={this.handlePdfLoadStart}
                    onLoadComplete={this.handlePdfLoadComplete}
                    onError={this.handlePdfError}
                    style={styles.pdf}
                    trustAllCerts={false}
                    spacing={0}
                    enablePaging={true}
                    enableRTL={false}
                    enableAnnotationRendering={false}
                    enableAntialiasing={true}
                    enableDoubleTapZoom={true}
                    enableScroll={true}
                    horizontal={false}
                    fitPolicy={0}
                    singlePage={false}
                    minScale={1.0}
                    maxScale={3.0}
                    scale={1.0}
                />
            </View>
        );
    }

    renderContent = () => {
        const { loading } = this.props;
        
        if (loading) {
            return this.renderLoadingIndicator();
        }

        return this.renderPdfViewer();
    }
    
    render() {
        const { refreshing } = this.state;
        const { navigate } = this.props.navigation;

        return (
            <SafeAreaView style={styleCss.container}>
                {/* Navigation Bar */}
                <Row style={styleCss.NaveBar}>
                    <Col>
                        <TouchableOpacity 
                            onPress={() => this.props.navigation.navigate("CustomSideBar")} 
                            style={styleCss.menu_col}
                        >
                            <Image 
                                style={styleCss.Naveicon}
                                source={require('../../../images/Menu-white.png')}
                            />
                        </TouchableOpacity>
                    </Col>

                    <Col>
                        <TouchableOpacity 
                            onPress={() => navigate('Feespayment')} 
                            style={styleCss.back_arrow}
                        >
                            <Image 
                                style={styleCss.Naveicon}
                                source={require('../../../images/Back-Arrow-White.png')}
                            />
                        </TouchableOpacity>
                    </Col>

                    <Col style={styleCss.name_col}>
                        <Text style={styleCss.NaveText}>{t("Invoice")}</Text>
                    </Col>

                    {/* <Col>
                        {this.renderSaveButton()}
                    </Col> */}
                    
                    <Col>
                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate('Workouts')}
                            style={styleCss.workout_col}
                        >
                            <Image
                                style={styleCss.Naveicon}
                                source={require('../../../images/Workout-White.png')}
                            />
                        </TouchableOpacity>
                    </Col>
                    
                    <Col>
                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate('Message')}
                            style={styleCss.message_col}
                        >
                            <Image
                                style={styleCss.Naveicon}
                                source={require('../../../images/Message-white.png')}
                            />
                        </TouchableOpacity>
                    </Col>
                </Row>

                {/* Content Area */}
                <ScrollView
                    style={styles.contentContainer}
                    contentContainerStyle={styles.scrollContentContainer}
                    refreshControl={
                        <RefreshControl
                            colors={["#30afb5"]}
                            refreshing={refreshing}
                            onRefresh={this.onRefresh}
                        />
                    }
                >
                    {this.renderContent()}
                </ScrollView>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
    },
    scrollContentContainer: {
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        color: '#30afb5',
        fontSize: 16,
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorIcon: {
        width: 64,
        height: 64,
        marginBottom: 20,
        tintColor: '#ff6b6b',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#30afb5',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    noInvoiceContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noInvoiceText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    pdfContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    pdf: {
        flex: 1,
        width: width,
        height: height,
        backgroundColor: 'transparent',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#30afb5',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 5,
        minWidth: 60,
        opacity: 1,
    },
    saveButtonIcon: {
        width: 16,
        height: 16,
        marginRight: 4,
        tintColor: 'white',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

const mapStateToProps = (state) => ({
    paymentInvoice: state.feesPayment.Invoice,
    loading: state.feesPayment.loading,
});

const mapDispatchToProps = {
    fetchInvoice,
    loadingStart,
    loadingEnd
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewInvoice);