import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { t } from '../../locals';

class AuthManager {
  constructor() {
    this.logoutCallback = null;
    this.navigationRef = null;
  }

  setLogoutCallback(callback) {
    this.logoutCallback = callback;
  }

  setNavigationRef(ref) {
    this.navigationRef = ref;
  }

  // Check if error message indicates unauthorized user (not login failures)
  isUnauthorizedError(error) {
    if (!error) return false;
    
    const errorString = typeof error === 'string' ? error.toLowerCase() : '';
    
    // Exclude login credential errors - these should NOT trigger auto logout
    const loginErrorExclusions = [
      'invalid email or password',
      'invalid credentials',
      'wrong password',
      'wrong email',
      'incorrect password',
      'incorrect email',
      'login failed',
      'authentication failed', // This can be ambiguous, but often means login failure
      'cannot log in'
    ];
    
    // If it's a login credential error, don't auto-logout
    const isLoginError = loginErrorExclusions.some(exclusion =>
      errorString.includes(exclusion)
    );
    
    if (isLoginError) {
      return false; // Don't auto-logout for login failures
    }
    
    // Only auto-logout for very specific session/token issues - be much more restrictive
    const sessionExpiredKeywords = [
      'unauthorized user',
      'unauthorized access',
      'token expired',
      'session expired',
      'please login again',
      'session invalid',
      'access token expired',
      'authentication token expired',
      'your session has expired'
    ];

    // Must be an exact match or very specific phrase, not just containing the keywords
    return sessionExpiredKeywords.some(keyword => {
      // For "token" related errors, require more specific context
      if (keyword.includes('token') && !keyword.includes('expired')) {
        return errorString === keyword; // Exact match only
      }
      return errorString.includes(keyword);
    });
  }

  // Check if HTTP status indicates unauthorized
  isUnauthorizedStatus(statusCode) {
    return statusCode === 401 || statusCode === 403;
  }

  // Automatic logout and clear data
  async forceLogout(reason = 'Session expired') {
    try {
      console.log(`🔐 Force logout triggered: ${reason}`);
      
      // Clear all stored auth data
      await Promise.allSettled([
        SecureStore.deleteItemAsync("access_token").catch(() => {}),
        SecureStore.deleteItemAsync("role_name").catch(() => {}),
        SecureStore.deleteItemAsync("id").catch(() => {}),
        SecureStore.deleteItemAsync("email").catch(() => {}),
      ]);

      // Call logout callback if available (Redux action)
      if (this.logoutCallback && typeof this.logoutCallback === 'function') {
        try {
          await this.logoutCallback();
        } catch (error) {
          console.warn('Logout callback failed:', error);
        }
      }

      // Navigate to login screen
      if (this.navigationRef && this.navigationRef.current) {
        try {
          this.navigationRef.current.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          });
        } catch (navError) {
          console.warn('Navigation reset failed:', navError);
        }
      }

