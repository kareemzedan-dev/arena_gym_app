import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { t } from '../../../../locals';
import styleCss from '../../../style';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Class Booking Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styleCss.container}>
          <View style={styleCss.errorContainer}>
            <Text style={styleCss.errorTitle}>
              {t('Something went wrong')}
            </Text>
            <Text style={styleCss.errorMessage}>
              {this.state.error?.message || t('An unexpected error occurred')}
            </Text>
            <TouchableOpacity
              style={styleCss.retryButton}
              onPress={this.handleRetry}
            >
              <Text style={styleCss.retryButtonText}>
                {t('Try Again')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;