      // Show user-friendly message
      setTimeout(() => {
        Alert.alert(
          t('Session Expired'),
          t('Please login again'),
          [
            {
              text: t('OK'),
              style: 'default'
            }
          ],
          { cancelable: false }
        );
      }, 500);

    } catch (error) {
      console.error('Force logout failed:', error);
    }
  }

  // Handle API response and check for auth errors
  async handleApiResponse(response, statusCode = null) {
    if (!response) return;

    console.log(`🔍 AuthManager handleApiResponse: statusCode=${statusCode}, response:`, response);

    // Check status code first (but only for authenticated API calls, not login)
    if (statusCode && this.isUnauthorizedStatus(statusCode)) {
      // Don't auto-logout on login endpoint 401/403 - those are credential errors
      const errorMessage = response?.error || response?.message || '';
      console.log(`🔍 Checking HTTP ${statusCode} error: "${errorMessage}"`);
      if (!this.isLoginCredentialError(errorMessage) && !this.isDataError(errorMessage)) {
        console.log(`🚨 TRIGGERING AUTO-LOGOUT for HTTP ${statusCode}`);
        await this.forceLogout(`HTTP ${statusCode} - Access denied`);
        return;
      } else {
        console.log(`✅ Skipping auto-logout for login/data error: "${errorMessage}"`);
      }
    }

    // Check response error message (with more restrictive logic)
    const errorMessage = response.error || response.message || '';
    if (errorMessage) {
      console.log(`🔍 Checking response error message: "${errorMessage}"`);
      if (this.isUnauthorizedError(errorMessage)) {
        console.log(`🚨 TRIGGERING AUTO-LOGOUT for error message: "${errorMessage}"`);
        await this.forceLogout(errorMessage);
        return;
      }
    }

    // Check response status and error code
    if (response.status === 0 && response.error_code) {
      console.log(`🔍 Checking response with status=0 and error_code=${response.error_code}`);
      if (this.isUnauthorizedStatus(response.error_code)) {
        // Don't auto-logout for login credential errors OR data errors
        if (!this.isLoginCredentialError(errorMessage) && !this.isDataError(errorMessage)) {
          console.log(`🚨 TRIGGERING AUTO-LOGOUT for error code ${response.error_code}`);
          await this.forceLogout(`Error ${response.error_code} - ${errorMessage}`);
          return;
        } else {
          console.log(`✅ Skipping auto-logout for data/login error: "${errorMessage}"`);
        }
      }
    }
    
    console.log(`✅ No auth errors detected in API response`);
  }

  // Helper method to detect login credential errors
  isLoginCredentialError(errorMessage) {
    if (!errorMessage) return false;
    
    const errorString = typeof errorMessage === 'string' ? errorMessage.toLowerCase() : '';
    const loginErrorKeywords = [
      'invalid email or password',
      'invalid credentials',
      'wrong password',
      'wrong email',
      'incorrect password',
      'incorrect email',
      'cannot log in',
      'login failed'
    ];
    
    return loginErrorKeywords.some(keyword => errorString.includes(keyword));
  }

  // Helper method to detect data-related errors that wrongly return 401
  isDataError(errorMessage) {
    if (!errorMessage) return false;
    
    const errorString = typeof errorMessage === 'string' ? errorMessage.toLowerCase() : '';
    const dataErrorKeywords = [
      'record not found',
      'data not found',
      'no data found',
      'data not available',
      'no records found',
      'empty result',
      'no results',
      'not found'
    ];
    
    return dataErrorKeywords.some(keyword => errorString.includes(keyword));
  }

  // Handle fetch errors
  async handleFetchError(error) {
    if (!error) return;

    console.log(`🔍 AuthManager handleFetchError:`, error);

    // Exclude monitoring service errors - these should never trigger logout
    if (error.message && (
      error.message.includes('monitor.arenagym-om.com') ||
      error.message.includes('monitoring') ||
      error.message.includes('Monitoring timeout')
    )) {
      console.log(`✅ Skipping auth check for monitoring service error`);
      return;
    }

    // Check if it's a network error with auth implications (with more restrictive logic)
    if (error.message) {
      console.log(`🔍 Checking fetch error message: "${error.message}"`);
      if (this.isUnauthorizedError(error.message)) {
        console.log(`🚨 TRIGGERING AUTO-LOGOUT for fetch error: "${error.message}"`);
        await this.forceLogout(error.message);
        return;
      }
    }

    // Check for HTTP error status
    if (error.status && this.isUnauthorizedStatus(error.status)) {
      console.log(`🚨 TRIGGERING AUTO-LOGOUT for HTTP status: ${error.status}`);
      await this.forceLogout(`HTTP ${error.status} - Network error`);
      return;
    }
    
    console.log(`✅ No auth errors detected in fetch error`);
  }

  // Enhanced show alert that checks for auth errors
  async checkAndShowAlert(type, title, message) {
    console.log(`🔍 AuthManager checking alert: type="${type}", title="${title}", message="${message}"`);
    
    // Check if the alert message indicates unauthorized user (with more restrictive logic)
    if (type === 'warn' || type === 'error') {
      const titleUnauth = this.isUnauthorizedError(title);
      const messageUnauth = this.isUnauthorizedError(message);
      
      console.log(`🔍 Auth check results: titleUnauth=${titleUnauth}, messageUnauth=${messageUnauth}`);
      
      if (titleUnauth || messageUnauth) {
        console.log(`🚨 TRIGGERING AUTO-LOGOUT for: ${message || title}`);
        await this.forceLogout(message || title);
        return true; // Indicate that we handled the auth error
      }
    }
    console.log(`✅ No auth error detected, proceeding with normal alert`);
    return false; // Indicate that normal alert should proceed
  }
}

// Create singleton instance
const authManager = new AuthManager();

export default authManager;